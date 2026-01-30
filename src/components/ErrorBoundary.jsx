import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-black text-red-500 p-8 font-mono overflow-auto">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <div className="bg-gray-900 p-4 rounded border border-red-900">
                        <h2 className="font-bold text-white">Error Message:</h2>
                        <pre className="whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
                        <br />
                        <h2 className="font-bold text-white">Stack Trace:</h2>
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
