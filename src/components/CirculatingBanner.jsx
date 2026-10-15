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
  Flag
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
        tag: "TRACK ALERT",
        tagColor: "text-[#E10600] bg-[#E10600]/15 border-[#E10600]/30",
        content: raceState.activeNews,
        linkTo: "/trade",
        linkText: "Trade Pit Stop"
      });
    }

    if (raceState?.status === "GREEN_FLAG") {
      items.push({
        id: "live_lap",
        tag: `LAP ${raceState.currentLap}/5 LIVE`,
        tagColor: "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30",
        content: "Green Flag active: Real-time order matching in progress across all 17 equities.",
        linkTo: "/trade",
        linkText: "Trading Terminal"
      });
    } else if (raceState?.status === "SAFETY_CAR") {
      items.push({
        id: "paused",
        tag: "SAFETY CAR",
        tagColor: "text-[#F59E0B] bg-[#F59E0B]/15 border-[#F59E0B]/30",
        content: "Track caution active: Order routing temporarily frozen by Race Director.",
        linkTo: "/leaderboard",
        linkText: "Standings"
      });
    } else if (raceState?.status === "CHECKERED_FLAG") {
      items.push({
        id: "concluded",
        tag: "CHECKERED FLAG",
        tagColor: "text-white bg-white/10 border-white/20",
        content: "Race session concluded: Final podium positions are locked in.",
        linkTo: "/leaderboard",
        linkText: "Final Grid"
      });
    }

    // Top mover
    if (topGainer && topGainer.changePercent !== 0) {
      const isPositive = topGainer.changePercent > 0;
      items.push({
        id: "top_mover",
        tag: "POLE MOVER",
        tagColor: isPositive
          ? "text-[#10B981] bg-[#10B981]/15 border-[#10B981]/30"
          : "text-[#E10600] bg-[#E10600]/15 border-[#E10600]/30",
        content: `${topGainer.ticker} (${topGainer.name}) is trading at ₹${topGainer.currentPrice.toFixed(2)} (${isPositive ? "+" : ""}${topGainer.changePercent}%)`,
        linkTo: `/trade?ticker=${topGainer.ticker}`,
        linkText: "Trade Scrip"
      });
    }

    // Track alerts
    if (Array.isArray(trackEvents) && trackEvents.length > 0) {
      trackEvents.slice(0, 2).forEach((evt) => {
        const hasImpact = typeof evt.priceImpactPercent === "number" && evt.priceImpactPercent !== 0;
        const isNeg = hasImpact && evt.priceImpactPercent < 0;
        items.push({
          id: `evt_${evt.id || evt.timestamp}`,
          tag: hasImpact ? `SECTOR SHOCK ${evt.priceImpactPercent > 0 ? "+" : ""}${evt.priceImpactPercent}%` : "ALERT",
          tagColor: isNeg
            ? "text-[#E10600] bg-[#E10600]/15 border-[#E10600]/30"
            : "text-[#06B6D4] bg-[#06B6D4]/15 border-[#06B6D4]/30",
          content: `${evt.title}: ${evt.description}`,
          linkTo: "/trade",
          linkText: "Pit Stop"
        });
      });
    }

    // Default item if empty
    if (items.length === 0) {
      items.push({
        id: "default_status",
        tag: "GRID TELEMETRY",
        tagColor: "text-[#06B6D4] bg-[#06B6D4]/15 border-[#06B6D4]/30",
        content: "17 scrips across 5 sectors with ₹1,00,000 mock fuel ready.",
        linkTo: "/companies",
        linkText: "View Sectors"
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
    <div className="bg-[#0D1117] border-b border-[#232B3B] px-4 py-1.5 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Message ticker */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase tracking-wider border shrink-0 ${currentMsg.tagColor}`}>
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
                <span className="text-slate-300 font-medium truncate text-[11px] sm:text-xs">
                  {currentMsg.content}
                </span>

                {currentMsg.linkTo && (
                  <Link
                    to={currentMsg.linkTo}
                    className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-[#06B6D4] hover:text-white shrink-0 gap-0.5"
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
              className="p-1 rounded hover:bg-[#161B24] hover:text-white transition-colors"
              aria-label="Previous notice"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400">
              {((index % messages.length) + 1)}/{messages.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % messages.length)}
              className="p-1 rounded hover:bg-[#161B24] hover:text-white transition-colors"
              aria-label="Next notice"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
