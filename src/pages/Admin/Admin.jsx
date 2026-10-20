import React, { useState, useMemo, Fragment } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Flag,
  Zap,
  Flame,
  Users,
  LogOut,
  CheckCircle,
  KeyRound,
  AlertCircle,
  ArrowRight,
  Play,
  Pause,
  StopCircle,
  Clock,
  Trash2,
  Lock,
  Unlock,
  Sliders,
  DollarSign,
  Edit,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Layers,
  Building2,
  Database,
  Radio,
  Sparkles,
  Activity,
  FastForward,
  RotateCcw,
  SlidersHorizontal,
  Info,
  Trophy,
  ChevronDown,
  ChevronUp,
  PieChart,
  Briefcase
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import { useSEO } from "../../hooks/useSEO";

/**
 * @file Admin.jsx
 * @description Race Director Control Center & Operations Command for Imprenditore 5.0.
 * Empowers event coordinators to manage:
 * 1. Master Race Engine: Flag-Off, Safety Car pause, Checkered Flag conclusion
 * 2. Lap Clock & Durations: Lap staging (1-5) and custom duration presets (5-30 min)
 * 3. Pre-Event Access Gates: Team Registration Gate and Simulation Cockpit Lounge Gate
 * 4. Event Countdown Scheduler: Target date and time configuration for flagship event
 * 5. Default Team Starting Capital: Initial wallet credit for newly registered teams
 * 6. Live Track Alert Broadcaster: Sector price shocks (+25%, -11%) and 1-click breaking news
 * 7. Active Teams Grid: Live participant monitoring, cash adjustments, and disqualification
 * 8. Individual Stocks Operations: Edit stock prices, day range, and volatility
 * 9. Industry Sector Shock Controller: Hitting industries with macro rallies & supply crunches
 * 10. Canonical 15-Team Grid Manager: Seed 15 pre-decided motorsport teams, enforce 3 members per team, and clear leader session locks.
 * 11. Historical Market Engine (Twelve Data): 120-min authentic historical OHLC timeline & valid news ticker streams.
 *
 * @returns {JSX.Element} Cryptographically locked admin console or control dashboard
 */
export default function Admin() {
  useSEO({
    title: "Race Operations Command",
    description: "Race Director Control Center for Imprenditore 5.0. Orchestrate competition laps, manage access gates, broadcast sector shocks, and monitor team grids."
  });

  const navigate = useNavigate();
  const {
    isAdmin,
    hasEnvAdminKey,
    adminLogin,
    raceState,
    teams,
    stocks,
    startRace,
    pauseRace,
    endRace,
    setRaceTimer,
    stageLap,
    toggleRegistration,
    toggleSimulationEntry,
    adminSetDefaultStartingCapital,
    broadcastTrackEvent,
    adminUpdateStock,
    adminTriggerSectorShock,
    seedCanonical15Teams,
    adminUpdateTeamMembers,
    adminClearLeaderSession,
    adminUpdateTeam,
    adminUpdateTeamCash,
    adminDeleteTeam,
    adminLogout,
    resetGrid,
    historicalStatus,
    generateHistoricalData,
    startHistoricalSimulation,
    pauseHistoricalSimulation,
    stepHistoricalSimulation,
    resetHistoricalSimulation,
    updateHistoricalSettings,
    gridTeamsWithHoldings
  } = useSimulation();

  // Holdings & Portfolio Inspection State
  const [expandedTeamCode, setExpandedTeamCode] = useState(null);
  const [holdingFilterStock, setHoldingFilterStock] = useState("ALL");
  const [holdingSearchTerm, setHoldingSearchTerm] = useState("");

  // Login Gate State (for unauthenticated /admin visits)
  const [adminPasscode, setAdminPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  // Historical Engine State
  const [isGeneratingHistorical, setIsGeneratingHistorical] = useState(false);
  const [historicalNotice, setHistoricalNotice] = useState("");
  const [historicalError, setHistoricalError] = useState("");
  const [selectedSpeedSeconds, setSelectedSpeedSeconds] = useState(30);
  const [selectedVolMultiplier, setSelectedVolMultiplier] = useState(1.5);

  // Starting Capital Notification State
  const [capitalNotice, setCapitalNotice] = useState("");

  // Custom Timer Form State
  const [customMinutes, setCustomMinutes] = useState(15);
  const [timerSuccess, setTimerSuccess] = useState("");

  // News Broadcast Form State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDesc, setNewsDesc] = useState("");
  const [selectedSector, setSelectedSector] = useState("Electric Vehicles & Clean Energy");
  const [impactPercent, setImpactPercent] = useState(10);
  const [broadcastSuccess, setBroadcastSuccess] = useState("");

  // Edit Team Cash State
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [newCashAmount, setNewCashAmount] = useState("");

  // Edit Stock State
  const [editingStockTicker, setEditingStockTicker] = useState(null);
  const [newStockPrice, setNewStockPrice] = useState("");
  const [newStockVolatility, setNewStockVolatility] = useState("");
  const [stockNotice, setStockNotice] = useState("");

  // Edit Team Roster State
  const [editingRosterTeam, setEditingRosterTeam] = useState(null);
  const [editTeamName, setEditTeamName] = useState("");
  const [editLeaderName, setEditLeaderName] = useState("");
  const [editMember2, setEditMember2] = useState("");
  const [editMember3, setEditMember3] = useState("");
  const [editTeamPin, setEditTeamPin] = useState("");
  const [rosterNotice, setRosterNotice] = useState("");

  // Fast Lookup for Team Stock Holdings
  const holdingsMap = useMemo(() => {
    const map = new Map();
    if (Array.isArray(gridTeamsWithHoldings)) {
      for (const t of gridTeamsWithHoldings) {
        map.set(t.teamCode, t);
      }
    }
    return map;
  }, [gridTeamsWithHoldings]);

  const sectors = useMemo(() => {
    const list = Array.from(new Set((stocks || []).map((s) => s.sector).filter(Boolean)));
    return list.length > 0 ? list : [
      "Electric Vehicles & Clean Energy",
      "AI & Semiconductor Computing",
      "Technology & Consumer Devices",
      "Aerospace & Aviation",
      "Clean Energy & Hydrogen",
      "Global Logistics & Delivery",
      "Consumer Retail & Apparel",
      "Media & Entertainment",
      "Healthcare & Pharmaceuticals"
    ];
  }, [stocks]);

  // Real Market Story Presets
  const presets = [
    {
      title: "Clean Energy Tax Credits Approved",
      description: "Government incentives trigger widespread rally for electric vehicle and solar charging networks.",
      sector: "Electric Vehicles & Clean Energy",
      impact: 12
    },
    {
      title: "AI Enterprise Supercluster Deal",
      description: "Cloud hyperscalers sign massive orders for next-gen AI accelerator chips.",
      sector: "AI & Semiconductor Computing",
      impact: 15
    },
    {
      title: "Commercial Jetliner Fleet Order",
      description: "Major international airlines confirm multi-billion dollar agreements for commercial jetliners.",
      sector: "Aerospace & Aviation",
      impact: 14
    },
    {
      title: "Global Supply Chain Delays",
      description: "Temporary port congestions and freight bottlenecks slow package logistics hubs.",
      sector: "Global Logistics & Delivery",
      impact: -10
    },
    {
      title: "Streaming Platform Viewership Record",
      description: "Global entertainment subscriber numbers break previous quarterly records.",
      sector: "Media & Entertainment",
      impact: 11
    }
  ];

  const handleAdminGateSubmit = (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      adminLogin(adminPasscode);
      setAdminPasscode("");
    } catch (err) {
      setAuthError(err.message || "Invalid Admin Key.");
    }
  };

  const handleSetTimer = (e) => {
    e.preventDefault();
    const totalSecs = (parseInt(customMinutes) || 0) * 60;
    if (totalSecs < 60) return;
    setRaceTimer(totalSecs);
    setTimerSuccess(`Lap duration set to ${customMinutes} minutes!`);
    setTimeout(() => setTimerSuccess(""), 3000);
  };

  const handlePresetTimer = (mins) => {
    setCustomMinutes(mins);
    setRaceTimer(mins * 60);
    setTimerSuccess(`Lap duration set to ${mins} minutes!`);
    setTimeout(() => setTimerSuccess(""), 3000);
  };

  // Historical Market Handlers (Twelve Data Engine)
  const handleGenerateHistorical = async () => {
    try {
      setIsGeneratingHistorical(true);
      setHistoricalNotice("");
      setHistoricalError("");
      const res = await generateHistoricalData({
        totalMinutes: 120,
        volatilityMultiplier: Number(selectedVolMultiplier) || 1.5,
      });
      if (res && res.success) {
        setHistoricalNotice(res.message || "Successfully generated 120 minutes of authentic historical data from Twelve Data! Competition lap is unchanged.");
      } else {
        setHistoricalNotice("Historical market data generated and stored. Competition lap is unchanged.");
      }
    } catch (err) {
      console.error("Generate historical data error:", err);
      setHistoricalError(err?.message || "Failed to generate historical data");
    } finally {
      setIsGeneratingHistorical(false);
    }
  };

  const handleStartHistorical = async () => {
    try {
      setHistoricalError("");
      await startHistoricalSimulation(selectedSpeedSeconds);
      setHistoricalNotice(`Historical auto-play started! Streaming stock price ticks every ${selectedSpeedSeconds}s. Competition lap is unaffected.`);
      setTimeout(() => setHistoricalNotice(""), 4000);
    } catch (err) {
      setHistoricalError(err?.message || "Failed to start historical simulation");
    }
  };

  const handlePauseHistorical = async () => {
    try {
      await pauseHistoricalSimulation();
      setHistoricalNotice("Historical price stream paused. Current competition lap remains active.");
      setTimeout(() => setHistoricalNotice(""), 4000);
    } catch (err) {
      setHistoricalError(err?.message || "Failed to pause simulation");
    }
  };

  const handleStepHistorical = async (targetMinute) => {
    try {
      await stepHistoricalSimulation(targetMinute);
      setHistoricalNotice(`Advanced market prices to minute ${targetMinute} of 120. Competition lap is unchanged.`);
      setTimeout(() => setHistoricalNotice(""), 3000);
    } catch (err) {
      setHistoricalError(err?.message || "Failed to step simulation");
    }
  };

  const handleResetHistorical = async () => {
    if (!window.confirm("Reset historical stock prices back to Minute 0 baseline? (Your current competition lap will NOT be changed)")) return;
    try {
      await resetHistoricalSimulation();
      setHistoricalNotice("Stock prices reset to Minute 0 opening baseline. Competition lap remains unchanged.");
      setTimeout(() => setHistoricalNotice(""), 3000);
    } catch (err) {
      setHistoricalError(err?.message || "Failed to reset simulation");
    }
  };

  const handleBroadcastNewsItem = async (newsItem) => {
    try {
      await broadcastTrackEvent({
        title: newsItem.title,
        description: newsItem.description,
        type: newsItem.type,
        affectedSectors: newsItem.sector ? [newsItem.sector] : [],
        priceImpactPercent: newsItem.priceImpactPercent,
      });
      setHistoricalNotice(`Broadcasted: "${newsItem.title}"`);
      setTimeout(() => setHistoricalNotice(""), 4000);
    } catch (err) {
      setHistoricalError(err?.message || "Failed to broadcast news item");
    }
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsDesc.trim()) return;

    broadcastTrackEvent({
      title: newsTitle.trim(),
      description: newsDesc.trim(),
      type: impactPercent < 0 ? "YELLOW_FLAG" : "GREEN_FLAG",
      affectedSectors: [selectedSector],
      priceImpactPercent: Number(impactPercent)
    });

    setBroadcastSuccess("Track event broadcasted live across all participant screens!");
    setNewsTitle("");
    setNewsDesc("");
    setTimeout(() => setBroadcastSuccess(""), 3000);
  };

  const handleApplyPreset = (preset) => {
    broadcastTrackEvent({
      title: preset.title,
      description: preset.description,
      type: preset.impact < 0 ? "YELLOW_FLAG" : "GREEN_FLAG",
      affectedSectors: [preset.sector],
      priceImpactPercent: preset.impact
    });

    setBroadcastSuccess(`Broadcasted: ${preset.title}`);
    setTimeout(() => setBroadcastSuccess(""), 3000);
  };

  const handleSaveTeamCash = (teamId) => {
    const parsed = parseFloat(newCashAmount);
    if (isNaN(parsed) || parsed < 0) return;
    adminUpdateTeamCash(teamId, parsed);
    setEditingTeamId(null);
    setNewCashAmount("");
  };

  // Seed Canonical 15 Teams Grid
  const handleSeedTeams = async (overwrite = false) => {
    if (overwrite && !window.confirm("Are you sure you want to overwrite all existing teams, holdings, and orders with the 15 canonical teams?")) {
      return;
    }
    try {
      const res = await seedCanonical15Teams(overwrite);
      alert(res.seeded ? `Grid Ready: Initialized ${res.count} canonical motorsport teams!` : res.message);
    } catch (err) {
      alert(err.message || "Failed to initialize canonical teams.");
    }
  };

  // Save Direct Edit to Stock
  const handleSaveStock = async (ticker) => {
    const priceNum = parseFloat(newStockPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert("Please enter a valid positive stock price.");
      return;
    }
    const volNum = parseFloat(newStockVolatility);
    try {
      await adminUpdateStock({
        ticker,
        currentPrice: priceNum,
        volatility: !isNaN(volNum) && volNum > 0 ? volNum : undefined,
      });
      setStockNotice(`Successfully updated ${ticker} price to ₹${priceNum.toFixed(2)}.`);
      setEditingStockTicker(null);
      setNewStockPrice("");
      setNewStockVolatility("");
      setTimeout(() => setStockNotice(""), 3500);
    } catch (err) {
      alert(err.message || "Failed to update stock price.");
    }
  };

  // Quick Price Nudge (+5%, -5%, etc.)
  const handleNudgeStockPrice = async (stock, percent) => {
    const newPrice = Math.max(1, Math.round(stock.currentPrice * (1 + percent / 100) * 10) / 10);
    try {
      await adminUpdateStock({
        ticker: stock.ticker,
        currentPrice: newPrice,
      });
      setStockNotice(`Adjusted ${stock.ticker} by ${percent > 0 ? "+" : ""}${percent}% to ₹${newPrice.toFixed(2)}.`);
      setTimeout(() => setStockNotice(""), 3500);
    } catch (err) {
      alert(err.message || "Failed to adjust stock price.");
    }
  };

  // Industry Sector Shock Broadcaster
  const handleFireSectorShock = async (sectorName, percentChange, title, desc) => {
    try {
      await adminTriggerSectorShock({
        sector: sectorName,
        percentChange,
        newsTitle: title || `Macro Shock: ${sectorName}`,
        newsDescription: desc || `Sector-wide price adjustment of ${percentChange > 0 ? "+" : ""}${percentChange}% across all equities.`,
      });
      setBroadcastSuccess(`Sector Shock Broadcasted: ${sectorName} (${percentChange > 0 ? "+" : ""}${percentChange}%)`);
      setTimeout(() => setBroadcastSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to broadcast sector shock.");
    }
  };

  // Open Edit Roster Modal
  const handleOpenEditRoster = (team) => {
    setEditingRosterTeam(team);
    setEditTeamName(team.teamName || "");
    setEditTeamPin(team.teamPin || "");
    setEditLeaderName(team.leaderName || "");
    setEditMember2(team.member2 || (team.members && team.members[1]) || "");
    setEditMember3(team.member3 || (team.members && team.members[2]) || "");
    setRosterNotice("");
  };

  // Save Edit Roster
  const handleSaveRoster = async (e) => {
    e.preventDefault();
    if (!editingRosterTeam) return;
    try {
      await adminUpdateTeamMembers({
        teamId: editingRosterTeam._id || editingRosterTeam.id,
        teamName: editTeamName,
        teamPin: editTeamPin,
        leaderName: editLeaderName,
        member2: editMember2.trim() || undefined,
        member3: editMember3.trim() || undefined,
      });
      setRosterNotice(`Successfully updated team roster for ${editTeamName}!`);
      setTimeout(() => {
        setRosterNotice("");
        setEditingRosterTeam(null);
      }, 1500);
    } catch (err) {
      alert(err.message || "Failed to update team roster.");
    }
  };

  // Clear Leader Session Lock
  const handleClearSession = async (teamId, teamName) => {
    try {
      await adminClearLeaderSession(teamId);
      alert(`Cleared leader session lock for ${teamName}. Leader can now authenticate from any device.`);
    } catch (err) {
      alert(err.message || "Failed to clear leader session lock.");
    }
  };

  const handleLogout = () => {
    adminLogout();
    navigate("/");
  };

  const formatTime = (secs) => {
    const safeSecs = Math.max(0, Math.floor(secs || 0));
    const m = Math.floor(safeSecs / 60);
    const s = safeSecs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // IF NOT AUTHENTICATED: Show Confidential Passcode Gate
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-center items-center px-4 sm:px-6 py-10 font-sans">
        <div className="w-full max-w-md bg-[#121720] rounded-xl border border-[#232B3B] p-6 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/rgpv-logo.jpeg" alt="RGPV Bhopal" className="h-9 w-9 object-contain rounded-full bg-white p-0.5" />
            <img src="/logo.png" alt="E-Cell RGPV" className="h-9 object-contain" />
            <img src="/logo_D.png" alt="Imprenditore 5.0" className="h-9 object-contain" />
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-black uppercase italic tracking-wide text-white">
              Race Director Control
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Restricted organizer access. Enter your key to continue.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#161B24] border border-[#232B3B]">
              <span className={`w-2 h-2 rounded-full ${hasEnvAdminKey ? "bg-[#10B981]" : "bg-[#EAB308]"}`} />
              <span className={hasEnvAdminKey ? "text-[#10B981]" : "text-[#EAB308]"}>
                {hasEnvAdminKey ? "VITE_ADMIN_KEY Active" : "Default Grid Key Active"}
              </span>
            </div>
          </div>

          {authError && (
            <div className="mb-4 p-3 rounded-lg bg-[#E10600]/15 border border-[#E10600]/40 text-xs text-[#FF8080] flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#E10600]" />
                <span className="font-bold">{authError}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
                {hasEnvAdminKey
                  ? "Enter the exact value of VITE_ADMIN_KEY saved in your .env.local file (or the fallback key RACE_CONTROL_2026)."
                  : "VITE_ADMIN_KEY was not detected in this running session. Use the default key RACE_CONTROL_2026, or restart your Vite dev server to load new .env.local values."}
              </p>
            </div>
          )}

          <form onSubmit={handleAdminGateSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Organizer ADMIN_KEY
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter Secret Admin Key"
                value={adminPasscode}
                onChange={(e) => setAdminPasscode(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#EAB308] text-xs text-white placeholder:text-slate-600 outline-none font-mono tracking-wider"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-[#EAB308] hover:bg-[#CA8A04] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
            >
              <span>Authorize Control Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              to="/"
              className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-bold"
            >
              Return To Public Grid
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // IF AUTHENTICATED: Show Full Race Control Center
  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Race Control Top Header */}
      <header className="bg-[#121720] border-b border-[#232B3B] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="hover:opacity-90 transition-opacity">
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-9 h-9 object-contain rounded shrink-0"
            />
          </Link>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">
              E-Cell RGPV : Race Operations Command
            </div>
            <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <span>Race Director Control Center</span>
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to reset the event grid? This will wipe all test teams, reset orders, lock registration, and return to Lap 1 Warmup.")) {
                resetGrid();
              }
            }}
            className="px-3 py-1.5 rounded bg-[#161B24] hover:bg-[#E10600]/20 text-slate-400 hover:text-[#FF4D4D] text-xs font-bold border border-[#232B3B] transition-colors"
            title="Wipe demo data and reset grid"
          >
            Reset Event Grid
          </button>
          <Link
            to="/projector"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-1.5 rounded bg-gradient-to-r from-[#EAB308]/20 to-amber-600/20 hover:from-[#EAB308]/30 hover:to-amber-600/30 text-xs font-black uppercase text-[#EAB308] border border-[#EAB308]/50 transition-all flex items-center gap-1.5 shadow-xs"
            title="Open Auditorium Big-Screen Projector View in New Tab"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>📽️ Projector Screen</span>
          </Link>
          <button
            onClick={handleLogout}
            className="px-3.5 py-1.5 rounded bg-[#E10600] hover:bg-[#C50500] text-xs font-bold text-white transition-colors flex items-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock Admin</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Section 1: Access Controls & Starting Balance */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex items-center gap-2 border-b border-[#232B3B] pb-3">
            <Sliders className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-200">
              Access Controls &amp; Starting Balance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Gate 1: Team Registration Gate */}
            <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {raceState.isRegistrationOpen ? <Unlock className="w-4 h-4 text-[#10B981]" /> : <Lock className="w-4 h-4 text-[#E10600]" />}
                    <span>Team Registration</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    raceState.isRegistrationOpen ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#E10600]/20 text-[#FF8080]"
                  }`}>
                    {raceState.isRegistrationOpen ? "Open" : "Locked"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Allow players to claim and register their team on the sign-up page.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleRegistration(!raceState.isRegistrationOpen)}
                className={`w-full py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  raceState.isRegistrationOpen
                    ? "bg-[#E10600]/20 hover:bg-[#E10600] text-[#FF8080] hover:text-white border border-[#E10600]/40"
                    : "bg-[#10B981] hover:bg-[#059669] text-slate-950"
                }`}
              >
                {raceState.isRegistrationOpen ? "Lock Registration" : "Open Registration"}
              </button>
            </div>

            {/* Gate 2: Trading Access Gate */}
            <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {raceState.isSimulationEntryOpen ? <Unlock className="w-4 h-4 text-[#06B6D4]" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    <span>Trading Dashboard Access</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    raceState.isSimulationEntryOpen ? "bg-[#06B6D4]/20 text-[#06B6D4]" : "bg-slate-800 text-slate-400"
                  }`}>
                    {raceState.isSimulationEntryOpen ? "Unlocked" : "Locked"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Allow logged-in teams to enter their dashboard and trade stocks.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleSimulationEntry(!raceState.isSimulationEntryOpen)}
                className={`w-full py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  raceState.isSimulationEntryOpen
                    ? "bg-[#F59E0B]/20 hover:bg-[#F59E0B] text-[#F59E0B] hover:text-slate-950 border border-[#F59E0B]/40"
                    : "bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950"
                }`}
              >
                {raceState.isSimulationEntryOpen ? "Lock Dashboard" : "Unlock Dashboard"}
              </button>
            </div>

            {/* Starting Balance Configurator */}
            <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#10B981]" />
                    <span>Default Starting Balance</span>
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981]">
                    {capitalNotice || `₹${(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Default cash balance credited to new teams.
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                {[50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      adminSetDefaultStartingCapital(amt);
                      setCapitalNotice(`Set to ₹${amt.toLocaleString("en-IN")}`);
                      setTimeout(() => setCapitalNotice(""), 3000);
                    }}
                    className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                      (raceState.defaultStartingCapital || 100000) === amt
                        ? "bg-[#10B981] text-slate-950 border-[#10B981]"
                        : "bg-[#161B24] text-slate-300 hover:text-white border-[#232B3B]"
                    }`}
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Master Race Lifecycle & Manual Lap Flag-Off */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B3B] pb-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">
                Master Race Engine
              </span>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
                <span>Current State:</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${raceState.status === "GREEN_FLAG"
                    ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                    : raceState.status === "SAFETY_CAR"
                      ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                      : raceState.status === "CHECKERED_FLAG"
                        ? "bg-[#E10600]/20 text-[#FF4D4D] border border-[#E10600]/40"
                        : "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40"
                  }`}>
                  {raceState.status === "GREEN_FLAG"
                    ? `RUNNING • LAP ${raceState.currentLap}/5`
                    : raceState.status === "SAFETY_CAR"
                      ? "PAUSED • SAFETY CAR"
                      : raceState.status === "CHECKERED_FLAG"
                        ? "CONCLUDED • CHECKERED FLAG"
                        : raceState.currentLap === 1
                          ? "WARMUP • NOT STARTED"
                          : `WARMUP • LAP ${raceState.currentLap} STAGED`}
                </span>
              </h2>
            </div>

            {/* Live Lap Timer Display */}
            <div className="flex items-center gap-3 bg-[#0A0D12] p-3 rounded-lg border border-[#232B3B]">
              <Clock className="w-5 h-5 text-[#06B6D4]" />
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  {raceState.status === "GREEN_FLAG" ? "Active Lap Clock" : "Lap Clock (Paused)"}
                </div>
                <div className="text-xl font-black font-mono text-white">
                  {formatTime(raceState.lapTimeRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Master Action Trigger Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Start / Flag-Off */}
            <button
              onClick={() => startRace()}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${raceState.status === "GREEN_FLAG"
                  ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 cursor-default"
                  : "bg-[#10B981] hover:bg-[#059669] text-slate-950 shadow-sm"
                }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {raceState.status === "GREEN_FLAG"
                  ? `Lap ${raceState.currentLap} Live`
                  : raceState.status === "SAFETY_CAR"
                    ? "Resume Race (Green Flag)"
                    : raceState.currentLap === 1
                      ? "Flag-Off / Start Race"
                      : `Flag-Off / Start Lap ${raceState.currentLap}`}
              </span>
            </button>

            {/* Pause (Safety Car) */}
            <button
              onClick={() => pauseRace("Track Clearance & Safety Car Protocol")}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${raceState.status === "SAFETY_CAR"
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 cursor-default"
                  : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950"
                }`}
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Race (Safety Car)</span>
            </button>

            {/* End Race (Checkered Flag) */}
            <button
              onClick={() => {
                if (window.confirm("End the race now and lock final podium scores with the Checkered Flag?")) {
                  endRace();
                }
              }}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${raceState.status === "CHECKERED_FLAG"
                  ? "bg-[#E10600]/20 text-[#FF4D4D] border border-[#E10600]/50 cursor-default"
                  : "bg-[#E10600] hover:bg-[#C50500] text-white"
                }`}
            >
              <StopCircle className="w-4 h-4" />
              <span>Conclude Race (Checkered Flag)</span>
            </button>
          </div>

          {/* Stage Specific Lap (Does NOT auto-run until Flag-Off clicked) */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-[#E10600]" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-300">
                  Select & Stage Competition Lap (Timer stays paused in Warmup until Start is clicked)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Clicking stages lap in Warmup
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {[1, 2, 3, 4, 5].map((lap) => (
                <button
                  key={lap}
                  onClick={() =>
                    stageLap(
                      lap,
                      null,
                      lap === 1
                        ? "The race will start upon Race Director Flag-Off. Paddock warmup in progress."
                        : `Lap ${lap - 1} completed. Lap ${lap} staged in Warmup. Awaiting Flag-Off.`
                    )
                  }
                  className={`p-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors border text-center ${raceState.currentLap === lap
                      ? "bg-[#E10600] text-white border-[#E10600]"
                      : "bg-[#0A0D12] text-slate-400 hover:text-white border-[#232B3B]"
                    }`}
                >
                  <div className="text-sm font-mono mb-0.5">L{lap}</div>
                  <div>{lap === 1 ? "Stage Lap 1" : lap === 5 ? "Stage Lap 5" : `Stage Lap ${lap}`}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Lap Duration & Timer Setter */}
          {/* Lap Duration Configurator */}
          <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Lap Duration Configurator
                </span>
              </div>
              {timerSuccess && (
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {timerSuccess}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
              {[5, 10, 15, 20, 25, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handlePresetTimer(m)}
                  className={`px-3 py-1 rounded text-xs font-mono font-bold border transition-colors ${
                    customMinutes === m
                      ? "bg-[#06B6D4] text-slate-950 border-[#06B6D4]"
                      : "bg-[#161B24] hover:bg-[#1D232E] text-slate-300 border-[#232B3B]"
                  }`}
                >
                  {m} Min
                </button>
              ))}
            </div>

            <form onSubmit={handleSetTimer} className="flex items-center gap-2 pt-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white font-mono text-center outline-none"
                />
                <span className="text-xs text-slate-400 font-bold">minutes</span>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
              >
                Set Lap Duration
              </button>
            </form>
          </div>
        </section>

        {/* Section 2.5: Historical Market Engine (Twelve Data 120-Minute Stream) */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-5">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#232B3B] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#06B6D4]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4]">
                  Twelve Data Stock Feed
                </span>
                {historicalStatus?.session?.status === "RUNNING" && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 animate-pulse">
                    <Radio className="w-3 h-3" />
                    Auto-Play Active
                  </span>
                )}
              </div>
              <h2 className="text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2 mt-1">
                <span>Historical Stock Market Data (Twelve Data)</span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black uppercase tracking-wider ${
                  historicalStatus?.session?.status === "RUNNING"
                    ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                    : historicalStatus?.session?.status === "PAUSED"
                      ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                      : historicalStatus?.isLoaded
                        ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40"
                        : "bg-[#E10600]/20 text-[#FF4D4D] border border-[#E10600]/40"
                }`}>
                  {historicalStatus?.session?.status === "RUNNING"
                    ? `PLAYING • MINUTE ${(historicalStatus?.session?.currentMinuteIndex ?? 0) + 1} OF ${historicalStatus?.session?.totalMinutes || 120}`
                    : historicalStatus?.session?.status === "PAUSED"
                      ? "PAUSED"
                      : historicalStatus?.isLoaded
                        ? "120-MIN DATASET READY"
                        : "NO DATA GENERATED YET"}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1 max-w-3xl">
                Uses real historical stock data from Twelve Data. Generates 120 minutes of realistic market price movements and clear news updates. Changing or resetting this data updates stock prices without affecting your competition lap.
              </p>
            </div>

            {/* Status Telemetry Pill */}
            <div className="flex items-center gap-3 bg-[#0A0D12] p-3 rounded-lg border border-[#232B3B] shrink-0">
              <Activity className="w-5 h-5 text-[#10B981]" />
              <div>
                <div className="text-[10px] font-bold uppercase text-slate-400">
                  Market Timeline
                </div>
                <div className="text-sm font-black font-mono text-white">
                  Min {historicalStatus?.session?.currentMinuteIndex ?? 0} / {historicalStatus?.session?.totalMinutes || 120}
                  <span className="text-slate-400 text-xs ml-1 font-normal">
                    ({Math.round(((historicalStatus?.session?.currentMinuteIndex ?? 0) / (historicalStatus?.session?.totalMinutes || 120)) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Independent Lap Reassurance Banner */}
          <div className="p-3 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/30 flex items-start gap-2.5 text-xs text-slate-300">
            <Info className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
            <div>
              <strong className="text-white">Independent Stock Data Feed:</strong> Changing, stepping, or resetting this historical market dataset updates stock prices across the market, but will <span className="text-[#10B981] font-bold">never restart or alter your current competition lap</span> (Lap {raceState?.currentLap || 1} stays intact).
            </div>
          </div>

          {/* Feedback Notices */}
          {historicalNotice && (
            <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{historicalNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoricalNotice("")}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {historicalError && (
            <div className="p-3 rounded-lg bg-[#E10600]/15 border border-[#E10600]/30 text-xs text-[#FF4D4D] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{historicalError}</span>
              </div>
              <button
                type="button"
                onClick={() => setHistoricalError("")}
                className="text-[10px] text-slate-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 120-Minute Timeline Visual Progress Bar */}
          <div className="space-y-1.5 bg-[#0A0D12] p-3.5 rounded-xl border border-[#1D2533]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                120-Minute Timeline Progress
              </span>
              <span className="font-mono text-xs text-[#06B6D4] font-bold">
                Minute {historicalStatus?.session?.currentMinuteIndex ?? 0} of {historicalStatus?.session?.totalMinutes || 120} • Competition Lap {raceState?.currentLap || 1} Intact
              </span>
            </div>

            {/* Interactive Timeline Progress Bar */}
            <div className="relative w-full h-3 bg-[#161B24] rounded-full overflow-hidden border border-[#232B3B]">
              <div
                className="h-full bg-linear-to-r from-[#06B6D4] via-[#10B981] to-[#E10600] transition-all duration-300"
                style={{
                  width: `${Math.min(100, (((historicalStatus?.session?.currentMinuteIndex ?? 0) + 1) / (historicalStatus?.session?.totalMinutes || 120)) * 100)}%`
                }}
              />
            </div>

            {/* Clear quarter markers */}
            <div className="flex justify-between text-[10px] font-mono text-slate-500 pt-0.5 px-1">
              <span>Start (0m)</span>
              <span>Quarter 1 (30m)</span>
              <span>Midpoint (60m)</span>
              <span>Quarter 3 (90m)</span>
              <span>Finish (120m)</span>
            </div>
          </div>

          {/* Master Historical Playback Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Generate Data Button */}
            <button
              type="button"
              onClick={handleGenerateHistorical}
              disabled={isGeneratingHistorical}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                isGeneratingHistorical
                  ? "bg-[#06B6D4]/20 text-[#06B6D4] border-[#06B6D4]/40 cursor-wait"
                  : "bg-linear-to-r from-[#0891B2] to-[#06B6D4] hover:from-[#06B6D4] hover:to-[#22D3EE] text-slate-950 border-[#06B6D4] shadow-sm hover:shadow-cyan-500/20"
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingHistorical ? "animate-spin" : ""}`} />
              <span>{isGeneratingHistorical ? "Fetching Twelve Data..." : "Generate 120-Min Data"}</span>
            </button>

            {/* Start Auto-Play */}
            <button
              type="button"
              onClick={handleStartHistorical}
              disabled={!historicalStatus?.isLoaded || historicalStatus?.session?.status === "RUNNING"}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                historicalStatus?.session?.status === "RUNNING"
                  ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/50 cursor-default"
                  : !historicalStatus?.isLoaded
                    ? "bg-[#161B24] text-slate-500 border border-[#232B3B] cursor-not-allowed"
                    : "bg-[#10B981] hover:bg-[#059669] text-slate-950 shadow-sm hover:shadow-emerald-500/20"
              }`}
            >
              <Play className="w-4 h-4 fill-current" />
              <span>
                {historicalStatus?.session?.status === "RUNNING"
                  ? "Auto-Playing Prices"
                  : "Start Auto-Play"}
              </span>
            </button>

            {/* Pause Auto-Play */}
            <button
              type="button"
              onClick={handlePauseHistorical}
              disabled={historicalStatus?.session?.status !== "RUNNING"}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                historicalStatus?.session?.status === "PAUSED"
                  ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/50 cursor-default"
                  : historicalStatus?.session?.status !== "RUNNING"
                    ? "bg-[#161B24] text-slate-500 border border-[#232B3B] cursor-not-allowed"
                    : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950"
              }`}
            >
              <Pause className="w-4 h-4 fill-current" />
              <span>Pause Auto-Play</span>
            </button>

            {/* Step +1 Minute */}
            <button
              type="button"
              onClick={() => handleStepHistorical((historicalStatus?.session?.currentMinuteIndex ?? 0) + 1)}
              disabled={!historicalStatus?.isLoaded}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                !historicalStatus?.isLoaded
                  ? "bg-[#161B24] text-slate-500 border-[#232B3B] cursor-not-allowed"
                  : "bg-[#161B24] hover:bg-[#202736] text-white border-[#2A3447]"
              }`}
            >
              <FastForward className="w-4 h-4 text-[#06B6D4]" />
              <span>Next Minute (+1m)</span>
            </button>

            {/* Reset to Min 0 */}
            <button
              type="button"
              onClick={handleResetHistorical}
              disabled={!historicalStatus?.isLoaded}
              className={`p-3.5 rounded-lg font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 border ${
                !historicalStatus?.isLoaded
                  ? "bg-[#161B24] text-slate-500 border-[#232B3B] cursor-not-allowed"
                  : "bg-[#161B24] hover:bg-[#202736] text-slate-300 hover:text-white border-[#2A3447]"
              }`}
            >
              <RotateCcw className="w-4 h-4 text-[#E10600]" />
              <span>Reset Prices to Min 0</span>
            </button>
          </div>

          {/* Playback Configuration & Scrubber Ribbon */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 pt-2">
            {/* Speed Presets */}
            <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1D2533] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#06B6D4]" />
                  Auto-Play Speed
                </span>
                <span className="text-[11px] font-mono text-[#06B6D4]">
                  {selectedSpeedSeconds}s per minute
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "10s (Fast)", secs: 10 },
                  { label: "30s (Default)", secs: 30 },
                  { label: "60s (Realtime)", secs: 60 }
                ].map((item) => (
                  <button
                    key={item.secs}
                    type="button"
                    onClick={() => {
                      setSelectedSpeedSeconds(item.secs);
                      updateHistoricalSettings({ tickIntervalSeconds: item.secs });
                      setHistoricalNotice(`Tick speed updated to ${item.secs}s per market minute.`);
                      setTimeout(() => setHistoricalNotice(""), 3000);
                    }}
                    className={`py-1.5 px-2 rounded text-[11px] font-bold font-mono transition-colors border ${
                      selectedSpeedSeconds === item.secs
                        ? "bg-[#06B6D4] text-slate-950 border-[#06B6D4]"
                        : "bg-[#121720] text-slate-400 hover:text-white border-[#232B3B]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Volatility Multiplier Presets */}
            <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1D2533] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-[#EAB308]" />
                  Price Fluctuation Scale
                </span>
                <span className="text-[11px] font-mono text-[#EAB308]">
                  {selectedVolMultiplier}x swing action
                </span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { label: "1.0x (Normal)", val: 1.0 },
                  { label: "1.5x (Recommended)", val: 1.5 },
                  { label: "2.0x (High Swings)", val: 2.0 }
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => {
                      setSelectedVolMultiplier(item.val);
                      updateHistoricalSettings({ volatilityMultiplier: item.val });
                      setHistoricalNotice(`Price fluctuation scale set to ${item.val}x.`);
                      setTimeout(() => setHistoricalNotice(""), 3000);
                    }}
                    className={`py-1.5 px-2 rounded text-[11px] font-bold font-mono transition-colors border ${
                      selectedVolMultiplier === item.val
                        ? "bg-[#EAB308] text-slate-950 border-[#EAB308]"
                        : "bg-[#121720] text-slate-400 hover:text-white border-[#232B3B]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Minute Scrubber */}
            <div className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1D2533] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#10B981]" />
                  Jump to Any Minute
                </span>
                <span className="text-[11px] font-mono text-[#10B981] font-bold">
                  Minute {historicalStatus?.session?.currentMinuteIndex ?? 0} of 120
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={Math.max(0, (historicalStatus?.session?.totalMinutes || 120) - 1)}
                value={historicalStatus?.session?.currentMinuteIndex ?? 0}
                onChange={(e) => handleStepHistorical(parseInt(e.target.value, 10))}
                disabled={!historicalStatus?.isLoaded}
                className="w-full accent-[#10B981] cursor-pointer"
              />
            </div>
          </div>

          {/* Scheduled News Tickers Feed */}
          <div className="pt-2 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-xs font-black uppercase tracking-widest text-slate-200">
                  Scheduled News Tickers (120-Minute Timeline)
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {historicalStatus?.validNewsSchedule?.length || 10} Scheduled Events
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
              {(historicalStatus?.validNewsSchedule || []).map((news, idx) => {
                const isPassed = (historicalStatus?.session?.currentMinuteIndex ?? 0) >= news.minuteIndex;
                const isPositive = (news.priceImpactPercent || 0) >= 0;

                return (
                  <div
                    key={news.title + idx}
                    className={`p-3 rounded-lg border transition-all flex flex-col justify-between gap-2 ${
                      isPassed
                        ? "bg-[#0D121B] border-[#10B981]/30 opacity-90"
                        : "bg-[#0A0D12] border-[#1D2533] hover:border-[#2A3447]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase ${
                          news.type === "GREEN_FLAG"
                            ? "bg-[#10B981]/20 text-[#10B981]"
                            : news.type === "YELLOW_FLAG"
                              ? "bg-[#F59E0B]/20 text-[#F59E0B]"
                              : news.type === "SAFETY_CAR"
                                ? "bg-[#E10600]/20 text-[#FF4D4D]"
                                : "bg-[#06B6D4]/20 text-[#06B6D4]"
                        }`}>
                          Min {String(news.minuteIndex).padStart(2, "0")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {news.ticker} • {news.sector}
                        </span>
                      </div>

                      <span className={`text-[10px] font-mono font-bold ${
                        isPositive ? "text-[#10B981]" : "text-[#E10600]"
                      }`}>
                        {isPositive ? "+" : ""}{news.priceImpactPercent}%
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-white line-clamp-1">
                        {news.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                        {news.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-[#18202E]">
                      <span className="text-[9px] text-slate-500 font-mono">
                        Source: {news.source}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleBroadcastNewsItem(news)}
                        className="px-2 py-0.5 rounded bg-[#161B24] hover:bg-[#10B981] text-slate-300 hover:text-slate-950 text-[10px] font-bold uppercase transition-colors"
                      >
                        Send Alert Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Industry Sector Shock Cockpit ("Hitting the Industries") */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B3B] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Industry Sector Shock Cockpit ("Hitting The Industries")
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Trigger macro sector shocks to simulate sudden market disruptions, raw material shortages, or technological breakthroughs.
              </p>
            </div>
            {broadcastSuccess && (
              <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{broadcastSuccess}</span>
              </div>
            )}
          </div>

          {/* Industry Sector Shock Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {sectors.map((sec) => {
              const sectorStocks = (stocks || []).filter((s) => s.sector === sec);
              return (
                <div key={sec} className="p-3.5 rounded-xl bg-[#0A0D12] border border-[#1A202C] hover:border-[#232B3B] transition-colors space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-black uppercase text-white tracking-wide">
                        {sec}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {sectorStocks.map((s) => s.ticker).join(", ") || "No stocks"}
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#161B24] text-[10px] font-mono text-[#06B6D4] shrink-0">
                      {sectorStocks.length} Stocks
                    </span>
                  </div>

                  {/* 1-Click Sector Shocks: +15% Surge & -10% Dip */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#161B24]">
                    <button
                      type="button"
                      onClick={() => handleFireSectorShock(sec, 15, `${sec.split("&")[0].trim()} Bull Surge`, "Surge in industrial order books triggers market-wide rally.")}
                      className="px-2 py-1.5 rounded bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold uppercase transition-colors text-center"
                    >
                      +15% Surge
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFireSectorShock(sec, -10, `${sec.split("&")[0].trim()} Market Correction`, "Component bottlenecks and cautious guidance trigger a dip.")}
                      className="px-2 py-1.5 rounded bg-[#E10600]/10 hover:bg-[#E10600]/25 border border-[#E10600]/30 text-[#FF8080] text-[10px] font-bold uppercase transition-colors text-center"
                    >
                      -10% Dip
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Sector Shock & Breaking News Broadcaster */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 pt-3 border-t border-[#232B3B]">
            <div className="lg:col-span-7 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span>Custom Sector Shock &amp; Broadcast</span>
              </div>
              <form onSubmit={handleBroadcast} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Headline Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. FIA Technical Directive: Aero Wings Banned"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#06B6D4] text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 mb-1">Impact Announcement Details *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="e.g. Sudden rule change requires immediate downforce redesign across all competitors."
                    value={newsDesc}
                    onChange={(e) => setNewsDesc(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#06B6D4] text-xs text-white outline-none resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Target Sector</label>
                    <select
                      value={selectedSector}
                      onChange={(e) => setSelectedSector(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white outline-none"
                    >
                      {sectors.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-400 mb-1">Price Shock % (-50% to +50%)</label>
                    <input
                      type="number"
                      value={impactPercent}
                      onChange={(e) => setImpactPercent(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white font-mono outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Broadcast Custom Sector Shock
                </button>
              </form>
            </div>

            {/* Presets Column */}
            <div className="lg:col-span-5 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Flame className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>1-Click Story Presets</span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {presets.map((p, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C] hover:border-slate-600 transition-colors flex items-center justify-between gap-2.5"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{p.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {p.sector.split("&")[0]} : {p.impact > 0 ? `+${p.impact}%` : `${p.impact}%`}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyPreset(p)}
                      className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#E10600] text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-wider transition-colors shrink-0"
                    >
                      Fire
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Individual Stocks Management ("Edit Stocks of Individual Companies") */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232B3B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#10B981]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Stock Price Controls ({stocks?.length || 0} Stocks)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust prices and volatility for specific equities directly in real time.
              </p>
            </div>
            {stockNotice && (
              <div className="p-2 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{stockNotice}</span>
              </div>
            )}
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full min-w-160 text-left text-xs font-sans">
              <thead>
                <tr className="border-b border-[#232B3B] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-2.5">Ticker &amp; Company</th>
                  <th className="pb-2.5">Sector</th>
                  <th className="pb-2.5 text-right">Current Price</th>
                  <th className="pb-2.5 text-right">Day Change</th>
                  <th className="pb-2.5 text-center">Volatility</th>
                  <th className="pb-2.5 text-center">Price Nudge</th>
                  <th className="pb-2.5 text-center">Direct Edit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A202C]">
                {(stocks || []).map((s) => (
                  <tr key={s.ticker} className="hover:bg-[#161B24] transition-colors">
                    <td className="py-2.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span className="font-mono text-[#06B6D4]">{s.ticker}</span>
                        <span className="text-slate-300 font-normal">: {s.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-[11px] text-slate-400">
                      {s.sector.split("&")[0]}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-white">
                      ₹{s.currentPrice.toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-mono">
                      <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                        s.changePercent >= 0 ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#E10600]/15 text-[#FF8080]"
                      }`}>
                        {s.changePercent >= 0 ? "+" : ""}{s.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-slate-300">
                      {s.volatility ?? 1.0}x
                    </td>
                    <td className="py-2.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleNudgeStockPrice(s, 5)}
                          className="px-2 py-0.5 rounded bg-[#10B981]/15 hover:bg-[#10B981]/30 text-[#10B981] font-mono text-[10px] font-bold"
                          title="Increase price by 5%"
                        >
                          +5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeStockPrice(s, -5)}
                          className="px-2 py-0.5 rounded bg-[#E10600]/15 hover:bg-[#E10600]/30 text-[#FF8080] font-mono text-[10px] font-bold"
                          title="Decrease price by 5%"
                        >
                          -5%
                        </button>
                      </div>
                    </td>
                    <td className="py-2.5 text-center">
                      {editingStockTicker === s.ticker ? (
                        <div className="flex items-center justify-center gap-1">
                          <input
                            type="number"
                            step="0.1"
                            value={newStockPrice}
                            onChange={(e) => setNewStockPrice(e.target.value)}
                            placeholder={s.currentPrice.toString()}
                            className="w-16 px-1.5 py-0.5 rounded bg-[#0A0D12] border border-[#232B3B] text-xs text-white font-mono outline-none"
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveStock(s.ticker)}
                            className="px-2 py-0.5 rounded bg-[#10B981] text-slate-950 font-bold text-[10px] uppercase"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingStockTicker(null);
                              setNewStockPrice("");
                            }}
                            className="px-1.5 py-0.5 rounded bg-[#161B24] text-slate-400 text-[10px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStockTicker(s.ticker);
                            setNewStockPrice(s.currentPrice.toString());
                            setNewStockVolatility((s.volatility || 1.0).toString());
                          }}
                          className="px-2 py-1 rounded bg-[#161B24] hover:bg-[#232B3B] text-slate-300 text-[10px] font-bold uppercase transition-colors"
                        >
                          Edit Price
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 5: Teams & Player Management */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B3B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E10600]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Teams &amp; Player Management (15 Teams)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage all 15 motorsport teams. Each team has up to 3 members with team leader order placement.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-[#0A0D12] border border-[#232B3B] text-xs font-mono font-bold text-white">
                {teams.length} / 15 Slots Active
              </span>
              <button
                type="button"
                onClick={() => handleSeedTeams(teams.length > 0)}
                className="px-3 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{teams.length === 0 ? "Seed 15 Canonical Teams" : "Reset / Re-Seed 15 Teams"}</span>
              </button>
            </div>
          </div>

          {teams.length === 0 ? (
            <div className="py-8 text-center bg-[#0A0D12] rounded-lg border border-[#1A202C] text-slate-400 text-xs font-medium space-y-3">
              <p>No teams seeded on the grid yet.</p>
              <button
                type="button"
                onClick={() => handleSeedTeams(false)}
                className="px-4 py-2 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-bold uppercase tracking-wider"
              >
                Click Here to Seed the 15 Motorsport Teams
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-180 text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#232B3B] text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="pb-2.5">Slot &amp; Code</th>
                    <th className="pb-2.5">Team Name &amp; PIN</th>
                    <th className="pb-2.5">Leader &amp; Members</th>
                    <th className="pb-2.5 text-right">Cash Balance</th>
                    <th className="pb-2.5 text-center">Stock Holdings</th>
                    <th className="pb-2.5 text-center">Leader Session</th>
                    <th className="pb-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C]">
                  {teams.map((t) => {
                    const teamHolding = holdingsMap.get(t.teamCode);
                    const holdingsList = teamHolding?.holdings || [];
                    const count = teamHolding?.holdingsCount || 0;
                    const isExpanded = expandedTeamCode === t.teamCode;

                    return (
                      <React.Fragment key={t.id || t._id}>
                        <tr className="hover:bg-[#161B24] transition-colors">
                          <td className="py-2.5 font-mono font-bold text-[#06B6D4]">
                            {t.teamCode}
                          </td>
                          <td className="py-2.5">
                            <div className="font-bold text-white">{t.teamName}</div>
                            <div className="text-[10px] font-mono text-slate-500">PIN: {t.teamPin}</div>
                          </td>
                          <td className="py-2.5 text-slate-200 font-medium">
                            <div className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#E10600] shrink-0" />
                              <span>{t.leaderName}</span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              {[t.member2, t.member3].filter(Boolean).join(" • ") || "Solo Leader"}
                            </div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-bold text-white">
                            {editingTeamId === (t.id || t._id) ? (
                              <div className="flex items-center justify-end gap-1">
                                <span className="text-xs text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={newCashAmount}
                                  onChange={(e) => setNewCashAmount(e.target.value)}
                                  className="w-20 px-1.5 py-0.5 rounded bg-[#0A0D12] border border-[#232B3B] text-xs text-white font-mono outline-none"
                                  placeholder={t.cashBalance.toString()}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleSaveTeamCash(t.id || t._id)}
                                  className="px-1.5 py-0.5 rounded bg-[#10B981] text-slate-950 text-[10px] font-bold uppercase"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTeamId(null);
                                    setNewCashAmount("");
                                  }}
                                  className="px-1.5 py-0.5 rounded bg-[#161B24] text-slate-400 text-[10px] font-bold uppercase"
                                >
                                  X
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-end gap-1.5">
                                <span>₹{t.cashBalance.toLocaleString("en-IN")}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingTeamId(t.id || t._id);
                                    setNewCashAmount(t.cashBalance.toString());
                                  }}
                                  className="text-[10px] text-slate-500 hover:text-[#06B6D4] font-sans underline"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setExpandedTeamCode(isExpanded ? null : t.teamCode)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-[10px] font-mono font-bold transition-all border ${
                                count > 0
                                  ? "bg-[#06B6D4]/15 hover:bg-[#06B6D4]/30 text-[#06B6D4] border-[#06B6D4]/30 shadow-xs"
                                  : "bg-[#161B24] hover:bg-[#1E2532] text-slate-400 border-[#232B3B]"
                              }`}
                              title="Click to view all stock investments made by this team"
                            >
                              <span>{count} Stocks</span>
                              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </td>
                          <td className="py-2.5 text-center">
                            {t.activeLeaderSessionId ? (
                              <div className="flex items-center justify-center gap-1">
                                <span className="px-1.5 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] font-mono text-[10px] font-bold">
                                  Connected
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleClearSession(t.id || t._id, t.teamName)}
                                  className="text-[10px] text-slate-400 hover:text-[#E10600] underline"
                                  title="Reset session lock if leader lost connection"
                                >
                                  Reset
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-mono">
                                Available
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleOpenEditRoster(t)}
                                className="px-2 py-1 rounded bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white text-[10px] font-bold uppercase transition-colors"
                              >
                                Roster
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  adminUpdateTeam(t.id || t._id, {
                                    status: t.status === "ACTIVE" ? "DISQUALIFIED" : "ACTIVE"
                                  })
                                }
                                className={`px-1.5 py-1 rounded text-[10px] font-bold uppercase transition-colors border ${
                                  t.status === "ACTIVE"
                                    ? "bg-[#161B24] hover:bg-[#F59E0B]/20 text-slate-300 hover:text-[#F59E0B] border-[#232B3B]"
                                    : "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40"
                                }`}
                              >
                                {t.status === "ACTIVE" ? "Lock" : "Unlock"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Permanently delete team "${t.teamName}" and all associated orders?`)) {
                                    adminDeleteTeam(t.id || t._id);
                                  }
                                }}
                                className="p-1 rounded bg-[#161B24] hover:bg-[#E10600] text-slate-400 hover:text-white transition-colors border border-[#232B3B]"
                                title="Delete team"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Stock Portfolio Breakdown */}
                        {isExpanded && (
                          <tr className="bg-[#0A0E18] border-y border-[#233148]">
                            <td colSpan={7} className="p-4 space-y-3">
                              <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-[#1A263C]">
                                <div>
                                  <div className="text-xs font-bold text-white flex items-center gap-2">
                                    <Briefcase className="w-4 h-4 text-[#06B6D4]" />
                                    <span>{t.teamName} ({t.teamCode}) — Live Stock Portfolio Breakdown</span>
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    Leader: {t.leaderName} • {holdingsList.length} active equities held
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs font-mono">
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Cash Balance</span>
                                    <span className="font-bold text-white">₹{t.cashBalance.toLocaleString("en-IN")}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Holdings Value</span>
                                    <span className="font-bold text-[#06B6D4]">₹{(teamHolding?.totalHoldingsValue || 0).toLocaleString("en-IN")}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-500 text-[10px] uppercase block">Total Net Worth</span>
                                    <span className="font-bold text-emerald-400">₹{(teamHolding?.totalPortfolioValue || t.cashBalance).toLocaleString("en-IN")}</span>
                                  </div>
                                </div>
                              </div>

                              {holdingsList.length > 0 ? (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-left text-xs font-mono">
                                    <thead>
                                      <tr className="text-[10px] text-slate-400 uppercase border-b border-[#1A263C]">
                                        <th className="pb-1.5">Stock Ticker &amp; Name</th>
                                        <th className="pb-1.5">Sector</th>
                                        <th className="pb-1.5 text-right">Shares Owned</th>
                                        <th className="pb-1.5 text-right">Avg Buy Price</th>
                                        <th className="pb-1.5 text-right">Current Price</th>
                                        <th className="pb-1.5 text-right">Total Invested</th>
                                        <th className="pb-1.5 text-right">Current Valuation</th>
                                        <th className="pb-1.5 text-right">Unrealized P&amp;L</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#151F33]">
                                      {holdingsList.map((h) => (
                                        <tr key={h.holdingId || h.ticker} className="hover:bg-[#121A2C]">
                                          <td className="py-2 font-bold text-white">
                                            <span className="text-[#06B6D4]">{h.ticker}</span>
                                            <span className="text-slate-400 font-normal ml-1 text-[11px] font-sans">: {h.stockName}</span>
                                          </td>
                                          <td className="py-2 text-[11px] text-slate-400 font-sans">{h.sector.split("&")[0]}</td>
                                          <td className="py-2 text-right font-bold text-white">{h.shares}</td>
                                          <td className="py-2 text-right text-slate-300">₹{h.avgBuyPrice.toFixed(2)}</td>
                                          <td className="py-2 text-right text-white font-bold">₹{h.currentPrice.toFixed(2)}</td>
                                          <td className="py-2 text-right text-slate-300">₹{h.investedValue.toLocaleString("en-IN")}</td>
                                          <td className="py-2 text-right font-bold text-white">₹{h.currentValue.toLocaleString("en-IN")}</td>
                                          <td className="py-2 text-right">
                                            <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                                              h.unrealizedPnL >= 0 ? "bg-[#10B981]/15 text-[#10B981]" : "bg-[#E10600]/15 text-[#FF8080]"
                                            }`}>
                                              {h.unrealizedPnL >= 0 ? "+" : ""}₹{h.unrealizedPnL.toFixed(2)} ({h.returnPercent}%)
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="py-3 text-center text-xs text-slate-400 font-sans bg-[#0E1524] rounded-lg border border-[#1A263C]">
                                  This team has not purchased any stocks yet. They are holding 100% of their balance in cash.
                                </div>
                              )}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Section 6: Grid-Wide Stock Investment Matrix ("Who Owns What") */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B3B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <PieChart className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Grid-Wide Stock Investment Matrix ("Who Owns What")
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect which equities each team has invested in, or filter by specific stock to see all shareholder teams.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Search team or stock..."
                value={holdingSearchTerm}
                onChange={(e) => setHoldingSearchTerm(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#06B6D4] text-xs text-white placeholder:text-slate-600 outline-none w-44"
              />
              <select
                value={holdingFilterStock}
                onChange={(e) => setHoldingFilterStock(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white outline-none"
              >
                <option value="ALL">All Stocks (17 Equities)</option>
                {(stocks || []).map((s) => (
                  <option key={s.ticker} value={s.ticker}>
                    {s.ticker} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {gridTeamsWithHoldings
              .filter((team) => {
                if (holdingSearchTerm) {
                  const q = holdingSearchTerm.toLowerCase();
                  const matchesTeam = team.teamName.toLowerCase().includes(q) || team.teamCode.toLowerCase().includes(q);
                  const matchesStock = team.holdings?.some((h) => h.ticker.toLowerCase().includes(q) || h.stockName.toLowerCase().includes(q));
                  if (!matchesTeam && !matchesStock) return false;
                }
                if (holdingFilterStock !== "ALL") {
                  return team.holdings?.some((h) => h.ticker === holdingFilterStock);
                }
                return true;
              })
              .map((team) => (
                <div
                  key={team.teamCode}
                  className="p-4 rounded-xl bg-[#0A0D12] border border-[#1A202C] hover:border-[#232B3B] transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-[#161B24] pb-2">
                    <div>
                      <div className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5">
                        <span className="font-mono text-[#06B6D4] font-bold">{team.teamCode}</span>
                        <span className="truncate max-w-[150px]">{team.teamName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Leader: {team.leaderName}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-[#161B24] border border-[#232B3B] text-[10px] font-mono text-cyan-400 shrink-0 font-bold">
                      {team.holdingsCount} Stocks
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase block">Cash Balance</span>
                      <span className="text-white font-bold">₹{team.cashBalance.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Invested Value</span>
                      <span className="text-cyan-400 font-bold">₹{team.totalHoldingsValue.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {team.holdings && team.holdings.length > 0 ? (
                    <div className="space-y-1.5 pt-1 border-t border-[#161B24]">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">
                        Equities Portfolio:
                      </span>
                      <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {team.holdings.map((h) => (
                          <div
                            key={h.ticker}
                            className={`px-2 py-1 rounded-md text-[11px] font-mono border flex items-center justify-between gap-2 w-full ${
                              h.unrealizedPnL >= 0
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-300"
                                : "bg-rose-500/10 border-rose-500/25 text-rose-300"
                            }`}
                          >
                            <span className="font-bold">
                              {h.ticker} <span className="font-normal text-slate-400">({h.shares} sh)</span>
                            </span>
                            <span className="font-bold">
                              ₹{h.currentValue.toLocaleString("en-IN")}
                              <span className="text-[10px] ml-1 opacity-80">
                                ({h.returnPercent >= 0 ? "+" : ""}{h.returnPercent}%)
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="py-2 text-center text-[11px] text-slate-500 font-mono italic">
                      No stock holdings (100% Cash)
                    </div>
                  )}
                </div>
              ))}
          </div>
        </section>

        {/* 3-Member Roster Edit Modal */}
        {editingRosterTeam && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#232B3B] pb-3">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#E10600]" />
                  <h3 className="text-sm font-black uppercase text-white">
                    Edit Roster: {editingRosterTeam.teamCode}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingRosterTeam(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              {rosterNotice && (
                <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{rosterNotice}</span>
                </div>
              )}

              <form onSubmit={handleSaveRoster} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    Team Name
                  </label>
                  <input
                    type="text"
                    required
                    value={editTeamName}
                    onChange={(e) => setEditTeamName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-400 mb-1">
                    4-Digit Security PIN
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    required
                    value={editTeamPin}
                    onChange={(e) => setEditTeamPin(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white font-mono outline-none"
                  />
                </div>

                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-[#06B6D4] tracking-wide">
                      Team Roster (Up to 3 Members)
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      1 to 3 members permitted
                    </span>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      Member 1: Team Leader (Required) *
                    </label>
                    <input
                      type="text"
                      required
                      value={editLeaderName}
                      onChange={(e) => setEditLeaderName(e.target.value)}
                      placeholder="Leader Name"
                      className="w-full px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      Member 2: Team Member (Optional)
                    </label>
                    <input
                      type="text"
                      value={editMember2}
                      onChange={(e) => setEditMember2(e.target.value)}
                      placeholder="Leave blank if 1-member team"
                      className="w-full px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      Member 3: Team Member (Optional)
                    </label>
                    <input
                      type="text"
                      value={editMember3}
                      onChange={(e) => setEditMember3(e.target.value)}
                      placeholder="Leave blank if 2-member team"
                      className="w-full px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white placeholder:text-slate-600 outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors shadow-xs"
                  >
                    Save Team Roster
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRosterTeam(null)}
                    className="px-3 py-2 rounded-lg bg-[#161B24] text-slate-300 text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
