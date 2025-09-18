import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class FormErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('Form Error Boundary caught an error:', error);
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Form Error Boundary details:', error, errorInfo);

    // Performance monitoring - track form errors
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark('form-error-caught');
      console.log('Form error performance mark created');
    }
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-red-50 border border-red-200 rounded-[36px] p-6 mt-6">
          <div className="text-center">
            <h3 className="text-red-600 font-bold font-raleway text-lg mb-3">⚠️ Form Error</h3>
            <p className="text-red-600 font-raleway text-base mb-4">
              Something went wrong with the form. Please refresh the page and try again.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="bg-red-600 text-white px-6 py-3 rounded-[10px] font-bold font-raleway text-base hover:bg-red-700 transition-colors duration-200"
            >
              Refresh Page
            </button>
            {process.env['NODE_ENV'] === 'development' && this.state.error && (
              <details className="mt-4 text-left">
                <summary className="text-red-600 font-raleway font-bold cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="text-sm text-red-800 bg-red-100 p-3 rounded mt-2 overflow-auto">
                  {this.state.error.stack}
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

export default FormErrorBoundary;
