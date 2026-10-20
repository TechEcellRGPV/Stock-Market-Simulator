import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  Clock,
  Radio,
  ArrowLeft,
  Wallet,
  Sparkles,
  Users
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

// Custom Luxury Gold Crown SVG (Matching reference design with ruby jewel)
function GoldCrown() {
  return (
    <svg
      viewBox="0 0 100 80"
      className="w-16 h-14 sm:w-20 sm:h-16 drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]"
    >
      <defs>
        <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </linearGradient>
        <linearGradient id="rubyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF4D6D" />
          <stop offset="100%" stopColor="#C9184A" />
        </linearGradient>
      </defs>
      <path
        d="M10,65 L90,65 L84,30 L68,46 L50,14 L32,46 L16,30 Z"
        fill="url(#goldCrownGrad)"
        stroke="#FFE066"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="10" y="62" width="80" height="9" rx="3" fill="#D97706" stroke="#FFE066" strokeWidth="1.5" />
      <circle cx="50" cy="12" r="4.5" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="16" cy="28" r="3.5" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="84" cy="28" r="3.5" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1.5" />
      <circle cx="32" cy="44" r="3" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
      <circle cx="68" cy="44" r="3" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="1" />
      <polygon points="50,40 57,49 50,58 43,49" fill="url(#rubyGrad)" stroke="#FFF" strokeWidth="1.2" />
      <circle cx="50" cy="49" r="1.5" fill="#FFF" />
    </svg>
  );
}

// Custom Luxury Silver Crown SVG (Matching reference design with emerald jewel)
function SilverCrown() {
  return (
    <svg
      viewBox="0 0 100 80"
      className="w-14 h-12 sm:w-16 sm:h-14 drop-shadow-[0_0_20px_rgba(148,163,184,0.6)]"
    >
      <defs>
        <linearGradient id="silverCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#CBD5E1" />
          <stop offset="100%" stopColor="#64748B" />
        </linearGradient>
        <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path
        d="M12,65 L88,65 L83,32 L67,47 L50,17 L33,47 L17,32 Z"
        fill="url(#silverCrownGrad)"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="12" y="62" width="76" height="8" rx="3" fill="#475569" stroke="#E2E8F0" strokeWidth="1.5" />
      <circle cx="50" cy="15" r="4" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="17" cy="30" r="3.2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="83" cy="30" r="3.2" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="33" cy="45" r="2.8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
      <circle cx="67" cy="45" r="2.8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
      <polygon points="50,41 56,49 50,57 44,49" fill="url(#emeraldGrad)" stroke="#FFF" strokeWidth="1" />
      <circle cx="50" cy="49" r="1.5" fill="#FFF" />
    </svg>
  );
}

// Custom Luxury Bronze Crown SVG (Matching reference design with sapphire jewel)
function BronzeCrown() {
  return (
    <svg
      viewBox="0 0 100 80"
      className="w-13 h-11 sm:w-15 sm:h-13 drop-shadow-[0_0_18px_rgba(217,119,6,0.5)]"
    >
      <defs>
        <linearGradient id="bronzeCrownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDBA74" />
          <stop offset="50%" stopColor="#D97706" />
          <stop offset="100%" stopColor="#78350F" />
        </linearGradient>
        <linearGradient id="sapphireGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
      </defs>
      <path
        d="M14,65 L86,65 L81,34 L66,48 L50,20 L34,48 L19,34 Z"
        fill="url(#bronzeCrownGrad)"
        stroke="#FDBA74"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <rect x="14" y="62" width="72" height="8" rx="3" fill="#92400E" stroke="#FDBA74" strokeWidth="1.5" />
      <circle cx="50" cy="18" r="3.8" fill="#FFF7ED" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="19" cy="32" r="3" fill="#FFF7ED" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="81" cy="32" r="3" fill="#FFF7ED" stroke="#B45309" strokeWidth="1.5" />
      <circle cx="34" cy="46" r="2.5" fill="#FFF7ED" stroke="#B45309" strokeWidth="1" />
      <circle cx="66" cy="46" r="2.5" fill="#FFF7ED" stroke="#B45309" strokeWidth="1" />
      <polygon points="50,42 55,49 50,56 45,49" fill="url(#sapphireGrad)" stroke="#FFF" strokeWidth="1" />
      <circle cx="50" cy="49" r="1.5" fill="#FFF" />
    </svg>
  );
}

// Team avatar gradient palette
const TEAM_GRADIENTS = [
  "from-red-600 via-rose-700 to-amber-700",
  "from-blue-600 via-indigo-700 to-cyan-800",
  "from-amber-500 via-orange-600 to-red-700",
  "from-teal-500 via-emerald-600 to-slate-800",
  "from-emerald-500 via-green-700 to-teal-900",
  "from-pink-600 via-purple-700 to-indigo-900",
  "from-cyan-500 via-blue-600 to-slate-900",
  "from-yellow-500 via-amber-600 to-stone-800",
];

export default function Projector() {
  useSEO({
    title: "Auditorium Leaderboard Screen — Imprenditore 5.0",
    description: "Broadcast-grade leaderboard display for KRC, RGPV auditorium screen."
  });

  const { raceState, leaderboard: contextLeaderboard, trackEvents } = useSimulation();
  const convexLeaderboard = useQuery(api.leaderboard.getLeaderboard, {});
  const allTeamsWithHoldings = useQuery(api.trades.getAllTeamsWithHoldings, {});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [viewFilter, setViewFilter] = useState("NEXT_RANKS"); // "NEXT_RANKS" (4-15) or "ALL" (1-15)
  const containerRef = useRef(null);

  // Live IST Venue Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Pure Leaderboard sorted strictly by Net Portfolio Value (No Points System)
  const standings = useMemo(() => {
    const base = Array.isArray(convexLeaderboard) && convexLeaderboard.length > 0
      ? convexLeaderboard
      : contextLeaderboard || [];

    const holdingsMap = new Map();
    if (Array.isArray(allTeamsWithHoldings)) {
      for (const t of allTeamsWithHoldings) {
        holdingsMap.set(t.teamCode, t);
      }
    }

    // Sort strictly by net portfolio value (most money in portfolio)
    const sorted = [...base].sort((a, b) => {
      const valA = a.totalPortfolioValue ?? 100000;
      const valB = b.totalPortfolioValue ?? 100000;
      if (valB !== valA) return valB - valA;
      return (b.returnPercent ?? 0) - (a.returnPercent ?? 0);
    });

    return sorted.map((team, idx) => {
      const teamWithHoldings = holdingsMap.get(team.teamCode);
      const topHolding = teamWithHoldings?.holdings?.[0];
      return {
        ...team,
        rank: idx + 1,
        holdingsCount: teamWithHoldings?.holdingsCount || 0,
        topHoldingTicker: topHolding?.ticker,
        topHoldingShares: topHolding?.shares,
      };
    });
  }, [convexLeaderboard, contextLeaderboard, allTeamsWithHoldings]);

  const p1 = standings[0];
  const p2 = standings[1];
  const p3 = standings[2];

  // Table rows based on filter
  const tableStandings = viewFilter === "NEXT_RANKS" ? standings.slice(3) : standings;

  // Active status badge helper
  const getStatusBadge = () => {
    if (raceState?.status === "GREEN_FLAG") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>LAP {raceState?.currentLap || 1}/5 • LIVE TRADING</span>
        </span>
      );
    }
    if (raceState?.status === "SAFETY_CAR") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider animate-pulse">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>SAFETY CAR • TRADING PAUSED</span>
        </span>
      );
    }
    if (raceState?.status === "CHECKERED_FLAG") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 text-xs font-mono font-bold uppercase tracking-wider">
          <Trophy className="w-3.5 h-3.5" />
          <span>CHECKERED FLAG • FINAL RESULTS</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/30 text-slate-300 border border-slate-600/40 text-xs font-mono font-bold uppercase tracking-wider">
        <Clock className="w-3.5 h-3.5" />
        <span>GRID PRE-RACE WARMUP</span>
      </span>
    );
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#060811] text-white font-sans selection:bg-[#E10600] selection:text-white flex flex-col justify-between overflow-x-hidden relative"
      style={{
        backgroundImage: "radial-gradient(ellipse 90% 60% at 50% 18%, rgba(14, 28, 56, 0.75) 0%, rgba(6, 8, 17, 1) 100%)"
      }}
    >
      {/* Top Projector Broadcast Bar */}
      <header className="bg-[#0A0E1A]/90 backdrop-blur-md border-b border-[#1A2336] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xl shrink-0 z-30">
        <div className="flex items-center gap-3 sm:gap-4">
          <img
            src="/logo_D.png"
            alt="Imprenditore 5.0"
            className="w-10 h-10 sm:w-12 sm:h-12 object-contain rounded drop-shadow-md shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#EAB308]">
                E-Cell RGPV • KRC, RGPV
              </span>
              <span className="px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-400 text-[10px] font-mono font-bold border border-cyan-500/30">
                AUDITORIUM SCREEN
              </span>
            </div>
            <h1 className="text-base sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <span>Imprenditore 5.0 : Live Leaderboard</span>
            </h1>
          </div>
        </div>

        {/* Center: Live Competition Status */}
        <div className="hidden md:flex items-center gap-3">
          {getStatusBadge()}
          {typeof raceState?.lapTimeRemaining === "number" && (
            <div className="bg-[#101728] px-3.5 py-1 rounded-full border border-[#202E48] text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5 shadow-inner">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>
                {Math.floor(raceState.lapTimeRemaining / 60)}:
                {(raceState.lapTimeRemaining % 60).toString().padStart(2, "0")}
              </span>
            </div>
          )}
        </div>

        {/* Right: Clock & Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex flex-col text-right font-mono text-xs pr-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Venue Time (IST)</span>
            <span className="text-white font-bold text-sm text-cyan-400">{currentTime || "--:--:--"}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#141C2C] hover:bg-[#1E2B42] text-white text-xs font-bold border border-[#24334C] transition-colors flex items-center gap-1.5 shadow-sm"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F11)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#EAB308]" /> : <Maximize2 className="w-4 h-4 text-[#EAB308]" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          <Link
            to="/admin"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Control</span>
          </Link>
        </div>
      </header>

      {/* Main Broadcast Stage */}
      <main className="flex-1 max-w-[1550px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6 z-20">
        
        {/* ============================================================== */}
        {/* 3D STEPPED PODIUM CENTERPIECE (Identical Layout to Reference)  */}
        {/* ============================================================== */}
        {standings.length >= 3 && (
          <section className="relative pt-6 pb-2">
            {/* Ambient Sunburst Glow behind 1st place crown */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
            <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 h-80 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none -z-10" />

            {/* Stepped 3D Pedestal Container: 2nd (Left), 1st (Center Tallest), 3rd (Right) */}
            <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-2">
              
              {/* ----------------- 2ND PLACE (SILVER - LEFT) ----------------- */}
              <div className="flex-1 flex flex-col items-center relative max-w-[260px] z-10">
                {/* Floating Crown + Avatar + Team Metadata */}
                <div className="flex flex-col items-center mb-2 z-20 space-y-1.5 w-full">
                  <div className="relative animate-pulse [animation-duration:4s]">
                    <SilverCrown />
                  </div>

                  {/* Avatar Circle */}
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-slate-400 via-slate-200 to-slate-500 shadow-[0_0_20px_rgba(148,163,184,0.4)] flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#0D1525] flex items-center justify-center font-black font-mono text-base sm:text-xl text-slate-200 border-2 border-slate-300/40">
                        {p2?.teamCode || "P2"}
                      </div>
                    </div>
                    {/* Rank Pill */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.2 rounded-full bg-slate-300 text-slate-950 font-black font-mono text-[11px] shadow-md border border-white">
                      2
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="text-center pt-1.5 px-1 max-w-[200px]">
                    <h3 className="text-sm sm:text-base font-black text-white truncate drop-shadow-md">
                      {p2?.teamName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate">@{p2?.leaderName}</p>
                  </div>

                  {/* Valuation Pill */}
                  <div className="px-3 py-1 rounded-full bg-[#0E1627]/90 border border-slate-500/40 shadow-md flex items-center gap-1.5">
                    <span className="text-slate-400 text-xs font-bold font-mono">₹</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-white">
                      {(p2?.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                      (p2?.returnPercent || 0) >= 0 ? "text-emerald-400 bg-emerald-500/15" : "text-rose-400 bg-rose-500/15"
                    }`}>
                      {(p2?.returnPercent || 0) >= 0 ? "+" : ""}{p2?.returnPercent || 0}%
                    </span>
                  </div>
                </div>

                {/* 3D Pedestal Block (2nd) */}
                <div className="w-full relative">
                  {/* Top Angled Platform */}
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-[#172033] via-[#24334E] to-[#172033] rounded-t-xl border-t-2 border-x border-slate-400/50 shadow-inner" />
                  {/* Front Vertical Slab with Engraved "2nd" */}
                  <div className="h-32 sm:h-40 md:h-44 bg-gradient-to-b from-[#101726] via-[#0B101C] to-[#060A12] border-x border-b border-[#1A253A] rounded-b-xl flex items-center justify-center relative shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black font-sans tracking-tight text-slate-600/35 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      2nd
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------- 1ST PLACE (GOLD - CENTER TALLEST) ----------------- */}
              <div className="flex-1 flex flex-col items-center relative max-w-[290px] z-20">
                {/* Floating Crown + Avatar + Team Metadata */}
                <div className="flex flex-col items-center mb-2 z-20 space-y-1.5 w-full">
                  <div className="relative animate-bounce [animation-duration:3s]">
                    <div className="absolute inset-0 bg-amber-400/25 blur-xl rounded-full scale-125" />
                    <GoldCrown />
                  </div>

                  {/* Avatar Circle with Glowing Gold Ring */}
                  <div className="relative">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#0D1528] flex items-center justify-center font-black font-mono text-xl sm:text-2xl text-amber-300 border-2 border-amber-400/60">
                        {p1?.teamCode || "P1"}
                      </div>
                    </div>
                    {/* Rank Pill */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-3 py-0.2 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black font-mono text-xs shadow-lg border border-yellow-200 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>1</span>
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="text-center pt-2 px-1 max-w-[230px]">
                    <h3 className="text-base sm:text-lg font-black text-white truncate drop-shadow-md">
                      {p1?.teamName}
                    </h3>
                    <p className="text-xs text-[#EAB308] font-mono truncate">@{p1?.leaderName}</p>
                  </div>

                  {/* Valuation Pill */}
                  <div className="px-4 py-1.5 rounded-full bg-[#121B2E]/95 border border-[#EAB308]/60 shadow-xl flex items-center gap-2">
                    <span className="text-[#EAB308] text-xs font-bold font-mono">₹</span>
                    <span className="text-sm sm:text-base font-black font-mono text-white">
                      {(p1?.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                    </span>
                    <span className={`text-[11px] font-black font-mono px-1.5 py-0.2 rounded ${
                      (p1?.returnPercent || 0) >= 0 ? "text-emerald-400 bg-emerald-500/20" : "text-rose-400 bg-rose-500/20"
                    }`}>
                      {(p1?.returnPercent || 0) >= 0 ? "+" : ""}{p1?.returnPercent || 0}%
                    </span>
                  </div>
                </div>

                {/* 3D Pedestal Block (1st - Highest) */}
                <div className="w-full relative">
                  {/* Top Angled Platform */}
                  <div className="h-5 sm:h-6 bg-gradient-to-r from-[#222E45] via-[#334668] to-[#222E45] rounded-t-xl border-t-2 border-x border-[#EAB308]/70 shadow-inner" />
                  {/* Front Vertical Slab with Engraved "1st" */}
                  <div className="h-44 sm:h-52 md:h-60 bg-gradient-to-b from-[#141C2D] via-[#0E1422] to-[#070B13] border-x-2 border-b-2 border-[#202E48] rounded-b-xl flex items-center justify-center relative shadow-[0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#EAB308] to-transparent" />
                    <div className="absolute inset-0 bg-radial-gradient from-amber-500/10 to-transparent pointer-events-none" />
                    <span className="text-5xl sm:text-6xl md:text-7xl font-black font-sans tracking-tight text-slate-500/40 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      1st
                    </span>
                  </div>
                </div>
              </div>

              {/* ----------------- 3RD PLACE (BRONZE - RIGHT) ----------------- */}
              <div className="flex-1 flex flex-col items-center relative max-w-[260px] z-10">
                {/* Floating Crown + Avatar + Team Metadata */}
                <div className="flex flex-col items-center mb-2 z-20 space-y-1.5 w-full">
                  <div className="relative animate-pulse [animation-duration:5s]">
                    <BronzeCrown />
                  </div>

                  {/* Avatar Circle */}
                  <div className="relative">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-tr from-amber-700 via-amber-500 to-amber-800 shadow-[0_0_20px_rgba(217,119,6,0.4)] flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-[#0D1424] flex items-center justify-center font-black font-mono text-base sm:text-xl text-amber-300 border-2 border-amber-600/40">
                        {p3?.teamCode || "P3"}
                      </div>
                    </div>
                    {/* Rank Pill */}
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-2.5 py-0.2 rounded-full bg-amber-600 text-white font-black font-mono text-[11px] shadow-md border border-amber-400">
                      3
                    </div>
                  </div>

                  {/* Team Name */}
                  <div className="text-center pt-1.5 px-1 max-w-[200px]">
                    <h3 className="text-sm sm:text-base font-black text-white truncate drop-shadow-md">
                      {p3?.teamName}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono truncate">@{p3?.leaderName}</p>
                  </div>

                  {/* Valuation Pill */}
                  <div className="px-3 py-1 rounded-full bg-[#0E1627]/90 border border-amber-600/40 shadow-md flex items-center gap-1.5">
                    <span className="text-amber-500 text-xs font-bold font-mono">₹</span>
                    <span className="text-xs sm:text-sm font-black font-mono text-white">
                      {(p3?.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                    </span>
                    <span className={`text-[10px] font-bold font-mono px-1.5 py-0.2 rounded ${
                      (p3?.returnPercent || 0) >= 0 ? "text-emerald-400 bg-emerald-500/15" : "text-rose-400 bg-rose-500/15"
                    }`}>
                      {(p3?.returnPercent || 0) >= 0 ? "+" : ""}{p3?.returnPercent || 0}%
                    </span>
                  </div>
                </div>

                {/* 3D Pedestal Block (3rd - Lowest) */}
                <div className="w-full relative">
                  {/* Top Angled Platform */}
                  <div className="h-4 sm:h-5 bg-gradient-to-r from-[#172033] via-[#24334E] to-[#172033] rounded-t-xl border-t-2 border-x border-amber-600/50 shadow-inner" />
                  {/* Front Vertical Slab with Engraved "3rd" */}
                  <div className="h-28 sm:h-34 md:h-36 bg-gradient-to-b from-[#101726] via-[#0B101C] to-[#060A12] border-x border-b border-[#1A253A] rounded-b-xl flex items-center justify-center relative shadow-[0_15px_35px_rgba(0,0,0,0.8)] overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-600/60 to-transparent" />
                    <span className="text-4xl sm:text-5xl md:text-6xl font-black font-sans tracking-tight text-slate-600/35 select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                      3rd
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </section>
        )}

        {/* ============================================================== */}
        {/* LEADERBOARD TABLE (Clean, High Scannability, No Points System) */}
        {/* ============================================================== */}
        <section className="rounded-2xl bg-[#0A0F1D]/80 backdrop-blur-md border border-[#1A2338] shadow-2xl overflow-hidden">
          {/* Table Header Ribbon */}
          <div className="px-5 py-3.5 bg-[#0D1527] border-b border-[#1A2338] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Live Standings Ranked by Portfolio Valuation
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                ({standings.length} Teams)
              </span>
            </div>

            {/* Filter Toggle: Ranks 4-15 vs All Teams */}
            <div className="flex items-center bg-[#070B14] p-1 rounded-lg border border-[#1A253A] shrink-0">
              <button
                type="button"
                onClick={() => setViewFilter("NEXT_RANKS")}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                  viewFilter === "NEXT_RANKS"
                    ? "bg-[#162238] text-cyan-400 border border-cyan-500/30 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Ranks 4 — {standings.length}
              </button>
              <button
                type="button"
                onClick={() => setViewFilter("ALL")}
                className={`px-3 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                  viewFilter === "ALL"
                    ? "bg-[#162238] text-[#EAB308] border border-amber-500/30 shadow-xs"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Full Grid (1 — {standings.length})
              </button>
            </div>
          </div>

          {/* Clean Table Content */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-sm font-sans min-w-[700px]">
              <thead>
                <tr className="bg-[#080D19] border-b border-[#172136] text-[11px] font-black uppercase tracking-wider text-slate-400 font-mono">
                  <th className="py-3 px-5 text-center w-16">Place</th>
                  <th className="py-3 px-5">Team &amp; Leader</th>
                  <th className="py-3 px-5 text-right">Portfolio Value</th>
                  <th className="py-3 px-5 text-right">Returns</th>
                  <th className="py-3 px-5 text-right">Cash / Assets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#131C2E]">
                {tableStandings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-mono">
                      All teams are currently displayed on the podium above.
                    </td>
                  </tr>
                ) : (
                  tableStandings.map((team, index) => {
                    const actualRank = team.rank || index + 1;
                    const grad = TEAM_GRADIENTS[(actualRank - 1) % TEAM_GRADIENTS.length];

                    return (
                      <tr
                        key={team.teamId || team.teamCode}
                        className={`transition-colors ${
                          actualRank === 1
                            ? "bg-[#EAB308]/5 hover:bg-[#EAB308]/10"
                            : actualRank === 2
                            ? "bg-slate-300/5 hover:bg-slate-300/10"
                            : actualRank === 3
                            ? "bg-amber-600/5 hover:bg-amber-600/10"
                            : "hover:bg-[#0D1525]"
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="py-3.5 px-5 text-center">
                          <span
                            className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-mono text-xs font-black shadow-xs ${
                              actualRank === 1
                                ? "bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 shadow-amber-500/20"
                                : actualRank === 2
                                ? "bg-slate-300 text-slate-950"
                                : actualRank === 3
                                ? "bg-amber-600 text-white"
                                : "bg-[#11192A] text-slate-300 border border-[#1E2B45]"
                            }`}
                          >
                            {actualRank}
                          </span>
                        </td>

                        {/* Team Avatar + Team Name + Leader */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${grad} flex items-center justify-center text-white font-mono font-black text-xs shadow-md border border-white/20 shrink-0`}>
                              {team.teamCode ? team.teamCode.slice(0, 3) : "TM"}
                            </div>
                            <div className="min-w-0">
                              <div className="font-extrabold text-white text-sm sm:text-base flex items-center gap-2 truncate">
                                <span>{team.teamName}</span>
                                {actualRank === 1 && <Trophy className="w-3.5 h-3.5 text-[#EAB308]" />}
                              </div>
                              <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
                                <span>@{team.leaderName}</span>
                                <span className="text-slate-600">•</span>
                                <span className="text-cyan-400 font-bold">{team.teamCode}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Portfolio Value */}
                        <td className="py-3.5 px-5 text-right font-mono">
                          <div className="text-base sm:text-lg font-black text-white flex items-center justify-end gap-1.5">
                            <Wallet className="w-4 h-4 text-cyan-400/80" />
                            <span>₹{(team.totalPortfolioValue || 100000).toLocaleString("en-IN")}</span>
                          </div>
                        </td>

                        {/* Return % */}
                        <td className="py-3.5 px-5 text-right font-mono">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-xs sm:text-sm ${
                              (team.returnPercent || 0) >= 0
                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                            }`}
                          >
                            {(team.returnPercent || 0) >= 0 ? "+" : ""}{team.returnPercent || 0}%
                          </span>
                        </td>

                        {/* Cash & Assets breakdown */}
                        <td className="py-3.5 px-5 text-right font-mono text-xs text-slate-300">
                          <div>
                            <span className="text-slate-400">Cash:</span> ₹{(team.cashBalance || 0).toLocaleString("en-IN")}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {team.holdingsCount > 0 ? `${team.holdingsCount} Stocks Active` : "100% Cash in Hand"}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Bottom Live Wire Market Ticker */}
      <footer className="bg-[#070B14] border-t border-[#172033] px-4 sm:px-8 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0 z-30">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase shrink-0">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE WIRE</span>
          </span>
          <span className="text-slate-200 truncate font-sans text-xs sm:text-sm">
            {raceState?.activeNews || (trackEvents?.[0] ? `${trackEvents[0].title} — ${trackEvents[0].description}` : "Market live feed connected to KRC, RGPV auditorium screen.")}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 text-xs">
          <span className="text-[#EAB308] font-bold">Imprenditore 5.0</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400">Stock Market Simulation</span>
        </div>
      </footer>
    </div>
  );
}
