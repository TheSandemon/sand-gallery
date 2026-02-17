import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg-main)] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--accent-primary)]/20 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              Something went wrong
            </h1>
            <p className="text-[var(--text-dim)] mb-6">
              We're sorry, but something unexpected happened. Please try again.
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-[var(--accent-primary)] text-black font-bold rounded-lg hover:opacity-80 transition-opacity"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold rounded-lg hover:bg-[var(--accent-primary)]/10 transition-colors"
              >
                Go Home
              </button>
            </div>
            {this.props.showDetails && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-[var(--text-dim)] text-sm mb-2">
                  Error Details
                </summary>
                <pre className="text-xs text-red-400 overflow-auto p-2 bg-black/50 rounded">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
