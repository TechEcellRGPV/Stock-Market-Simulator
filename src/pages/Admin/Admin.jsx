import { useState } from "react";
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
  Calendar,
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
  Building2
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import EventCountdown from "../../components/EventCountdown";
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
 * 8. Individual Stocks Operations: Edit scrip prices, day range, and volatility
 * 9. Industry Sector Shock Controller: Hitting industries with macro rallies & supply crunches
 * 10. Canonical 15-Team Grid Manager: Seed 15 pre-decided motorsport teams, enforce 3 members per team, and clear leader session locks.
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
    setTargetEventDate,
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
    resetGrid
  } = useSimulation();

  // Login Gate State (for unauthenticated /admin visits)
  const [adminPasscode, setAdminPasscode] = useState("");
  const [authError, setAuthError] = useState("");

  // Target Date / Time State
  const [targetDateInput, setTargetDateInput] = useState(
    raceState.targetEventDate ? raceState.targetEventDate.slice(0, 16) : ""
  );
  const [dateSummaryText, setDateSummaryText] = useState(raceState.scheduledStartTime || "");
  const [dateNotice, setDateNotice] = useState("");

  // Starting Capital Form State
  const [startingCapitalInput, setStartingCapitalInput] = useState(
    raceState.defaultStartingCapital || 100000
  );
  const [capitalNotice, setCapitalNotice] = useState("");

  // Custom Timer Form State
  const [customMinutes, setCustomMinutes] = useState(15);
  const [customSeconds, setCustomSeconds] = useState(0);
  const [timerSuccess, setTimerSuccess] = useState("");

  // News Broadcast Form State
  const [newsTitle, setNewsTitle] = useState("");
  const [newsDesc, setNewsDesc] = useState("");
  const [selectedSector, setSelectedSector] = useState("Powertrain & Electric Vehicles");
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

  const sectors = [
    "Powertrain & Electric Vehicles",
    "Aerodynamics & Advanced Materials",
    "Telemetry, AI & Autonomous Tech",
    "Sustainable Fuels & Energy",
    "Logistics & Precision Engineering"
  ];

  // Presets
  const presets = [
    {
      title: "Solid-State Battery Breakthrough",
      description: "Powertrain EV manufacturers report 40% range increase.",
      sector: "Powertrain & Electric Vehicles",
      impact: 12
    },
    {
      title: "Raw Lithium Supply Chain Crunch",
      description: "Material delays slow down high-performance EV battery assembly.",
      sector: "Powertrain & Electric Vehicles",
      impact: -10
    },
    {
      title: "FIA Aerodynamics Rule Revision",
      description: "New vortex airflow guidelines boost demand for advanced composites.",
      sector: "Aerodynamics & Advanced Materials",
      impact: 15
    },
    {
      title: "AI Telemetry Quantum Microchip Release",
      description: "Real-time edge telemetry computing stocks surge.",
      sector: "Telemetry, AI & Autonomous Tech",
      impact: 14
    },
    {
      title: "100% Synthetic Fuel Mandate Approved",
      description: "Carbon-neutral drop-in e-fuels receive major green subsidies.",
      sector: "Sustainable Fuels & Energy",
      impact: 18
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

  const handleSetTargetDate = (e) => {
    e.preventDefault();
    if (!targetDateInput) return;
    const d = new Date(targetDateInput);
    const dateDerived = !isNaN(d.getTime())
      ? d.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true
      })
      : "";

    const isExplicitSummary =
      dateSummaryText.trim() &&
      dateSummaryText.trim() !== raceState.scheduledStartTime &&
      !dateSummaryText.trim().includes("10:00 AM");

    const formattedSummary = isExplicitSummary
      ? dateSummaryText.trim()
      : (dateDerived || dateSummaryText.trim());

    setTargetEventDate(targetDateInput, formattedSummary);
    setDateNotice(`Countdown set to: ${formattedSummary}`);
    setTimeout(() => setDateNotice(""), 3500);
  };

  const handlePresetDate = (isoString, label) => {
    setTargetDateInput(isoString.slice(0, 16));
    setDateSummaryText(label);
    setTargetEventDate(isoString, label);
    setDateNotice(`Countdown set to: ${label}`);
    setTimeout(() => setDateNotice(""), 3500);
  };

  const handleSetCapital = (e) => {
    e.preventDefault();
    const amount = Number(startingCapitalInput);
    if (!amount || amount < 1000) return;
    adminSetDefaultStartingCapital(amount);
    setCapitalNotice(`Default capital updated to ₹${amount.toLocaleString("en-IN")}`);
    setTimeout(() => setCapitalNotice(""), 3000);
  };

  const handleSetTimer = (e) => {
    e.preventDefault();
    const totalSecs = (parseInt(customMinutes) || 0) * 60 + (parseInt(customSeconds) || 0);
    if (totalSecs < 10) return;
    setRaceTimer(totalSecs);
    setTimerSuccess(`Timer set to ${customMinutes}m ${customSeconds}s!`);
    setTimeout(() => setTimerSuccess(""), 3000);
  };

  const handlePresetTimer = (mins) => {
    setCustomMinutes(mins);
    setCustomSeconds(0);
    setRaceTimer(mins * 60);
    setTimerSuccess(`Timer set to ${mins} minutes!`);
    setTimeout(() => setTimerSuccess(""), 3000);
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
    setEditMember2(team.member2 || (team.members && team.members[1]) || "Member 2");
    setEditMember3(team.member3 || (team.members && team.members[2]) || "Member 3");
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
        member2: editMember2,
        member3: editMember3,
      });
      setRosterNotice(`Successfully updated 3-member roster for ${editTeamName}!`);
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
            to="/leaderboard"
            className="px-3.5 py-1.5 rounded bg-[#161B24] hover:bg-[#1D232E] text-xs font-bold text-[#EAB308] border border-[#EAB308]/30 transition-colors"
          >
            Projector View
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
        {/* Section 1: Pre-Event Access Gates & Countdown Orchestrator */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-5">
          <div className="flex items-center gap-2 border-b border-[#232B3B] pb-3.5">
            <Sliders className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-200">
              Pre-Event Access Gates & Countdown Orchestrator
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gate 1: Team Registration Gate */}
            <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {raceState.isRegistrationOpen ? <Unlock className="w-4 h-4 text-[#10B981]" /> : <Lock className="w-4 h-4 text-[#E10600]" />}
                    <span>Team Registration Gate</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${raceState.isRegistrationOpen ? "bg-[#10B981]/20 text-[#10B981]" : "bg-[#E10600]/20 text-[#FF8080]"
                    }`}>
                    {raceState.isRegistrationOpen ? "OPEN FOR REGISTRATION" : "LOCKED (CLOSED)"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Control whether participants can register new teams on the login page. Keep locked until the official event day.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleRegistration(!raceState.isRegistrationOpen)}
                className={`w-full py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${raceState.isRegistrationOpen
                    ? "bg-[#E10600]/20 hover:bg-[#E10600] text-[#FF8080] hover:text-white border border-[#E10600]/40"
                    : "bg-[#10B981] hover:bg-[#059669] text-slate-950"
                  }`}
              >
                {raceState.isRegistrationOpen ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Team Registration Now</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Open Team Registration</span>
                  </>
                )}
              </button>
            </div>

            {/* Gate 2: Paddock / Cockpit Access Gate */}
            <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex flex-col justify-between gap-3">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    {raceState.isSimulationEntryOpen ? <Unlock className="w-4 h-4 text-[#06B6D4]" /> : <Lock className="w-4 h-4 text-slate-400" />}
                    <span>Simulation Cockpit Access</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${raceState.isSimulationEntryOpen ? "bg-[#06B6D4]/20 text-[#06B6D4]" : "bg-slate-800 text-slate-400"
                    }`}>
                    {raceState.isSimulationEntryOpen ? "PADDOCK ACCESS OPEN" : "PADDOCK LOCKED"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Control whether logged-in drivers can enter the Cockpit Dashboard. Lock to keep participants in the waiting lounge.
                </p>
              </div>

              <button
                type="button"
                onClick={() => toggleSimulationEntry(!raceState.isSimulationEntryOpen)}
                className={`w-full py-2 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${raceState.isSimulationEntryOpen
                    ? "bg-[#F59E0B]/20 hover:bg-[#F59E0B] text-[#F59E0B] hover:text-slate-950 border border-[#F59E0B]/40"
                    : "bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950"
                  }`}
              >
                {raceState.isSimulationEntryOpen ? (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Lock Cockpit Access</span>
                  </>
                ) : (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Unlock Cockpit Access</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Target Event Date & Time Countdown Scheduler */}
          <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#EAB308]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Event Target Date & Countdown Scheduler (Days, Hours, Minutes, Seconds)
                </span>
              </div>
              {dateNotice && (
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{dateNotice}</span>
                </span>
              )}
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-400 font-medium mr-1">Quick Presets:</span>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setMinutes(d.getMinutes() + 15);
                  handlePresetDate(d.toISOString(), "Flag-Off in 15 Minutes");
                }}
                className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 text-xs font-bold border border-[#232B3B]"
              >
                In 15 Minutes
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setHours(d.getHours() + 2);
                  handlePresetDate(d.toISOString(), "Flag-Off in 2 Hours");
                }}
                className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 text-xs font-bold border border-[#232B3B]"
              >
                In 2 Hours
              </button>
              <button
                type="button"
                onClick={() => {
                  const d = new Date();
                  d.setDate(d.getDate() + 1);
                  d.setHours(10, 0, 0, 0);
                  handlePresetDate(d.toISOString(), "Tomorrow at 10:00 AM");
                }}
                className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 text-xs font-bold border border-[#232B3B]"
              >
                Tomorrow 10:00 AM
              </button>
              <button
                type="button"
                onClick={() => handlePresetDate("2026-10-29T15:00:00", "October 29, 2026 at 3:00 PM")}
                className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#E10600]/20 text-[#EAB308] text-xs font-bold border border-[#EAB308]/40"
              >
                Official Event: Oct 29, 3:00 PM (RGPV Hall)
              </button>
            </div>

            <form onSubmit={handleSetTargetDate} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
              <div className="sm:col-span-4">
                <input
                  type="datetime-local"
                  required
                  value={targetDateInput}
                  onChange={(e) => {
                    const val = e.target.value;
                    setTargetDateInput(val);
                    if (val) {
                      const d = new Date(val);
                      if (!isNaN(d.getTime())) {
                        setDateSummaryText(
                          d.toLocaleString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true
                          })
                        );
                      }
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded bg-[#121720] border border-[#232B3B] focus:border-[#EAB308] text-xs text-white outline-none"
                />
              </div>

              <div className="sm:col-span-5">
                <input
                  type="text"
                  placeholder="Summary text (e.g. October 29, 2026 at 3:00 PM)"
                  value={dateSummaryText}
                  onChange={(e) => setDateSummaryText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded bg-[#121720] border border-[#232B3B] focus:border-[#EAB308] text-xs text-white placeholder:text-slate-600 outline-none"
                />
              </div>

              <div className="sm:col-span-3">
                <button
                  type="submit"
                  className="w-full py-1.5 rounded bg-[#EAB308] hover:bg-[#CA8A04] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
                >
                  Save Countdown
                </button>
              </div>
            </form>

            {/* Live Countdown Preview */}
            <div className="pt-2">
              <EventCountdown />
            </div>
          </div>

          {/* Default Team Starting Capital Configurator */}
          <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#10B981]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  Default Team Starting Capital Configuration
                </span>
              </div>
              {capitalNotice && (
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{capitalNotice}</span>
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              New teams registered on the grid will automatically be credited with this initial wallet balance. Current: <strong className="text-white">₹{(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}</strong>
            </p>
            <form onSubmit={handleSetCapital} className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-bold">₹</span>
                <input
                  type="number"
                  min="1000"
                  step="5000"
                  value={startingCapitalInput}
                  onChange={(e) => setStartingCapitalInput(e.target.value)}
                  className="w-32 px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white font-mono outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
              >
                Update Default Capital
              </button>
              <div className="flex gap-1.5">
                {[50000, 100000, 200000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setStartingCapitalInput(amt);
                      adminSetDefaultStartingCapital(amt);
                      setCapitalNotice(`Set to ₹${amt.toLocaleString("en-IN")}`);
                      setTimeout(() => setCapitalNotice(""), 3000);
                    }}
                    className="px-2 py-1 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 text-[11px] font-mono border border-[#232B3B]"
                  >
                    ₹{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>
            </form>
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
          <div className="p-4 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Custom Lap Duration Configurator
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
                  className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#1D232E] text-slate-300 text-xs font-mono font-bold border border-[#232B3B] transition-colors"
                >
                  {m} Min
                </button>
              ))}
            </div>

            <form onSubmit={handleSetTimer} className="flex flex-wrap items-center gap-2.5 pt-1">
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-16 px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white font-mono text-center outline-none"
                />
                <span className="text-xs text-slate-400 font-bold">min</span>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={customSeconds}
                  onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white font-mono text-center outline-none"
                />
                <span className="text-xs text-slate-400 font-bold">sec</span>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors"
              >
                Apply Custom Time
              </button>
            </form>
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

          {/* 5 Industry Sector Shock Cards */}
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
                        {sectorStocks.map((s) => s.ticker).join(", ") || "No scrips"}
                      </div>
                    </div>
                    <span className="px-1.5 py-0.5 rounded bg-[#161B24] text-[10px] font-mono text-[#06B6D4] shrink-0">
                      {sectorStocks.length} Equities
                    </span>
                  </div>

                  {/* 1-Click Sector Shocks */}
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-[#161B24]">
                    <button
                      type="button"
                      onClick={() => handleFireSectorShock(sec, 15, `${sec.split("&")[0].trim()} Bull Surge`, "Surge in industrial order books triggers market-wide rally.")}
                      className="px-2 py-1.5 rounded bg-[#10B981]/10 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[#10B981] text-[10px] font-bold uppercase transition-colors"
                    >
                      +15% Bull Surge
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFireSectorShock(sec, 25, `${sec.split("&")[0].trim()} Breakthrough`, "Groundbreaking technological milestone drives explosive gains.")}
                      className="px-2 py-1.5 rounded bg-[#06B6D4]/10 hover:bg-[#06B6D4]/25 border border-[#06B6D4]/30 text-[#06B6D4] text-[10px] font-bold uppercase transition-colors"
                    >
                      +25% Breakthrough
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFireSectorShock(sec, -10, `${sec.split("&")[0].trim()} Supply Crunch`, "Supply bottlenecks and component delays squeeze operating margins.")}
                      className="px-2 py-1.5 rounded bg-[#F59E0B]/10 hover:bg-[#F59E0B]/25 border border-[#F59E0B]/30 text-[#F59E0B] text-[10px] font-bold uppercase transition-colors"
                    >
                      -10% Crunch
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFireSectorShock(sec, -20, `${sec.split("&")[0].trim()} Regulatory Ban`, "Tightened compliance standards and component recall trigger selloff.")}
                      className="px-2 py-1.5 rounded bg-[#E10600]/10 hover:bg-[#E10600]/25 border border-[#E10600]/30 text-[#FF8080] text-[10px] font-bold uppercase transition-colors"
                    >
                      -20% Sector Crash
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
                  Individual Company Stocks Operations ({stocks?.length || 0} Scrips)
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Adjust prices, day ranges, and volatility for specific equities directly in real time.
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
                  <th className="pb-2.5">Ticker & Company</th>
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
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleNudgeStockPrice(s, 5)}
                          className="px-1.5 py-0.5 rounded bg-[#10B981]/15 hover:bg-[#10B981]/30 text-[#10B981] font-mono text-[10px] font-bold"
                          title="Increase price by 5%"
                        >
                          +5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeStockPrice(s, -5)}
                          className="px-1.5 py-0.5 rounded bg-[#E10600]/15 hover:bg-[#E10600]/30 text-[#FF8080] font-mono text-[10px] font-bold"
                          title="Decrease price by 5%"
                        >
                          -5%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeStockPrice(s, 10)}
                          className="px-1.5 py-0.5 rounded bg-[#06B6D4]/15 hover:bg-[#06B6D4]/30 text-[#06B6D4] font-mono text-[10px] font-bold"
                          title="Increase price by 10%"
                        >
                          +10%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNudgeStockPrice(s, -10)}
                          className="px-1.5 py-0.5 rounded bg-[#F59E0B]/15 hover:bg-[#F59E0B]/30 text-[#F59E0B] font-mono text-[10px] font-bold"
                          title="Decrease price by 10%"
                        >
                          -10%
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

        {/* Section 5: Canonical 15-Team Grid & Roster Manager */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#232B3B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E10600]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Canonical 15-Team Grid &amp; 3-Member Roster Controller
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hard-capped grid of 15 pre-decided motorsport teams. Each team is strictly limited to 3 members with leader-only bidding.
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
                    <th className="pb-2.5">Slot & Code</th>
                    <th className="pb-2.5">Team Name & PIN</th>
                    <th className="pb-2.5">Member 1: Team Leader</th>
                    <th className="pb-2.5">Member 2</th>
                    <th className="pb-2.5">Member 3</th>
                    <th className="pb-2.5 text-right">Cash Balance</th>
                    <th className="pb-2.5 text-center">Leader Session</th>
                    <th className="pb-2.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C]">
                  {teams.map((t) => (
                    <tr key={t.id || t._id} className="hover:bg-[#161B24] transition-colors">
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
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {t.member2 || (t.members && t.members[1]) || "Member 2"}
                      </td>
                      <td className="py-2.5 text-slate-400">
                        {t.member3 || (t.members && t.members[2]) || "Member 3"}
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
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
                  <div className="text-[11px] font-bold uppercase text-[#FF4D4D] tracking-wide">
                    Strictly 3 Assigned Members
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      Member 1: Team Leader (Can Trade &amp; Bid)
                    </label>
                    <input
                      type="text"
                      required
                      value={editLeaderName}
                      onChange={(e) => setEditLeaderName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      Member 2: Team Member (View Only)
                    </label>
                    <input
                      type="text"
                      required
                      value={editMember2}
                      onChange={(e) => setEditMember2(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-slate-400 mb-0.5">
                      Member 3: Team Member (View Only)
                    </label>
                    <input
                      type="text"
                      required
                      value={editMember3}
                      onChange={(e) => setEditMember3(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#121720] border border-[#232B3B] text-xs text-white outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-2 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Save 3-Member Roster
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
