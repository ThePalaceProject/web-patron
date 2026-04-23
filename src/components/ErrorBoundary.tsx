import * as React from "react";
import { getBugsnagErrorBoundary } from "analytics/bugsnag";
import ErrorComponent from "components/Error";

export type FallbackProps = {
  error: Error;
  info: React.ErrorInfo;
  clearError: () => void;
};

export const DefaultFallback: React.FC<FallbackProps> = ({ error }) => {
  return (
    <ErrorComponent
      info={{
        title: `${error.name}`,
        detail:
          "Something went wrong. Please refresh and try again. If the issue persists, contact your library support staff."
      }}
    />
  );
};

type ErrorState = { error?: Error; info?: React.ErrorInfo };
const initialState: ErrorState = { error: undefined, info: undefined };
class DefaultErrorBoundary extends React.Component<
  {
    FallbackComponent: React.ComponentType<FallbackProps>;
    children?: React.ReactNode;
  },
  ErrorState
> {
  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  state = initialState;

  handleClearError() {
    this.setState(initialState);
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      info: errorInfo
    });
  }

  render() {
    const { error, info } = this.state;
    const { FallbackComponent } = this.props;

    if (error && info) {
      return (
        <FallbackComponent
          clearError={this.handleClearError}
          error={error}
          info={info}
        />
      );
    }

    return this.props.children;
  }
}

export const ErrorBoundary: React.FC<{
  fallback?: React.ComponentType<FallbackProps>;
  children?: React.ReactNode;
}> = ({ children, fallback: Fallback = DefaultFallback }) => {
  const BugsnagBoundary = getBugsnagErrorBoundary();
  if (!BugsnagBoundary) {
    return (
      <DefaultErrorBoundary FallbackComponent={Fallback}>
        {children}
      </DefaultErrorBoundary>
    );
  }
  return (
    <BugsnagBoundary FallbackComponent={Fallback}>{children}</BugsnagBoundary>
  );
};

export default function withErrorBoundary<T>(
  Component: React.ComponentType<T>,
  Fallback: React.ComponentType<FallbackProps> = DefaultFallback
) {
  const Wrapped = (props: any) => {
    const BugsnagBoundary = getBugsnagErrorBoundary();
    if (!BugsnagBoundary) {
      return (
        <DefaultErrorBoundary FallbackComponent={Fallback}>
          <Component {...props} />
        </DefaultErrorBoundary>
      );
    }
    return (
      <BugsnagBoundary FallbackComponent={Fallback}>
        <Component {...props} />
      </BugsnagBoundary>
    );
  };

  // Format for display in DevTools
  const name = Component.displayName || Component.name;
  Wrapped.displayName = name
    ? `WithErrorBoundary(${name})`
    : "WithErrorBoundary";

  return Wrapped;
}
