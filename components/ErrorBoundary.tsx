import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Only log in development mode
        if (import.meta.env.DEV) {
            console.error('Error caught by boundary:', error, errorInfo);
        }
        // In production, you could send to error tracking service here
        // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
                        <div className="text-6xl mb-4">⚠️</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-4">
                            Terjadi Kesalahan
                        </h1>
                        <p className="text-gray-600 mb-6">
                            Maaf, terjadi kesalahan yang tidak terduga. Silakan refresh halaman atau hubungi admin.
                        </p>
                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="px-6 py-2 bg-dark-teal text-white rounded-md hover:bg-teal-700 transition-colors"
                        >
                            Refresh Halaman
                        </button>
                        {import.meta.env.DEV && this.state.error && (
                            <details className="mt-4 text-left">
                                <summary className="cursor-pointer text-sm text-gray-500">
                                    Detail Error (Development)
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                                    {this.state.error.toString()}
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

