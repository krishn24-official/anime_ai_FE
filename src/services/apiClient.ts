const BASE_URL = import.meta.env.VITE_API_URL || '';

// Circuit-breaker for guest auth: after a failure, back off 60 s before retrying.
// Prevents a flood of /auth/login requests when Render is sleeping or returning 502.
let _guestAuthFailedAt: number | null = null;
const GUEST_AUTH_BACKOFF_MS = 60_000;

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

export interface AuthSessionUser {
  id: string;
  email: string;
  username: string;
  display_name?: string;
  is_admin?: boolean;
}

export type AuthEvent =
  | { type: 'refreshed'; user: AuthSessionUser; accessToken: string; refreshToken: string }
  | { type: 'expired' };

// Auth endpoints that must never trigger the refresh / guest-fallback logic
// (they either issue credentials themselves or would loop).
const CREDENTIAL_ENDPOINTS = [
  '/auth/login',
  '/auth/register',
  '/auth/token',
  '/auth/refresh',
  '/auth/logout',
  '/auth/forgot-password',
  '/auth/verify-otp',
  '/auth/reset-password',
];

class ApiClient {
  private token: string | null = localStorage.getItem('anime_ai_token');
  private refreshToken: string | null = localStorage.getItem('anime_ai_refresh_token');
  // Refresh tokens are single-use (rotated by the backend), so concurrent 401s
  // must share one in-flight refresh instead of each spending the same token.
  private refreshPromise: Promise<boolean> | null = null;
  private authListeners = new Set<(event: AuthEvent) => void>();

  onAuthEvent(listener: (event: AuthEvent) => void): () => void {
    this.authListeners.add(listener);
    return () => this.authListeners.delete(listener);
  }

  private emitAuthEvent(event: AuthEvent) {
    this.authListeners.forEach((listener) => listener(event));
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('anime_ai_token', token);
  }

  getToken(): string | null {
    return this.token;
  }

  setRefreshToken(token: string) {
    this.refreshToken = token;
    localStorage.setItem('anime_ai_refresh_token', token);
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  clearTokens() {
    this.token = null;
    this.refreshToken = null;
    localStorage.removeItem('anime_ai_token');
    localStorage.removeItem('anime_ai_refresh_token');
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers, ...customOptions } = options;
    
    let url = `${BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          searchParams.append(key, String(val));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }

    const defaultHeaders: Record<string, string> = {};
    if (!(options.body instanceof FormData)) {
      defaultHeaders['Content-Type'] = 'application/json';
    }

    const sentToken = this.token;
    const send = (token: string | null) => {
      const authHeaders: Record<string, string> = { ...defaultHeaders };
      if (token) {
        authHeaders['Authorization'] = `Bearer ${token}`;
      }
      return fetch(url, {
        ...customOptions,
        headers: {
          ...authHeaders,
          ...headers,
        },
      });
    };

    let response = await send(sentToken);

    const isCredentialEndpoint = CREDENTIAL_ENDPOINTS.some((p) => endpoint.startsWith(p));
    if (response.status === 401 && !isCredentialEndpoint) {
      // 1. Another request may already have refreshed the token while this one was in flight.
      // 2. Otherwise exchange the refresh token for a new pair and retry as the same user.
      const recovered =
        (this.token !== null && this.token !== sentToken) || (await this.refreshSession());

      if (recovered) {
        response = await send(this.token);
      } else {
        // The real user's session is over: tell the app (clears currentUser) instead of
        // silently continuing as someone else.
        this.expireSession();

        // /auth/me must never answer with the guest profile, or the guest would be
        // stored as the current user.
        if (!endpoint.startsWith('/auth/me')) {
          try {
            const guestToken = await this.ensureGuestSession();
            response = await send(guestToken);
          } catch (authError) {
            console.error('Failed to re-authenticate on 401:', authError);
          }
        }
      }
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearTokens();
      }
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Handle 204 No Content or similar empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Exchange the stored refresh token for a new access/refresh token pair.
   * Resolves true if the session was renewed. Concurrent callers share one request.
   */
  refreshSession(): Promise<boolean> {
    if (!this.refreshToken) return Promise.resolve(false);
    if (!this.refreshPromise) {
      const tokenToSpend = this.refreshToken;
      this.refreshPromise = (async () => {
        try {
          const res = await fetch(`${BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: tokenToSpend }),
          });
          if (!res.ok) return false;
          const data = await res.json();
          if (!data?.access_token || !data?.refresh_token) return false;

          this.setToken(data.access_token);
          this.setRefreshToken(data.refresh_token);
          if (data.user) {
            localStorage.setItem('anime_ai_user', JSON.stringify(data.user));
            this.emitAuthEvent({
              type: 'refreshed',
              user: data.user,
              accessToken: data.access_token,
              refreshToken: data.refresh_token,
            });
          }
          return true;
        } catch (err) {
          console.error('Token refresh failed:', err);
          return false;
        } finally {
          this.refreshPromise = null;
        }
      })();
    }
    return this.refreshPromise;
  }

  /**
   * Clear the logged-in user's credentials and notify the app, but only if a real
   * user was signed in (an expiring guest token is just re-issued silently).
   */
  private expireSession() {
    const hadUser = localStorage.getItem('anime_ai_user') !== null;
    this.clearTokens();
    if (hadUser) {
      localStorage.removeItem('anime_ai_user');
      this.emitAuthEvent({ type: 'expired' });
    }
  }

  /**
   * Automatically sign in as a guest to get a valid JWT token.
   */
  async ensureGuestSession(): Promise<string> {
    if (this.token) return this.token;

    // Circuit breaker: don't retry within 60 s of a recent failure.
    if (_guestAuthFailedAt && Date.now() - _guestAuthFailedAt < GUEST_AUTH_BACKOFF_MS) {
      throw new Error('Guest auth temporarily suspended (backend unavailable). Retry later.');
    }

    const guestEmail = 'guest@anime.ai';
    const guestPassword = 'Password123';

    try {
      // Try logging in first
      const loginRes = await this.post<{ access_token: string }>('/auth/login', {
        identifier: guestEmail,
        password: guestPassword,
      });
      _guestAuthFailedAt = null; // reset on success
      this.setToken(loginRes.access_token);
      return loginRes.access_token;
    } catch {
      // If login fails, register the guest user
      try {
        await this.post('/auth/register', {
          email: guestEmail,
          password: guestPassword,
          username: 'Guest_User',
        });

        // Login after successful registration
        const loginRes = await this.post<{ access_token: string }>('/auth/login', {
          identifier: guestEmail,
          password: guestPassword,
        });
        _guestAuthFailedAt = null; // reset on success
        this.setToken(loginRes.access_token);
        return loginRes.access_token;
      } catch (regError) {
        _guestAuthFailedAt = Date.now(); // arm the circuit breaker
        console.error('Failed to establish guest session:', regError);
        throw regError;
      }
    }
  }
}

export const apiClient = new ApiClient();
