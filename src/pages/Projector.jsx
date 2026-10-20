import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Medal,
  Award,
  Maximize2,
  Minimize2,
  TrendingUp,
  TrendingDown,
  Shield,
  Clock,
  Radio,
  ArrowLeft,
  Users,
  Activity,
  Layers,
  Sparkles
} from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

export default function Projector() {
  useSEO({
    title: "Live Leaderboard Screen — Imprenditore 5.0",
    description: "Auditorium broadcast projector display for Imprenditore 5.0 Stock Market Simulation."
  });

  const { raceState, leaderboard: contextLeaderboard, trackEvents } = useSimulation();
  const convexLeaderboard = useQuery(api.leaderboard.getLeaderboard, {});
  const allTeamsWithHoldings = useQuery(api.trades.getAllTeamsWithHoldings, {});

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const containerRef = useRef(null);

  // Live real-time clock
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

  // Merge leaderboard data with holdings for enriched display
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

    return base.map((team, idx) => {
      const teamWithHoldings = holdingsMap.get(team.teamCode);
      const topHolding = teamWithHoldings?.holdings?.[0];
      return {
        ...team,
        rank: idx + 1,
        topHoldingTicker: topHolding?.ticker,
        topHoldingShares: topHolding?.shares,
        holdingsCount: teamWithHoldings?.holdingsCount || 0,
      };
    });
  }, [convexLeaderboard, contextLeaderboard, allTeamsWithHoldings]);

  const p1 = standings[0];
  const p2 = standings[1];
  const p3 = standings[2];

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
          <span>CHECKERED FLAG • FINAL STANDINGS</span>
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
      className="min-h-screen bg-[#06090F] text-white font-sans selection:bg-[#E10600] selection:text-white flex flex-col justify-between overflow-x-hidden"
    >
      {/* Top Projector Broadcast Bar */}
      <header className="bg-[#0A0F1A] border-b border-[#1E293B] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 shadow-xl shrink-0">
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
              <span>Imprenditore 5.0 : Pole Position Leaderboard</span>
            </h1>
          </div>
        </div>

        {/* Center: Live Competition Status */}
        <div className="hidden md:flex items-center gap-3">
          {getStatusBadge()}
          {typeof raceState?.lapTimeRemaining === "number" && (
            <div className="bg-[#121A2C] px-3 py-1 rounded-full border border-[#23314A] text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
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
          <div className="hidden lg:flex flex-col text-right font-mono text-xs">
            <span className="text-slate-400 text-[10px] uppercase font-bold">Venue Time (IST)</span>
            <span className="text-white font-bold text-sm text-cyan-400">{currentTime || "--:--:--"}</span>
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#162032] hover:bg-[#202E48] text-white text-xs font-bold border border-[#263550] transition-colors flex items-center gap-1.5 shadow-xs"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Enter Fullscreen (F11)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-[#EAB308]" /> : <Maximize2 className="w-4 h-4 text-[#EAB308]" />}
            <span className="hidden sm:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          <Link
            to="/admin"
            className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Admin Control</span>
          </Link>
        </div>
      </header>

      {/* Main Broadcast Stage */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-5">
        {/* Top 3 Podium Showcase */}
        {standings.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* P2: Silver Podium (Order 2 on desktop for visual podium layout: P2, P1, P3) */}
            <div className="order-2 md:order-1 relative rounded-2xl bg-gradient-to-b from-[#131A26] to-[#0A0F1A] border-2 border-slate-400/30 p-5 shadow-lg flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black font-mono text-sm flex items-center justify-center shadow-md">
                    2
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400 tracking-wider">
                      Second Place
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white truncate max-w-[180px]">
                      {p2?.teamName}
                    </h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-slate-700/50 text-slate-300 font-mono font-bold text-xs">
                  {p2?.teamCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700/40">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Net Portfolio</div>
                  <div className="text-lg sm:text-xl font-mono font-extrabold text-white">
                    ₹{(p2?.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                  <div className="text-lg sm:text-xl font-mono font-extrabold text-cyan-400">
                    {p2?.totalScore || 0} <span className="text-xs text-slate-400">PTS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-slate-400 font-mono">
                <span>Leader: {p2?.leaderName}</span>
                <span className={`font-bold ${p2?.returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {p2?.returnPercent >= 0 ? "+" : ""}{p2?.returnPercent}%
                </span>
              </div>
            </div>

            {/* P1: Gold Podium (Trophy - Center) */}
            <div className="order-1 md:order-2 relative rounded-2xl bg-gradient-to-b from-[#1C180A] via-[#141824] to-[#0A0F1A] border-2 border-[#EAB308] p-5 shadow-2xl flex flex-col justify-between space-y-3 ring-2 ring-[#EAB308]/20">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-[#EAB308] text-slate-950 font-black font-mono text-[11px] uppercase tracking-wider flex items-center gap-1 shadow-md">
                <Trophy className="w-3.5 h-3.5" />
                <span>Pole Position Leader</span>
              </div>

              <div className="flex items-start justify-between pt-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-10 h-10 rounded-full bg-[#EAB308] text-slate-950 font-black font-mono text-lg flex items-center justify-center shadow-lg shadow-[#EAB308]/30">
                    1
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-[#EAB308] tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Current Winner
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-white truncate max-w-[200px]">
                      {p1?.teamName}
                    </h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-[#EAB308]/20 border border-[#EAB308]/40 text-[#EAB308] font-mono font-black text-xs">
                  {p1?.teamCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#EAB308]/30">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Net Portfolio</div>
                  <div className="text-xl sm:text-2xl font-mono font-black text-white">
                    ₹{(p1?.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#EAB308]">Grand Score</div>
                  <div className="text-xl sm:text-2xl font-mono font-black text-[#EAB308]">
                    {p1?.totalScore || 0} <span className="text-xs text-white">PTS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-slate-300 font-mono">
                <span>Leader: <strong className="text-white">{p1?.leaderName}</strong></span>
                <span className={`font-black text-sm ${p1?.returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {p1?.returnPercent >= 0 ? "+" : ""}{p1?.returnPercent}%
                </span>
              </div>
            </div>

            {/* P3: Bronze Podium (Order 3) */}
            <div className="order-3 relative rounded-2xl bg-gradient-to-b from-[#18120B] to-[#0A0F1A] border-2 border-amber-600/40 p-5 shadow-lg flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-amber-600 text-slate-950 font-black font-mono text-sm flex items-center justify-center shadow-md">
                    3
                  </span>
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-500 tracking-wider">
                      Third Place
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white truncate max-w-[180px]">
                      {p3?.teamName}
                    </h3>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-600/20 text-amber-400 font-mono font-bold text-xs">
                  {p3?.teamCode}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-amber-700/30">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Net Portfolio</div>
                  <div className="text-lg sm:text-xl font-mono font-extrabold text-white">
                    ₹{(p3?.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                  <div className="text-lg sm:text-xl font-mono font-extrabold text-amber-400">
                    {p3?.totalScore || 0} <span className="text-xs text-slate-400">PTS</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 text-slate-400 font-mono">
                <span>Leader: {p3?.leaderName}</span>
                <span className={`font-bold ${p3?.returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {p3?.returnPercent >= 0 ? "+" : ""}{p3?.returnPercent}%
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Full Grid Standings Table (All 15 Teams) */}
        <div className="rounded-2xl bg-[#0D131F] border border-[#1E293B] shadow-2xl overflow-hidden">
          <div className="px-6 py-3.5 bg-[#101828] border-b border-[#1E293B] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#EAB308]" />
              <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                Live Grid Standings (50/30/20 Pole Position Formula)
              </h2>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {standings.length} Teams Competing
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs sm:text-sm font-sans min-w-[900px]">
              <thead>
                <tr className="bg-[#090E17] border-b border-[#1E293B] text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <th className="py-3 px-4 text-center w-16">Rank</th>
                  <th className="py-3 px-4">Team &amp; Leader</th>
                  <th className="py-3 px-4 text-center">Code</th>
                  <th className="py-3 px-4 text-right">Cash Balance</th>
                  <th className="py-3 px-4 text-right">Holdings Value</th>
                  <th className="py-3 px-4 text-right">Total Net Worth</th>
                  <th className="py-3 px-4 text-right">Profit / Return</th>
                  <th className="py-3 px-4 text-center">P / S / E</th>
                  <th className="py-3 px-4 text-right">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A2536]">
                {standings.map((team, index) => {
                  const isTop3 = index < 3;
                  const rankBadgeClass =
                    index === 0
                      ? "bg-[#EAB308] text-slate-950 font-black shadow-md shadow-[#EAB308]/30"
                      : index === 1
                      ? "bg-slate-300 text-slate-950 font-black"
                      : index === 2
                      ? "bg-amber-600 text-white font-black"
                      : "bg-[#162032] text-slate-300 font-bold border border-[#24334C]";

                  return (
                    <tr
                      key={team.teamId || team.teamCode}
                      className={`transition-colors ${
                        index === 0
                          ? "bg-[#18170D]/40 hover:bg-[#18170D]/70"
                          : isTop3
                          ? "bg-[#111726]/40 hover:bg-[#111726]/70"
                          : "hover:bg-[#121A2A]"
                      }`}
                    >
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs ${rankBadgeClass}`}>
                          {index + 1}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                          <span>{team.teamName}</span>
                          {index === 0 && <Trophy className="w-4 h-4 text-[#EAB308]" />}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          Leader: <span className="text-slate-300 font-medium">{team.leaderName}</span>
                          {team.topHoldingTicker && (
                            <span className="ml-2 px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Top: {team.topHoldingTicker} ({team.topHoldingShares} sh)
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono font-bold text-cyan-400">
                        {team.teamCode}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        ₹{(team.cashBalance || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right font-mono text-slate-300">
                        ₹{(team.holdingsValue || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-white text-sm sm:text-base">
                        ₹{(team.totalPortfolioValue || 100000).toLocaleString("en-IN")}
                      </td>

                      <td className="py-3 px-4 text-right font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded font-black text-xs ${
                            team.returnPercent >= 0
                              ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {team.returnPercent >= 0 ? "+" : ""}{team.returnPercent}%
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400">
                        <span title="Portfolio Score / Strategy Score / Execution Score">
                          {team.portfolioScore ?? "-"} / {team.strategyScore ?? "-"} / {team.executionScore ?? "-"}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-black text-sm sm:text-base text-[#EAB308]">
                        {(team.totalScore || 0).toFixed(1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Bottom Live Market Ticker for Screen */}
      <footer className="bg-[#090D15] border-t border-[#1E293B] px-4 py-2.5 flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 text-[10px] font-bold uppercase shrink-0">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>LIVE WIRE</span>
          </span>
          <span className="text-slate-300 truncate font-sans text-xs">
            {raceState?.activeNews || (trackEvents?.[0] ? `${trackEvents[0].title} — ${trackEvents[0].description}` : "Live market telemetry feeds streamed to KRC, RGPV auditorium screen.")}
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-3 shrink-0 text-[11px]">
          <span>Format: 50% Profit • 30% Strategy • 20% Execution</span>
          <span className="text-slate-600">|</span>
          <span className="text-cyan-400 font-bold">Imprenditore 5.0</span>
        </div>
      </footer>
    </div>
  );
}
