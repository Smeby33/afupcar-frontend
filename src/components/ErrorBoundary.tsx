import React from 'react';

interface State {
  hasError: boolean;
  error: Error | null;
  info: { componentStack: string } | null;
}

class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, State> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error, info: null } as State;
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error, info);
    this.setState({ hasError: true, error, info: { componentStack: info.componentStack } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded">
          <h3 className="text-lg font-bold text-red-700">Erreur lors du rendu d'un composant</h3>
          <p className="text-sm text-red-600">{this.state.error?.message}</p>
          <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap">{this.state.info?.componentStack}</pre>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
