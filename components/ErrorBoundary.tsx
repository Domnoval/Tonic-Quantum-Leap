import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-8">
          <div className="max-w-md text-center">
            <div className="text-red-500 text-6xl mb-6 font-mono">137</div>
            <h1 className="text-white text-2xl font-serif mb-4">
              Signal Disruption Detected
            </h1>
            <p className="text-white/50 text-sm font-mono mb-8">
              The transmission encountered interference. The coupling constant has destabilized.
            </p>
            <div className="text-white/30 text-xs font-mono mb-8 p-4 bg-white/5 rounded text-left overflow-auto max-h-32">
              {this.state.error?.message || 'Unknown frequency anomaly'}
            </div>
            <button
              onClick={this.handleReset}
              className="font-mono text-xs uppercase tracking-widest border border-white/20 px-8 py-3 text-white/70 hover:border-sky-400 hover:text-sky-400 transition-all"
            >
              Recalibrate Signal
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
