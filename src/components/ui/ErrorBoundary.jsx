import React from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-surface border border-red-500/20 rounded-2xl p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-red-500/5" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                                <AlertTriangle className="text-red-500" size={32} />
                            </div>
                            <h2 className="text-2xl font-display font-bold text-white mb-3">Something went wrong</h2>
                            <p className="text-gray-400 mb-8 text-sm">
                                {this.state.error?.message || "An unexpected error occurred while loading this page. Please try refreshing or contact support if the problem persists."}
                            </p>
                            <Button
                                variant="primary"
                                onClick={() => window.location.reload()}
                                className="w-full !bg-blue-600 hover:!bg-red-600 !text-white border-none py-3"
                            >
                                Refresh Page
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
