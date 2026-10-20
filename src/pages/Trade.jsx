import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import TradeForm from "../../trade company components/TradeForm";
import Navbar from "../components/Navbar";
import CirculatingBanner from "../components/CirculatingBanner";
import StockTelemetryChart from "../components/StockTelemetryChart";
import {
  TrendingUp,
  TrendingDown,
  Receipt,
  Layers,
  Clock
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

  const queryTicker = searchParams.get("ticker");

  const [selectedTicker, setSelectedTicker] = useState(() => {
    if (queryTicker && stocks.some((s) => s.ticker === queryTicker)) {
      return queryTicker;
    }
    return stocks[0]?.ticker || "TSLA";
  });

  const activeStock = useMemo(() => {
    return (
      stocks.find((s) => s.ticker === selectedTicker) ||
      stocks.find((s) => s.ticker === queryTicker) ||
      stocks[0] || {
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
      }
    );
  }, [stocks, selectedTicker, queryTicker]);

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
      <div className="bg-[#0B0F17] border-b border-[#182133] px-4 sm:px-6 lg:px-8 py-2 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          {stocks.map((stk) => {
            const isSelected = stk.ticker === activeStock.ticker;
            const isUp = (stk.changePercent || 0) >= 0;

            return (
              <button
                key={stk.ticker}
                type="button"
                onClick={() => handleSelectTicker(stk.ticker)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-[#161F30] text-white border-emerald-500 shadow-xs"
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Active Stock Telemetry Ribbon */}
        <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-mono font-bold text-white">
                  {activeStock.ticker}
                </span>
                <span className="text-[10px] text-slate-400 px-2 py-0.5 rounded bg-[#141B29] border border-[#1F293D]">
                  {activeStock.sector}
                </span>
              </div>
              <h2 className="text-xs text-slate-300 font-medium mt-0.5">
                {activeStock.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 text-xs">
            {/* Price */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Price</div>
              <div className="text-base sm:text-lg font-mono font-bold text-white mt-0.5">
                ₹{activeStock.currentPrice.toFixed(2)}
              </div>
            </div>

            {/* Change */}
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">24h Change</div>
              <div
                className={`text-sm sm:text-base font-mono font-bold mt-0.5 flex items-center gap-0.5 ${
                  isPositive ? "text-emerald-400" : "text-rose-400"
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                <span>{isPositive ? "+" : ""}{activeStock.changePercent}%</span>
              </div>
            </div>

            {/* Day High / Low */}
            <div className="hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Day Range</div>
              <div className="text-xs font-mono text-slate-300 mt-0.5">
                ₹{(activeStock.dayLow || activeStock.currentPrice).toFixed(1)} - ₹{(activeStock.dayHigh || activeStock.currentPrice).toFixed(1)}
              </div>
            </div>

            {/* Volatility */}
            <div className="hidden md:block">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">Volatility</div>
              <div className="text-xs font-mono text-amber-400 mt-0.5">
                {activeStock.volatility ? `${activeStock.volatility}x` : "1.0x"}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Grid: Chart & Order Ticket (Appropriate balanced sizing & stretch alignment) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
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

        {/* Session Orders Table (Stable Min-Height Container to avoid page shake) */}
        <div className="rounded-xl bg-[#0D121D] border border-[#1A2336] p-4 sm:p-5 min-h-[220px]">
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
