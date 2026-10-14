import { useState, useMemo, useSyncExternalStore } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Gauge,
  Trophy,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  LogOut,
  Layers,
  Flame,
  Plus,
  Lock,
  Activity,
  ShieldCheck,
  ChevronRight,
  Calendar,
  Sparkles
} from "lucide-react";
import CirculatingBanner from "../components/CirculatingBanner";
import PortfolioPerformanceChart from "../components/PortfolioPerformanceChart";
import PaddockWaitingLounge from "../components/PaddockWaitingLounge";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";
import { useScreenWakeLock } from "../hooks/useScreenWakeLock";

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
 * @file Dashboard.jsx
 * @description Driver Cockpit & Financial Telemetry Console for Imprenditore 5.0.
 * Serves as the primary operational terminal for authenticated racing teams:
 * 1. Top Telemetry Bar: Net worth, cash fuel, stock allocation, and 50/30/20 live score
 * 2. Sector Diversification Gauges: Real-time visual progress across all 5 sectors
 * 3. Tabbed Command Center:
 *    - Holdings Table with live prices, quantities, and unrealized P&L
 *    - Valuation Telemetry Canvas: Interactive portfolio net worth history chart
 *    - Pit Stop Orders Ledger: Complete session order audit stream
 *    - 50/30/20 Official Scorecard: Detailed breakdown of the three scoring pillars
 * 4. Paddock Waiting Lounge: Holds participants until green flag-off
 *
 * @returns {JSX.Element} Driver Cockpit terminal or Paddock Lounge
 */
export default function Dashboard() {
  useSEO({
    title: "Team Trading Dashboard",
    description: "Team Trading Dashboard for Imprenditore 5.0. Monitor real-time net worth, cash balance, sector allocation meters, valuation charts, and order ledgers."
  });

  const navigate = useNavigate();
  const {
    currentTeam,
    currentHoldings,
    orders,
    stocks,
    raceState,
    leaderboard,
    logout
  } = useSimulation();

  // Mobile Screen Wake Lock: Keeps display active during live race flag-off
  useScreenWakeLock(raceState?.status === "GREEN_FLAG");

  const [activeTab, setActiveTab] = useState("holdings"); // "holdings" | "telemetry" | "orders" | "scorecard"

  const now = useSyncExternalStore(subscribeToSeconds, getNowSnapshot, getServerSnapshot);

  const countdown = useMemo(() => {
    if (!raceState.targetEventDate) return null;
    const target = new Date(raceState.targetEventDate).getTime();
    if (isNaN(target)) return null;

    const diff = target - now;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPassed: false };
  }, [raceState.targetEventDate, now]);

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

  const stockPriceMap = useMemo(() => new Map(stocks.map((s) => [s.ticker, s])), [stocks]);

  // Compute live portfolio values for the current team
  const portfolioStats = useMemo(() => {
    if (!currentTeam) {
      return {
        cash: 100000,
        invested: 0,
        totalValue: 100000,
        totalPnL: 0,
        pnlPercent: 0,
        sectorBreakdown: {},
        holdingRows: []
      };
    }

    let invested = 0;
    const sectorTotals = {};
    const holdingRows = [];

    for (const h of currentHoldings) {
      const stock = stockPriceMap.get(h.ticker);
      const currentPrice = stock ? stock.currentPrice : h.avgBuyPrice;
      const currentValue = Math.round(h.shares * currentPrice * 100) / 100;
      const costBasis = Math.round(h.shares * h.avgBuyPrice * 100) / 100;
      const pnl = Math.round((currentValue - costBasis) * 100) / 100;
      const pnlPct = costBasis > 0 ? Math.round((pnl / costBasis) * 1000) / 10 : 0;

      invested += currentValue;

      const sectorName = stock ? stock.sector : "Other";
      sectorTotals[sectorName] = (sectorTotals[sectorName] || 0) + currentValue;

      holdingRows.push({
        ...h,
        stockName: stock ? stock.name : h.ticker,
        sector: sectorName,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPct
      });
    }

    const totalValue = Math.round((currentTeam.cashBalance + invested) * 100) / 100;
    const totalPnL = Math.round((totalValue - 100000) * 100) / 100;
    const pnlPercent = Math.round((totalPnL / 100000) * 1000) / 10;

    return {
      cash: currentTeam.cashBalance,
      invested,
      totalValue,
      totalPnL,
      pnlPercent,
      sectorBreakdown: sectorTotals,
      holdingRows
    };
  }, [currentTeam, currentHoldings, stockPriceMap]);

  // Current Team Rank in Pole Position Leaderboard
  const currentRank = useMemo(() => {
    if (!currentTeam) return "-";
    const found = leaderboard.find(
      (entry) =>
        entry.teamId === currentTeam.id ||
        entry.teamId === currentTeam._id ||
        entry.teamCode === currentTeam.teamCode
    );
    return found ? `#${found.rank}` : "#1";
  }, [currentTeam, leaderboard]);

  // 50/30/20 Scorecard stats
  const scoreData = useMemo(() => {
    if (!currentTeam) {
      return { total: 0, portfolio: 0, strategy: 0, execution: 0, uniqueSectors: 0 };
    }
    const found = leaderboard.find(
      (entry) =>
        entry.teamId === currentTeam.id ||
        entry.teamId === currentTeam._id ||
        entry.teamCode === currentTeam.teamCode
    );
    if (found) {
      return {
        total: found.totalScore,
        portfolio: found.portfolioScore,
        strategy: found.strategyScore,
        execution: found.executionScore,
        uniqueSectors: found.uniqueSectorCount
      };
    }
    return { total: 0, portfolio: 0, strategy: 0, execution: 0, uniqueSectors: 0 };
  }, [currentTeam, leaderboard]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full bg-[#121720] p-6 sm:p-8 rounded-xl border border-[#232B3B] text-center">
          <div className="w-12 h-12 rounded bg-[#E10600]/10 text-[#E10600] flex items-center justify-center mx-auto mb-3 border border-[#E10600]/30">
            <Gauge className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black uppercase italic tracking-wide text-white mb-2">
            No Active Team Session
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Please register your team or enter your 4-digit PIN to access your cockpit.
          </p>
          <div className="space-y-2.5">
            <Link
              to="/login"
              className="block w-full py-3 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors"
            >
              Enter Paddock Login
            </Link>
            <Link
              to="/"
              className="block w-full py-3 rounded-lg bg-[#161B24] hover:bg-[#1D232E] text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors border border-[#232B3B]"
            >
              Return To Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!raceState.isSimulationEntryOpen) {
    return (
      <PaddockWaitingLounge
        currentTeam={currentTeam}
        raceState={raceState}
        stocks={stocks}
        onLogout={handleLogout}
      />
    );
  }

  const isPreRace = raceState.status === "GRID_WARMUP";
  const isLive = raceState.status === "GREEN_FLAG";
  const isPaused = raceState.status === "SAFETY_CAR";
  const isConcluded = raceState.status === "CHECKERED_FLAG";

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Top Telemetry Strip */}
      <div className="bg-[#121720] border-b border-[#232B3B] px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-7 h-7 object-contain rounded shrink-0"
            />
          </Link>
          <div>
            <span className="text-slate-400 text-[11px] font-bold uppercase mr-1.5">Team:</span>
            <strong className="text-white uppercase tracking-wider">{currentTeam.teamName}</strong>
            <span className="ml-2 px-2 py-0.5 rounded bg-[#1A202C] text-slate-300 text-[10px] font-mono border border-[#2A3447]">
              {currentTeam.teamCode}
            </span>
          </div>
        </div>

        {/* Lap & Race Status Indicators */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 bg-[#0A0D12] px-3 py-1 rounded border border-[#232B3B]">
            <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span className="font-mono font-bold text-[#06B6D4] text-xs">
              {formatTime(raceState.lapTimeRemaining)}
            </span>
            <span className={`font-black uppercase tracking-wider text-[11px] ${isLive
              ? "text-[#EAB308]"
              : isPaused
                ? "text-[#F59E0B]"
                : isConcluded
                  ? "text-[#FF4D4D]"
                  : "text-[#06B6D4]"
              }`}>
              {isLive
                ? `LAP ${raceState.currentLap}/5`
                : isPaused
                  ? "PAUSED"
                  : isConcluded
                    ? "CONCLUDED"
                    : "WARMUP"}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-slate-400 text-[11px]">Rank:</span>
            <span className="font-black text-[#EAB308] px-2 py-0.5 bg-[#EAB308]/10 rounded border border-[#EAB308]/30">
              {currentRank}
            </span>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded bg-[#161B24] hover:bg-[#E10600]/20 text-slate-400 hover:text-[#FF4D4D] transition-colors border border-[#232B3B]"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Dashboard Workspace */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Real-time Circulating Live Update Banner */}
        <div className="rounded-xl overflow-hidden border border-[#232B3B]">
          <CirculatingBanner />
        </div>

        {/* Pre-Race Mission Control Hero (Desktop & Mobile) */}
        {isPreRace && (
          <section className="bg-linear-to-br from-[#0F1420] via-[#121824] to-[#0A0D14] rounded-2xl border border-[#232B3B] p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#06B6D4]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#E10600]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              {/* Row 1: Status Lockup & Synchronized Countdown */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAB308]/15 border border-[#EAB308]/30 text-[#EAB308] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
                      <span>Pre-Race Grid Warmup</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                      <Lock className="w-3 h-3 text-[#EAB308]" />
                      <span>Pit Lane Locked</span>
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-2xl font-black uppercase tracking-wide text-white">
                    Trading Floor Staged: Awaiting Green Flag
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Race Control is conducting paddock checks. Your team is funded with ₹1,00,000 mock capital. Review the 17 equities and formulate your sector allocation strategy before Lap 1 commences.
                  </p>
                </div>

                {/* Countdown Dial Box or Standby Status */}
                {countdown && !countdown.isPassed ? (
                  <div className="bg-[#0A0D12] p-3 sm:p-4 rounded-xl border border-slate-800 shrink-0">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#EAB308] font-bold mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Flag-Off Target</span>
                      </span>
                      <span className="text-slate-400 font-normal">{formattedEventDate}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-[#121720] px-2.5 py-1.5 rounded-lg border border-slate-800/80 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-white">
                          {countdown.days.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Days</div>
                      </div>
                      <div className="bg-[#121720] px-2.5 py-1.5 rounded-lg border border-slate-800/80 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-white">
                          {countdown.hours.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Hours</div>
                      </div>
                      <div className="bg-[#121720] px-2.5 py-1.5 rounded-lg border border-slate-800/80 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-[#EAB308]">
                          {countdown.minutes.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Mins</div>
                      </div>
                      <div className="bg-[#121720] px-2.5 py-1.5 rounded-lg border border-slate-800/80 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-[#06B6D4]">
                          {countdown.seconds.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Secs</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#0A0D12] p-3 sm:p-4 rounded-xl border border-[#10B981]/30 text-center shrink-0">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Grid Standby</div>
                    <div className="text-xs sm:text-sm font-black text-[#10B981] mt-1 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Flag-Off Imminent</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Awaiting Race Director Command
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: 3 Pre-Race Strategy Directives */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090D15] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 border border-[#10B981]/30">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Mock Fuel Ready</div>
                    <div className="text-base font-black font-mono text-white mt-0.5">₹1,00,000.00</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      100% available liquidity. Zero market slippage prior to flag-off.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#06B6D4]/15 border border-slate-800/90 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center shrink-0 border border-[#06B6D4]/30">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">30% Strategy Goal</div>
                    <div className="text-base font-black font-mono text-[#06B6D4] mt-0.5">Min 3 Sectors</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Allocate across at least 3 distinct sectors to unlock 30/30 points.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090D15] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#EAB308]/15 text-[#EAB308] flex items-center justify-center shrink-0 border border-[#EAB308]/30">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Paddock Intelligence</div>
                    <div className="text-base font-black font-mono text-[#EAB308] mt-0.5">17 Scrips Staged</div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                      Analyze base valuations and sector exposure before prices swing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Tactical Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="font-bold text-slate-300">Venue:</span>
                  <span>RGPV Conference Hall • Campus Auditorium Display Live</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("scorecard")}
                    className="px-3 py-1.5 rounded-lg bg-[#141A26] hover:bg-[#1E2536] text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700/80"
                  >
                    Scoring Rulebook
                  </button>
                  <Link
                    to="/companies"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <span>Browse 17 Company Dossiers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Card 1: Total Portfolio Value */}
          <div className="p-5 rounded-xl bg-[#121720] border border-[#232B3B]">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Total Portfolio Value
              </span>
              <div className={`p-1 rounded ${portfolioStats.totalPnL >= 0 ? "text-[#10B981]" : "text-[#E10600]"}`}>
                {portfolioStats.totalPnL >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ₹{portfolioStats.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-[11px] font-bold font-mono px-1.5 py-0.5 rounded ${portfolioStats.totalPnL >= 0 ? "bg-[#10B981]/10 text-[#10B981]" : "bg-[#E10600]/10 text-[#E10600]"}`}>
                {portfolioStats.totalPnL >= 0 ? "+" : ""}{portfolioStats.pnlPercent}% (₹{Math.abs(portfolioStats.totalPnL).toLocaleString("en-IN")})
              </span>
              <span className="text-[10px] text-slate-500">vs ₹1,00,000 base</span>
            </div>
          </div>

          {/* Card 2: Available Fuel / Cash */}
          <div className="p-5 rounded-xl bg-[#121720] border border-[#232B3B]">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Available Cash
              </span>
              <div className="p-1 text-[#06B6D4]">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ₹{portfolioStats.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isPreRace ? "100% Mock Fuel Ready to Deploy" : "Ready for Pit Stop deployment"}
            </p>
          </div>

          {/* Card 3: Invested Stock Value */}
          <div className="p-5 rounded-xl bg-[#121720] border border-[#232B3B]">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Deployed in Stocks
              </span>
              <div className="p-1 text-[#EAB308]">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              ₹{portfolioStats.invested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              {isPreRace ? "0 / 17 Equities Allocated" : `Across ${currentHoldings.length} companies`}
            </p>
          </div>

          {/* Card 4: Competition Rank & Net Profit */}
          <div className="p-5 rounded-xl bg-[#121720] border border-[#EAB308]/40">
            <div className="flex justify-between items-start mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EAB308]">
                Competition Rank
              </span>
              <div className="p-1 text-[#EAB308]">
                <Trophy className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-[#EAB308] font-mono">
              {teamRank}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] mt-2 font-mono">
              <span className={portfolioStats.totalPnL >= 0 ? "text-[#10B981] font-bold" : "text-[#E10600] font-bold"}>
                {portfolioStats.totalPnL >= 0 ? "+" : ""}₹{portfolioStats.totalPnL.toLocaleString("en-IN")} Profit
              </span>
            </div>
          </div>
        </div>

        {/* Sector Telemetry Allocation Gauges */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#121720] border border-[#232B3B]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#E10600]" />
              <h2 className="text-xs font-black uppercase tracking-widest text-slate-300">
                Sector Diversification
              </h2>
            </div>
            <span className="text-xs font-bold text-[#06B6D4]">
              {scoreData.uniqueSectors || 0} of 5 Sectors Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {[
              { name: "Powertrain & EV", key: "Powertrain & Electric Vehicles", color: "#E10600" },
              { name: "Aerodynamics", key: "Aerodynamics & Advanced Materials", color: "#10B981" },
              { name: "Telemetry & AI", key: "Telemetry, AI & Autonomous Tech", color: "#06B6D4" },
              { name: "Sustainable Fuels", key: "Sustainable Fuels & Energy", color: "#EAB308" },
              { name: "Logistics", key: "Logistics & Precision Engineering", color: "#A855F7" }
            ].map((sec) => {
              const secVal = portfolioStats.sectorBreakdown[sec.key] || 0;
              const pct = portfolioStats.totalValue > 0 ? Math.round((secVal / portfolioStats.totalValue) * 100) : 0;
              const stockCount = stocks.filter((s) => s.sector === sec.key).length;

              return (
                <div key={sec.name} className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-[10px] sm:text-[11px] font-bold text-slate-300 mb-1">
                      <span className="truncate">{sec.name}</span>
                      <span className="font-mono text-xs font-bold" style={{ color: sec.color }}>{pct}%</span>
                    </div>
                    <div className="h-1 rounded bg-[#161B24] overflow-hidden">
                      <div
                        className="h-full transition-all duration-300 rounded"
                        style={{ width: `${pct}%`, backgroundColor: sec.color }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-slate-400 font-mono mt-1.5 pt-1 border-t border-slate-800/60">
                    <span>{secVal > 0 ? `₹${secVal.toLocaleString("en-IN")}` : "₹0"}</span>
                    <span className="text-slate-500 font-sans">{stockCount} Scrips</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sleek Underline Tabs */}
        <div className="bg-[#121720] rounded-xl border border-[#232B3B] overflow-hidden shadow-lg">
          {/* Tab Navigation */}
          <div className="border-b border-slate-800/90 px-3.5 sm:px-6 pt-1 flex items-center justify-between gap-2 sm:gap-6 bg-[#0B0F17]">
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-2 sm:gap-8">
              <button
                type="button"
                onClick={() => setActiveTab("holdings")}
                className={`pb-3 pt-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-1 sm:gap-1.5 shrink-0 ${activeTab === "holdings" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <span>Holdings</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "holdings"
                  ? "bg-[#E10600]/20 text-[#FF8080] border border-[#E10600]/40"
                  : "bg-slate-800 text-slate-400"
                  }`}>
                  {currentHoldings.length}
                </span>
                {activeTab === "holdings" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E10600] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("telemetry")}
                className={`pb-3 pt-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-1 sm:gap-1.5 shrink-0 ${activeTab === "telemetry" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <span>Chart</span>
                {activeTab === "telemetry" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06B6D4] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`pb-3 pt-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-1 sm:gap-1.5 shrink-0 ${activeTab === "orders" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <span>Orders</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${activeTab === "orders"
                  ? "bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40"
                  : "bg-slate-800 text-slate-400"
                  }`}>
                  {orders.length}
                </span>
                {activeTab === "orders" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EAB308] rounded-full" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("scorecard")}
                className={`pb-3 pt-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-1 sm:gap-1.5 shrink-0 ${activeTab === "scorecard" ? "text-white" : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <span className="sm:hidden">Rules</span>
                <span className="hidden sm:inline">Competition Rules</span>
                {activeTab === "scorecard" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
                )}
              </button>
            </div>

            {/* Right-aligned Context Action: Desktop Only */}
            {isLive ? (
              <Link
                to="/trade"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Trade</span>
              </Link>
            ) : isPreRace ? (
              <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-400 shrink-0">
                <Lock className="w-3 h-3 text-[#EAB308]" />
                <span>Pre-Market Standby</span>
              </div>
            ) : null}
          </div>

          {/* Tab 1: Holdings Table / Pre-Market Staging Grid */}
          {activeTab === "holdings" && (
            <div className="p-3 sm:p-6 w-full">
              {portfolioStats.holdingRows.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-162.5 text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#232B3B] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="pb-2.5">Company</th>
                        <th className="pb-2.5">Sector</th>
                        <th className="pb-2.5 text-right">Shares</th>
                        <th className="pb-2.5 text-right">Avg Price</th>
                        <th className="pb-2.5 text-right">Current</th>
                        <th className="pb-2.5 text-right">Market Value</th>
                        <th className="pb-2.5 text-right">P&L</th>
                        <th className="pb-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1A202C]">
                      {portfolioStats.holdingRows.map((row) => (
                        <tr key={row.ticker} className="hover:bg-[#161B24] transition-colors">
                          <td className="py-3">
                            <div className="font-bold text-white">{row.stockName}</div>
                            <div className="text-[10px] font-mono text-slate-500">{row.ticker}</div>
                          </td>
                          <td className="py-3 text-slate-400">{row.sector}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">{row.shares}</td>
                          <td className="py-3 text-right font-mono text-slate-300">₹{(row.avgBuyPrice || row.avgPrice || 0).toFixed(2)}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">₹{row.currentPrice.toFixed(2)}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">₹{row.currentValue.toLocaleString("en-IN")}</td>
                          <td className="py-3 text-right font-mono font-bold">
                            <span className={row.pnl >= 0 ? "text-[#10B981]" : "text-[#E10600]"}>
                              {row.pnl >= 0 ? "+" : ""}₹{row.pnl.toLocaleString("en-IN")} ({row.pnlPct}%)
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            {isLive ? (
                              <Link
                                to={`/trade?ticker=${row.ticker}`}
                                className="px-2.5 py-1 rounded bg-[#1A202C] hover:bg-[#E10600] text-slate-300 hover:text-white font-bold text-[10px] uppercase tracking-wider transition-colors border border-[#2A3447]"
                              >
                                Trade
                              </Link>
                            ) : (
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-mono">
                                Locked
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : isPreRace ? (
                /* Pre-Race Equities Staging Preview */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                        Pre-Market Equities Watchlist (17 Companies)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Base prices are staged. Instant market orders will execute when Green Flag drops.
                      </p>
                    </div>
                    <Link
                      to="/companies"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
                    >
                      <span>Full Dossiers</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-3">
                    {stocks.slice(0, 9).map((stock) => (
                      <div
                        key={stock.ticker}
                        className="p-3 rounded-xl bg-[#0A0E17] border border-slate-800/90 hover:border-slate-700 transition-colors flex items-center justify-between gap-2.5"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-white">
                              {stock.ticker}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#141A26] text-slate-300 border border-slate-800">
                              {stock.sector?.split(" ")[0] || "Equities"}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-300 truncate mt-0.5">
                            {stock.name}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-xs text-[#10B981]">
                            ₹{stock.currentPrice.toFixed(2)}
                          </div>
                          <div className="text-[9px] font-mono text-slate-500">
                            Base: ₹{stock.openingPrice.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#090D15] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-400 text-[11px] leading-relaxed">
                      Showing 9 of {stocks.length} tradeable companies. Explore all technical dossiers and price caps in the Company Directory.
                    </div>
                    <Link
                      to="/companies"
                      className="inline-flex items-center gap-1 text-[#06B6D4] hover:text-[#22D3EE] font-bold text-xs shrink-0"
                    >
                      <span>View All {stocks.length} Companies</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Empty State during Live Race */
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-slate-400 mb-1">No shares in your portfolio yet.</p>
                  <p className="text-xs text-slate-500 mb-4">
                    Deploy your ₹1,00,000 capital by buying stocks from the grid.
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Link
                      to="/trade"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white font-bold text-xs uppercase tracking-wider transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Open Trading Screen</span>
                    </Link>
                    <Link
                      to="/companies"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#161F2E] hover:bg-[#1E293B] text-slate-200 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700/80"
                    >
                      <span>Browse Companies</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Valuation Telemetry Chart */}
          {activeTab === "telemetry" && (
            <div className="p-4 sm:p-6 space-y-3">
              <PortfolioPerformanceChart
                team={currentTeam}
                portfolioStats={portfolioStats}
                raceState={raceState}
                height={280}
              />
              {isPreRace && (
                <div className="p-3 rounded-lg bg-[#0A0D12] border border-slate-800 text-[11px] text-slate-400">
                  Telemetry Flatline: Performance history will chart live price swings once Round 1 begins.
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Pit Stop Orders Ledger */}
          {activeTab === "orders" && (
            <div className="p-3 sm:p-6 overflow-x-auto w-full">
              {orders.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold space-y-1">
                  <div>No orders executed yet in this session.</div>
                  <div className="text-slate-500 text-[11px] font-normal">
                    {isPreRace
                      ? "Orders will execute instantaneously at live market prices once the Green Flag is active."
                      : "Click 'New Trade' to submit your first market order."}
                  </div>
                </div>
              ) : (
                <table className="w-full min-w-162.5 text-left text-xs font-sans">
                  <thead>
                    <tr className="border-b border-[#232B3B] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="pb-2.5">Type</th>
                      <th className="pb-2.5">Stock</th>
                      <th className="pb-2.5 text-right">Shares</th>
                      <th className="pb-2.5 text-right">Price</th>
                      <th className="pb-2.5 text-right">Total</th>
                      <th className="pb-2.5">Driver</th>
                      <th className="pb-2.5 text-right">Lap</th>
                      <th className="pb-2.5 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A202C]">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-[#161B24] transition-colors">
                        <td className="py-2.5">
                          <span className={`px-1.5 py-0.5 rounded font-black text-[10px] uppercase ${o.type === "BUY" ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#E10600]/15 text-[#E10600]"
                            }`}>
                            {o.type}
                          </span>
                        </td>
                        <td className="py-2.5 font-bold text-white">{o.ticker} {o.stockName ? `- ${o.stockName}` : ""}</td>
                        <td className="py-2.5 text-right font-mono text-white">{o.shares}</td>
                        <td className="py-2.5 text-right font-mono text-slate-300">₹{o.price.toFixed(2)}</td>
                        <td className="py-2.5 text-right font-mono font-bold text-white">₹{o.totalAmount.toLocaleString("en-IN")}</td>
                        <td className="py-2.5 text-slate-400">{o.executedBy}</td>
                        <td className="py-2.5 text-right font-mono text-[#EAB308]">Lap {o.lap}</td>
                        <td className="py-2.5 text-right text-slate-500 font-mono text-[10px]">
                          {new Date(o.timestamp).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Tab 4: Competition Rules & Profit Breakdown */}
          {activeTab === "scorecard" && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#232B3B]">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Ranked by Net Profit</div>
                  <div className="text-xl font-black text-[#10B981] font-mono">
                    {portfolioStats.totalPnL >= 0 ? "+" : ""}₹{portfolioStats.totalPnL.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Leaderboard rankings are determined strictly by net profit vs initial ₹1,00,000 capital.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#232B3B]">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Current Standing</div>
                  <div className="text-xl font-black text-[#EAB308] font-mono">
                    {teamRank}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Your real-time rank among all registered teams on the live grid.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#232B3B]">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Portfolio Return</div>
                  <div className="text-xl font-black text-[#06B6D4] font-mono">
                    {portfolioStats.totalPnL >= 0 ? "+" : ""}{portfolioStats.pnlPercent}%
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Overall percentage return on total capital across cash and stock holdings.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
