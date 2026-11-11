import React from 'react';

const RELOADED_KEY = 'anime_ai_chunk_reload';

const isChunkLoadError = (error: unknown) =>
  /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk .* failed/i.test(
    String((error as Error)?.message || error)
  );

interface State {
  error: unknown;
}

/**
 * Keeps one broken page from blanking the whole app.
 *
 * If a lazily loaded page's code can't be fetched (typically right after a deploy,
 * when an open tab still references old files), reload once to get the new version.
 * Any other error shows a message with a Reload button instead of a blank screen.
 */
export class PageErrorBoundary extends React.Component<{ children: React.ReactNode; resetKey?: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State {
    return { error };
  }

  componentDidCatch(error: unknown) {
    console.error('Page crashed:', error);
    if (isChunkLoadError(error)) {
      let alreadyReloaded = false;
      try {
        alreadyReloaded = sessionStorage.getItem(RELOADED_KEY) === '1';
        sessionStorage.setItem(RELOADED_KEY, '1');
      } catch {
        // storage unavailable: still try one reload
      }
      if (!alreadyReloaded) window.location.reload();
    }
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    // Navigating to another page clears the error.
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4 text-center">
        <p className="text-lg font-semibold text-white">Something went wrong loading this page.</p>
        <p className="text-sm text-anime-text/60 max-w-md">
          {isChunkLoadError(this.state.error)
            ? 'A newer version of the app may be available.'
            : 'Please try again.'}
        </p>
        <button
          type="button"
          onClick={() => {
            try {
              sessionStorage.removeItem(RELOADED_KEY);
            } catch {
              // ignore
            }
            window.location.reload();
          }}
          className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-semibold text-white transition"
        >
          Reload
        </button>
      </div>
    );
  }
}

export default PageErrorBoundary;
