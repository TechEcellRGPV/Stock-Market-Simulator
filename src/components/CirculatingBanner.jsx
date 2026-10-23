import { useState, useEffect, useMemo, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Flame,
  ChevronRight,
  ChevronLeft,
  Lock,
  Unlock,
  Clock,
  Flag,
  Zap,
  AlertTriangle
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

function subscribeToSeconds(callback) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getNowSnapshot() {
  return Math.floor(Date.now() / 1000) * 1000;
}

function getServerSnapshot() {
  return 0;
}

/**
 * @file CirculatingBanner.jsx
 * @description Dynamic circulating headline banner component for Imprenditore 5.0.
 * Cycles through real-time telemetry items including:
 * 1. Broadcasted Macro Sector Shocks & Breaking News ([SECTOR SHOCK %], [TRACK ALERT])
 * 2. Top market gainer across the 17 equities with 1-click trade navigation
 * 3. Event countdown clock ticking down to October 29, 2026 flag-off
 * 4. F1 Race Status and Paddock Access Gate status indicators
 *
 * Uses useSyncExternalStore for hydration-safe 1-second interval synchronization.
 *
 * @returns {JSX.Element} Animated marquee banner with manual navigation controls
 */
export default function CirculatingBanner() {
  const { raceState, stocks, trackEvents, marketNews } = useSimulation();
  const [index, setIndex] = useState(0);
  const now = useSyncExternalStore(subscribeToSeconds, getNowSnapshot, getServerSnapshot);

  // Real-time formatted event date derived from admin targetEventDate
  const formattedEventDate = useMemo(() => {
    if (raceState.targetEventDate) {
      const d = new Date(raceState.targetEventDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });
      }
    }
    return raceState.scheduledStartTime || "October 29, 2026 at 3:00 PM";
  }, [raceState.targetEventDate, raceState.scheduledStartTime]);

  // Real-time countdown string ticking every second
  const countdownText = useMemo(() => {
    if (!raceState.targetEventDate || !now) return null;
    const target = new Date(raceState.targetEventDate).getTime();
    if (isNaN(target)) return null;
    const diff = target - now;
    if (diff <= 0) {
      return "Flag-Off Imminent";
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s remaining`;
    }
    return `${minutes}m ${seconds}s remaining`;
  }, [raceState.targetEventDate, now]);

  // Real-time live clock string
  const liveClockString = useMemo(() => {
    if (!now) return "";
    const d = new Date(now);
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    });
  }, [now]);

  // Top stock gainer
  const topGainer = useMemo(() => {
    if (!stocks || stocks.length === 0) return null;
    return [...stocks].sort((a, b) => b.changePercent - a.changePercent)[0];
  }, [stocks]);

  // Construct dynamic circulating message items based on exact race state
  const messages = useMemo(() => {
    const items = [];

    // State 1: PRE-RACE WARMUP / NOT STARTED
    if (raceState.status === "GRID_WARMUP") {
      // Real-time Scheduled Flag-Off Time & Live Countdown
      items.push({
        id: "schedule_countdown",
        icon: Calendar,
        tag: countdownText && countdownText !== "Flag-Off Imminent" ? "LIVE COUNTDOWN" : "FLAG-OFF SCHEDULE",
        tagColor: "bg-[#EAB308] text-slate-950",
        content: countdownText
          ? `Flag-Off: ${formattedEventDate} (${countdownText})`
          : `Flag-Off scheduled for: ${formattedEventDate}. Pre-round warmup in progress.`,
        linkText: "View Schedule",
        linkTo: "/"
      });

      // Registration Gate item
      items.push({
        id: "reg_gate",
        icon: raceState.isRegistrationOpen ? Unlock : Lock,
        tag: raceState.isRegistrationOpen ? "REGISTRATION OPEN" : "REGISTRATION LOCKED",
        tagColor: raceState.isRegistrationOpen ? "bg-[#10B981] text-slate-950" : "bg-[#E10600] text-white",
        content: raceState.isRegistrationOpen
          ? "Team Registration is currently OPEN on the team roster."
          : "Team Registration is currently LOCKED by Race Control. Check countdown clock.",
        linkText: raceState.isRegistrationOpen ? "Register Team" : "View Countdown",
        linkTo: raceState.isRegistrationOpen ? "/login" : "/"
      });

      // Official Venue & Timing Notice with real-time target date
      items.push({
        id: "official_venue",
        icon: Calendar,
        tag: "VENUE & TIMING",
        tagColor: "bg-[#E10600] text-white",
        content: `RGPV Conference Hall : Event Date: ${formattedEventDate} : Timing: 3:00 PM - 5:30 PM`,
        linkText: "View Briefing",
        linkTo: "/"
      });

      // Warmup state item
      items.push({
        id: "warmup_state",
        icon: Flag,
        tag: "ROUND NOT STARTED",
        tagColor: "bg-[#06B6D4] text-slate-950",
        content: "The round will start upon Race Director Flag-Off. Pre-round warmup in progress.",
        linkText: "Explore Companies",
        linkTo: "/companies"
      });
    }

    // State 2: GREEN FLAG (RACE LIVE & RUNNING)
    else if (raceState.status === "GREEN_FLAG") {
      items.push({
        id: "live_race",
        icon: Flame,
        tag: `ROUND ${raceState.currentLap}/7 LIVE`,
        tagColor: "bg-[#10B981] text-slate-950 font-black",
        content: raceState.activeNews || "Green Flag: Order matching is active! Execute trades on the trading screen.",
        linkText: "Trade Now",
        linkTo: "/trade"
      });

      if (topGainer && topGainer.changePercent !== 0) {
        items.push({
          id: "top_stock",
          icon: TrendingUp,
          tag: "TOP MOVER",
          tagColor: topGainer.changePercent > 0 ? "bg-[#10B981] text-slate-950" : "bg-[#E10600] text-white",
          content: `${topGainer.ticker} (${topGainer.name}) is at ₹${topGainer.currentPrice.toFixed(2)} (${topGainer.changePercent > 0 ? "+" : ""}${topGainer.changePercent}%)`,
          linkText: "Trade Stock",
          linkTo: `/trade?ticker=${topGainer.ticker}`
        });
      }
    }

    // State 3: SAFETY CAR (PAUSED)
    else if (raceState.status === "SAFETY_CAR") {
      items.push({
        id: "safety_car",
        icon: Clock,
        tag: "SAFETY CAR PAUSED",
        tagColor: "bg-[#F59E0B] text-slate-950",
        content: raceState.activeNews || "Race temporarily paused by Race Director. Order matching and timers frozen.",
        linkText: "Leaderboard",
        linkTo: "/leaderboard"
      });
    }

    // State 4: CHECKERED FLAG (CONCLUDED)
    else if (raceState.status === "CHECKERED_FLAG") {
      items.push({
        id: "checkered_flag",
        icon: Flag,
        tag: "CHECKERED FLAG CONCLUDED",
        tagColor: "bg-[#E10600] text-white",
        content: "Simulation concluded! All trading closed and final podium standings locked.",
        linkText: "View Rankings",
        linkTo: "/leaderboard"
      });
    }

    // Recent Track Alerts & Sector Shocks from Race Director
    if (Array.isArray(trackEvents) && trackEvents.length > 0) {
      trackEvents.slice(0, 4).forEach((evt) => {
        const hasImpact = typeof evt.priceImpactPercent === "number" && evt.priceImpactPercent !== 0;
        const isNegative = hasImpact && evt.priceImpactPercent < 0;
        const impactSign = hasImpact && evt.priceImpactPercent > 0 ? "+" : "";
        const tag = hasImpact
          ? `SECTOR SHOCK ${impactSign}${evt.priceImpactPercent}%`
          : "TRACK ALERT";
        const tagColor = hasImpact
          ? (isNegative ? "bg-[#E10600] text-white font-bold" : "bg-[#10B981] text-slate-950 font-bold")
          : "bg-[#EAB308] text-slate-950 font-bold";
        const sectorPrefix = evt.affectedSectors && evt.affectedSectors.length > 0
          ? `[${evt.affectedSectors.join(", ")}] `
          : "";

        items.push({
          id: `evt_${evt.id || evt.timestamp}`,
          icon: hasImpact ? (isNegative ? TrendingDown : TrendingUp) : Zap,
          tag,
          tagColor,
          content: `${sectorPrefix}${evt.title}: ${evt.description}`,
          linkText: "Trade Now",
          linkTo: "/trade"
        });
      });
    }

    // Latest Market News articles
    if (Array.isArray(marketNews) && marketNews.length > 0) {
      marketNews.slice(0, 3).forEach((news) => {
        const isBullish = news.sentiment === "BULLISH";
        const isBearish = news.sentiment === "BEARISH";
        items.push({
          id: `news_${news._id || news.id || news.title}`,
          icon: isBullish ? TrendingUp : isBearish ? TrendingDown : Radio,
          tag: news.isOfficialAnnouncement ? "RACE CONTROL NEWS" : `NEWS: ${news.category}`,
          tagColor: news.isOfficialAnnouncement
            ? "bg-[#E10600] text-white font-bold"
            : isBullish
            ? "bg-[#10B981] text-slate-950 font-bold"
            : "bg-[#06B6D4] text-slate-950 font-bold",
          content: `${news.title}: ${news.summary}`,
          linkText: "Read Wire",
          linkTo: "/news"
        });
      });
    }

    return items;
  }, [raceState, topGainer, formattedEventDate, countdownText, trackEvents, marketNews]);

  // Auto-circulate every 4 seconds
  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [messages.length]);

  const currentMsg = messages[index % messages.length] || messages[0];

  return (
    <div className="bg-[#0E131C] border-b border-[#232B3B] px-3 sm:px-6 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 text-xs">
        {/* Left: Circulating News Content */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Status Tag */}
          <span className={`px-2 py-0.5 rounded font-black tracking-wider uppercase text-[10px] shrink-0 ${currentMsg.tagColor}`}>
            {currentMsg.tag}
          </span>

          {/* Animated Message Text */}
          <div className="overflow-hidden relative flex-1 min-w-0 h-5 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMsg.id + (currentMsg.content || "")}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 truncate"
              >
                <span className="text-slate-300 font-medium truncate text-[11px]">
                  {currentMsg.content}
                </span>

                {currentMsg.linkTo && (
                  <Link
                    to={currentMsg.linkTo}
                    className="hidden md:inline-flex items-center text-[10px] font-bold text-[#06B6D4] hover:underline shrink-0"
                  >
                    <span>{currentMsg.linkText}</span>
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right: Live Clock, Quick Manual Circulation Arrows + Capital Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden md:inline-flex items-center gap-1.5 text-slate-400 font-mono text-[10px] sm:text-[11px] border-r border-[#232B3B] pr-2.5">
            <Clock className="w-3 h-3 text-[#06B6D4]" />
            <span className="text-slate-300 font-semibold">{liveClockString}</span>
          </div>

          {messages.length > 1 && (
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev - 1 + messages.length) % messages.length)}
                className="p-1 rounded hover:bg-[#1C2538] text-slate-400 hover:text-white transition-colors"
                aria-label="Previous Notice"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIndex((prev) => (prev + 1) % messages.length)}
                className="p-1 rounded hover:bg-[#1C2538] text-slate-400 hover:text-white transition-colors"
                aria-label="Next Notice"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="hidden sm:inline-block text-slate-400 font-mono text-[10px] sm:text-[11px] border-l border-[#232B3B] pl-2.5">
            CAPITAL: <strong className="text-white font-bold">₹{(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
