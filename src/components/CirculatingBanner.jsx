import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronRight,
  ChevronLeft,
  Radio,
  History,
  RotateCcw
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function CirculatingBanner() {
  const { raceState, stocks, trackEvents } = useSimulation();

  // 0 = Current Live News; 1..5 = Previous 5 Broadcasted News Items
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
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
      list.push({
        id: "active_live_news",
        tag: "LIVE WIRE",
        tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40",
        headline: text,
        timestamp: raceState.updatedAt || 0,
        isLive: true,
        linkTo: "/trade",
        linkText: "Trade Stocks"
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

        list.push({
          id: evt.id || evt._id || `evt_${evt.timestamp || i}`,
          tag,
          tagColor,
          headline: title ? (desc && desc !== title ? `${title}: ${desc}` : title) : desc,
          timestamp: evt.timestamp || 0,
          isLive: false,
          linkTo: "/trade",
          linkText: "Trade Stock"
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
          timestamp: 0,
          isLive: true,
          linkTo: `/trade?ticker=${topGainer.ticker}`,
          linkText: "Trade Stock"
        });
      } else if (topLoser && topLoser.changePercent < 0) {
        list.push({
          id: "top_loser_init",
          tag: "MARKET DIP",
          tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40",
          headline: `${topLoser.ticker} (${topLoser.name}) corrects ${topLoser.changePercent}% to ₹${topLoser.currentPrice.toFixed(2)}`,
          timestamp: 0,
          isLive: true,
          linkTo: `/trade?ticker=${topLoser.ticker}`,
          linkText: "Buy Dip"
        });
      } else {
        list.push({
          id: "market_open_init",
          tag: "MARKET OPEN",
          tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
          headline: "Trading is live across all 17 equities with ₹1,00,000 starting mock capital.",
          timestamp: 0,
          isLive: true,
          linkTo: "/trade",
          linkText: "Open Cockpit"
        });
      }
    }

    // Limit to maximum 6 items: Current news + at most 5 past news
    return list.slice(0, 6);
  }, [raceState, trackEvents, topGainer, topLoser]);

  // When a new live event flows in from race control, reset to current live news (index 0)
  const currentLiveKey = newsStream[0]?.id || newsStream[0]?.headline;
  useEffect(() => {
    if (prevLiveNewsRef.current && prevLiveNewsRef.current !== currentLiveKey) {
      setHistoryIndex(0);
    }
    prevLiveNewsRef.current = currentLiveKey;
  }, [currentLiveKey]);

  const currentItem = newsStream[historyIndex] || newsStream[0];
  const isViewingHistory = historyIndex > 0;
  const maxHistoryReached = historyIndex >= newsStream.length - 1 || historyIndex >= 5;

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP VIEW (md: and up): Sleek Broadcast Ribbon Header     */}
      {/* ============================================================== */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:block relative bg-[#090D14] border-b border-[#182133] px-4 sm:px-6 py-2 text-xs select-none transition-colors duration-200"
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

            {/* Headline Text */}
            <div className="overflow-hidden relative flex-1 min-w-0 h-5 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${currentItem.id}_${historyIndex}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="flex items-center gap-2.5 truncate"
                >
                  <span className="text-slate-200 font-medium text-xs tracking-normal truncate">
                    {currentItem.headline}
                  </span>

                  {currentItem.linkTo && (
                    <Link
                      to={currentItem.linkTo}
                      className="inline-flex items-center text-[10px] font-semibold text-rose-400 hover:text-white shrink-0 gap-0.5 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 transition-colors"
                    >
                      <span>{currentItem.linkText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: History Navigation Controls (Previous 5 News only, NO Future News) */}
          <div className="flex items-center gap-2 shrink-0">
            {isHovered && !isViewingHistory && (
              <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
                Click arrows for past 5 news
              </span>
            )}

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
      {/* 2. MOBILE VIEW (md:hidden): Floating Right-to-Left Ticker Ribbon*/}
      {/* Smooth continuous right-to-left marquee with NO popup alerts!   */}
      {/* ============================================================== */}
      <div className="md:hidden bg-[#090D14] border-b border-[#182133] px-2.5 py-1.5 text-xs select-none">
        <div className="flex items-center justify-between gap-2 h-7">
          {/* Left: Compact Live or History badge */}
          <div className="flex items-center gap-1 shrink-0 z-10 bg-[#090D14] pr-1.5 border-r border-[#182133]">
            {!isViewingHistory ? (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
              </span>
            ) : (
              <History className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            )}
            <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono font-bold uppercase tracking-wider border ${
              isViewingHistory
                ? "text-amber-300 bg-amber-500/15 border-amber-500/30"
                : "text-rose-300 bg-rose-500/15 border-rose-500/30"
            }`}>
              {isViewingHistory ? `-${historyIndex}` : "LIVE"}
            </span>
          </div>

          {/* Center: Smooth Floating Text from Right to Left */}
          <div className="overflow-hidden relative flex-1 min-w-0 h-full flex items-center">
            <div
              key={`${currentItem.id}_${historyIndex}`}
              className="animate-ticker-rtl text-[11px] font-medium text-slate-100 flex items-center cursor-pointer"
              title="Touch and hold to pause ticker"
            >
              <span className="inline-block mr-12">{currentItem.headline}</span>
              <span className="inline-block mr-12 text-[#E10600] font-black">•</span>
              <span className="inline-block mr-12">{currentItem.headline}</span>
            </div>
          </div>

          {/* Right: Quick Previous / Next News Buttons (Capped at 5 past, 0 future) */}
          <div className="flex items-center gap-0.5 shrink-0 z-10 bg-[#090D14] pl-1.5 border-l border-[#182133]">
            {isViewingHistory && (
              <button
                type="button"
                onClick={() => setHistoryIndex(0)}
                className="p-1 rounded text-amber-400 hover:text-white"
                title="Jump to live"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setHistoryIndex((prev) => Math.min(newsStream.length - 1, Math.min(5, prev + 1)))}
              disabled={maxHistoryReached}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
              aria-label="Previous News"
              title="Previous news"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[9px] font-mono font-bold text-slate-400 min-w-[16px] text-center">
              {historyIndex === 0 ? "0" : `-${historyIndex}`}
            </span>
            <button
              type="button"
              onClick={() => setHistoryIndex((prev) => Math.max(0, prev - 1))}
              disabled={historyIndex <= 0}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-20 cursor-pointer"
              aria-label="Newer News"
              title="Newer news (future unavailable)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
