const BASE_URL = '/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number>;
}

class ApiClient {
  private token: string | null = localStorage.getItem('anime_ai_token');
  private refreshToken: string | null = localStorage.getItem('anime_ai_refresh_token');

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
        searchParams.append(key, String(val));
      });
      url += `?${searchParams.toString()}`;
    }

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      defaultHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    let response = await fetch(url, {
      ...customOptions,
      headers: {
        ...defaultHeaders,
        ...headers,
      },
    });

    if (response.status === 401 && !endpoint.startsWith('/auth/')) {
      this.clearTokens();
      try {
        const newToken = await this.ensureGuestSession();
        defaultHeaders['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...customOptions,
          headers: {
            ...defaultHeaders,
            ...headers,
          },
        });
      } catch (authError) {
        console.error('Failed to re-authenticate on 401:', authError);
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
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  /**
   * Automatically sign in as a guest to get a valid JWT token.
   */
  async ensureGuestSession(): Promise<string> {
    if (this.token) return this.token;

    const guestEmail = 'guest@anime.ai';
    const guestPassword = 'Password123';

    try {
      // Try logging in first
      const loginRes = await this.post<{ access_token: string }>('/auth/login', {
        email: guestEmail,
        password: guestPassword,
      });
      this.setToken(loginRes.access_token);
      return loginRes.access_token;
    } catch {
      // If login fails, register the guest user
      try {
        await this.post('/auth/register', {
          email: guestEmail,
          password: guestPassword,
          display_name: 'Guest User',
        });
        
        // Login after successful registration
        const loginRes = await this.post<{ access_token: string }>('/auth/login', {
          email: guestEmail,
          password: guestPassword,
        });
        this.setToken(loginRes.access_token);
        return loginRes.access_token;
      } catch (regError) {
        console.error('Failed to establish guest session:', regError);
        throw regError;
      }
    }
  }
}

export const apiClient = new ApiClient();
