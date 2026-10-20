import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ChevronLeft,
  Bell
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function CirculatingBanner() {
  const { raceState, stocks, trackEvents } = useSimulation();
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [prevNews, setPrevNews] = useState(raceState?.activeNews);

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
        tagColor: "text-rose-400 bg-rose-500/15 border-rose-500/30",
        content: raceState.activeNews,
        linkTo: "/trade",
        linkText: "Trade Stock"
      });
    }

    // 2. Competition status
    if (raceState?.status === "GREEN_FLAG") {
      items.push({
        id: "live_lap",
        tag: `LAP ${raceState.currentLap}/5 • OPEN`,
        tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        content: "Stock market is live! Teams can place buy and sell orders across all listed stocks.",
        linkTo: "/trade",
        linkText: "Open Trading"
      });
    } else if (raceState?.status === "SAFETY_CAR") {
      items.push({
        id: "paused",
        tag: "MARKET PAUSED",
        tagColor: "text-amber-400 bg-amber-500/15 border-amber-500/30",
        content: "Trading is temporarily paused by the organizers. Orders and timers are on hold.",
        linkTo: "/leaderboard",
        linkText: "View Standings"
      });
    } else if (raceState?.status === "CHECKERED_FLAG") {
      items.push({
        id: "concluded",
        tag: "FINAL STANDINGS",
        tagColor: "text-white bg-white/10 border-white/20",
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
        tagColor: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
        content: `${topGainer.ticker} (${topGainer.name}) is up +${topGainer.changePercent}% at ₹${topGainer.currentPrice.toFixed(2)}`,
        linkTo: `/trade?ticker=${topGainer.ticker}`,
        linkText: "Trade Stock"
      });
    }

    // 4. Top dip / value stock
    if (topLoser && topLoser.changePercent < 0) {
      items.push({
        id: "top_dip",
        tag: "MARKET DIP",
        tagColor: "text-rose-400 bg-rose-500/15 border-rose-500/30",
        content: `${topLoser.ticker} (${topLoser.name}) is down ${topLoser.changePercent}% at ₹${topLoser.currentPrice.toFixed(2)}`,
        linkTo: `/trade?ticker=${topLoser.ticker}`,
        linkText: "Buy Dip"
      });
    }

    // 5. Recent news ticker events from the market feed
    if (Array.isArray(trackEvents) && trackEvents.length > 0) {
      trackEvents.slice(0, 6).forEach((evt) => {
        const hasImpact = typeof evt.priceImpactPercent === "number" && evt.priceImpactPercent !== 0;
        const isNeg = hasImpact && evt.priceImpactPercent < 0;
        items.push({
          id: `evt_${evt.id || evt.timestamp}`,
          tag: hasImpact ? `NEWS ${evt.priceImpactPercent > 0 ? "+" : ""}${evt.priceImpactPercent}%` : "MARKET NEWS",
          tagColor: isNeg
            ? "text-rose-400 bg-rose-500/15 border-rose-500/30"
            : "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
          content: `${evt.title} — ${evt.description}`,
          linkTo: "/trade",
          linkText: "Trade Stock"
        });
      });
    }

    // 6. Default helpful tip if few items
    if (items.length <= 2) {
      items.push({
        id: "wallet_tip",
        tag: "TRADING TIP",
        tagColor: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
        content: "Every team starts with ₹1,00,000 cash balance. Diversify across sectors to manage risk.",
        linkTo: "/trade",
        linkText: "Explore Stocks"
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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-[#0B0F17] border-b border-[#1E2638] px-4 py-2 text-xs transition-colors hover:bg-[#0E131E]"
      title="News ticker pauses on hover so you can read comfortably"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Message ticker */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border shrink-0 ${currentMsg.tagColor}`}>
            {currentMsg.tag}
          </span>

          <div className="overflow-hidden relative flex-1 min-w-0 h-5 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMsg.id + currentMsg.content}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-2 truncate"
              >
                <span className="text-slate-300 font-medium truncate text-xs">
                  {currentMsg.content}
                </span>

                {currentMsg.linkTo && (
                  <Link
                    to={currentMsg.linkTo}
                    className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-cyan-400 hover:text-white shrink-0 gap-0.5"
                  >
                    <span>{currentMsg.linkText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Step controls & Pause indicator */}
        {messages.length > 1 && (
          <div className="flex items-center gap-1 shrink-0 text-slate-400">
            {isHovered && (
              <span className="text-[10px] text-amber-400/90 font-mono font-medium mr-1 hidden sm:inline">
                Paused
              </span>
            )}
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev - 1 + messages.length) % messages.length)}
              className="p-1 rounded hover:bg-[#1A2234] hover:text-white transition-colors"
              aria-label="Previous announcement"
              title="Previous announcement"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span className="text-[10px] font-mono text-slate-400 px-0.5">
              {((index % messages.length) + 1)}/{messages.length}
            </span>
            <button
              type="button"
              onClick={() => setIndex((prev) => (prev + 1) % messages.length)}
              className="p-1 rounded hover:bg-[#1A2234] hover:text-white transition-colors"
              aria-label="Next announcement"
              title="Next announcement"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
