import React, { Suspense, lazy, useState, useEffect } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { MicroFrontendProps } from '@/types';

interface LazyMicroFrontendProps {
  remoteName: string;
  moduleName: string;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  props: MicroFrontendProps;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback: React.ReactNode }>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{ fallback: React.ReactNode }>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Micro-frontend error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export const LazyMicroFrontend: React.FC<LazyMicroFrontendProps> = ({
  remoteName,
  moduleName,
  fallback,
  errorFallback,
  props,
}) => {
  const [Component, setComponent] = useState<React.ComponentType<MicroFrontendProps> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Dynamic import of the remote module
        const module = await import(/* webpackIgnore: true */ `${remoteName}/${moduleName}`);
        setComponent(() => module.default);
      } catch (err) {
        console.error(`Failed to load micro-frontend ${remoteName}/${moduleName}:`, err);
        setError(err instanceof Error ? err : new Error('Failed to load module'));
      } finally {
        setIsLoading(false);
      }
    };

    loadComponent();
  }, [remoteName, moduleName]);

  const defaultFallback = (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
        <p className="text-gray-600">Loading {moduleName}...</p>
      </div>
    </div>
  );

  const defaultErrorFallback = (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <AlertCircle className="w-8 h-8 mx-auto mb-4 text-red-600" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load {moduleName}
        </h3>
        <p className="text-gray-600 mb-4">
          {error?.message || 'An error occurred while loading the module'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (isLoading) {
    return <>{fallback || defaultFallback}</>;
  }

  if (error || !Component) {
    return <>{errorFallback || defaultErrorFallback}</>;
  }

  return (
    <ErrorBoundary fallback={errorFallback || defaultErrorFallback}>
      <Suspense fallback={fallback || defaultFallback}>
        <Component {...props} />
      </Suspense>
    </ErrorBoundary>
  );
};

export default LazyMicroFrontend; 