import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  Wallet,
  ShieldAlert
} from "lucide-react";
import { useSimulation } from "../src/context/SimulationContext";

export default function TradeForm({ selectedTicker: propTicker, onSelectTicker }) {
  const { stocks, currentTeam, currentHoldings, executeTrade, raceState, isConnected } = useSimulation();

  const [internalTicker, setInternalTicker] = useState(() => propTicker || "TSLA");
  const [orderType, setOrderType] = useState("BUY"); // "BUY" | "SELL"
  const [shares, setShares] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-dismiss success notification to keep interface clean without height jumps
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => {
      setSuccess("");
    }, 4000);
    return () => clearTimeout(timer);
  }, [success]);

  const activeTicker = propTicker || internalTicker;

  const handleTickerChange = (ticker) => {
    setInternalTicker(ticker);
    if (onSelectTicker) {
      onSelectTicker(ticker);
    }
  };

  const selectedStock = useMemo(() => {
    return (
      stocks.find((s) => s.ticker === activeTicker) ||
      stocks[0] ||
      null
    );
  }, [stocks, activeTicker]);

  const userHolding = useMemo(() => {
    if (!currentTeam || !currentHoldings || !selectedStock) return null;
    return (
      currentHoldings.find(
        (h) => h.ticker?.trim().toUpperCase() === selectedStock.ticker?.trim().toUpperCase()
      ) || null
    );
  }, [currentTeam, currentHoldings, selectedStock]);

  const numericShares = typeof shares === "number" ? shares : (parseInt(shares, 10) || 0);
  const totalCost = Math.round(numericShares * (selectedStock ? selectedStock.currentPrice : 0) * 100) / 100;
  const availableCash = currentTeam ? currentTeam.cashBalance : 0;
  const ownedShares = userHolding ? userHolding.shares : 0;
  const avgCost = userHolding ? (userHolding.avgBuyPrice ?? userHolding.avgPrice ?? 0) : 0;
  const holdingVal = ownedShares * (selectedStock ? selectedStock.currentPrice : 0);
  const unrealizedPnL = holdingVal - (ownedShares * avgCost);
  const unrealizedPnLPct = ownedShares * avgCost > 0 ? (unrealizedPnL / (ownedShares * avgCost)) * 100 : 0;

  const maxSharesCanBuy = selectedStock && selectedStock.currentPrice > 0
    ? Math.floor(availableCash / selectedStock.currentPrice)
    : 0;

  const handleSharesChange = (val) => {
    if (val === "") {
      setShares("");
      return;
    }
    const num = Math.max(1, parseInt(val, 10) || 1);
    setShares(num);
  };

  const handlePercentAllocation = (pct) => {
    if (orderType === "BUY") {
      if (!selectedStock || selectedStock.currentPrice <= 0) return;
      const targetCash = availableCash * (pct / 100);
      const computedShares = Math.max(1, Math.floor(targetCash / selectedStock.currentPrice));
      setShares(computedShares);
    } else {
      if (ownedShares <= 0) {
        setShares(0);
        return;
      }
      const computedShares = Math.max(1, Math.floor(ownedShares * (pct / 100)));
      setShares(computedShares);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (isConnected === false) {
      setError("Cannot route order while offline. Reconnecting to Race Control...");
      return;
    }

    if (!currentTeam) {
      setError("Please log in to your team to place trades.");
      return;
    }

    if (currentTeam.userRole === "MEMBER") {
      setError(`View Only Mode: Only designated Team Leader (${currentTeam.leaderName}) can execute trades.`);
      return;
    }

    if (!selectedStock) {
      setError("Please select a target company.");
      return;
    }

    const shareCount = Math.floor(numericShares);
    if (shareCount <= 0 || !Number.isFinite(shareCount)) {
      setError("Share quantity must be a positive number.");
      return;
    }

    if (orderType === "BUY" && totalCost > availableCash) {
      setError(`Insufficient cash fuel (₹${Math.floor(availableCash).toLocaleString("en-IN")} available).`);
      return;
    }

    if (orderType === "SELL" && shareCount > ownedShares) {
      setError(`Short selling not permitted. You own ${ownedShares} shares.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await executeTrade({
        ticker: selectedStock.ticker,
        type: orderType,
        shares: shareCount,
        executedBy: currentTeam.currentMemberName || currentTeam.leaderName
      });

      const confirmedShares = res?.shares ?? shareCount;
      const confirmedTicker = res?.ticker ?? selectedStock.ticker;
      setSuccess(`Executed: ${orderType === "BUY" ? "Bought" : "Sold"} ${confirmedShares} ${confirmedTicker} shares.`);
      setShares(orderType === "BUY" ? 10 : Math.max(0, ownedShares - confirmedShares));
    } catch (err) {
      setError(err?.message || "Failed to execute order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTeam) {
    return (
      <div className="p-6 rounded-xl bg-[#121720] border border-[#232B3B] text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-[#E10600]/15 text-[#E10600] flex items-center justify-center mx-auto border border-[#E10600]/30">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase italic text-white">Login Required to Trade</h3>
          <p className="text-xs text-slate-400 mt-1">Authenticate as Team Leader to place pit stop orders</p>
        </div>
        <Link
          to="/login"
          className="inline-block w-full py-2.5 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-xs uppercase tracking-wider transition-colors"
        >
          Team Login
        </Link>
      </div>
    );
  }
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#121720] border border-[#232B3B] space-y-3.5 h-full flex flex-col justify-between select-none">
      <div className="space-y-3.5">
        {/* Header: Available Cash */}
        <div className="flex items-center justify-between pb-2.5 border-b border-[#1E2638]">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-300">
            <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Available Cash</span>
          </div>
          <div className="font-mono font-black text-sm text-[#10B981]">
            ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
        </div>

        {/* Segmented Buy / Sell Control */}
        <div className="grid grid-cols-2 p-1 rounded-lg bg-[#0A0D12] border border-[#1A202C] gap-1">
          <button
            type="button"
            onClick={() => { setOrderType("BUY"); setError(""); setSuccess(""); }}
            className={`py-2 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              orderType === "BUY"
                ? "bg-[#10B981] text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Buy Stock</span>
          </button>
          <button
            type="button"
            onClick={() => { setOrderType("SELL"); setError(""); setSuccess(""); }}
            className={`py-2 rounded text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
              orderType === "SELL"
                ? "bg-[#E10600] text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Sell Stock</span>
          </button>
        </div>

        {/* Stable Alert Notice Container (Strict 40px height prevents screen jitter/shake) */}
        <div className="h-10 min-h-[40px] max-h-[40px] flex items-center overflow-hidden">
          {error ? (
            <div className="w-full px-3 py-2 rounded-lg bg-[#E10600]/15 border border-[#E10600]/30 text-xs text-[#FF8080] flex items-center gap-2 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#FF4D4D]" />
              <span className="truncate">{error}</span>
            </div>
          ) : success ? (
            <div className="w-full px-3 py-2 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2 animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
              <span className="truncate">{success}</span>
            </div>
          ) : (
            <div className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#1A202C]/60 text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-medium text-slate-300">Live Trading Desk</span>
              </span>
              <span className="font-mono text-[10px] text-emerald-400 font-semibold">Ready to Trade</span>
            </div>
          )}
        </div>

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Stock Dropdown */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1">
              Target Company
            </label>
            <div className="relative">
              <select
                value={selectedStock ? selectedStock.ticker : ""}
                onChange={(e) => handleTickerChange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white font-bold outline-none appearance-none cursor-pointer h-9"
              >
                {stocks.map((stock) => (
                  <option key={stock.ticker} value={stock.ticker} className="bg-[#121720] text-white">
                    {stock.ticker} - {stock.name} (₹{stock.currentPrice.toFixed(2)})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Position Summary Pill (Fixed 2-Line Structure prevents layout shift) */}
          <div className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>Current Position</span>
              <span className="font-mono font-bold text-white">
                {ownedShares} {ownedShares === 1 ? "share" : "shares"}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#1A202C]">
              <span>Avg {ownedShares > 0 ? `₹${avgCost.toFixed(2)}` : "₹0.00"}</span>
              <span className={`font-mono font-bold ${
                ownedShares > 0
                  ? unrealizedPnL >= 0
                    ? "text-[#10B981]"
                    : "text-[#E10600]"
                  : "text-slate-400"
              }`}>
                {ownedShares > 0
                  ? `${unrealizedPnL >= 0 ? "+" : ""}₹${unrealizedPnL.toFixed(2)} (${unrealizedPnLPct.toFixed(1)}%)`
                  : "No open position"}
              </span>
            </div>
          </div>

          {/* Share Quantity Input + Quick % chips */}
          <div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span className="font-bold uppercase tracking-wider text-slate-300">Quantity</span>
              <span className="font-mono text-[10px]">
                {orderType === "BUY" ? `Affordable: ${maxSharesCanBuy}` : `Available: ${ownedShares}`}
              </span>
            </div>

            <div className="space-y-1.5">
              <input
                type="number"
                min="1"
                value={shares}
                onChange={(e) => handleSharesChange(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-base sm:text-xs font-mono font-black text-white outline-none h-9"
              />
              <div className="grid grid-cols-4 gap-1.5">
                {[25, 50, 75, 100].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => handlePercentAllocation(pct)}
                    className="h-7 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 hover:text-white text-[10px] font-mono font-bold border border-[#232B3B] transition-colors flex items-center justify-center"
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Cost Summary */}
          <div className="h-10 px-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex items-center justify-between text-xs">
            <span className="text-slate-300 font-bold uppercase tracking-wider text-[11px]">Total Cost</span>
            <span className="font-mono font-black text-sm text-[#06B6D4]">
              ₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Member View-Only notice */}
          {currentTeam?.userRole === "MEMBER" && (
            <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-400 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>View Only: Team Leader ({currentTeam.leaderName}) executes orders.</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || raceState.status !== "GREEN_FLAG" || !isConnected || currentTeam?.userRole === "MEMBER"}
            className={`w-full h-11 rounded font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              !isConnected || raceState.status !== "GREEN_FLAG" || currentTeam?.userRole === "MEMBER"
                ? "bg-[#1A202C] text-slate-500 border border-[#232B3B] cursor-not-allowed"
                : orderType === "BUY"
                ? "bg-[#10B981] hover:bg-[#059669] text-slate-950 shadow-emerald-500/10 active:scale-[0.99]"
                : "bg-[#E10600] hover:bg-[#C50500] text-white shadow-red-500/10 active:scale-[0.99]"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>
              {raceState.status !== "GREEN_FLAG"
                ? "Trading Frozen"
                : orderType === "BUY"
                ? `Execute Buy: ₹${totalCost.toLocaleString("en-IN")}`
                : `Execute Sell: ₹${totalCost.toLocaleString("en-IN")}`}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}