import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Trophy,
  Crown,
  Search,
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import CirculatingBanner from "../components/CirculatingBanner";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

export default function Leaderboard() {
  useSEO({
    title: "Competition Leaderboard",
    description: "Live Standings for Imprenditore 5.0. Track team net profit, portfolio value, return percentages, and real-time rank positions."
  });

  const { leaderboard, raceState, currentTeam } = useSimulation();
  const [searchQuery, setSearchQuery] = useState("");

  const getNetProfit = (entry) => {
    if (!entry) return 0;
    if (typeof entry.netProfit === "number") return entry.netProfit;
    return (entry.totalPortfolioValue || 100000) - (raceState.defaultStartingCapital || 100000);
  };

  const top3 = useMemo(() => {
    return leaderboard.slice(0, 3);
  }, [leaderboard]);

  const filteredLeaderboard = useMemo(() => {
    if (!searchQuery.trim()) return leaderboard;
    const q = searchQuery.toLowerCase();
    return leaderboard.filter(
      (entry) =>
        entry.teamName?.toLowerCase().includes(q) ||
        entry.teamCode?.toLowerCase().includes(q) ||
        entry.leaderName?.toLowerCase().includes(q)
    );
  }, [leaderboard, searchQuery]);

  return (
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <Navbar />
      <CirculatingBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2336]">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Competition Leaderboard</span>
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Rankings evaluated strictly by Net Profit generated over ₹{(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")} initial capital
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            {leaderboard.length} Teams Registered
          </div>
        </div>

        {/* Top 3 Podium Showcase */}
        {top3.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 items-end">
            {/* 2nd Place */}
            {top3[1] && (() => {
              const profit2 = getNetProfit(top3[1]);
              const isProfit = profit2 >= 0;
              return (
                <div className="p-4 rounded-xl bg-[#0D121D] border border-slate-700/60 order-2 md:order-1 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-slate-400/10 text-slate-300 font-mono font-bold text-xs flex items-center justify-center border border-slate-400/20">
                      P2
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{top3[1].teamCode}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{top3[1].teamName}</h3>
                    <div className="text-xs text-slate-400 truncate">Leader: {top3[1].leaderName}</div>
                  </div>
                  <div className="pt-2 border-t border-[#161F30] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Net Profit</div>
                      <div className={`font-mono font-bold text-base ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}₹{profit2.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Return</div>
                      <div className={`font-mono font-semibold text-xs ${top3[1].returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {top3[1].returnPercent >= 0 ? "+" : ""}{top3[1].returnPercent}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 1st Place (Crown) */}
            {top3[0] && (() => {
              const profit1 = getNetProfit(top3[0]);
              const isProfit = profit1 >= 0;
              return (
                <div className="p-5 rounded-xl bg-[#111726] border border-amber-500/40 order-1 md:order-2 md:-translate-y-1 shadow-md shadow-amber-500/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 font-mono font-bold text-sm flex items-center justify-center border border-amber-500/30">
                      P1
                    </span>
                    <Crown className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white truncate">{top3[0].teamName}</h3>
                    <div className="text-xs text-amber-400/80 truncate">Leader: {top3[0].leaderName}</div>
                  </div>
                  <div className="pt-2.5 border-t border-[#1C263B] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-amber-400">1st Place Profit</div>
                      <div className={`font-mono font-bold text-xl ${isProfit ? "text-amber-400" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}₹{profit1.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Return</div>
                      <div className={`font-mono font-bold text-sm ${top3[0].returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {top3[0].returnPercent >= 0 ? "+" : ""}{top3[0].returnPercent}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3rd Place */}
            {top3[2] && (() => {
              const profit3 = getNetProfit(top3[2]);
              const isProfit = profit3 >= 0;
              return (
                <div className="p-4 rounded-xl bg-[#0D121D] border border-amber-700/50 order-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="w-7 h-7 rounded-lg bg-amber-700/15 text-amber-600 font-mono font-bold text-xs flex items-center justify-center border border-amber-700/30">
                      P3
                    </span>
                    <span className="font-mono text-[11px] text-slate-400">{top3[2].teamCode}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white truncate">{top3[2].teamName}</h3>
                    <div className="text-xs text-slate-400 truncate">Leader: {top3[2].leaderName}</div>
                  </div>
                  <div className="pt-2 border-t border-[#161F30] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Net Profit</div>
                      <div className={`font-mono font-bold text-base ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                        {isProfit ? "+" : ""}₹{profit3.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">Return</div>
                      <div className={`font-mono font-semibold text-xs ${top3[2].returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                        {top3[2].returnPercent >= 0 ? "+" : ""}{top3[2].returnPercent}%
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Complete Standings Table */}
        <div className="rounded-xl bg-[#0D121D] border border-[#1A2336] overflow-hidden">
          {/* Filter Bar */}
          <div className="p-3 sm:px-5 sm:py-3 border-b border-[#1A2336] flex items-center justify-between gap-3 bg-[#0A0E17]">
            <div className="relative flex-1 max-w-xs">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search team or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#090D14] border border-[#1C263B] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none"
              />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Showing {filteredLeaderboard.length} of {leaderboard.length}
            </div>
          </div>

          {filteredLeaderboard.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              {leaderboard.length === 0 ? "No teams registered on the grid yet." : "No teams matched your search."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#1A2336] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#080B10]">
                    <th className="py-3 px-4 text-center">Rank</th>
                    <th className="py-3 px-4">Team</th>
                    <th className="py-3 px-4">Leader</th>
                    <th className="py-3 px-4 text-right">Portfolio Value</th>
                    <th className="py-3 px-4 text-right">Available Cash</th>
                    <th className="py-3 px-4 text-right">Return %</th>
                    <th className="py-3 px-4 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#141B28]">
                  {filteredLeaderboard.map((entry) => {
                    const profit = getNetProfit(entry);
                    const isProfit = profit >= 0;
                    const isUserTeam = currentTeam && (currentTeam.id === entry.teamId || currentTeam._id === entry.teamId || currentTeam.teamCode === entry.teamCode);

                    return (
                      <tr
                        key={entry.teamId || entry.id || entry.rank}
                        className={`transition-colors ${
                          isUserTeam
                            ? "bg-emerald-500/5 hover:bg-emerald-500/10 font-medium"
                            : "hover:bg-[#121824]"
                        }`}
                      >
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {entry.rank === 1 ? (
                            <span className="text-amber-400">P1</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-slate-300">P2</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-amber-600">P3</span>
                          ) : (
                            <span className="text-slate-400">{entry.rank}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white flex items-center gap-2">
                            <span>{entry.teamName}</span>
                            {isUserTeam && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400">{entry.teamCode}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-300">{entry.leaderName}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ₹{entry.totalPortfolioValue?.toLocaleString("en-IN") || "1,00,000"}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-400">
                          ₹{(entry.cashBalance || 0).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          <span className={entry.returnPercent >= 0 ? "text-emerald-400" : "text-rose-400"}>
                            {entry.returnPercent >= 0 ? "+" : ""}{entry.returnPercent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={isProfit ? "text-emerald-400" : "text-rose-400"}>
                            {isProfit ? "+" : ""}₹{profit.toLocaleString("en-IN")}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
