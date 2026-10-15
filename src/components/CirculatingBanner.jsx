import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  ChevronRight,
  ChevronLeft,
  Zap,
  Info
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function CirculatingBanner() {
  const { raceState, stocks, trackEvents } = useSimulation();
  const [index, setIndex] = useState(0);

  const topGainer = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [stocks]);

  const messages = useMemo(() => {
    const items = [];

    // Live news or race status
    if (raceState?.activeNews) {
      items.push({
        id: "active_news",
        tag: "Breaking",
        tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        content: raceState.activeNews,
        linkTo: "/trade",
        linkText: "Trade"
      });
    }

    if (raceState?.status === "GREEN_FLAG") {
      items.push({
        id: "live_lap",
        tag: `Round ${raceState.currentLap}/5`,
        tagColor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
        content: "Market orders active. Monitor sector allocations and execute trades.",
        linkTo: "/trade",
        linkText: "Trading Terminal"
      });
    } else if (raceState?.status === "SAFETY_CAR") {
      items.push({
        id: "paused",
        tag: "Market Paused",
        tagColor: "text-amber-400 bg-amber-400/10 border-amber-400/20",
        content: "Simulation paused by Race Control. Order routing will resume shortly.",
        linkTo: "/leaderboard",
        linkText: "Standings"
      });
    } else if (raceState?.status === "CHECKERED_FLAG") {
      items.push({
        id: "concluded",
        tag: "Session Ended",
        tagColor: "text-rose-400 bg-rose-400/10 border-rose-400/20",
        content: "Trading is officially closed. Final podium standings are published.",
        linkTo: "/leaderboard",
        linkText: "Final Leaderboard"
      });
    }

    // Top mover
    if (topGainer && topGainer.changePercent !== 0) {
      const isPositive = topGainer.changePercent > 0;
      items.push({
        id: "top_mover",
        tag: "Top Mover",
        tagColor: isPositive
          ? "text-emerald-400 bg-emerald-400/10 border-emerald-400/20"
          : "text-rose-400 bg-rose-400/10 border-rose-400/20",
        content: `${topGainer.ticker} (${topGainer.name}) is ₹${topGainer.currentPrice.toFixed(2)} (${isPositive ? "+" : ""}${topGainer.changePercent}%)`,
        linkTo: `/trade?ticker=${topGainer.ticker}`,
        linkText: "View Stock"
      });
    }

    // Track alerts
    if (Array.isArray(trackEvents) && trackEvents.length > 0) {
      trackEvents.slice(0, 2).forEach((evt) => {
        const hasImpact = typeof evt.priceImpactPercent === "number" && evt.priceImpactPercent !== 0;
        const isNeg = hasImpact && evt.priceImpactPercent < 0;
        items.push({
          id: `evt_${evt.id || evt.timestamp}`,
          tag: hasImpact ? `${evt.priceImpactPercent > 0 ? "+" : ""}${evt.priceImpactPercent}% Shock` : "Alert",
          tagColor: isNeg
            ? "text-rose-400 bg-rose-400/10 border-rose-400/20"
            : "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
          content: `${evt.title}: ${evt.description}`,
          linkTo: "/trade",
          linkText: "Trade"
        });
      });
    }

    // Default item if empty
    if (items.length === 0) {
      items.push({
        id: "default_status",
        tag: "Market Feed",
        tagColor: "text-slate-400 bg-slate-400/10 border-slate-400/20",
        content: "17 motorsport equities across 5 sectors with ₹1,00,000 starting mock capital.",
        linkTo: "/companies",
        linkText: "View Equities"
      });
    }

    return items;
  }, [raceState, topGainer, trackEvents]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [messages.length]);

  const currentMsg = messages[index % messages.length] || messages[0];

  return (
    <div className="bg-[#0B0F17] border-b border-[#182133] px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Message ticker */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold uppercase tracking-wider border shrink-0 ${currentMsg.tagColor}`}>
            {currentMsg.tag}
          </span>

          <div className="overflow-hidden relative flex-1 min-w-0 h-4.5 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMsg.id + currentMsg.content}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 truncate"
              >
                <span className="text-slate-300 font-normal truncate text-[11px] sm:text-xs">
                  {currentMsg.content}
                </span>

                {currentMsg.linkTo && (
                  <Link
                    to={currentMsg.linkTo}
                    className="inline-flex items-center text-[10px] font-medium text-emerald-400 hover:text-emerald-300 shrink-0 gap-0.5"
                  >
                    <span>{currentMsg.linkText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Step controls */}
        {messages.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + messages.length) % messages.length)}
              className="p-1 rounded hover:bg-[#141C2B] hover:text-slate-200 transition-colors"
              aria-label="Previous announcement"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              {((index % messages.length) + 1)}/{messages.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % messages.length)}
              className="p-1 rounded hover:bg-[#141C2B] hover:text-slate-200 transition-colors"
              aria-label="Next announcement"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
