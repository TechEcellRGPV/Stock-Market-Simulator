import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Trophy,
  Crown,
  Clock,
  ArrowLeft
} from "lucide-react";
import CirculatingBanner from "../components/CirculatingBanner";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

/**
 * @file Leaderboard.jsx
 * @description Auditorium Projector View & Pole Position Standings for Imprenditore 5.0.
 * Displays real-time grand prix rankings evaluated using the 50/30/20 scoring model:
 * - 50% Portfolio Return benchmarked against base capital
 * - 30% Strategy & Sector Diversification (1 to 3+ sectors)
 * - 20% Decision-Making & Capital Deployment (≥50% cash invested + order frequency)
 *
 * Features high-contrast P1, P2, and P3 podium cards alongside the full grid table.
 *
 * @returns {JSX.Element} High-visibility leaderboard formatted for auditorium projection
 */
export default function Leaderboard() {
  useSEO({
    title: "Competition Leaderboard",
    description: "Live 50/30/20 Competition Standings for Imprenditore 5.0. Track team net worth, return percentages, sector diversification, and real-time rank positions."
  });

  const { leaderboard, raceState, currentTeam } = useSimulation();

  // Extract top three teams for podium presentation
  const top3 = leaderboard.slice(0, 3);

  /**
   * Formats remaining lap duration into MM:SS notation.
   * @param {number} secs - Seconds remaining in current lap
   * @returns {string} Formatted time string
   */
  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Top Projector Header */}
      <header className="bg-[#121720] border-b border-[#232B3B] px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link to="/" className="hover:opacity-90 transition-opacity shrink-0">
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded"
            />
          </Link>
          <div className="min-w-0">
            <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E10600] truncate">
              E-Cell RGPV : Imprenditore 5.0
            </div>
            <h1 className="text-xs sm:text-base font-black uppercase italic tracking-tight text-white flex items-center gap-1.5 truncate">
              <span>Competition Leaderboard</span>
              <Trophy className="w-3.5 h-3.5 text-[#EAB308] shrink-0" />
            </h1>
          </div>
        </div>

        {/* Lap, Flag & Time Telemetry */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-[#0A0D12] px-2 sm:px-3 py-1 rounded border border-[#232B3B]">
            <Clock className="w-3 h-3 text-[#06B6D4]" />
            <span className="font-mono font-bold text-[#06B6D4] text-[11px] sm:text-xs">
              {formatTime(raceState.lapTimeRemaining)}
            </span>
            <span className={`font-black uppercase tracking-wider text-[10px] sm:text-[11px] ${raceState.status === "GREEN_FLAG"
              ? "text-[#EAB308]"
              : raceState.status === "SAFETY_CAR"
                ? "text-[#F59E0B]"
                : raceState.status === "CHECKERED_FLAG"
                  ? "text-[#FF4D4D]"
                  : "text-[#06B6D4]"
              }`}>
              {raceState.status === "GREEN_FLAG"
                ? `LAP ${raceState.currentLap}/5`
                : raceState.status === "SAFETY_CAR"
                  ? "PAUSED"
                  : raceState.status === "CHECKERED_FLAG"
                    ? "CONCLUDED"
                    : "WARMUP"}
            </span>
          </div>

          <Link
            to={currentTeam ? "/dashboard" : "/login"}
            className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded bg-[#E10600] hover:bg-[#C50500] text-white text-[11px] sm:text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0"
          >
            <ArrowLeft className="w-3 h-3 shrink-0" />
            <span>{currentTeam ? "Dashboard" : "Login"}</span>
          </Link>
        </div>
      </header>

      {/* Real-time Circulating Live Update Banner */}
      <CirculatingBanner />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Top 3 Podium Cards */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* 2nd Place */}
            {top3[1] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl bg-[#121720] border border-[#94A3B8]/40 order-2 md:order-1"
              >
                <div className="w-8 h-8 rounded bg-[#94A3B8]/15 text-[#94A3B8] flex items-center justify-center font-black text-sm border border-[#94A3B8]/30 mb-2">
                  P2
                </div>
                <div className="text-[10px] font-mono text-slate-500">{top3[1].teamCode}</div>
                <h3 className="text-lg font-black text-white truncate">{top3[1].teamName}</h3>
                <div className="text-xs text-slate-400 mb-3">Leader: {top3[1].leaderName}</div>

                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] mb-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                  <div className="text-xl font-black font-mono text-[#94A3B8]">
                    {top3[1].totalScore} <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>₹{top3[1].totalPortfolioValue.toLocaleString("en-IN")}</span>
                  <span className={top3[1].returnPercent >= 0 ? "text-[#10B981]" : "text-[#E10600]"}>
                    {top3[1].returnPercent >= 0 ? "+" : ""}{top3[1].returnPercent}%
                  </span>
                </div>
              </motion.div>
            )}

            {/* 1st Place - Podium */}
            {top3[0] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-xl bg-[#161B24] border-2 border-[#EAB308] order-1 md:order-2 md:-translate-y-2"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="w-9 h-9 rounded bg-[#EAB308]/20 text-[#EAB308] flex items-center justify-center font-black text-base border border-[#EAB308]/50">
                    P1
                  </div>
                  <Crown className="w-6 h-6 text-[#EAB308]" />
                </div>
                <div className="text-[10px] font-mono text-slate-500">{top3[0].teamCode}</div>
                <h3 className="text-xl sm:text-2xl font-black text-white truncate">{top3[0].teamName}</h3>
                <div className="text-xs text-[#EAB308] font-bold mb-4">Leader: {top3[0].leaderName}</div>

                <div className="p-3.5 rounded-lg bg-[#0A0D12] border border-[#EAB308]/30 mb-3">
                  <div className="text-[10px] uppercase font-black tracking-wider text-[#EAB308]">
                    First Place Score
                  </div>
                  <div className="text-3xl font-black font-mono text-[#EAB308]">
                    {top3[0].totalScore} <span className="text-xs text-slate-400 font-sans font-bold">/ 100 pts</span>
                  </div>
                  <div className="flex gap-2 text-[10px] text-slate-400 font-mono mt-1">
                    <span>P:{top3[0].portfolioScore}</span>
                    <span>•</span>
                    <span>S:{top3[0].strategyScore}</span>
                    <span>•</span>
                    <span>E:{top3[0].executionScore}</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-200">
                  <span>Portfolio: ₹{top3[0].totalPortfolioValue.toLocaleString("en-IN")}</span>
                  <span className={`font-bold ${top3[0].returnPercent >= 0 ? "text-[#10B981]" : "text-[#E10600]"}`}>
                    {top3[0].returnPercent >= 0 ? "+" : ""}{top3[0].returnPercent}%
                  </span>
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {top3[2] && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl bg-[#121720] border border-[#CD7F32]/40 order-3"
              >
                <div className="w-8 h-8 rounded bg-[#CD7F32]/15 text-[#CD7F32] flex items-center justify-center font-black text-sm border border-[#CD7F32]/30 mb-2">
                  P3
                </div>
                <div className="text-[10px] font-mono text-slate-500">{top3[2].teamCode}</div>
                <h3 className="text-lg font-black text-white truncate">{top3[2].teamName}</h3>
                <div className="text-xs text-slate-400 mb-3">Leader: {top3[2].leaderName}</div>

                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] mb-3">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                  <div className="text-xl font-black font-mono text-[#CD7F32]">
                    {top3[2].totalScore} <span className="text-xs text-slate-500">/ 100</span>
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>₹{top3[2].totalPortfolioValue.toLocaleString("en-IN")}</span>
                  <span className={top3[2].returnPercent >= 0 ? "text-[#10B981]" : "text-[#E10600]"}>
                    {top3[2].returnPercent >= 0 ? "+" : ""}{top3[2].returnPercent}%
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Complete Standings Table */}
        <div className="bg-[#121720] rounded-xl border border-[#232B3B] overflow-hidden">
          <div className="px-4 sm:px-6 py-3.5 border-b border-[#232B3B] flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#EAB308]" />
              <span>Team Rankings ({leaderboard.length} Teams)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Live Standings
            </span>
          </div>

          <div className="p-4 sm:p-6 overflow-x-auto">
            <div className="sm:hidden text-[10px] text-slate-500 font-mono mb-2 text-right">
              Scroll table horizontally for full details
            </div>
            {leaderboard.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-xs font-bold">
                No teams registered on the grid yet.
              </div>
            ) : (
              <table className="w-full min-w-162.5 text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#232B3B] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-2.5 text-center">Pos</th>
                    <th className="pb-2.5">Team &amp; Code</th>
                    <th className="pb-2.5">Team Leader</th>
                    <th className="pb-2.5 text-right">Portfolio Value</th>
                    <th className="pb-2.5 text-right">Return %</th>
                    <th className="pb-2.5 text-center">Sectors</th>
                    <th className="pb-2.5 text-center">Score (P/S/E)</th>
                    <th className="pb-2.5 text-right font-black text-[#EAB308]">Total Score</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C]">
                  {leaderboard.map((entry) => (
                    <tr
                      key={entry.teamId || entry.id || entry.rank}
                      className={`hover:bg-[#161B24] transition-colors ${currentTeam && (currentTeam.id === entry.teamId || currentTeam.id === entry.id) ? "bg-[#E10600]/10 font-bold" : ""
                        }`}
                    >
                      <td className="py-3 text-center font-black font-mono">
                        {entry.rank === 1 ? (
                          <span className="text-[#EAB308]">P1</span>
                        ) : entry.rank === 2 ? (
                          <span className="text-[#94A3B8]">P2</span>
                        ) : entry.rank === 3 ? (
                          <span className="text-[#CD7F32]">P3</span>
                        ) : (
                          <span className="text-slate-400">{entry.rank}</span>
                        )}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-white">{entry.teamName}</div>
                        <div className="text-[10px] font-mono text-slate-500">{entry.teamCode}</div>
                      </td>
                      <td className="py-3 text-slate-300">{entry.leaderName}</td>
                      <td className="py-3 text-right font-mono font-bold text-white">
                        ₹{entry.totalPortfolioValue.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 text-right font-mono font-bold">
                        <span className={entry.returnPercent >= 0 ? "text-[#10B981]" : "text-[#E10600]"}>
                          {entry.returnPercent >= 0 ? "+" : ""}{entry.returnPercent}%
                        </span>
                      </td>
                      <td className="py-3 text-center font-mono text-slate-300">
                        {entry.uniqueSectorCount}/5
                      </td>
                      <td className="py-3 text-center font-mono text-[11px] text-slate-400">
                        {entry.portfolioScore} / {entry.strategyScore} / {entry.executionScore}
                      </td>
                      <td className="py-3 text-right font-mono font-black text-sm text-[#EAB308]">
                        {entry.totalScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
