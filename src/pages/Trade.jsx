import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import TradeForm from "../../trade company components/TradeForm";
import Navbar from "../components/Navbar";
import CirculatingBanner from "../components/CirculatingBanner";
import StockTelemetryChart from "../components/StockTelemetryChart";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Zap,
  LineChart,
  Layers,
  ChevronRight
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";
import { useScreenWakeLock } from "../hooks/useScreenWakeLock";

export default function Trade() {
  useSEO({
    title: "Live Trading Screen",
    description: "Live order execution terminal for Imprenditore 5.0. Trade real market equities with real-time price telemetry."
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const { stocks, raceState, orders } = useSimulation();

  useScreenWakeLock(raceState?.status === "GREEN_FLAG");

  // Mobile navigation tab: "trade" (default for mobile) | "chart" | "orders"
  const [mobileTab, setMobileTab] = useState("trade");

  const queryTicker = searchParams.get("ticker");

  const [selectedTicker, setSelectedTicker] = useState(() => {
    if (queryTicker && stocks.some((s) => s.ticker === queryTicker)) {
      return queryTicker;
    }
    return stocks[0]?.ticker || "TSLA";
  });

  // Derived active ticker: prioritizes queryTicker if present, falls back to selectedTicker
  const activeTicker = (queryTicker && stocks.some((s) => s.ticker === queryTicker))
    ? queryTicker
    : selectedTicker;

  // Support instantaneous same-page stock switching via custom event from CirculatingBanner
  useEffect(() => {
    const handleSwitchStock = (e) => {
      const ticker = e.detail;
      if (ticker && stocks.some((s) => s.ticker === ticker)) {
        setSelectedTicker(ticker);
        setSearchParams({ ticker });
      }
    };
    window.addEventListener("select_stock_ticker", handleSwitchStock);
    return () => window.removeEventListener("select_stock_ticker", handleSwitchStock);
  }, [stocks, setSearchParams]);

  const activeStock = useMemo(() => {
    if (!stocks || stocks.length === 0) {
      return {
        ticker: "TSLA",
        name: "Tesla, Inc.",
        sector: "Electric Vehicles & Clean Energy",
        currentPrice: 368.0,
        openingPrice: 368.0,
        dayHigh: 375.0,
        dayLow: 362.0,
        changePercent: 0,
        volatility: 1.5,
        sparkline: [365, 368]
      };
    }

    return (
      stocks.find((s) => s.ticker === activeTicker) ||
      stocks[0]
    );
  }, [stocks, activeTicker]);

  const handleSelectTicker = (ticker) => {
    setSelectedTicker(ticker);
    setSearchParams({ ticker });
  };

  const isPositive = (activeStock.changePercent || 0) >= 0;

  return (
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <Navbar />
      <CirculatingBanner />

      {/* Horizontal Stock Selection Ribbon */}
      <div className="bg-[#0B0F17] border-b border-[#182133] px-3 sm:px-6 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {stocks.map((stk) => {
            const isSelected = stk.ticker === activeStock.ticker;
            const isUp = (stk.changePercent || 0) >= 0;

            return (
              <button
                key={stk.ticker}
                type="button"
                onClick={() => handleSelectTicker(stk.ticker)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 border shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-[#161F30] text-white border-emerald-500 shadow-xs ring-1 ring-emerald-500/30"
                    : "bg-[#090D14] text-slate-400 hover:text-white border-[#182133] hover:border-[#222E46]"
                }`}
              >
                <span className="font-bold">{stk.ticker}</span>
                <span>₹{stk.currentPrice.toFixed(1)}</span>
                <span className={`text-[10px] ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                  {isUp ? "+" : ""}{stk.changePercent}%
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-3.5 sm:py-5 space-y-4 sm:space-y-5">
        {/* Active Stock Telemetry Ribbon (Optimized for both mobile and desktop) */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] shadow-sm">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Ticker & Sector & Company Name */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-mono font-bold text-white">
                  {activeStock.ticker}
                </span>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#141B29] border border-[#1F293D] truncate max-w-[130px] sm:max-w-none">
                  {activeStock.sector}
                </span>
              </div>
              <h2 className="text-xs text-slate-300 font-medium truncate mt-0.5 max-w-[200px] sm:max-w-none">
                {activeStock.name}
              </h2>
            </div>

            {/* Right: Live Price & 24h Change */}
            <div className="text-right shrink-0">
              <div className="text-base sm:text-lg font-mono font-black text-white">
                ₹{activeStock.currentPrice.toFixed(2)}
              </div>
              <div
                className={`text-xs font-mono font-bold mt-0.5 inline-flex items-center gap-0.5 ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isPositive ? "+" : ""}{activeStock.changePercent}%</span>
              </div>
            </div>
          </div>

          {/* Secondary Telemetry Strip (visible on sm: screens and above) */}
          <div className="hidden sm:flex items-center gap-6 pt-2.5 mt-2.5 border-t border-[#182133] text-xs font-mono text-slate-400">
            <div>
              Day Range: <strong className="text-slate-200">₹{(activeStock.dayLow || activeStock.currentPrice).toFixed(1)} - ₹{(activeStock.dayHigh || activeStock.currentPrice).toFixed(1)}</strong>
            </div>
            <div>
              Open: <strong className="text-slate-200">₹{(activeStock.openingPrice || activeStock.currentPrice).toFixed(1)}</strong>
            </div>
            <div>
              Volatility: <strong className="text-amber-400">{activeStock.volatility ? `${activeStock.volatility}x` : "1.0x"}</strong>
            </div>
          </div>
        </div>

        {/* Mobile View Mode Switcher (Visible only on screens < lg) */}
        {/* Solves mobile inconvenience: users can 1-tap switch between Trade Form, Live Chart, and Order History without endless 1000px scrolling! */}
        <div className="lg:hidden flex items-center p-1 rounded-xl bg-[#0D121D] border border-[#1A2336] gap-1 shadow-sm">
          <button
            type="button"
            onClick={() => setMobileTab("trade")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "trade"
                ? "bg-[#E10600] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Place Order</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("chart")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "chart"
                ? "bg-[#161F30] text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Live Chart</span>
          </button>
          <button
            type="button"
            onClick={() => setMobileTab("orders")}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              mobileTab === "orders"
                ? "bg-[#161F30] text-white border border-[#232B3B]"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Orders ({orders?.length || 0})</span>
          </button>
        </div>

        {/* ============================================================== */}
        {/* DESKTOP LAYOUT (lg: and up): Side-by-Side Dual Cockpit         */}
        {/* ============================================================== */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-5 items-stretch">
          {/* Chart View */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
            <StockTelemetryChart stock={activeStock} height={350} />
          </div>

          {/* Execution Form */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
            <TradeForm
              selectedTicker={activeStock.ticker}
              onSelectTicker={handleSelectTicker}
            />
          </div>
        </div>

        {/* ============================================================== */}
        {/* MOBILE LAYOUT (lg:hidden): Seamless Tab Content               */}
        {/* ============================================================== */}
        <div className="lg:hidden space-y-4">
          {mobileTab === "trade" && (
            <div className="space-y-3">
              <TradeForm
                selectedTicker={activeStock.ticker}
                onSelectTicker={handleSelectTicker}
              />
              <button
                type="button"
                onClick={() => setMobileTab("chart")}
                className="w-full py-2.5 rounded-xl bg-[#0D121D] hover:bg-[#141B29] border border-[#1A2336] text-xs font-mono font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <LineChart className="w-3.5 h-3.5 text-emerald-400" />
                <span>View {activeStock.ticker} Telemetry Chart</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          )}

          {mobileTab === "chart" && (
            <div className="space-y-3">
              <StockTelemetryChart stock={activeStock} />
              <button
                type="button"
                onClick={() => setMobileTab("trade")}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E10600] to-[#B80500] text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/50 cursor-pointer"
              >
                <Zap className="w-4 h-4" />
                <span>Open Order Form for {activeStock.ticker} (₹{activeStock.currentPrice.toFixed(2)})</span>
              </button>
            </div>
          )}

          {mobileTab === "orders" && (
            <div className="rounded-xl bg-[#0D121D] border border-[#1A2336] p-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#1A2336] mb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Order History</h3>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#141B29] text-slate-400">
                    {orders ? orders.length : 0}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">Real-time settlement</span>
              </div>

              {!orders || orders.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No orders placed in this session yet.
                </div>
              ) : (
                <div className="divide-y divide-[#161F30]">
                  {orders.map((o) => (
                    <div key={o.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            o.type === "BUY"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {o.type}
                          </span>
                          <span className="font-bold text-white text-xs">{o.ticker}</span>
                          <span className="text-[10px] font-mono text-slate-400">
                            {o.shares} shs @ ₹{o.price.toFixed(2)}
                          </span>
                        </div>
                        <div className="font-mono font-bold text-xs text-white">
                          ₹{o.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                        <span>By: {o.executedBy}</span>
                        <span>Round {o.lap} • {new Date(o.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* DESKTOP SESSION ORDERS TABLE (Always visible on desktop lg:)   */}
        {/* ============================================================== */}
        <div className="hidden lg:block rounded-xl bg-[#0D121D] border border-[#1A2336] p-4 sm:p-5 min-h-[200px]">
          <div className="flex items-center justify-between pb-3 border-b border-[#1A2336] mb-3">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Order History</h3>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#141B29] text-slate-400">
                {orders ? orders.length : 0}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Real-time settlement</span>
          </div>

          {!orders || orders.length === 0 ? (
            <div className="h-28 flex flex-col items-center justify-center text-xs text-slate-400 text-center">
              <span>No orders placed in this session yet.</span>
              <span className="text-[11px] text-slate-500 mt-1">Submit your first trade ticket above.</span>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="sticky top-0 bg-[#0D121D] z-10">
                  <tr className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-[#161F30]">
                    <th className="py-2.5">Side</th>
                    <th className="py-2.5">Ticker</th>
                    <th className="py-2.5 text-right">Shares</th>
                    <th className="py-2.5 text-right">Price</th>
                    <th className="py-2.5 text-right">Total</th>
                    <th className="py-2.5">Trader</th>
                    <th className="py-2.5 text-right">Round</th>
                    <th className="py-2.5 text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141B28]">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-[#121824] transition-colors">
                      <td className="py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          o.type === "BUY"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}>
                          {o.type}
                        </span>
                      </td>
                      <td className="py-2.5 font-bold text-white">{o.ticker}</td>
                      <td className="py-2.5 text-right font-mono text-white">{o.shares}</td>
                      <td className="py-2.5 text-right font-mono text-slate-300">₹{o.price.toFixed(2)}</td>
                      <td className="py-2.5 text-right font-mono font-bold text-white">
                        ₹{o.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2.5 text-slate-400 text-[11px]">{o.executedBy}</td>
                      <td className="py-2.5 text-right font-mono text-amber-400">Lap {o.lap}</td>
                      <td className="py-2.5 text-right text-slate-400 font-mono text-[10px]">
                        {new Date(o.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
