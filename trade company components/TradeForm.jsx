import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ShieldAlert,
  Wallet
} from "lucide-react";
import { useSimulation } from "../src/context/SimulationContext";

/**
 * @file TradeForm.jsx
 * @description Pit Stop Order Execution Terminal for Imprenditore 5.0.
 * Handles instantaneous market order routing (BUY / SELL) with pre-flight cash
 * balance validation, short-selling prevention, dynamic position sizing,
 * quick percentage allocations, and real-time unrealized P&L telemetry.
 *
 * @param {Object} props - Component properties
 * @param {string} [props.selectedTicker] - Controlled stock ticker passed from parent view
 * @param {Function} [props.onSelectTicker] - Callback invoked when a participant selects a new scrip
 * @returns {JSX.Element} Interactive trading form or authentication gate
 */
export default function TradeForm({ selectedTicker: propTicker, onSelectTicker }) {
  const [searchParams] = useSearchParams();
  const { stocks, currentTeam, currentHoldings, executeTrade, raceState, isConnected } = useSimulation();

  const queryTicker = searchParams.get("ticker");

  // Local state: active ticker selection, order direction (BUY/SELL), and share count
  const [internalTicker, setInternalTicker] = useState(() => propTicker || queryTicker || "APEX");
  const [orderType, setOrderType] = useState("BUY"); // "BUY" | "SELL"
  const [shares, setShares] = useState(10);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeTicker = propTicker || internalTicker;

  /**
   * Synchronizes ticker change across local state and optional parent listener.
   * @param {string} ticker - The newly selected scrip ticker symbol
   */
  const handleTickerChange = (ticker) => {
    setInternalTicker(ticker);
    if (onSelectTicker) {
      onSelectTicker(ticker);
    }
  };

  /**
   * Resolves the full stock object matching the active ticker with safe fallbacks.
   */
  const selectedStock = useMemo(() => {
    return (
      stocks.find((s) => s.ticker === activeTicker) ||
      stocks.find((s) => s.ticker === "APEX" || s.ticker.startsWith("APEX")) ||
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

  /**
   * Computes position sizing based on percentage of capital (for BUY) or owned shares (for SELL).
   * @param {number} pct - Allocation percentage (25, 50, 75, 100)
   */
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

  /**
   * Pre-flight order validation and execution handler.
   * Performs client-side guards against short selling and insufficient cash before
   * submitting the atomic mutation to the Convex backend.
   *
   * @param {React.FormEvent} e - Form submission event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Guard 0: Verify active WebSocket telemetry connection
    if (isConnected === false) {
      setError("Cannot route order while telemetry link is offline. Please wait for reconnection.");
      return;
    }

    // Guard 1: Verify authenticated team session
    if (!currentTeam) {
      setError("Please log in to your team to place trades.");
      return;
    }

    // Guard 1.5: Verify Team Leader bidding authorization
    if (currentTeam.userRole === "MEMBER") {
      setError(
        `View Only Mode: Only the designated Team Leader (${currentTeam.leaderName}) can execute trades.`
      );
      return;
    }

    // Guard 2: Verify valid target scrip
    if (!selectedStock) {
      setError("Please select a target company.");
      return;
    }

    // Guard 3: Validate strictly positive integer share quantities
    const shareCount = Math.floor(numericShares);
    if (shareCount <= 0 || !Number.isFinite(shareCount)) {
      setError("Share quantity must be a positive whole number.");
      return;
    }

    // Guard 4: Validate cash sufficiency for Buy orders
    if (orderType === "BUY" && totalCost > availableCash) {
      setError(
        `Insufficient cash balance. Order requires ₹${totalCost.toLocaleString("en-IN")}, but available cash is ₹${Math.floor(availableCash).toLocaleString("en-IN")}.`
      );
      return;
    }

    // Guard 5: Prevent short selling on Sell orders
    if (orderType === "SELL" && shareCount > ownedShares) {
      setError(
        `Short selling is not permitted. You attempted to sell ${shareCount} shares, but only own ${ownedShares} shares.`
      );
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
      const confirmedAmount =
        typeof res?.totalAmount === "number"
          ? res.totalAmount
          : typeof res?.totalCost === "number"
          ? res.totalCost
          : totalCost;

      setSuccess(
        `Order Executed: ${orderType === "BUY" ? "Bought" : "Sold"} ${confirmedShares} shares of ${confirmedTicker} for ₹${confirmedAmount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}.`
      );
      setShares(orderType === "BUY" ? 10 : Math.max(0, ownedShares - confirmedShares));
    } catch (err) {
      setError(err?.message || "Failed to execute order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentTeam) {
    return (
      <div className="w-full p-6 sm:p-8 rounded-xl bg-[#121720] border border-[#232B3B] text-center my-4">
        <div className="w-10 h-10 rounded bg-[#E10600]/15 text-[#E10600] flex items-center justify-center mx-auto mb-3 border border-[#E10600]/30">
          <Zap className="w-5 h-5" />
        </div>
        <h3 className="text-base font-black uppercase italic tracking-wide text-white mb-1.5">
          Login Required to Trade
        </h3>
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          You must be logged in as a Team Leader to execute stock orders.
        </p>
        <Link
          to="/login"
          className="block w-full py-2.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors"
        >
          Go to Team Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full p-4 sm:p-5 rounded-xl bg-[#121720] border border-[#232B3B] font-sans flex flex-col justify-between">
      {/* Order Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#1E2638] mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-[#E10600] flex items-center justify-center text-white font-black text-xs shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase italic tracking-tight text-white">
              Buy &amp; Sell Shares
            </h2>
            <div className="text-[11px] text-slate-400 font-medium">
              Round {raceState.currentLap}/5 • {raceState.status === "GREEN_FLAG" ? "Market Live" : "Market Paused"}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 justify-end">
            <Wallet className="w-3 h-3 text-[#10B981]" />
            <span>Available Cash</span>
          </div>
          <div className="text-sm font-black font-mono text-[#10B981]">
            ₹{availableCash.toLocaleString("en-IN")}
          </div>
        </div>
      </div>

      {/* Order Type Tabs: BUY / SELL */}
      <div className="grid grid-cols-2 gap-1.5 bg-[#0A0D12] p-1 rounded-lg border border-[#1A202C] mb-4">
        <button
          type="button"
          onClick={() => {
            setOrderType("BUY");
            setError("");
            setSuccess("");
          }}
          className={`py-2 rounded-md text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
            orderType === "BUY" ? "bg-[#10B981] text-slate-950" : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Buy Stock</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setOrderType("SELL");
            setError("");
            setSuccess("");
          }}
          className={`py-2 rounded-md text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
            orderType === "SELL" ? "bg-[#E10600] text-white" : "text-slate-400 hover:text-white"
          }`}
        >
          <TrendingDown className="w-3.5 h-3.5" />
          <span>Sell Stock</span>
        </button>
      </div>

      {/* Error & Success Alerts */}
      {error && (
        <div className="mb-3.5 p-2.5 rounded-lg bg-[#E10600]/10 border border-[#E10600]/30 text-xs text-[#FF8080] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E10600]" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-3.5 p-2.5 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
          <span>{success}</span>
        </div>
      )}

      {/* Trade Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Company Dropdown Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
            Target Company
          </label>
          <div className="relative">
            <select
              value={selectedStock ? selectedStock.ticker : ""}
              onChange={(e) => handleTickerChange(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white font-bold outline-none appearance-none cursor-pointer"
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

        {/* Current Position Card for this Stock */}
        <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-xs space-y-1.5">
          <div className="flex items-center justify-between text-slate-400">
            <span>Current Holding</span>
            <span className="font-mono font-bold text-white">
              {ownedShares} {ownedShares === 1 ? "share" : "shares"}
            </span>
          </div>
          {ownedShares > 0 && (
            <>
              <div className="flex items-center justify-between text-slate-400">
                <span>Average Cost</span>
                <span className="font-mono text-white">₹{avgCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Unrealized P&L</span>
                <span
                  className={`font-mono font-bold ${
                    unrealizedPnL >= 0 ? "text-[#10B981]" : "text-[#E10600]"
                  }`}
                >
                  {unrealizedPnL >= 0 ? "+₹" : "-₹"}
                  {Math.abs(unrealizedPnL).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}{" "}
                  ({unrealizedPnLPct >= 0 ? "+" : ""}
                  {unrealizedPnLPct.toFixed(1)}%)
                </span>
              </div>
            </>
          )}
        </div>

        {/* Share Quantity Input with Quick % Allocation Buttons */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quantity of Shares
            </label>
            <span className="text-[10px] text-slate-400 font-mono">
              {orderType === "BUY" ? `Affordable: ${maxSharesCanBuy}` : `Available: ${ownedShares}`}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="number"
              min="1"
              value={shares}
              onChange={(e) => handleSharesChange(e.target.value)}
              className="w-full flex-1 px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white font-mono font-bold outline-none"
            />
            <div className="grid grid-cols-4 sm:flex gap-1 w-full sm:w-auto shrink-0">
              {[25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentAllocation(pct)}
                  className="px-2 py-1.5 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 hover:text-white text-[10px] font-mono font-bold border border-[#232B3B] transition-colors text-center"
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Order Breakdown Summary */}
        <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-1.5 text-xs">
          <div className="flex justify-between text-slate-400">
            <span>Price per share</span>
            <span className="font-mono text-white">
              ₹{selectedStock ? selectedStock.currentPrice.toFixed(2) : "0.00"}
            </span>
          </div>
          <div className="flex justify-between text-slate-400">
            <span>Execution Quantity</span>
            <span className="font-mono text-white">{shares} shares</span>
          </div>
          <div className="pt-2 border-t border-[#1A202C] flex justify-between font-bold text-xs">
            <span className="text-white">Total Order Value</span>
            <span className="font-mono text-[#06B6D4]">
              ₹{totalCost.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* View Only Mode Banner for Team Members */}
        {currentTeam?.userRole === "MEMBER" && (
          <div className="p-3 rounded-lg bg-[#EAB308]/10 border border-[#EAB308]/30 text-xs text-[#EAB308] flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 text-[#EAB308] mt-0.5" />
            <div>
              <div className="font-bold uppercase tracking-wider text-[#FACC15]">
                Team Member (View Only Mode)
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
                You are logged in as <strong className="text-white">{currentTeam.currentMemberName || "Team Member"}</strong>. In accordance with competition rules, only the designated Team Leader (<strong className="text-white">{currentTeam.leaderName}</strong>) can place bids and execute trades.
              </p>
            </div>
          </div>
        )}

        {/* Market State Alert Banner */}
        {raceState.status !== "GREEN_FLAG" && (
          <div
            className={`p-2.5 rounded-lg border text-[11px] font-bold flex items-center gap-2 ${
              raceState.status === "GRID_WARMUP"
                ? "bg-[#06B6D4]/10 border-[#06B6D4]/30 text-[#06B6D4]"
                : raceState.status === "SAFETY_CAR"
                ? "bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]"
                : "bg-[#E10600]/10 border-[#E10600]/30 text-[#FF8080]"
            }`}
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>
              {raceState.status === "GRID_WARMUP" &&
                "Warmup: Trading opens when the round starts."}
              {raceState.status === "SAFETY_CAR" &&
                "Trading Paused: Order execution temporarily frozen by Admin."}
              {raceState.status === "CHECKERED_FLAG" &&
                "Market Closed: Simulation concluded. Final trading ended."}
            </span>
          </div>
        )}

        {/* Execute Button */}
        <button
          type="submit"
          disabled={isSubmitting || raceState.status !== "GREEN_FLAG" || !isConnected || currentTeam?.userRole === "MEMBER"}
          className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
            !isConnected || raceState.status !== "GREEN_FLAG" || currentTeam?.userRole === "MEMBER"
              ? "bg-[#1A202C] text-slate-500 border border-[#232B3B] cursor-not-allowed"
              : orderType === "BUY"
              ? "bg-[#10B981] hover:bg-[#059669] text-slate-950 shadow-sm"
              : "bg-[#E10600] hover:bg-[#C50500] text-white shadow-sm"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>
            {currentTeam?.userRole === "MEMBER"
              ? "View Only Mode (Leader Executes Orders)"
              : !isConnected
              ? "Offline (Reconnecting...)"
              : raceState.status === "GRID_WARMUP"
              ? "Trading Locked (Pre-Round Warmup)"
              : raceState.status === "SAFETY_CAR"
              ? "Trading Paused (Admin Pause)"
              : raceState.status === "CHECKERED_FLAG"
              ? "Market Closed (Competition Ended)"
              : orderType === "BUY"
              ? `Execute Buy: ₹${totalCost.toLocaleString("en-IN")}`
              : `Execute Sell: ₹${totalCost.toLocaleString("en-IN")}`}
          </span>
        </button>
      </form>
    </div>
  );
}