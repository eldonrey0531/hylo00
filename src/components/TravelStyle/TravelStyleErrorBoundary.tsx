// src/components/TravelStyle/TravelStyleErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TravelStyleErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TravelStyle Error Boundary caught an error:', error, errorInfo);

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="bg-form-box rounded-[36px] p-6 border-3 border-red-200">
          <div className="text-center">
            <span className="text-4xl mb-4 block">⚠️</span>
            <h3 className="text-xl font-bold text-red-600 mb-2 font-raleway">
              Travel Style Form Error
            </h3>
            <p className="text-red-500 font-raleway text-sm mb-4">
              We encountered an issue with the travel style form. Please try refreshing the page.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 bg-primary text-white rounded-[10px] font-raleway font-bold hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default TravelStyleErrorBoundary;
