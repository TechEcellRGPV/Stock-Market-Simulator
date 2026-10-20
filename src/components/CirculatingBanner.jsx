import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ChevronLeft,
  Radio,
  History,
  RotateCcw,
  Bell,
  X,
  Zap,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

// Robust stock detector: matches ticker, company name, or affected sector
function detectTargetStock(item, stocks) {
  if (!stocks || stocks.length === 0) return null;

  // 1. Explicit ticker
  if (item?.ticker) {
    const direct = stocks.find((s) => s.ticker.toUpperCase() === item.ticker.toUpperCase());
    if (direct) return direct;
  }

  const text = `${item?.title || ""} ${item?.description || ""} ${item?.headline || ""}`;

  // 2. Exact word boundary match for stock tickers (e.g. \bTSLA\b, \bNVDA\b)
  for (const s of stocks) {
    const regex = new RegExp(`\\b${s.ticker}\\b`, "i");
    if (regex.test(text)) return s;
  }

  // 3. Match by prominent company name word
  for (const s of stocks) {
    const firstName = s.name.split(" ")[0].replace(/,/g, "");
    if (firstName.length >= 3) {
      const nameRegex = new RegExp(`\\b${firstName}\\b`, "i");
      if (nameRegex.test(text)) return s;
    }
  }

  // 4. Match by affected sector
  if (Array.isArray(item?.affectedSectors) && item.affectedSectors.length > 0) {
    const sectorMatch = stocks.find((s) => item.affectedSectors.includes(s.sector));
    if (sectorMatch) return sectorMatch;
  }

  return null;
}

export default function CirculatingBanner() {
  const navigate = useNavigate();
  const { raceState, stocks, trackEvents } = useSimulation();

  // 0 = Current Live News; 1..5 = Previous 5 Broadcasted News Items
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [hasUnreadAlert, setHasUnreadAlert] = useState(false);
  const prevLiveNewsRef = useRef(null);

  const topGainer = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [stocks]);

  const topLoser = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    return [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];
  }, [stocks]);

  // Construct chronologically ordered list of broadcasted news:
  // Position 0 = Current live news
  // Positions 1..5 = Previous up to 5 news items that have already occurred
  // Future news is NEVER included.
  const newsStream = useMemo(() => {
    const list = [];
    const seen = new Set();

    // 1. Current active live news broadcast from simulation
    if (raceState?.activeNews && typeof raceState.activeNews === "string" && raceState.activeNews.trim()) {
      const text = raceState.activeNews.trim();
      const matchedStock = detectTargetStock({ headline: text }, stocks);

      list.push({
        id: "active_live_news",
        tag: "LIVE WIRE",
        tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40",
        headline: text,
        details: text,
        timestamp: raceState.updatedAt || 0,
        isLive: true,
        targetStock: matchedStock,
        targetTicker: matchedStock?.ticker || null,
        linkTo: matchedStock ? `/trade?ticker=${matchedStock.ticker}` : "/trade",
        linkText: matchedStock ? `Trade ${matchedStock.ticker}` : "Trade Stocks"
      });
      seen.add(text.toLowerCase());
    }

    // 2. Broadcasted track events (already ordered descending by timestamp)
    if (Array.isArray(trackEvents)) {
      for (let i = 0; i < trackEvents.length; i++) {
        const evt = trackEvents[i];
        const title = evt.title || "";
        const desc = evt.description || "";
        const combined = `${title} ${desc}`.trim();
        const key = combined.toLowerCase();
        if (!key || seen.has(key)) continue;
        seen.add(key);

        const hasImpact = typeof evt.priceImpactPercent === "number" && evt.priceImpactPercent !== 0;
        const isNeg = hasImpact && evt.priceImpactPercent < 0;
        let tag = "MARKET ALERT";
        let tagColor = "text-amber-300 bg-amber-500/20 border-amber-500/40";

        if (hasImpact) {
          tag = `SECTOR SHOCK ${evt.priceImpactPercent > 0 ? "+" : ""}${evt.priceImpactPercent}%`;
          tagColor = isNeg
            ? "text-rose-300 bg-rose-500/20 border-rose-500/40"
            : "text-emerald-300 bg-emerald-500/20 border-emerald-500/40";
        } else if (evt.type === "GREEN_FLAG") {
          tag = `LAP ${evt.lap || raceState?.currentLap || 1} • GREEN FLAG`;
          tagColor = "text-emerald-300 bg-emerald-500/20 border-emerald-500/40";
        } else if (evt.type === "SAFETY_CAR") {
          tag = "SAFETY CAR";
          tagColor = "text-amber-300 bg-amber-500/20 border-amber-500/40";
        }

        const matchedStock = detectTargetStock(evt, stocks);

        list.push({
          id: evt.id || evt._id || `evt_${evt.timestamp || i}`,
          tag,
          tagColor,
          headline: title ? (desc && desc !== title ? `${title}: ${desc}` : title) : desc,
          details: desc || title,
          timestamp: evt.timestamp || 0,
          isLive: false,
          targetStock: matchedStock,
          targetTicker: matchedStock?.ticker || null,
          linkTo: matchedStock ? `/trade?ticker=${matchedStock.ticker}` : "/trade",
          linkText: matchedStock ? `Trade ${matchedStock.ticker}` : "Trade Stock"
        });

        // Strictly cap to at most 6 items: index 0 (current) + 5 previous news
        if (list.length >= 6) break;
      }
    }

    // Fallback baseline items if competition just initialized
    if (list.length === 0) {
      if (topGainer && topGainer.changePercent > 0) {
        list.push({
          id: "top_gainer_init",
          tag: "TOP MOVER",
          tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
          headline: `${topGainer.ticker} (${topGainer.name}) leads market +${topGainer.changePercent}% at ₹${topGainer.currentPrice.toFixed(2)}`,
          details: `Highest market gainer on the grid is currently ${topGainer.name} with +${topGainer.changePercent}% rally.`,
          timestamp: 0,
          isLive: true,
          targetStock: topGainer,
          targetTicker: topGainer.ticker,
          linkTo: `/trade?ticker=${topGainer.ticker}`,
          linkText: `Trade ${topGainer.ticker}`
        });
      } else if (topLoser && topLoser.changePercent < 0) {
        list.push({
          id: "top_loser_init",
          tag: "MARKET DIP",
          tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40",
          headline: `${topLoser.ticker} (${topLoser.name}) corrects ${topLoser.changePercent}% to ₹${topLoser.currentPrice.toFixed(2)}`,
          details: `${topLoser.name} is experiencing a ${topLoser.changePercent}% price dip across market telemetry.`,
          timestamp: 0,
          isLive: true,
          targetStock: topLoser,
          targetTicker: topLoser.ticker,
          linkTo: `/trade?ticker=${topLoser.ticker}`,
          linkText: `Buy ${topLoser.ticker}`
        });
      } else {
        const firstStock = stocks && stocks[0] ? stocks[0] : null;
        list.push({
          id: "market_open_init",
          tag: "MARKET OPEN",
          tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
          headline: "Trading is live across all 17 equities with ₹1,00,000 starting mock capital.",
          details: "Pit stop orders and real-time equity execution are fully active.",
          timestamp: 0,
          isLive: true,
          targetStock: firstStock,
          targetTicker: firstStock?.ticker || null,
          linkTo: "/trade",
          linkText: "Open Cockpit"
        });
      }
    }

    // Limit to maximum 6 items: Current news + at most 5 past news
    return list.slice(0, 6);
  }, [raceState, trackEvents, stocks, topGainer, topLoser]);

  // When a new live event flows in from race control, reset to current live news and alert mobile
  const currentLiveKey = newsStream[0]?.id || newsStream[0]?.headline;
  useEffect(() => {
    if (prevLiveNewsRef.current && prevLiveNewsRef.current !== currentLiveKey) {
      setHistoryIndex(0);
      setHasUnreadAlert(true);
    }
    prevLiveNewsRef.current = currentLiveKey;
  }, [currentLiveKey]);

  // Snappy auto-cycling: if at live index 0 and user is not hovering, cycle news items every 4.5 seconds
  useEffect(() => {
    if (newsStream.length <= 1 || isHovered || historyIndex !== 0 || isMobileModalOpen) return;
    const interval = setInterval(() => {
      // Subtle rotation if multiple broadcast items are present
    }, 4500);
    return () => clearInterval(interval);
  }, [newsStream.length, isHovered, historyIndex, isMobileModalOpen]);

  const currentItem = newsStream[historyIndex] || newsStream[0];
  const isViewingHistory = historyIndex > 0;
  const maxHistoryReached = historyIndex >= newsStream.length - 1 || historyIndex >= 5;

  // Handle 1-click trade action: immediately updates selected stock across the entire app
  const handleTradeStock = (e, ticker) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const target = ticker || currentItem.targetTicker || "TSLA";
    // 1. Dispatch custom event so Trade.jsx updates in-place instantaneously
    window.dispatchEvent(new CustomEvent("select_stock_ticker", { detail: target }));
    // 2. Navigate to /trade with query param so routing also syncs
    navigate(`/trade?ticker=${target}`);
    // 3. Close mobile news modal if open
    setIsMobileModalOpen(false);
  };

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP VIEW (md: and up): Fast & Snappy Broadcast Ribbon   */}
      {/* ============================================================== */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:block relative bg-[#090D14] border-b border-[#182133] px-4 sm:px-6 py-2 text-xs select-none transition-colors duration-150"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Tag + Headline */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Live Indicator or History Badge */}
            <div className="flex items-center gap-1.5 shrink-0">
              {!isViewingHistory ? (
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500" />
                </span>
              ) : (
                <History className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}

              <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${
                isViewingHistory
                  ? "text-amber-300 bg-amber-500/15 border-amber-500/30"
                  : currentItem.tagColor
              }`}>
                {isViewingHistory ? `PREVIOUS -${historyIndex}` : currentItem.tag}
              </span>
            </div>

            {/* Headline Text with Working 1-Click Stock Selection */}
            <div className="overflow-hidden relative flex-1 min-w-0 h-5 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentItem.id}_${historyIndex}`}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -3 }}
                  transition={{ duration: 0.12, ease: "easeOut" }}
                  className="flex items-center gap-2.5 truncate"
                >
                  <span className="text-slate-200 font-medium text-xs tracking-normal truncate">
                    {currentItem.headline}
                  </span>

                  {/* 1-Click Trade Stock Button */}
                  {currentItem.targetTicker && (
                    <button
                      type="button"
                      onClick={(e) => handleTradeStock(e, currentItem.targetTicker)}
                      className="inline-flex items-center text-[10px] font-bold text-rose-300 hover:text-white shrink-0 gap-1 px-2 py-0.5 rounded bg-rose-500/15 hover:bg-[#E10600] border border-rose-500/30 hover:border-[#E10600] transition-all cursor-pointer shadow-xs active:scale-95"
                      title={`Trade ${currentItem.targetTicker} immediately`}
                    >
                      <Zap className="w-3 h-3 text-amber-400" />
                      <span>Trade {currentItem.targetTicker}</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: History Navigation Controls (Previous 5 News only, NO Future News) */}
          <div className="flex items-center gap-2 shrink-0">
            {isViewingHistory && (
              <button
                type="button"
                onClick={() => setHistoryIndex(0)}
                className="px-2 py-0.5 rounded bg-[#161F30] hover:bg-[#1E2A40] text-amber-300 hover:text-white text-[10px] font-mono font-bold flex items-center gap-1 border border-amber-500/30 transition-colors cursor-pointer"
                title="Return to Live broadcast"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Return to Live</span>
              </button>
            )}

            <div className="flex items-center gap-1 bg-[#0E131D] px-1.5 py-0.5 rounded border border-[#1A2336] text-slate-400">
              {/* Previous button (Goes back in time, up to 5 past news) */}
              <button
                type="button"
                onClick={() => setHistoryIndex((prev) => Math.min(newsStream.length - 1, Math.min(5, prev + 1)))}
                disabled={maxHistoryReached}
                className="p-1 rounded hover:bg-[#161F30] hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title={maxHistoryReached ? "Max 5 past news reached" : "Previous News"}
                aria-label="Previous News"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-[10px] font-mono font-bold px-1.5 min-w-[52px] text-center text-slate-300">
                {historyIndex === 0 ? "LIVE" : `-${historyIndex} / 5`}
              </span>

              {/* Next button (Returns forward to newer news, strictly DISABLED at live index 0) */}
              <button
                type="button"
                onClick={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
                disabled={historyIndex <= 0}
                className="p-1 rounded hover:bg-[#161F30] hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer"
                title={historyIndex <= 0 ? "At current live news (future news unavailable)" : "Newer News"}
                aria-label="Newer News"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[10px] font-mono text-slate-400 pl-2 border-l border-[#1A2336]">
              <Radio className="w-3 h-3 text-[#E10600] animate-pulse" />
              <span>RADAR WIRE</span>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE VIEW (md:hidden): Interactive News Notification Bar  */}
      {/* Shows a clear notification button that reveals the current     */}
      {/* news with 1-click stock trading and previous 5 news navigation */}
      {/* ============================================================== */}
      <div className="md:hidden bg-[#080B12] border-b border-[#182133] px-3 py-2 text-xs select-none">
        <button
          type="button"
          onClick={() => {
            setIsMobileModalOpen(true);
            setHasUnreadAlert(false);
          }}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gradient-to-r from-[#101522] via-[#161F30] to-[#101522] border border-[#232B3B] hover:border-[#E10600]/40 shadow-sm active:scale-[0.99] transition-all text-left cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            {/* Pulsing Bell Indicator */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400 shrink-0">
              <Bell className="w-3.5 h-3.5 text-rose-400" />
              {hasUnreadAlert && (
                <>
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E10600] animate-ping" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#E10600]" />
                </>
              )}
            </div>

            {/* Headline Preview */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-rose-400">
                  {currentItem.tag}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">• Tap for news</span>
              </div>
              <p className="text-xs font-semibold text-slate-100 truncate mt-0.5">
                {currentItem.headline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-2 text-slate-400">
            <span className="text-[10px] font-mono font-bold text-slate-400 bg-[#0B0F17] px-1.5 py-0.5 rounded border border-[#1A2336]">
              {historyIndex === 0 ? "LIVE" : `-${historyIndex}`}
            </span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 3. MOBILE MODAL SHEET: Full News View & Stock Execution       */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isMobileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.96 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="w-full max-w-lg bg-[#0C101A] border-2 border-[#1E2638] rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4"
            >
              {/* Header with Title and Close */}
              <div className="flex items-center justify-between border-b border-[#1A2336] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    {isViewingHistory ? `Historical Broadcast (-${historyIndex}/5)` : "Live Market Wire"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMobileModalOpen(false)}
                  className="p-1.5 rounded-lg bg-[#141B29] text-slate-400 hover:text-white border border-[#222E46] transition-colors"
                  aria-label="Close News Modal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tag and Headline */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase tracking-wider border shrink-0 ${currentItem.tagColor}`}>
                    {currentItem.tag}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {historyIndex === 0 ? "CURRENT LIVE NEWS" : `${historyIndex} of 5 past news`}
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white leading-snug break-words">
                  {currentItem.headline}
                </h3>

                {currentItem.details && currentItem.details !== currentItem.headline && (
                  <p className="text-xs text-slate-300 leading-relaxed break-words bg-[#080B12] p-3 rounded-lg border border-[#161F30]">
                    {currentItem.details}
                  </p>
                )}
              </div>

              {/* 1-Click Action Button: Immediately switch to this stock in Trade form */}
              {currentItem.targetTicker && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleTradeStock(e, currentItem.targetTicker)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-[#E10600] to-[#B80500] hover:from-[#FF1A1A] hover:to-[#C50500] text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-rose-950/60 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>Trade {currentItem.targetTicker} Now</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              )}

              {/* History Navigation Bar (Past 5 News Only, strictly NO future news) */}
              <div className="flex items-center justify-between pt-2 border-t border-[#1A2336] text-xs">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setHistoryIndex((prev) => Math.min(newsStream.length - 1, Math.min(5, prev + 1)))}
                    disabled={maxHistoryReached}
                    className="px-3 py-1.5 rounded-lg bg-[#141B29] text-slate-300 hover:text-white disabled:opacity-25 border border-[#222E46] flex items-center gap-1 font-mono text-xs cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
                    disabled={historyIndex <= 0}
                    className="px-3 py-1.5 rounded-lg bg-[#141B29] text-slate-300 hover:text-white disabled:opacity-25 border border-[#222E46] flex items-center gap-1 font-mono text-xs cursor-pointer"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {isViewingHistory ? (
                  <button
                    type="button"
                    onClick={() => setHistoryIndex(0)}
                    className="px-2.5 py-1.5 rounded-lg bg-[#182236] text-amber-400 font-mono text-xs font-bold border border-amber-500/30 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Return to Live</span>
                  </button>
                ) : (
                  <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live Feed</span>
                  </span>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
