import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

/**
 * @file ErrorBoundary.jsx
 * @description Graceful telemetry recovery barrier preventing screen blackouts.
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled render error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHardReset = () => {
    try {
      localStorage.removeItem("imprenditore_active_team");
    } catch {}
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#07090E] text-slate-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0D121D] border border-rose-500/30 rounded-2xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>

            <div className="space-y-1">
              <h2 className="text-base font-black uppercase tracking-wider text-white">
                Telemetry Stream Interruption
              </h2>
              <p className="text-xs font-mono text-slate-400">
                A localized client render error occurred. The application remains recoverable.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-[#080B12] rounded-xl border border-[#1A2336] text-[11px] font-mono text-rose-300/90 text-left overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#E10600] to-[#B80500] hover:from-[#FF1812] hover:to-[#D40600] text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-red-950/40 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleHardReset}
                className="px-4 py-2 rounded-xl bg-[#141C2B] hover:bg-[#1E293D] border border-[#232F47] text-slate-300 text-xs font-mono font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Reset to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
