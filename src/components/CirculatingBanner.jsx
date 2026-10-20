import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronLeft,
  Bell,
  Radio,
  Sparkles,
  Maximize2,
  X
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function CirculatingBanner() {
  const { raceState, stocks, trackEvents } = useSimulation();
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prevNews, setPrevNews] = useState(raceState?.activeNews);
  const [showFullNewsModal, setShowFullNewsModal] = useState(false);

  // When a new breaking news headline arrives, immediately reset the ticker to index 0
  if (raceState?.activeNews !== prevNews) {
    setPrevNews(raceState?.activeNews);
    setIndex(0);
  }

  const topGainer = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [stocks]);

  const topLoser = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    return [...stocks].sort((a, b) => a.changePercent - b.changePercent)[0];
  }, [stocks]);

  const messages = useMemo(() => {
    const items = [];

    // 1. Live breaking news or director message
    if (raceState?.activeNews) {
      items.push({
        id: "active_news",
        tag: "BREAKING NEWS",
        tagType: "breaking",
        tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40 shadow-xs shadow-rose-950/50",
        content: raceState.activeNews,
        linkTo: "/trade",
        linkText: "Trade Stocks"
      });
    }

    // 2. Competition status
    if (raceState?.status === "GREEN_FLAG") {
      items.push({
        id: "live_lap",
        tag: `LAP ${raceState.currentLap}/5 • OPEN`,
        tagType: "status",
        tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-xs shadow-emerald-950/50",
        content: "Stock market is live! Teams can place buy and sell orders across all 17 listed equities.",
        linkTo: "/trade",
        linkText: "Open Cockpit"
      });
    } else if (raceState?.status === "SAFETY_CAR") {
      items.push({
        id: "paused",
        tag: "MARKET PAUSED",
        tagType: "alert",
        tagColor: "text-amber-300 bg-amber-500/20 border-amber-500/40",
        content: "Trading is temporarily paused by the organizers. Orders and timers are on hold.",
        linkTo: "/leaderboard",
        linkText: "View Standings"
      });
    } else if (raceState?.status === "CHECKERED_FLAG") {
      items.push({
        id: "concluded",
        tag: "FINAL STANDINGS",
        tagType: "neutral",
        tagColor: "text-slate-200 bg-slate-700/40 border-slate-600/50",
        content: "The competition has concluded! Final portfolio rankings are now locked.",
        linkTo: "/leaderboard",
        linkText: "View Results"
      });
    }

    // 3. Top gainer
    if (topGainer && topGainer.changePercent > 0) {
      items.push({
        id: "top_gainer",
        tag: "TOP GAINER",
        tagType: "gainer",
        tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
        content: `${topGainer.ticker} (${topGainer.name}) surges +${topGainer.changePercent}% to ₹${topGainer.currentPrice.toFixed(2)}`,
        linkTo: `/trade?ticker=${topGainer.ticker}`,
        linkText: "Trade Stock"
      });
    }

    // 4. Top dip / value stock
    if (topLoser && topLoser.changePercent < 0) {
      items.push({
        id: "top_dip",
        tag: "MARKET DIP",
        tagType: "loser",
        tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40",
        content: `${topLoser.ticker} (${topLoser.name}) corrects ${topLoser.changePercent}% to ₹${topLoser.currentPrice.toFixed(2)}`,
        linkTo: `/trade?ticker=${topLoser.ticker}`,
        linkText: "Buy Dip"
      });
    }

    // 5. Recent news ticker events from the market feed
    if (Array.isArray(trackEvents) && trackEvents.length > 0) {
      trackEvents.slice(0, 10).forEach((evt) => {
        const hasImpact = typeof evt.priceImpactPercent === "number" && evt.priceImpactPercent !== 0;
        const isNeg = hasImpact && evt.priceImpactPercent < 0;
        items.push({
          id: `evt_${evt.id || evt.timestamp}`,
          tag: hasImpact
            ? `NEWS ${evt.priceImpactPercent > 0 ? "+" : ""}${evt.priceImpactPercent}%`
            : "MARKET WIRE",
          tagType: isNeg ? "negative" : "news",
          tagColor: isNeg
            ? "text-rose-300 bg-rose-500/20 border-rose-500/40"
            : "text-cyan-300 bg-cyan-500/20 border-cyan-500/40",
          content: `${evt.title} — ${evt.description}`,
          linkTo: "/trade",
          linkText: "Inspect Equities"
        });
      });
    }

    // 6. Default helpful tip if few items
    if (items.length <= 2) {
      items.push({
        id: "wallet_tip",
        tag: "TRADING TIP",
        tagType: "tip",
        tagColor: "text-cyan-300 bg-cyan-500/20 border-cyan-500/40",
        content: "Every team starts with ₹1,00,000 capital. Build a balanced portfolio across technology, energy, and retail to hedge risk.",
        linkTo: "/trade",
        linkText: "Explore 17 Stocks"
      });
    }

    return items;
  }, [raceState, topGainer, topLoser, trackEvents]);

  // Automatic slow cycling (10 seconds) with hover-pause
  useEffect(() => {
    if (messages.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [messages.length, isHovered]);

  const currentMsg = messages[index % messages.length] || messages[0];
  const isBreaking = currentMsg.tagType === "breaking" || currentMsg.tagType === "negative";

  return (
    <>
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="relative bg-gradient-to-r from-[#0A0E17] via-[#0E1524] to-[#0A0E17] border-b border-[#1E293B] px-3 sm:px-6 py-2.5 text-xs select-none transition-colors duration-200 shadow-sm"
        title="Hover to pause ticker and read comfortably"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Live Broadcast Radar Beacon */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isBreaking ? "bg-rose-500" : "bg-cyan-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isBreaking ? "bg-rose-500" : "bg-cyan-400"
                  }`}
                />
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-extrabold uppercase tracking-wider border shrink-0 ${currentMsg.tagColor}`}>
                {currentMsg.tag}
              </span>
            </div>

            {/* Middle: Headline Text with smooth animation */}
            <div className="overflow-hidden relative flex-1 min-w-0 h-6 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMsg.id + currentMsg.content}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                  className="flex items-center gap-2.5 truncate"
                >
                  <span
                    className="text-slate-100 font-semibold text-xs sm:text-[13px] tracking-normal truncate cursor-pointer hover:text-white transition-colors"
                    onClick={() => setShowFullNewsModal(true)}
                    title="Click to view full headline"
                  >
                    {currentMsg.content}
                  </span>

                  {currentMsg.linkTo && (
                    <Link
                      to={currentMsg.linkTo}
                      className="hidden sm:inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 hover:text-cyan-200 shrink-0 gap-0.5 px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/25 transition-all"
                    >
                      <span>{currentMsg.linkText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Manual Step Controls, Pause Indicator & News Center Modal trigger */}
          <div className="flex items-center gap-1.5 shrink-0 text-slate-400">
            {isHovered && (
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 hidden md:inline animate-pulse">
                PAUSED
              </span>
            )}

            <button
              type="button"
              onClick={() => setShowFullNewsModal(true)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-[#1E293B] transition-colors hidden sm:flex items-center gap-1 text-[11px] font-medium"
              title="Open News Center Feed"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {messages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setIndex((prev) => (prev - 1 + messages.length) % messages.length)}
                  className="p-1 rounded-md hover:bg-[#1E293B] hover:text-white text-slate-300 transition-colors"
                  aria-label="Previous headline"
                  title="Previous headline"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono font-bold text-slate-300 px-1 bg-[#131B2C] py-0.5 rounded border border-[#222E46]">
                  {((index % messages.length) + 1)}/{messages.length}
                </span>
                <button
                  type="button"
                  onClick={() => setIndex((prev) => (prev + 1) % messages.length)}
                  className="p-1 rounded-md hover:bg-[#1E293B] hover:text-white text-slate-300 transition-colors"
                  aria-label="Next headline"
                  title="Next headline"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Subtle Bottom Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1E293B] overflow-hidden">
          {!isHovered && (
            <motion.div
              key={index}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, ease: "linear" }}
              className={`h-full ${isBreaking ? "bg-rose-500" : "bg-cyan-400"}`}
            />
          )}
        </div>
      </div>

      {/* Full News Wire Modal */}
      {showFullNewsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#0D1422] border border-[#233148] rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#1E293B] pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white tracking-wide">
                  Race Control Market Wire &amp; News Archive
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFullNewsModal(false)}
                className="p-1.5 rounded-lg bg-[#162032] hover:bg-[#202D45] text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Complete chronological broadcast log of corporate announcements, sector events, and competition status.
            </p>

            <div className="space-y-3 overflow-y-auto flex-1 pr-1">
              {messages.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border transition-all ${
                    idx === index % messages.length
                      ? "bg-[#141F32] border-cyan-500/40 shadow-sm"
                      : "bg-[#090E18] border-[#1C263A]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${item.tagColor}`}>
                      {item.tag}
                    </span>
                    {item.linkTo && (
                      <Link
                        to={item.linkTo}
                        onClick={() => setShowFullNewsModal(false)}
                        className="text-[10px] font-bold text-cyan-400 hover:text-white flex items-center gap-0.5"
                      >
                        <span>{item.linkText}</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {item.content}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#1E293B] flex justify-end">
              <button
                type="button"
                onClick={() => setShowFullNewsModal(false)}
                className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider"
              >
                Close News Center
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
