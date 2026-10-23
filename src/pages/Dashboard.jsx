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
  Sparkles,
  TrendingUp,
  TrendingDown,
  Search,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  ExternalLink,
  Copy,
  Check,
  Zap,
  Percent,
  SlidersHorizontal,
  Wallet,
  Newspaper
} from "lucide-react";
import CirculatingBanner from "../components/CirculatingBanner";
import PortfolioPerformanceChart from "../components/PortfolioPerformanceChart";
import MiniSparklineCanvas from "../components/MiniSparklineCanvas";
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

const SECTOR_CONFIGS = [
  { name: "Powertrain & EV", key: "Powertrain & Electric Vehicles", color: "#E10600", bgGlow: "rgba(225, 6, 0, 0.15)" },
  { name: "Aerodynamics", key: "Aerodynamics & Advanced Materials", color: "#10B981", bgGlow: "rgba(16, 185, 129, 0.15)" },
  { name: "Telemetry & AI", key: "Telemetry, AI & Autonomous Tech", color: "#06B6D4", bgGlow: "rgba(6, 182, 212, 0.15)" },
  { name: "Sustainable Fuels", key: "Sustainable Fuels & Energy", color: "#EAB308", bgGlow: "rgba(234, 179, 8, 0.15)" },
  { name: "Logistics", key: "Logistics & Precision Engineering", color: "#A855F7", bgGlow: "rgba(168, 85, 247, 0.15)" }
];

/**
 * @file Dashboard.jsx
 * @description Driver Cockpit & Financial Telemetry Console for Imprenditore 5.0.
 * Premium Motorsport Telemetry UI featuring:
 * 1. Cockpit HUD Header with synchronized flag status, race clocks, and rapid navigation
 * 2. Dynamic Race Status Banners (Staging Warmup countdown, Live Lap Radar, and Direct Pit Stop Actions)
 * 3. 4 High-Precision Telemetry KPI Cards with baseline capital health indicators
 * 4. F1 Sector Telemetry Allocation Bars with live 30% Strategy Pillar qualification
 * 5. Interactive Tabbed Command Center:
 *    - Holdings Table with intraday sparklines, search, sector filters, and direct trading CTAs
 *    - Valuation Telemetry Canvas with historical valuation curve and milestone watermarks
 *    - Pit Stop Orders Ledger with real-time audit stream and transaction totals
 *    - 50/30/20 Official Scorecard Breakdown with live qualifying checklists
 */
export default function Dashboard() {
  useSEO({
    title: "Driver Cockpit | Imprenditore 5.0 Telemetry",
    description: "Driver Cockpit and Financial Telemetry Console for Imprenditore 5.0. Monitor real-time net worth, cash fuel, sector allocation meters, valuation charts, and live order ledgers."
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
  const [holdingSearch, setHoldingSearch] = useState("");
  const [selectedSectorFilter, setSelectedSectorFilter] = useState("ALL");
  const [copiedCode, setCopiedCode] = useState(false);

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
        pnlPct,
        sparkline: stock?.sparkline || [h.avgBuyPrice, currentPrice],
        changePercent: stock?.changePercent || 0
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
    // Calculate active sectors dynamically from current holdings if not yet in leaderboard
    const activeSectorsCount = Object.keys(portfolioStats.sectorBreakdown).filter(
      (sec) => portfolioStats.sectorBreakdown[sec] > 0
    ).length;
    return {
      total: 0,
      portfolio: 0,
      strategy: activeSectorsCount >= 3 ? 30 : Math.round((activeSectorsCount / 3) * 30),
      execution: 0,
      uniqueSectors: activeSectorsCount
    };
  }, [currentTeam, leaderboard, portfolioStats.sectorBreakdown]);

  const handleCopyCode = () => {
    if (currentTeam?.teamCode) {
      navigator.clipboard.writeText(currentTeam.teamCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // Filtered holdings for the search & sector filter bar
  const filteredHoldings = useMemo(() => {
    return portfolioStats.holdingRows.filter((row) => {
      const matchesSearch =
        row.stockName.toLowerCase().includes(holdingSearch.toLowerCase()) ||
        row.ticker.toLowerCase().includes(holdingSearch.toLowerCase());
      const matchesSector =
        selectedSectorFilter === "ALL" || row.sector === selectedSectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [portfolioStats.holdingRows, holdingSearch, selectedSectorFilter]);

  // Filtered pre-market stocks
  const filteredPreMarketStocks = useMemo(() => {
    return stocks.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(holdingSearch.toLowerCase()) ||
        s.ticker.toLowerCase().includes(holdingSearch.toLowerCase());
      const matchesSector =
        selectedSectorFilter === "ALL" || s.sector === selectedSectorFilter;
      return matchesSearch && matchesSector;
    });
  }, [stocks, holdingSearch, selectedSectorFilter]);

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-[#070A0F] text-white flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
        {/* Ambient glow backgrounds */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-[#E10600]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-md w-full bg-[#101520]/90 backdrop-blur-xl p-6 sm:p-8 rounded-2xl border border-[#20293D] shadow-2xl text-center relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-[#E10600]/20 to-[#E10600]/5 text-[#E10600] flex items-center justify-center mx-auto mb-4 border border-[#E10600]/30 shadow-lg shadow-[#E10600]/10">
            <Gauge className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-white mb-2">
            Paddock Access Required
          </h2>
          <p className="text-xs text-slate-400 mb-6 leading-relaxed">
            Please register your racing team or enter your 4-digit PIN to establish telemetric connection with your cockpit.
          </p>
          <div className="space-y-3">
            <Link
              to="/login"
              className="block w-full py-3 rounded-xl bg-linear-to-r from-[#E10600] to-[#C50500] hover:brightness-110 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-[#E10600]/25"
            >
              Enter Paddock Login
            </Link>
            <Link
              to="/"
              className="block w-full py-3 rounded-xl bg-[#141A26] hover:bg-[#1C2436] text-slate-300 text-xs font-bold uppercase tracking-wider transition-colors border border-[#20293D]"
            >
              Return To Circuit Home
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

  const uniqueSectorsActive = Object.keys(portfolioStats.sectorBreakdown).filter(
    (sec) => portfolioStats.sectorBreakdown[sec] > 0
  ).length;

  return (
    <div className="min-h-screen bg-[#070A0F] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Top Glassmorphic Telemetry Navigation Strip */}
      <header className="sticky top-0 z-40 bg-[#0B0F17]/95 backdrop-blur-md border-b border-[#1A2233] px-3 sm:px-6 lg:px-8 py-2.5 transition-all">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Branding & Team Telemetry Badge */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group hover:opacity-95 transition-opacity">
              <div className="relative">
                <img
                  src="/logo_D.png"
                  alt="Imprenditore 5.0"
                  className="w-8 h-8 object-contain rounded-lg ring-1 ring-white/10 group-hover:ring-[#E10600]/50 transition-all"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#10B981] border-2 border-[#0B0F17]" />
              </div>
            </Link>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

            <div className="flex items-center gap-2">
              <div className="bg-[#121824] px-2.5 py-1 rounded-lg border border-[#20293D] flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden xs:inline">Team:</span>
                <span className="text-xs sm:text-sm font-black uppercase tracking-wide text-white truncate max-w-35 sm:max-w-50">
                  {currentTeam.teamName}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  title="Click to copy Team Code"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#1A2234] hover:bg-[#232E44] text-[#06B6D4] text-[10px] font-mono font-bold border border-[#2B3954] transition-all cursor-pointer"
                >
                  <span>{currentTeam.teamCode}</span>
                  {copiedCode ? <Check className="w-2.5 h-2.5 text-[#10B981]" /> : <Copy className="w-2.5 h-2.5 opacity-70" />}
                </button>
              </div>
            </div>
          </div>

          {/* Center: Live Lap Ticker & Race Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 bg-[#121824] px-3 py-1 rounded-lg border border-[#20293D]">
              <Clock className="w-3.5 h-3.5 text-[#06B6D4] animate-pulse" />
              <span className="font-mono font-black text-[#06B6D4] text-xs sm:text-sm tracking-wider">
                {formatTime(raceState.lapTimeRemaining)}
              </span>
              <span className="h-3 w-px bg-slate-700" />
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isLive
                      ? "bg-[#10B981] animate-ping"
                      : isPaused
                      ? "bg-[#F59E0B] animate-pulse"
                      : isConcluded
                      ? "bg-[#E10600]"
                      : "bg-[#EAB308]"
                  }`}
                />
                <span
                  className={`font-black uppercase tracking-wider text-[11px] ${
                    isLive
                      ? "text-[#10B981]"
                      : isPaused
                      ? "text-[#F59E0B]"
                      : isConcluded
                      ? "text-[#FF4D4D]"
                      : "text-[#EAB308]"
                  }`}
                >
                  {isLive
                    ? `ROUND ${raceState.currentLap}/7`
                    : isPaused
                    ? "SAFETY CAR"
                    : isConcluded
                    ? "CONCLUDED"
                    : "WARMUP"}
                </span>
              </div>
            </div>

            {/* Current Position Rank Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-linear-to-r from-[#EAB308]/15 to-[#EAB308]/5 border border-[#EAB308]/30">
              <Trophy className="w-3.5 h-3.5 text-[#EAB308]" />
              <span className="text-[10px] uppercase font-bold text-slate-400 hidden md:inline">Grid:</span>
              <span className="font-mono font-black text-xs sm:text-sm text-[#EAB308]">{currentRank}</span>
            </div>
          </div>

          {/* Right: Quick Cockpit Actions & Logout */}
          <div className="flex items-center gap-2">
            <Link
              to="/trade"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all shadow-sm ${
                isLive
                  ? "bg-linear-to-r from-[#E10600] to-[#C50500] hover:brightness-110 text-white shadow-[#E10600]/25 animate-pulse"
                  : "bg-[#1A2234] hover:bg-[#232E44] text-slate-200 border border-[#2B3954]"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-yellow-300" />
              <span>{isLive ? "Trade Now" : "Pit Lane"}</span>
            </Link>

            <Link
              to="/news"
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1A2234] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-[#20293D]"
            >
              <Newspaper className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>News</span>
            </Link>

            <Link
              to="/leaderboard"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#121824] hover:bg-[#1A2234] text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider transition-colors border border-[#20293D]"
            >
              <span>Leaderboard</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-[#121824] hover:bg-[#E10600]/20 text-slate-400 hover:text-[#FF4D4D] transition-colors border border-[#20293D]"
              title="Logout from Cockpit"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Cockpit Telemetry Canvas */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5 sm:space-y-6">
        {/* Real-time Circulating Live Update Banner */}
        <div className="rounded-xl overflow-hidden border border-[#20293D] shadow-md shadow-black/40">
          <CirculatingBanner />
        </div>

        {/* DYNAMIC RACE STATUS HUD HERO */}
        {isPreRace ? (
          /* Pre-Race Grid Warmup Hero */
          <section className="bg-linear-to-br from-[#101726] via-[#0E1522] to-[#090D14] rounded-2xl border border-[#20293D] p-4 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#06B6D4]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#E10600]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-5">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EAB308]/15 border border-[#EAB308]/30 text-[#EAB308] text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] animate-pulse" />
                      <span>Pre-Race Grid Warmup</span>
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 text-[10px] font-mono border border-slate-700">
                      <Lock className="w-3 h-3 text-[#EAB308]" />
                      <span>Pit Lane Staged</span>
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black uppercase tracking-wide text-white">
                    Paddock Staged: Awaiting Green Flag
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                    Race Control is performing grid telemetry checks. Your team is staged with ₹1,00,000 liquid capital. Review the 17 equities below and calibrate your 3-sector diversification strategy.
                  </p>
                </div>

                {/* Countdown Dial Box */}
                {countdown && !countdown.isPassed ? (
                  <div className="bg-[#090D14]/90 backdrop-blur-sm p-3.5 sm:p-4 rounded-xl border border-slate-800 shrink-0 shadow-lg">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#EAB308] font-bold mb-2 flex items-center justify-between gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Flag-Off Target</span>
                      </span>
                      <span className="text-slate-400 font-normal">{formattedEventDate}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-[#121824] px-2.5 py-1.5 rounded-lg border border-slate-800 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-white">
                          {countdown.days.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Days</div>
                      </div>
                      <div className="bg-[#121824] px-2.5 py-1.5 rounded-lg border border-slate-800 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-white">
                          {countdown.hours.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Hours</div>
                      </div>
                      <div className="bg-[#121824] px-2.5 py-1.5 rounded-lg border border-slate-800 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-[#EAB308]">
                          {countdown.minutes.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Mins</div>
                      </div>
                      <div className="bg-[#121824] px-2.5 py-1.5 rounded-lg border border-slate-800 min-w-13">
                        <div className="text-base sm:text-xl font-mono font-black text-[#06B6D4]">
                          {countdown.seconds.toString().padStart(2, "0")}
                        </div>
                        <div className="text-[9px] uppercase font-bold text-slate-400">Secs</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#090D14]/90 p-3.5 sm:p-4 rounded-xl border border-[#10B981]/40 text-center shrink-0">
                    <div className="text-[10px] font-mono text-slate-400 uppercase font-bold">Grid Standby</div>
                    <div className="text-sm font-black text-[#10B981] mt-1 flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Flag-Off Imminent</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Awaiting Race Director Command
                    </div>
                  </div>
                )}
              </div>

              {/* 3 Pre-Race Strategy Directives */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-[#090D15] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#10B981]/15 text-[#10B981] flex items-center justify-center shrink-0 border border-[#10B981]/30">
                    <Flame className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Mock Fuel Ready</div>
                    <div className="text-base font-black font-mono text-white mt-0.5">₹1,00,000.00</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      100% available liquidity. Zero market slippage prior to flag-off.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#06B6D4]/20 text-[#06B6D4] flex items-center justify-center shrink-0 border border-[#06B6D4]/40">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-300 font-bold">30% Strategy Goal</div>
                    <div className="text-base font-black font-mono text-[#06B6D4] mt-0.5">Min 3 Sectors</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Hold positions across at least 3 distinct sectors to unlock 30/30 pts.
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#090D15] border border-slate-800/90 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[#EAB308]/15 text-[#EAB308] flex items-center justify-center shrink-0 border border-[#EAB308]/30">
                    <Layers className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">Paddock Intelligence</div>
                    <div className="text-base font-black font-mono text-[#EAB308] mt-0.5">17 Scrips Staged</div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      Evaluate price swings, volatility, and historical telemetry data.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tactical Quick Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="text-xs text-slate-400 flex items-center gap-1.5">
                  <span className="font-bold text-slate-300">Venue:</span>
                  <span>RGPV Conference Hall • Auditorium Telemetry Screen Active</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("scorecard")}
                    className="px-3 py-1.5 rounded-lg bg-[#141A26] hover:bg-[#1E2536] text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-slate-700/80 cursor-pointer"
                  >
                    Scoring Rulebook
                  </button>
                  <Link
                    to="/companies"
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-linear-to-r from-[#E10600] to-[#C50500] hover:brightness-110 text-white text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#E10600]/20"
                  >
                    <span>Browse 17 Company Dossiers</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* Live Lap Telemetry Banner (Green Flag / Safety Car / Concluded) */
          <section className="bg-linear-to-r from-[#101726] via-[#0E1522] to-[#121824] rounded-2xl border border-[#20293D] p-4 sm:p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
                  isLive
                    ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30"
                    : isPaused
                    ? "bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30"
                    : "bg-[#E10600]/15 text-[#E10600] border-[#E10600]/30"
                }`}
              >
                <Activity className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                    {isLive ? "Live Circuit Active" : isPaused ? "Caution Flag" : "Session Finalized"}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                      isLive
                        ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                        : isPaused
                        ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                        : "bg-red-900/40 text-red-400 border border-red-700/50"
                    }`}
                  >
                    Round {raceState.currentLap} of 7
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-white mt-0.5 uppercase tracking-wide">
                  {isLive
                    ? "Market Floor Trading Live: Execute Orders via Pit Stop"
                    : isPaused
                    ? "Safety Car on Track: Reduced Volatility Period"
                    : "Race Concluded: Final Leaderboard Calculation"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/trade"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-linear-to-r from-[#E10600] to-[#C50500] hover:brightness-110 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#E10600]/25"
              >
                <Zap className="w-4 h-4 text-yellow-300" />
                <span>Execute Pit Trade</span>
              </Link>
              <Link
                to="/companies"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#141A26] hover:bg-[#1C2436] text-slate-200 text-xs font-bold uppercase tracking-wider transition-colors border border-[#20293D]"
              >
                <span>Stock Dossiers</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        )}

        {/* 4 PRIMARY TELEMETRY KPI CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
          {/* Card 1: Total Portfolio Valuation */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#131926] to-[#0D121D] border border-[#20293D] hover:border-slate-600 transition-all duration-300 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Wallet className="w-3.5 h-3.5 text-slate-400" />
                <span>Net Portfolio Value</span>
              </span>
              <div
                className={`p-1.5 rounded-lg ${
                  portfolioStats.totalPnL >= 0
                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                    : "bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30"
                }`}
              >
                {portfolioStats.totalPnL >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ₹{portfolioStats.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>

            <div className="flex items-center gap-2 mt-2.5">
              <span
                className={`text-[11px] font-bold font-mono px-2 py-0.5 rounded-md ${
                  portfolioStats.totalPnL >= 0
                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                    : "bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30"
                }`}
              >
                {portfolioStats.totalPnL >= 0 ? "+" : ""}
                {portfolioStats.pnlPercent}% (₹{Math.abs(portfolioStats.totalPnL).toLocaleString("en-IN")})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">vs ₹1,00,000 base</span>
            </div>

            {/* Baseline comparison indicator */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Capital Health:</span>
              <span className={portfolioStats.totalPnL >= 0 ? "text-[#10B981] font-bold" : "text-[#E10600] font-bold"}>
                {portfolioStats.totalPnL >= 0 ? "Surplus Buffer" : "Drawdown Warning"}
              </span>
            </div>
          </div>

          {/* Card 2: Cash Fuel & Liquidity */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#131926] to-[#0D121D] border border-[#20293D] hover:border-cyan-500/40 transition-all duration-300 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Available Cash Fuel</span>
              </span>
              <div className="p-1.5 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                <Percent className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ₹{portfolioStats.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>

            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Liquidity Ratio</span>
                <span className="font-bold text-[#06B6D4]">
                  {portfolioStats.totalValue > 0
                    ? Math.round((portfolioStats.cash / portfolioStats.totalValue) * 100)
                    : 100}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#06B6D4] rounded-full transition-all duration-500"
                  style={{
                    width: `${
                      portfolioStats.totalValue > 0
                        ? Math.min(100, Math.round((portfolioStats.cash / portfolioStats.totalValue) * 100))
                        : 100
                    }%`
                  }}
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2.5 truncate">
              {isPreRace ? "100% Mock Fuel Ready to Deploy" : "Ready for Instant Pit Deployments"}
            </p>
          </div>

          {/* Card 3: Deployed in Equities */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#131926] to-[#0D121D] border border-[#20293D] hover:border-yellow-500/40 transition-all duration-300 shadow-lg relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>Deployed in Equities</span>
              </span>
              <div className="p-1.5 rounded-lg bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              ₹{portfolioStats.invested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>

            <div className="mt-2.5">
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
                <span>Active Holdings</span>
                <span className="font-bold text-[#EAB308]">
                  {currentHoldings.length} / 17 Scrips
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-[#EAB308] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (currentHoldings.length / 17) * 100)}%`
                  }}
                />
              </div>
            </div>

            <p className="text-[10px] text-slate-500 mt-2.5 truncate">
              {isPreRace ? "No shares allocated yet" : `Active across ${currentHoldings.length} companies`}
            </p>
          </div>

          {/* Card 4: Competition Rank & P&L */}
          <div className="p-5 rounded-2xl bg-linear-to-b from-[#181E2E] to-[#0E1420] border border-[#EAB308]/50 hover:border-[#EAB308] transition-all duration-300 shadow-lg shadow-[#EAB308]/5 relative overflow-hidden group">
            <div className="flex justify-between items-start mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EAB308] flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5" />
                <span>Competition Rank</span>
              </span>
              <Link
                to="/leaderboard"
                className="text-[10px] text-[#EAB308] hover:underline font-mono uppercase tracking-wider flex items-center gap-0.5"
              >
                <span>Grid</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>

            <div className="text-2xl sm:text-3xl font-black text-[#EAB308] font-mono tracking-tight flex items-baseline gap-2">
              <span>{currentRank}</span>
              <span className="text-xs text-slate-400 font-sans font-normal">on live grid</span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] mt-2 font-mono">
              <span
                className={`font-bold px-2 py-0.5 rounded-md ${
                  portfolioStats.totalPnL >= 0
                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                    : "bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30"
                }`}
              >
                {portfolioStats.totalPnL >= 0 ? "+" : ""}₹{portfolioStats.totalPnL.toLocaleString("en-IN")} Profit
              </span>
            </div>

            <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Scoring Weight:</span>
              <span className="text-slate-300 font-bold">50% Net Worth + 30% Strategy</span>
            </div>
          </div>
        </div>

        {/* SECTOR TELEMETRY ALLOCATION GAUGES */}
        <div className="p-4 sm:p-5 rounded-2xl bg-linear-to-b from-[#121824] to-[#0A0E15] border border-[#20293D] shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#E10600]/15 text-[#E10600] flex items-center justify-center border border-[#E10600]/30">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-black uppercase tracking-wider text-slate-200">
                  Sector Telemetry Diversification
                </h2>
                <p className="text-[10px] text-slate-400">
                  Strategic diversification pillar: Allocate across 3 or more sectors to qualify for full 30/30 points.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                  uniqueSectorsActive >= 3
                    ? "bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40"
                    : "bg-[#EAB308]/15 text-[#EAB308] border-[#EAB308]/40"
                }`}
              >
                {uniqueSectorsActive >= 3 ? (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5" />
                )}
                <span>
                  {uniqueSectorsActive} of 5 Sectors Active
                  {uniqueSectorsActive >= 3 ? " (Qualified)" : " (Min 3 Needed)"}
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {SECTOR_CONFIGS.map((sec) => {
              const secVal = portfolioStats.sectorBreakdown[sec.key] || 0;
              const pct = portfolioStats.totalValue > 0 ? Math.round((secVal / portfolioStats.totalValue) * 100) : 0;
              const stockCount = stocks.filter((s) => s.sector === sec.key).length;
              const heldCount = portfolioStats.holdingRows.filter((h) => h.sector === sec.key).length;
              const isSelected = selectedSectorFilter === sec.key;

              return (
                <button
                  type="button"
                  key={sec.name}
                  onClick={() => setSelectedSectorFilter(isSelected ? "ALL" : sec.key)}
                  className={`p-3 rounded-xl bg-[#090D14] border transition-all text-left flex flex-col justify-between group cursor-pointer hover:border-slate-500 ${
                    isSelected
                      ? "ring-2 ring-[#06B6D4] border-[#06B6D4]"
                      : heldCount > 0
                      ? "border-slate-700"
                      : "border-slate-800/80 opacity-80"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center text-[11px] font-bold text-slate-300 mb-1.5">
                      <span className="truncate flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: sec.color }} />
                        <span className="truncate">{sec.name}</span>
                      </span>
                      <span className="font-mono text-xs font-bold shrink-0 ml-1" style={{ color: sec.color }}>
                        {pct}%
                      </span>
                    </div>

                    <div className="h-1.5 rounded-full bg-[#161D2B] overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min(100, pct)}%`, backgroundColor: sec.color }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-2.5 pt-1.5 border-t border-slate-800/60">
                    <span className="font-bold text-slate-200">
                      {secVal > 0 ? `₹${secVal.toLocaleString("en-IN")}` : "₹0"}
                    </span>
                    <span className="text-slate-500 font-sans text-[9px]">
                      {heldCount > 0 ? `${heldCount} Held` : `${stockCount} Scrips`}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* TABBED COMMAND CENTER (Holdings, Chart, Orders, Rules) */}
        <div className="bg-[#101622] rounded-2xl border border-[#20293D] overflow-hidden shadow-xl">
          {/* Tab Navigation Strip */}
          <div className="border-b border-slate-800/90 px-3.5 sm:px-6 pt-2 flex flex-wrap items-center justify-between gap-3 bg-[#0A0E16]">
            <div className="flex items-center gap-2 sm:gap-6 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("holdings")}
                className={`pb-3 pt-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === "holdings" ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Holdings & Equities</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === "holdings"
                      ? "bg-[#E10600]/20 text-[#FF8080] border border-[#E10600]/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {currentHoldings.length}
                </span>
                {activeTab === "holdings" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E10600] rounded-full shadow-sm shadow-[#E10600]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("telemetry")}
                className={`pb-3 pt-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === "telemetry" ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Valuation Chart</span>
                {activeTab === "telemetry" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#06B6D4] rounded-full shadow-sm shadow-[#06B6D4]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("orders")}
                className={`pb-3 pt-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === "orders" ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Pit Stop Orders</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === "orders"
                      ? "bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {orders.length}
                </span>
                {activeTab === "orders" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#EAB308] rounded-full shadow-sm shadow-[#EAB308]" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("scorecard")}
                className={`pb-3 pt-2 text-xs sm:text-sm font-bold transition-all relative flex items-center gap-1.5 shrink-0 cursor-pointer ${
                  activeTab === "scorecard" ? "text-white" : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#10B981]" />
                <span>50/30/20 Scorecard</span>
                {activeTab === "scorecard" && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full shadow-sm shadow-[#10B981]" />
                )}
              </button>
            </div>

            {/* Right Action on Tab Bar */}
            <div className="flex items-center gap-2 pb-2 sm:pb-0">
              <Link
                to="/trade"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-sm shadow-[#E10600]/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Trade</span>
              </Link>
            </div>
          </div>

          {/* TAB 1: HOLDINGS & EQUITIES TABLE */}
          {activeTab === "holdings" && (
            <div className="p-3 sm:p-6 w-full space-y-4">
              {/* Search & Filter Toolbar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search scrip by name or ticker..."
                    value={holdingSearch}
                    onChange={(e) => setHoldingSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0A0D14] border border-slate-800 focus:border-[#06B6D4] text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
                    <SlidersHorizontal className="w-3 h-3" />
                    <span>Sector:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedSectorFilter("ALL")}
                    className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                      selectedSectorFilter === "ALL"
                        ? "bg-[#06B6D4] text-black"
                        : "bg-[#141A26] text-slate-400 hover:text-white border border-slate-800"
                    }`}
                  >
                    All
                  </button>
                  {SECTOR_CONFIGS.map((s) => (
                    <button
                      type="button"
                      key={s.key}
                      onClick={() => setSelectedSectorFilter(s.key)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase whitespace-nowrap transition-colors cursor-pointer ${
                        selectedSectorFilter === s.key
                          ? "bg-slate-200 text-black font-black"
                          : "bg-[#141A26] text-slate-400 hover:text-white border border-slate-800"
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Table of Active Portfolio Positions */}
              {portfolioStats.holdingRows.length > 0 ? (
                filteredHoldings.length > 0 ? (
                  <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                    <table className="w-full min-w-180 text-left text-xs font-sans">
                      <thead>
                        <tr className="bg-[#0A0E16] border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          <th className="py-3 px-3.5">Company & Ticker</th>
                          <th className="py-3 px-3">Sector</th>
                          <th className="py-3 px-3 text-center">Intraday Sparkline</th>
                          <th className="py-3 px-3 text-right">Shares</th>
                          <th className="py-3 px-3 text-right">Avg Cost</th>
                          <th className="py-3 px-3 text-right">Current Price</th>
                          <th className="py-3 px-3 text-right">Market Value</th>
                          <th className="py-3 px-3 text-right">Unrealized P&L</th>
                          <th className="py-3 px-3.5 text-center">Pit Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 bg-[#0E1420]/50">
                        {filteredHoldings.map((row) => (
                          <tr key={row.ticker} className="hover:bg-[#141C2B] transition-colors">
                            <td className="py-3 px-3.5">
                              <div className="font-bold text-white flex items-center gap-1.5">
                                <span>{row.stockName}</span>
                              </div>
                              <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded bg-slate-800 text-[10px] font-mono text-[#06B6D4] font-bold border border-slate-700">
                                {row.ticker}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-slate-300 text-[11px]">
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{
                                    backgroundColor:
                                      SECTOR_CONFIGS.find((s) => s.key === row.sector)?.color || "#06B6D4"
                                  }}
                                />
                                <span className="truncate max-w-36">{row.sector}</span>
                              </span>
                            </td>

                            <td className="py-3 px-3 text-center">
                              <div className="flex justify-center">
                                <MiniSparklineCanvas
                                  sparkline={row.sparkline}
                                  isPositive={row.pnl >= 0}
                                  width={85}
                                  height={26}
                                />
                              </div>
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                              {row.shares.toLocaleString("en-IN")}
                            </td>

                            <td className="py-3 px-3 text-right font-mono text-slate-300">
                              ₹{(row.avgBuyPrice || row.avgPrice || 0).toFixed(2)}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                              ₹{row.currentPrice.toFixed(2)}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-bold text-white">
                              ₹{row.currentValue.toLocaleString("en-IN")}
                            </td>

                            <td className="py-3 px-3 text-right font-mono font-bold">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                                  row.pnl >= 0
                                    ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                    : "bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30"
                                }`}
                              >
                                {row.pnl >= 0 ? "+" : ""}₹{row.pnl.toLocaleString("en-IN")} ({row.pnlPct}%)
                              </span>
                            </td>

                            <td className="py-3 px-3.5 text-center">
                              {isLive ? (
                                <Link
                                  to={`/trade?ticker=${row.ticker}`}
                                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-linear-to-r from-[#E10600] to-[#C50500] hover:brightness-110 text-white font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm"
                                >
                                  <span>Trade</span>
                                </Link>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-500 text-[10px] font-mono border border-slate-700">
                                  Standby
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {/* Summary Footer */}
                      <tfoot>
                        <tr className="bg-[#0A0D14] border-t-2 border-slate-700 text-xs font-mono font-bold text-slate-300">
                          <td colSpan={6} className="py-2.5 px-3.5 text-right uppercase tracking-wider text-[11px] text-slate-400">
                            Total Equity Valuation:
                          </td>
                          <td className="py-2.5 px-3 text-right text-white text-sm">
                            ₹{portfolioStats.invested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span className={portfolioStats.totalPnL >= 0 ? "text-[#10B981]" : "text-[#E10600]"}>
                              {portfolioStats.totalPnL >= 0 ? "+" : ""}₹{portfolioStats.totalPnL.toLocaleString("en-IN")}
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-[#090D14] rounded-xl border border-slate-800 text-slate-400 text-xs">
                    No holdings match your search filter "{holdingSearch}".
                  </div>
                )
              ) : isPreRace ? (
                /* Pre-Race Equities Staging Preview Grid */
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                    <div>
                      <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                        Pre-Market Equities Watchlist (17 Companies Staged)
                      </h3>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Opening base valuations staged. Market orders trigger immediately when the Green Flag drops.
                      </p>
                    </div>
                    <Link
                      to="/companies"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white font-bold text-xs uppercase tracking-wider transition-colors shrink-0"
                    >
                      <span>Full Technical Dossiers</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredPreMarketStocks.slice(0, 9).map((stock) => (
                      <div
                        key={stock.ticker}
                        className="p-3.5 rounded-xl bg-[#090D15] border border-slate-800 hover:border-slate-600 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-black text-xs text-white">
                              {stock.ticker}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase bg-[#141A26] text-slate-300 border border-slate-800 truncate">
                              {stock.sector?.split(" ")[0] || "Equities"}
                            </span>
                          </div>
                          <div className="text-xs font-semibold text-slate-300 truncate mt-1">
                            {stock.name}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                            Base: ₹{stock.openingPrice?.toFixed(2) || stock.currentPrice.toFixed(2)}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-mono font-black text-sm text-[#10B981]">
                            ₹{stock.currentPrice.toFixed(2)}
                          </div>
                          <div className="mt-1">
                            <MiniSparklineCanvas
                              sparkline={stock.sparkline || [stock.currentPrice, stock.currentPrice]}
                              isPositive={(stock.changePercent || 0) >= 0}
                              width={70}
                              height={22}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-[#090D15] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-slate-400 text-[11px] leading-relaxed">
                      Showing {Math.min(9, filteredPreMarketStocks.length)} of {filteredPreMarketStocks.length} equities. Analyze historical data, volatility metrics, and sector exposures before Flag-Off.
                    </div>
                    <Link
                      to="/companies"
                      className="inline-flex items-center gap-1 text-[#06B6D4] hover:text-[#22D3EE] font-bold text-xs shrink-0"
                    >
                      <span>Explore All 17 Company Dossiers</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ) : (
                /* Empty state during Live Race */
                <div className="text-center py-12 bg-[#090D14] rounded-2xl border border-slate-800 space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-[#E10600]/10 text-[#E10600] flex items-center justify-center mx-auto border border-[#E10600]/30">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">No shares in your portfolio yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      Deploy your ₹1,00,000 mock fuel across at least 3 sectors to start competing on the leaderboard.
                    </p>
                  </div>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <Link
                      to="/trade"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-linear-to-r from-[#E10600] to-[#C50500] hover:brightness-110 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#E10600]/25"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Open Trading Pit</span>
                    </Link>
                    <Link
                      to="/companies"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#141A26] hover:bg-[#1E2536] text-slate-300 font-bold text-xs uppercase tracking-wider transition-colors border border-slate-700/80"
                    >
                      <span>Browse Companies</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: VALUATION TELEMETRY CHART */}
          {activeTab === "telemetry" && (
            <div className="p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    Team Valuation Telemetry Timeline
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Real-time net worth valuation mapped against the ₹1,00,000 initial benchmark.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="bg-[#090D14] px-3 py-1 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Live Net Worth</span>
                    <span className="text-white font-black text-sm">
                      ₹{portfolioStats.totalValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="bg-[#090D14] px-3 py-1 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Net Return</span>
                    <span className={portfolioStats.totalPnL >= 0 ? "text-[#10B981] font-black text-sm" : "text-[#E10600] font-black text-sm"}>
                      {portfolioStats.totalPnL >= 0 ? "+" : ""}{portfolioStats.pnlPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-[#090D14] p-3 sm:p-4 border border-slate-800/90 shadow-inner">
                <PortfolioPerformanceChart
                  team={currentTeam}
                  portfolioStats={portfolioStats}
                  raceState={raceState}
                  height={300}
                />
              </div>

              {isPreRace && (
                <div className="p-3.5 rounded-xl bg-[#090D14] border border-[#06B6D4]/30 flex items-center gap-2.5 text-xs text-slate-300">
                  <Sparkles className="w-4 h-4 text-[#06B6D4] shrink-0" />
                  <span>Telemetry Flatline: Portfolio net worth swings will dynamically curve here once Round 1 begins.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PIT STOP ORDERS LEDGER */}
          {activeTab === "orders" && (
            <div className="p-3 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                    Pit Stop Execution Audit Stream
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Immutable order execution audit trail across all completed race laps.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-lg bg-[#090D14] text-[11px] font-mono text-slate-300 border border-slate-800">
                    Total Executions: <strong className="text-white">{orders.length}</strong>
                  </span>
                </div>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 bg-[#090D14] rounded-2xl border border-slate-800 text-slate-400 text-xs font-bold space-y-2">
                  <Clock className="w-8 h-8 text-slate-500 mx-auto" />
                  <div className="text-white">No orders executed yet in this session.</div>
                  <div className="text-slate-500 text-[11px] font-normal max-w-md mx-auto">
                    {isPreRace
                      ? "Orders will execute instantaneously at live market prices once the Green Flag is active."
                      : "Navigate to the Trading Screen to submit your first market order."}
                  </div>
                  {isLive && (
                    <div className="pt-2">
                      <Link
                        to="/trade"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Place First Order</span>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-800/80">
                  <table className="w-full min-w-162.5 text-left text-xs font-sans">
                    <thead>
                      <tr className="bg-[#0A0E16] border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        <th className="py-3 px-3.5">Type</th>
                        <th className="py-3 px-3">Stock & Description</th>
                        <th className="py-3 px-3 text-right">Shares</th>
                        <th className="py-3 px-3 text-right">Execution Price</th>
                        <th className="py-3 px-3 text-right">Total Transacted</th>
                        <th className="py-3 px-3">Executed By</th>
                        <th className="py-3 px-3 text-center">Lap</th>
                        <th className="py-3 px-3.5 text-right">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-[#0E1420]/50">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#141C2B] transition-colors">
                          <td className="py-3 px-3.5">
                            <span
                              className={`px-2 py-0.5 rounded font-black text-[10px] uppercase ${
                                o.type === "BUY"
                                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                                  : "bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30"
                              }`}
                            >
                              {o.type}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-white">{o.ticker}</div>
                            {o.stockName && <div className="text-[10px] text-slate-400">{o.stockName}</div>}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">{o.shares}</td>
                          <td className="py-3 px-3 text-right font-mono text-slate-300">₹{o.price.toFixed(2)}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-white">
                            ₹{o.totalAmount.toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">{o.executedBy}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[#EAB308] font-mono text-[10px] font-bold border border-slate-700">
                              Lap {o.lap}
                            </span>
                          </td>
                          <td className="py-3 px-3.5 text-right text-slate-400 font-mono text-[11px]">
                            {new Date(o.timestamp).toLocaleTimeString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: 50/30/20 OFFICIAL SCORECARD */}
          {activeTab === "scorecard" && (
            <div className="p-4 sm:p-6 space-y-5">
              <div className="pb-3 border-b border-slate-800">
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                  Official 50/30/20 Championship Scoring Engine
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Leaderboard standings are calculated by 3 performance pillars: Portfolio Returns, Sector Strategy, and Execution Discipline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Pillar 1: 50% Portfolio Performance */}
                <div className="p-4.5 rounded-2xl bg-[#090D14] border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#10B981] px-2 py-0.5 rounded bg-[#10B981]/10 border border-[#10B981]/30">
                      Pillar 1 • 50% Weight
                    </span>
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase mt-1">Portfolio Returns & Net Profit</h4>
                  <div className="text-2xl font-black font-mono text-[#10B981] mt-2">
                    {portfolioStats.totalPnL >= 0 ? "+" : ""}₹{portfolioStats.totalPnL.toLocaleString("en-IN")}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Evaluated against ₹1,00,000 initial capital. Net profit drives half of the final championship scorecard.
                  </p>
                </div>

                {/* Pillar 2: 30% Sector Diversification Strategy */}
                <div className="p-4.5 rounded-2xl bg-[#090D14] border border-[#06B6D4]/30 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#06B6D4] px-2 py-0.5 rounded bg-[#06B6D4]/10 border border-[#06B6D4]/30">
                      Pillar 2 • 30% Weight
                    </span>
                    <Layers className="w-4 h-4 text-[#06B6D4]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase mt-1">Sector Diversification</h4>
                  <div className="text-2xl font-black font-mono text-[#06B6D4] mt-2">
                    {uniqueSectorsActive} / 5 Sectors Active
                  </div>
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    {uniqueSectorsActive >= 3 ? (
                      <span className="text-[#10B981] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>30/30 Strategy Points Qualified</span>
                      </span>
                    ) : (
                      <span className="text-[#EAB308] font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Need {3 - uniqueSectorsActive} more sector(s) for 30 pts</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Teams holding equities across at least 3 distinct sectors unlock the full 30 strategic points.
                  </p>
                </div>

                {/* Pillar 3: 20% Pit Execution & Discipline */}
                <div className="p-4.5 rounded-2xl bg-[#090D14] border border-slate-800 relative overflow-hidden">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EAB308] px-2 py-0.5 rounded bg-[#EAB308]/10 border border-[#EAB308]/30">
                      Pillar 3 • 20% Weight
                    </span>
                    <Trophy className="w-4 h-4 text-[#EAB308]" />
                  </div>
                  <h4 className="text-sm font-black text-white uppercase mt-1">Execution & Order Flow</h4>
                  <div className="text-2xl font-black font-mono text-[#EAB308] mt-2">
                    {orders.length} Executions
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                    Measures trade timing, disciplined execution during caution periods, and liquidity management.
                  </p>
                </div>
              </div>

              {/* Live Rank Summary Strip */}
              <div className="p-4.5 rounded-2xl bg-linear-to-r from-[#141A26] to-[#0E1420] border border-[#EAB308]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EAB308]/15 text-[#EAB308] flex items-center justify-center shrink-0 border border-[#EAB308]/30">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-[#EAB308] font-bold">
                      Current Grid Standing
                    </div>
                    <div className="text-lg font-black text-white">
                      Ranked <span className="text-[#EAB308]">{currentRank}</span> overall on the live grid
                    </div>
                  </div>
                </div>

                <Link
                  to="/leaderboard"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#EAB308] hover:bg-[#D9A307] text-black font-black text-xs uppercase tracking-wider transition-all self-start sm:self-auto shadow-md"
                >
                  <span>View Full Championship Leaderboard</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
