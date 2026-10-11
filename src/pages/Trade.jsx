import { useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import TradeForm from "../../trade company components/TradeForm";
import CirculatingBanner from "../components/CirculatingBanner";
import StockTelemetryChart from "../components/StockTelemetryChart";
import {
  ArrowLeft,
  Activity,
  Zap,
  Clock,
  Info,
  Receipt
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

/**
 * @file Trade.jsx
 * @description Pit Stop Trading Floor Page for Imprenditore 5.0.
 * Orchestrates real-time market telemetry, single-stock intraday sparkline charts,
 * scrip profile specifications, interactive order placement via TradeForm,
 * and the live Recent Pit Stop Executions audit ledger.
 *
 * @returns {JSX.Element} Trading floor viewport with reactive Convex subscriptions
 */
export default function Trade() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { currentTeam, stocks, raceState, orders } = useSimulation();

  const queryTicker = searchParams.get("ticker");

  // Selected ticker synchronized with URL query params (e.g. ?ticker=APEX)
  const [selectedTicker, setSelectedTicker] = useState(() => {
    if (queryTicker && stocks.some((s) => s.ticker === queryTicker)) {
      return queryTicker;
    }
    return stocks[0]?.ticker || "APEX";
  });

  /**
   * Resolves the full equity object for the active ticker with safe fallback metadata.
   */
  const activeStock = useMemo(() => {
    return (
      stocks.find((s) => s.ticker === selectedTicker) ||
      stocks.find((s) => s.ticker === queryTicker) ||
      stocks.find((s) => s.ticker === "APEX" || s.ticker.startsWith("APEX")) ||
      stocks[0] ||
      { ticker: "APEX", name: "Apex Dynamics EV", sector: "Powertrain & Electric Vehicles", currentPrice: 850, openingPrice: 830, dayHigh: 865, dayLow: 825, changePercent: 0, volatility: 1.5, sparkline: [830, 850] }
    );
  }, [stocks, selectedTicker, queryTicker]);

  /**
   * Updates selected ticker and synchronizes with URL search parameters.
   * @param {string} ticker - The stock ticker symbol selected
   */
  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker);
    setSearchParams({ ticker });
  };

  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Top Navbar */}
      <header className="bg-[#121720] border-b border-[#232B3B] px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            to="/"
            className="w-8 h-8 rounded shrink-0 hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-8 h-8 object-contain rounded"
            />
          </Link>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E10600] truncate">
              Pit Stop Trading Floor
            </div>
            <h1 className="text-xs sm:text-base font-black uppercase italic tracking-tight text-white truncate flex items-center gap-1.5">
              <span>Order Execution & Telemetry</span>
              <Activity className="w-3.5 h-3.5 text-[#06B6D4] shrink-0" />
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Lap Clock Telemetry */}
          <div className="flex items-center gap-1.5 bg-[#0A0D12] px-2.5 py-1 rounded border border-[#232B3B]">
            <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="font-mono font-bold text-[#06B6D4] text-[11px] sm:text-xs">
              {formatTime(raceState.lapTimeRemaining)}
            </span>
            <span
              className={`font-black uppercase tracking-wider text-[10px] sm:text-[11px] ${
                raceState.status === "GREEN_FLAG"
                  ? "text-[#EAB308]"
                  : raceState.status === "SAFETY_CAR"
                  ? "text-[#F59E0B]"
                  : raceState.status === "CHECKERED_FLAG"
                  ? "text-[#FF4D4D]"
                  : "text-[#06B6D4]"
              }`}
            >
              {raceState.status === "GREEN_FLAG"
                ? `L${raceState.currentLap}`
                : raceState.status === "SAFETY_CAR"
                ? "PAUSED"
                : raceState.status === "CHECKERED_FLAG"
                ? "CLOSED"
                : "WARMUP"}
            </span>
          </div>

          <Link
            to={currentTeam ? "/dashboard" : "/"}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#161B24] hover:bg-[#1D232E] text-xs font-bold text-slate-300 hover:text-white border border-[#232B3B] transition-colors shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentTeam ? "Cockpit" : "Home"}</span>
          </Link>
        </div>
      </header>

      {/* Real-time Circulating Live Update Banner */}
      <CirculatingBanner />

      {/* Horizontal Quick Ticker Selection Strip */}
      <div className="bg-[#0D1117] border-b border-[#1E2638] px-3 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mr-1 flex items-center gap-1">
            <Zap className="w-3 h-3 text-[#EAB308]" />
            <span>Grid:</span>
          </span>
          {stocks.map((stk) => {
            const isSelected = stk.ticker === activeStock.ticker;
            const isPositive = (stk.changePercent || 0) >= 0;

            return (
              <button
                key={stk.ticker}
                type="button"
                onClick={() => handleSelectTicker(stk.ticker)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-colors flex items-center gap-2 border ${
                  isSelected
                    ? "bg-[#161B24] text-white border-[#E10600] shadow-sm"
                    : "bg-[#0A0D12] text-slate-400 hover:text-white border-[#1E2638] hover:border-slate-700"
                }`}
              >
                <span>{stk.ticker}</span>
                <span className="text-white">₹{stk.currentPrice.toFixed(1)}</span>
                <span
                  className={`text-[10px] inline-flex items-center ${
                    isPositive ? "text-[#10B981]" : "text-[#E10600]"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {stk.changePercent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Terminal Grid: Chart on Left, Execution Form on Right */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive Telemetry Chart & Company Fundamentals */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Telemetry Chart */}
            <StockTelemetryChart stock={activeStock} height={320} />

            {/* Company Fundamentals & Technicals Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-[#121720] border border-[#232B3B] space-y-3.5">
              <div className="flex items-center gap-2 border-b border-[#1E2638] pb-2.5">
                <Info className="w-4 h-4 text-[#06B6D4]" />
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Company Telemetry & Profile
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Day High</div>
                  <div className="text-sm font-black font-mono text-[#10B981] mt-0.5">
                    ₹{(activeStock.dayHigh || activeStock.currentPrice).toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Day Low</div>
                  <div className="text-sm font-black font-mono text-[#E10600] mt-0.5">
                    ₹{(activeStock.dayLow || activeStock.currentPrice).toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Opening</div>
                  <div className="text-sm font-black font-mono text-white mt-0.5">
                    ₹{(activeStock.openingPrice || activeStock.currentPrice).toFixed(2)}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C]">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Volatility</div>
                  <div className="text-sm font-black font-mono text-[#EAB308] mt-0.5">
                    {activeStock.volatility ? `${activeStock.volatility}x` : "1.0x"}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {activeStock.description ||
                  `${activeStock.name} operates in the ${activeStock.sector} sector, delivering mission-critical motorsport components, telemetry algorithms, or advanced sustainable propulsion systems.`}
              </p>
            </div>
          </div>

          {/* Right Column: Pit Stop Execution Form */}
          <div className="lg:col-span-5">
            <TradeForm
              selectedTicker={activeStock.ticker}
              onSelectTicker={handleSelectTicker}
            />
          </div>
        </div>

        {/* Past Pit Stop Executions / Orders Ledger */}
        <div className="mt-8 p-4 sm:p-5 rounded-xl bg-[#121720] border border-[#232B3B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-[#1E2638] mb-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-sm font-black uppercase italic tracking-wide text-white">
                Recent Pit Stop Executions ({orders ? orders.length : 0})
              </h2>
            </div>
            {currentTeam && (
              <span className="text-xs text-slate-400 font-mono">
                Active Session: <strong className="text-white">{currentTeam.teamName}</strong> ({currentTeam.teamCode})
              </span>
            )}
          </div>

          {!currentTeam ? (
            <div className="py-8 text-center text-xs text-slate-500">
              Please log in to your team session to view your order execution ledger.
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500 font-mono">
              No pit stop trade executions recorded yet for this session.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#232B3B] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-2.5">Type</th>
                    <th className="pb-2.5">Stock</th>
                    <th className="pb-2.5 text-right">Shares</th>
                    <th className="pb-2.5 text-right">Price</th>
                    <th className="pb-2.5 text-right">Total Amount</th>
                    <th className="pb-2.5">Executed By</th>
                    <th className="pb-2.5 text-right">Lap</th>
                    <th className="pb-2.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C]">
                  {orders.map((o) => (
                    <tr key={o.id || `${o.teamId}_${o.timestamp}`} className="hover:bg-[#161B24] transition-colors">
                      <td className="py-2.5">
                        <span
                          className={`px-1.5 py-0.5 rounded font-black text-[10px] uppercase ${
                            o.type === "BUY"
                              ? "bg-[#10B981]/15 text-[#10B981]"
                              : "bg-[#E10600]/15 text-[#E10600]"
                          }`}
                        >
                          {o.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-white">
                        {o.ticker} {o.stockName ? `- ${o.stockName}` : ""}
                      </td>
                      <td className="py-2.5 text-right font-mono text-white">{o.shares}</td>
                      <td className="py-2.5 text-right font-mono text-slate-300">
                        ₹{Number(o.price || 0).toFixed(2)}
                      </td>
                      <td className="py-2.5 text-right font-mono font-bold text-white">
                        ₹{Number(o.totalAmount || 0).toLocaleString("en-IN")}
                      </td>
                      <td className="py-2.5 text-slate-400">{o.executedBy}</td>
                      <td className="py-2.5 text-right font-mono text-[#EAB308]">Lap {o.lap}</td>
                      <td className="py-2.5 text-right text-slate-500 font-mono text-[10px]">
                        {new Date(o.timestamp).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
