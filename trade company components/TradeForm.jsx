import { useState, useMemo } from "react";
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

  const [internalTicker, setInternalTicker] = useState(() => propTicker || "APEX");
  const [orderType, setOrderType] = useState("BUY"); // "BUY" | "SELL"
  const [shares, setShares] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setError("Cannot route order while offline. Reconnecting...");
      return;
    }

    if (!currentTeam) {
      setError("Please log in to your team to place trades.");
      return;
    }

    if (currentTeam.userRole === "MEMBER") {
      setError(`View Only Mode: Only Team Leader (${currentTeam.leaderName}) can execute trades.`);
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
      setError(`Insufficient cash balance (₹${Math.floor(availableCash).toLocaleString("en-IN")} available).`);
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
      <div className="p-6 rounded-xl bg-[#0D121D] border border-[#1A2336] text-center space-y-4">
        <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">Authentication Required</h3>
          <p className="text-xs text-slate-400 mt-1">Sign in with your team PIN to place orders</p>
        </div>
        <Link
          to="/login"
          className="inline-block w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
        >
          Sign In to Trade
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-4">
      {/* Header: Available Cash */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1A2336]">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Wallet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Available Cash</span>
        </div>
        <div className="font-mono font-bold text-sm text-emerald-400">
          ₹{availableCash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </div>
      </div>

      {/* Segmented Buy / Sell Control */}
      <div className="grid grid-cols-2 p-1 rounded-lg bg-[#090D14] border border-[#1A2336] gap-1">
        <button
          type="button"
          onClick={() => { setOrderType("BUY"); setError(""); setSuccess(""); }}
          className={`py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            orderType === "BUY"
              ? "bg-emerald-500 text-slate-950 shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Buy</span>
        </button>
        <button
          type="button"
          onClick={() => { setOrderType("SELL"); setError(""); setSuccess(""); }}
          className={`py-2 rounded-md text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            orderType === "SELL"
              ? "bg-rose-500 text-white shadow-xs"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Sell</span>
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{error}</span>
        </div>
      )}
      {success && (
        <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span className="truncate">{success}</span>
        </div>
      )}

      {/* Order Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Company Dropdown */}
        <div>
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Target Scrip
          </label>
          <div className="relative">
            <select
              value={selectedStock ? selectedStock.ticker : ""}
              onChange={(e) => handleTickerChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white font-medium outline-none appearance-none cursor-pointer"
            >
              {stocks.map((stock) => (
                <option key={stock.ticker} value={stock.ticker} className="bg-[#0D121D] text-white">
                  {stock.ticker} - {stock.name} (₹{stock.currentPrice.toFixed(2)})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Position Summary Pill */}
        <div className="p-2.5 rounded-lg bg-[#090D14] border border-[#161F30] text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span>Current Position</span>
            <span className="font-mono font-semibold text-white">
              {ownedShares} shares
            </span>
          </div>
          {ownedShares > 0 && (
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-[#161F30]">
              <span>Avg ₹{avgCost.toFixed(2)}</span>
              <span className={`font-mono font-semibold ${unrealizedPnL >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {unrealizedPnL >= 0 ? "+" : ""}₹{unrealizedPnL.toFixed(2)} ({unrealizedPnLPct.toFixed(1)}%)
              </span>
            </div>
          )}
        </div>

        {/* Share Quantity Input + Quick % chips */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider">Quantity</span>
            <span className="font-mono">
              {orderType === "BUY" ? `Affordable: ${maxSharesCanBuy}` : `Available: ${ownedShares}`}
            </span>
          </div>

          <div className="space-y-2">
            <input
              type="number"
              min="1"
              value={shares}
              onChange={(e) => handleSharesChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs font-mono font-bold text-white outline-none"
            />
            <div className="grid grid-cols-4 gap-1.5">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentAllocation(pct)}
                  className="py-1 rounded bg-[#121824] hover:bg-[#182234] text-slate-300 hover:text-white text-[10px] font-mono font-semibold border border-[#1C263B] transition-colors"
                >
                  {pct === 100 ? "Max" : `${pct}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Cost Summary */}
        <div className="p-3 rounded-lg bg-[#090D14] border border-[#161F30] flex items-center justify-between text-xs">
          <span className="text-slate-400 font-medium">Estimated Total</span>
          <span className="font-mono font-bold text-sm text-white">
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
          className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-sm ${
            !isConnected || raceState.status !== "GREEN_FLAG" || currentTeam?.userRole === "MEMBER"
              ? "bg-[#161E2E] text-slate-500 border border-[#20293D] cursor-not-allowed"
              : orderType === "BUY"
              ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/10"
              : "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/10"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>
            {raceState.status !== "GREEN_FLAG"
              ? "Market Paused"
              : orderType === "BUY"
              ? `Buy ${selectedStock?.ticker || "Stock"}`
              : `Sell ${selectedStock?.ticker || "Stock"}`}
          </span>
        </button>
      </form>
    </div>
  );
}