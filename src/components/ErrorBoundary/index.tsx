"use client";

import Link from "next/link";
import { Component, ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
  onError?: (error: Error, errorInfo: { componentStack: string }) => void; // Callback for logging
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: undefined };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    // Log the error to an external service if onError is provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    // Reset the error state to retry rendering
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-100 p-6 text-center">
          <h1 className="text-2xl font-semibold text-red-600">Something went wrong!</h1>
          <p className="mt-2 text-gray-700">
            We&apos;re sorry for the inconvenience. You can retry or return to the home page.
          </p>
          <div className="mt-4">
            <button onClick={this.handleRetry} className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
              Retry
            </button>
            <Link href="/" className="ml-4 rounded bg-gray-300 px-4 py-2 text-black hover:bg-gray-400">
              Go to Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
