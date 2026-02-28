import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
          <h1>Something went wrong</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '1rem' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div style={{ marginTop: '2rem' }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = '/';
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
