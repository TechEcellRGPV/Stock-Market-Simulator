import { useState, useEffect } from "react";
import { useConvexConnectionState } from "convex/react";
import { WifiOff, RefreshCw } from "lucide-react";

/**
 * @file MobileConnectionSentinel.jsx
 * @description Non-blocking real-time network connectivity and Convex WebSocket
 * status monitor for mobile participants. Renders an alert banner whenever
 * the cellular or Wi-Fi radio drops, or during exponential backoff reconnections.
 *
 * @returns {JSX.Element | null} Alert banner when offline, null when nominal
 */
export default function MobileConnectionSentinel() {
  const connectionState = useConvexConnectionState();
  const [isBrowserOnline, setIsBrowserOnline] = useState(() =>
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  useEffect(() => {
    const handleOnline = () => setIsBrowserOnline(true);
    const handleOffline = () => setIsBrowserOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const isConnected = isBrowserOnline && Boolean(connectionState?.isWebSocketConnected);

  if (isConnected) {
    return null;
  }

  const retries = connectionState?.connectionRetries ?? 0;
  const pendingOrders = connectionState?.inflightMutations ?? 0;

  return (
    <aside
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-50 bg-[#E10600] text-white px-3 py-2 shadow-xl flex flex-wrap items-center justify-between gap-2 text-xs font-sans font-bold border-b border-red-500/40"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-4 h-4 text-white animate-pulse shrink-0" />
        <span className="leading-tight">
          {!isBrowserOnline
            ? "Network Disconnected: Checking Cellular / Wi-Fi..."
            : "Telemetry Paused: Reconnecting to Race Control..."}
        </span>
      </div>

      <div className="flex items-center gap-2 text-[11px] font-mono shrink-0">
        {pendingOrders > 0 && (
          <span className="bg-black/30 px-2 py-0.5 rounded text-[#EAB308]">
            {pendingOrders} order(s) pending sync
          </span>
        )}
        {retries > 0 && (
          <span className="bg-black/20 px-2 py-0.5 rounded flex items-center gap-1 opacity-90">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Retry #{retries}</span>
          </span>
        )}
      </div>
    </aside>
  );
}
