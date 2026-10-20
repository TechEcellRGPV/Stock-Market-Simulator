import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Radio,
  X,
  Sparkles,
  Zap
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function CirculatingBanner() {
  const { raceState, stocks } = useSimulation();
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prevNews, setPrevNews] = useState(raceState?.activeNews);
  const [isMobileExpanded, setIsMobileExpanded] = useState(true);
  const [isMobileDismissed, setIsMobileDismissed] = useState(false);

  // When a new live headline arrives from race control, automatically expand and alert mobile users
  if (raceState?.activeNews && raceState.activeNews !== prevNews) {
    setPrevNews(raceState.activeNews);
    setIsMobileDismissed(false);
    setIsMobileExpanded(true);
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

  // LIVE FEED ONLY: Strict real-time feed without exposing future or past news archives
  const messages = useMemo(() => {
    const items = [];

    // 1. Current Live Breaking News broadcast from the running historical minute
    if (raceState?.activeNews) {
      items.push({
        id: "active_news",
        tag: "LIVE WIRE",
        tagType: "breaking",
        tagColor: "text-rose-300 bg-rose-500/20 border-rose-500/40 shadow-xs shadow-rose-950/50",
        content: raceState.activeNews,
        linkTo: "/trade",
        linkText: "Trade Stocks"
      });
    }

    // 2. Current Competition Live Lap Status
    if (raceState?.status === "GREEN_FLAG") {
      items.push({
        id: "live_lap",
        tag: `LAP ${raceState.currentLap}/5 • OPEN`,
        tagType: "status",
        tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40 shadow-xs shadow-emerald-950/50",
        content: "Market trading is live! Teams can place buy and sell orders across all 17 competition equities.",
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
        tag: "FINAL RESULTS",
        tagType: "neutral",
        tagColor: "text-slate-200 bg-slate-700/40 border-slate-600/50",
        content: "The competition has concluded! Final portfolio rankings are now locked.",
        linkTo: "/leaderboard",
        linkText: "View Leaderboard"
      });
    }

    // 3. Top live market mover
    if (topGainer && topGainer.changePercent > 0) {
      items.push({
        id: "top_gainer",
        tag: "TOP MOVER",
        tagType: "gainer",
        tagColor: "text-emerald-300 bg-emerald-500/20 border-emerald-500/40",
        content: `${topGainer.ticker} (${topGainer.name}) surges +${topGainer.changePercent}% to ₹${topGainer.currentPrice.toFixed(2)}`,
        linkTo: `/trade?ticker=${topGainer.ticker}`,
        linkText: "Trade Stock"
      });
    } else if (topLoser && topLoser.changePercent < 0) {
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

    // Fallback baseline tip if waiting for first minute
    if (items.length === 0) {
      items.push({
        id: "stream_standby",
        tag: "LIVE STREAM",
        tagType: "status",
        tagColor: "text-cyan-300 bg-cyan-500/20 border-cyan-500/40",
        content: "Connecting to race telemetry wire. 1-minute historical prices stream automatically.",
        linkTo: "/trade",
        linkText: "View Stocks"
      });
    }

    return items;
  }, [raceState, topGainer, topLoser]);

  // Automatic cycling (10 seconds)
  useEffect(() => {
    if (messages.length <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 10000);
    return () => clearInterval(timer);
  }, [messages.length, isHovered]);

  const currentMsg = messages[index % messages.length] || messages[0];
  const isBreaking = currentMsg.tagType === "breaking";

  return (
    <>
      {/* ============================================================== */}
      {/* 1. DESKTOP VIEW (md: and up): Sleek Broadcast Ribbon Header     */}
      {/* ============================================================== */}
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="hidden md:block relative bg-gradient-to-r from-[#080B12] via-[#0E1320] to-[#080B12] border-b border-[#1E2638] px-4 sm:px-6 py-2.5 text-xs select-none transition-colors duration-200 shadow-sm"
        title="Hover to pause ticker"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Left: Live Radar Beacon + Tag */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isBreaking ? "bg-rose-500" : "bg-[#E10600]"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isBreaking ? "bg-rose-500" : "bg-[#E10600]"
                  }`}
                />
              </span>
              <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-mono font-extrabold uppercase tracking-wider border shrink-0 ${currentMsg.tagColor}`}>
                {currentMsg.tag}
              </span>
            </div>

            {/* Middle: Headline Text */}
            <div className="overflow-hidden relative flex-1 min-w-0 h-6 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentMsg.id + currentMsg.content}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex items-center gap-2.5 truncate"
                >
                  <span className="text-slate-100 font-semibold text-xs sm:text-[13px] tracking-normal truncate">
                    {currentMsg.content}
                  </span>

                  {currentMsg.linkTo && (
                    <Link
                      to={currentMsg.linkTo}
                      className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-rose-400 hover:text-white shrink-0 gap-0.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 transition-all"
                    >
                      <span>{currentMsg.linkText}</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Live Feed Indicator */}
          <div className="flex items-center gap-2 shrink-0 text-slate-400">
            {isHovered && (
              <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25 animate-pulse">
                PAUSED
              </span>
            )}
            <span className="text-[10px] font-mono font-bold text-slate-400 px-2 py-0.5 rounded bg-[#121824] border border-[#1E273A] flex items-center gap-1">
              <Radio className="w-3 h-3 text-[#E10600] animate-pulse" />
              <span>LIVE FEED</span>
            </span>
          </div>
        </div>

        {/* Bottom Progress Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#1A2234] overflow-hidden">
          {!isHovered && (
            <motion.div
              key={index}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 10, ease: "linear" }}
              className={`h-full ${isBreaking ? "bg-rose-500" : "bg-[#E10600]"}`}
            />
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. MOBILE VIEW (md:hidden): FLOATING LIVE NEWS CARD            */}
      {/* Displays the ENTIRE news without truncation so mobile users    */}
      {/* can comfortably read full headlines & descriptions!           */}
      {/* ============================================================== */}
      {!isMobileDismissed && (
        <div className="md:hidden fixed bottom-3 left-3 right-3 z-40">
          <AnimatePresence>
            {isMobileExpanded ? (
              /* Expanded Full News View (No Truncation) */
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="bg-[#0B0F19]/95 backdrop-blur-xl border-2 border-[#E10600]/40 rounded-2xl p-3.5 shadow-[0_10px_35px_rgba(0,0,0,0.85)] space-y-2.5"
              >
                {/* Header bar with tag and control buttons */}
                <div className="flex items-center justify-between gap-2 border-b border-[#1E273A] pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider border ${currentMsg.tagColor}`}>
                      {currentMsg.tag}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setIsMobileExpanded(false)}
                      className="p-1 rounded-md bg-[#141A28] text-slate-400 hover:text-white border border-[#222E46]"
                      title="Minimize ticker"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMobileDismissed(true)}
                      className="p-1 rounded-md bg-[#141A28] text-slate-400 hover:text-white border border-[#222E46]"
                      title="Dismiss until next headline"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Complete Uncut Headline Text */}
                <p className="text-xs sm:text-sm text-slate-100 font-semibold leading-relaxed break-words">
                  {currentMsg.content}
                </p>

                {/* Footer action button */}
                {currentMsg.linkTo && (
                  <div className="pt-1 flex justify-end">
                    <Link
                      to={currentMsg.linkTo}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[#E10600] text-white text-xs font-bold font-mono tracking-wider shadow-sm hover:bg-[#B80500]"
                    >
                      <span>{currentMsg.linkText}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </motion.div>
            ) : (
              /* Minimized Compact Floating Pill */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                onClick={() => setIsMobileExpanded(true)}
                className="bg-[#0B0F19]/95 backdrop-blur-lg border border-[#E10600]/50 rounded-full px-3.5 py-2 shadow-2xl flex items-center justify-between gap-2 cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                  <span className="text-[11px] font-mono font-bold text-rose-400 shrink-0">
                    {currentMsg.tag}:
                  </span>
                  <span className="text-xs text-slate-200 font-medium truncate">
                    {currentMsg.content}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 text-slate-400">
                  <span className="text-[10px] text-slate-400 font-mono">Tap</span>
                  <ChevronUp className="w-3.5 h-3.5 text-white" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </>
  );
}
