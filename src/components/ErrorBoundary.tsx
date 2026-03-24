"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error("[ErrorBoundary caught]:", error, info.componentStack);
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="flex flex-col items-center justify-center min-h-[40vh] p-8 text-center">
                    <div className="h-16 w-16 rounded-3xl bg-red-50 flex items-center justify-center mb-6">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">Wax khalad ah ayaa dhacay</h2>
                    <p className="text-slate-500 text-sm font-medium mb-6 max-w-sm">
                        {this.state.error?.message || "Dib u bilow bogga adigoo gujinaya badhanka hoose."}
                    </p>
                    <Button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl gap-2"
                    >
                        <RefreshCw className="h-4 w-4" /> Dib u Bilow
                    </Button>
                </div>
            );
        }
        return this.props.children;
    }
}
