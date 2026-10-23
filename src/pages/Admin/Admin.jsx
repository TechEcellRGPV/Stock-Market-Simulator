import { useState, useMemo } from "react";
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
  Building2,
  Key,
  Copy,
  Download,
  Radio,
  Newspaper,
  Send,
  ShieldAlert,
  History,
  UserCheck,
  UserX,
  Check,
  Search,
  Filter,
  Plus,
  X
} from "lucide-react";
import { useSimulation } from "../../context/SimulationContext";
import EventCountdown from "../../components/EventCountdown";
import { useSEO } from "../../hooks/useSEO";
import { PREDEFINED_NEWS_STORIES } from "../../data/news";

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
    resetGrid,
    adminTeamsAndAccounts,
    adminToggleAccountStatus,
    adminResetAccountPassword,
    adminInitialCredentials,
    adminAuditLogs,
    marketNews,
    publishMarketNews,
    seedInitialMarketNews,
    adminClearAllNews
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

  // Predefined News State & Composer
  const [selectedNewsCategory, setSelectedNewsCategory] = useState("ALL");
  const [newsSearchTerm, setNewsSearchTerm] = useState("");
  const [newsPublishNotice, setNewsPublishNotice] = useState("");
  const [publishingStoryId, setPublishingStoryId] = useState(null);
  const [showCustomNewsComposer, setShowCustomNewsComposer] = useState(false);
  const [customHeadline, setCustomHeadline] = useState("");
  const [customContent, setCustomContent] = useState("");
  const [customCategory, setCustomCategory] = useState("ANNOUNCEMENT");
  const [customSentiment, setCustomSentiment] = useState("NEUTRAL");
  const [customTicker, setCustomTicker] = useState("");
  const [customIsOfficial, setCustomIsOfficial] = useState(true);

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

  // Participant Account Management State
  const [resetModalAccount, setResetModalAccount] = useState(null); // { accountId, username, role, teamName }
  const [resetNewPassword, setResetNewPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetNotice, setResetNotice] = useState("");
  const [resetError, setResetError] = useState("");
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [copiedCredentials, setCopiedCredentials] = useState(false);
  const [togglingAccountId, setTogglingAccountId] = useState(null);
  const [publishAlsoToMarketNews, setPublishAlsoToMarketNews] = useState(true);

  const handleToggleAccount = async (accountId, currentStatus, username) => {
    const nextStatus = currentStatus === "ACTIVE" ? "DISABLED" : "ACTIVE";
    if (!window.confirm(`Are you sure you want to ${nextStatus === "ACTIVE" ? "ENABLE" : "DISABLE"} account "${username}"?`)) {
      return;
    }
    setTogglingAccountId(accountId);
    try {
      await adminToggleAccountStatus(accountId, nextStatus);
    } catch (err) {
      alert(err.message || "Failed to update account status.");
    } finally {
      setTogglingAccountId(null);
    }
  };

  const handleOpenResetModal = (acc, teamName) => {
    setResetModalAccount({
      accountId: acc._id,
      username: acc.username,
      role: acc.role,
      teamName: teamName
    });
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setResetNewPassword(randomPin);
    setResetNotice("");
    setResetError("");
  };

  const handleGenerateRandomPassword = () => {
    const randomPin = Math.floor(1000 + Math.random() * 9000).toString();
    setResetNewPassword(randomPin);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetModalAccount || !resetNewPassword.trim()) return;
    if (!/^\d{4}$/.test(resetNewPassword.trim())) {
      setResetError("Password must be exactly 4 digits (numbers only).");
      return;
    }
    setResetLoading(true);
    setResetError("");
    setResetNotice("");
    try {
      await adminResetAccountPassword(resetModalAccount.accountId, resetNewPassword.trim());
      setResetNotice(`Password for ${resetModalAccount.username} successfully updated!`);
      setTimeout(() => {
        setResetModalAccount(null);
        setResetNotice("");
      }, 1500);
    } catch (err) {
      setResetError(err.message || "Failed to reset password.");
    } finally {
      setResetLoading(false);
    }
  };

  const handleCopyCredentials = () => {
    const rows = (adminInitialCredentials || []).map(
      (c) =>
        `Team #${c.teamNumber} [${c.teamCode}] ${c.teamName} | Leader: ${c.leaderUsername} (Pass: ${c.leaderInitialPasswordPattern}) | Member: ${c.memberUsername} (Pass: ${c.memberInitialPasswordPattern})`
    );
    const header = "IMPRENDITORE 5.0 - OFFICIAL 15 TEAMS PARTICIPANT CREDENTIALS\n" + "=".repeat(75) + "\n";
    navigator.clipboard.writeText(header + rows.join("\n"));
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 2500);
  };

  const handleDownloadCredentialsCSV = () => {
    const headers = ["Team Number", "Team Code", "Team Name", "Leader Username", "Leader Initial Password", "Member Username", "Member Initial Password"];
    const rows = (adminInitialCredentials || []).map((c) => [
      c.teamNumber,
      `"${c.teamCode}"`,
      `"${c.teamName}"`,
      `"${c.leaderUsername}"`,
      `"${c.leaderInitialPasswordPattern}"`,
      `"${c.memberUsername}"`,
      `"${c.memberInitialPasswordPattern}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "imprenditore_canonical_15_team_credentials.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPresenceTime = (timestamp) => {
    if (!timestamp) return "Never";
    const sec = Math.floor((Date.now() - timestamp) / 1000);
    if (sec < 60) return "Just now";
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

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

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsDesc.trim()) return;

    broadcastTrackEvent({
      title: newsTitle.trim(),
      description: newsDesc.trim(),
      type: impactPercent < 0 ? "YELLOW_FLAG" : "GREEN_FLAG",
      affectedSectors: [selectedSector],
      priceImpactPercent: Number(impactPercent)
    });

    if (publishAlsoToMarketNews) {
      try {
        await publishMarketNews({
          title: newsTitle.trim(),
          summary: newsDesc.trim(),
          source: "Race Director Operations",
          category: "ANNOUNCEMENT",
          sentiment: impactPercent < 0 ? "BEARISH" : impactPercent > 0 ? "BULLISH" : "NEUTRAL",
          isOfficialAnnouncement: true
        });
      } catch (err) {
        console.warn("Failed to publish to market news:", err);
      }
    }

    setBroadcastSuccess("Track event & market announcement broadcasted live!");
    setNewsTitle("");
    setNewsDesc("");
    setTimeout(() => setBroadcastSuccess(""), 3000);
  };

  const handleApplyPreset = async (preset) => {
    broadcastTrackEvent({
      title: preset.title,
      description: preset.description,
      type: preset.impact < 0 ? "YELLOW_FLAG" : "GREEN_FLAG",
      affectedSectors: [preset.sector],
      priceImpactPercent: preset.impact
    });

    if (publishAlsoToMarketNews) {
      try {
        await publishMarketNews({
          title: preset.title,
          summary: preset.description,
          source: "Race Control Telemetry",
          category: "ANNOUNCEMENT",
          sentiment: preset.impact < 0 ? "BEARISH" : "BULLISH",
          isOfficialAnnouncement: true
        });
      } catch (err) {
        console.warn("Failed to publish preset to market news:", err);
      }
    }

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

  // Seed Canonical 15 Teams & 30 Participant Accounts Grid
  const handleSeedTeams = async (overwrite = false) => {
    if (overwrite && !window.confirm("Are you sure you want to reset and re-seed the 15 canonical teams and 30 participant accounts?")) {
      return;
    }
    try {
      const res = await seedCanonical15Teams(overwrite);
      alert(res.seeded ? `Grid Ready: Provisioned ${res.count} canonical teams and 30 secure participant accounts!` : res.message);
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

  // Quick Price Nudge with Random percentage between 3% and 10%
  const handleRandomNudgeStockPrice = async (stock, isIncrease) => {
    // Generate random percentage between 3.0% and 10.0% (rounded to 1 decimal place)
    const randomPercent = Math.round((Math.random() * 7 + 3) * 10) / 10;
    const finalPercent = isIncrease ? randomPercent : -randomPercent;
    const newPrice = Math.max(1, Math.round(stock.currentPrice * (1 + finalPercent / 100) * 10) / 10);
    try {
      await adminUpdateStock({
        ticker: stock.ticker,
        currentPrice: newPrice,
      });
      setStockNotice(
        `Random ${isIncrease ? "Surge" : "Drop"}: ${stock.ticker} ${isIncrease ? "+" : ""}${finalPercent.toFixed(1)}% → ₹${newPrice.toFixed(2)}`
      );
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

  // Random Sector Shock (3% to 10% Increase or Decrease)
  const handleRandomSectorShock = async (sectorName, isIncrease) => {
    const randomPercent = Math.round((Math.random() * 7 + 3) * 10) / 10;
    const finalPercent = isIncrease ? randomPercent : -randomPercent;
    const cleanSector = sectorName.split("&")[0].trim();
    const title = isIncrease
      ? `${cleanSector} Sector Rally (+${randomPercent}%)`
      : `${cleanSector} Sector Pullback (-${randomPercent}%)`;
    const desc = isIncrease
      ? `Buying demand lifts ${sectorName} equities by +${randomPercent}%.`
      : `Selling pressure triggers a -${randomPercent}% pullback across ${sectorName} equities.`;

    try {
      await adminTriggerSectorShock({
        sector: sectorName,
        percentChange: finalPercent,
        newsTitle: title,
        newsDescription: desc,
      });
      setBroadcastSuccess(
        `Sector ${isIncrease ? "Surge" : "Drop"}: ${cleanSector} ${isIncrease ? "+" : ""}${finalPercent}% applied.`
      );
      setTimeout(() => setBroadcastSuccess(""), 4000);
    } catch (err) {
      alert(err.message || "Failed to broadcast sector shock.");
    }
  };

  // Publish a Pre-Curated News Story directly to Player Feed
  const handlePublishPredefinedStory = async (story) => {
    const key = story.id || story.title;
    setPublishingStoryId(key);
    try {
      await publishMarketNews({
        title: story.title,
        summary: story.summary,
        category: story.category,
        sentiment: story.sentiment,
        ticker: story.ticker,
        isOfficialAnnouncement: Boolean(story.isOfficialAnnouncement),
        source: story.source || "Official Market News Desk",
      });

      setNewsPublishNotice(`Published! "${story.title}" is now LIVE on players' News feeds.`);
      setTimeout(() => setNewsPublishNotice(""), 4500);
    } catch (err) {
      alert(err.message || "Failed to publish news story.");
    } finally {
      setPublishingStoryId(null);
    }
  };

  // Publish Custom News Article (if admin ever wants to create their own)
  const handlePublishCustomNews = async (e) => {
    e.preventDefault();
    if (!customHeadline.trim() || !customContent.trim()) {
      alert("Please provide both a headline and details for the custom article.");
      return;
    }

    setPublishingStoryId("custom");
    try {
      await publishMarketNews({
        title: customHeadline.trim(),
        summary: customContent.trim(),
        category: customCategory,
        sentiment: customSentiment,
        ticker: customTicker.trim() ? customTicker.trim() : undefined,
        isOfficialAnnouncement: customIsOfficial,
        source: customIsOfficial ? "Official Market Announcement" : "Market Wire Desk",
      });

      setNewsPublishNotice(`Custom announcement published: "${customHeadline.trim()}"`);
      setCustomHeadline("");
      setCustomContent("");
      setCustomTicker("");
      setShowCustomNewsComposer(false);
      setTimeout(() => setNewsPublishNotice(""), 4500);
    } catch (err) {
      alert(err.message || "Failed to publish custom news article.");
    } finally {
      setPublishingStoryId(null);
    }
  };

  // Clear All Published Live News from Player Feed
  const handleClearLiveNews = async () => {
    if (!window.confirm("Are you sure you want to clear all published news from the live participant feed?")) {
      return;
    }
    try {
      await adminClearAllNews();
      setNewsPublishNotice("Participant news feed cleared to empty.");
      setTimeout(() => setNewsPublishNotice(""), 3500);
    } catch (err) {
      alert("Failed to clear news feed: " + err.message);
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

  // Set of published story titles (lowercased for matching)
  const publishedStoryTitles = useMemo(() => {
    return new Set((marketNews || []).map((m) => (m.title || "").trim().toLowerCase()));
  }, [marketNews]);

  // Predefined news categories
  const newsCategories = [
    { id: "ALL", label: "All Stories" },
    { id: "ANNOUNCEMENT", label: "Official Directives" },
    { id: "TECH", label: "Tech & AI" },
    { id: "ENERGY", label: "Energy & EV" },
    { id: "EQUITIES", label: "Equities" },
    { id: "MACRO", label: "Macro & Rates" },
  ];

  // Filtered predefined news list
  const filteredPredefinedNews = useMemo(() => {
    const stories = PREDEFINED_NEWS_STORIES || [];
    return stories.filter((story) => {
      if (selectedNewsCategory !== "ALL" && story.category !== selectedNewsCategory) {
        return false;
      }
      if (newsSearchTerm.trim()) {
        const q = newsSearchTerm.toLowerCase().trim();
        const inTitle = (story.title || "").toLowerCase().includes(q);
        const inSummary = (story.summary || "").toLowerCase().includes(q);
        const inTicker = (story.ticker || "").toLowerCase().includes(q);
        const inSource = (story.source || "").toLowerCase().includes(q);
        return inTitle || inSummary || inTicker || inSource;
      }
      return true;
    });
  }, [selectedNewsCategory, newsSearchTerm]);

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
              Stock Market Director Control
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
              E-Cell RGPV : Stock Market Operations Command
            </div>
            <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-tight text-white flex items-center gap-2">
              <span>Stock Market Director Control Center</span>
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

        {/* Section 2: Master Stock Market Lifecycle & Manual Round Controls */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#0F141C] border border-[#1E2638] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2234] pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#EAB308]">
                  Stock Market Control • 7 Rounds
                </span>
              </div>
              <div className="text-sm sm:text-base font-black uppercase tracking-tight text-white flex items-center gap-2 mt-0.5">
                <span className="text-slate-400 font-sans font-normal text-xs">Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-wider ${
                    raceState.status === "GREEN_FLAG"
                      ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
                      : raceState.status === "SAFETY_CAR"
                      ? "bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40"
                      : raceState.status === "CHECKERED_FLAG"
                      ? "bg-[#E10600]/20 text-[#FF4D4D] border border-[#E10600]/40"
                      : "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40"
                  }`}
                >
                  {raceState.status === "GREEN_FLAG"
                    ? `MARKET LIVE • ROUND ${raceState.currentLap}/7`
                    : raceState.status === "SAFETY_CAR"
                    ? "PAUSED • TRADING HALT"
                    : raceState.status === "CHECKERED_FLAG"
                    ? "CONCLUDED • MARKET CLOSED"
                    : raceState.currentLap === 1
                    ? "PRE-MARKET • NOT STARTED"
                    : `PRE-MARKET • ROUND ${raceState.currentLap}/7 STAGED`}
                </span>
              </div>
            </div>

            {/* Live Market Timer Display */}
            <div className="flex items-center gap-3 bg-[#070A0F] px-3.5 py-2 rounded-lg border border-[#1A2234]">
              <Clock className="w-4 h-4 text-[#06B6D4]" />
              <div>
                <div className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  {raceState.status === "GREEN_FLAG" ? "Market Clock (Live)" : "Market Clock (Paused)"}
                </div>
                <div className="text-lg font-black font-mono text-white leading-tight">
                  {formatTime(raceState.lapTimeRemaining)}
                </div>
              </div>
            </div>
          </div>

          {/* Master Action Trigger Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Start Stock Market / Open Trading */}
            <button
              onClick={() => startRace()}
              className={`p-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                raceState.status === "GREEN_FLAG"
                  ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/40 cursor-default"
                  : "bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black shadow-sm active:scale-[0.99]"
              }`}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {raceState.status === "GREEN_FLAG"
                  ? `Round ${raceState.currentLap}/7 Market Live`
                  : raceState.status === "SAFETY_CAR"
                  ? "Resume Market (Open Trading)"
                  : raceState.currentLap === 1
                  ? "Start Stock Market (Open Trading)"
                  : `Start Round ${raceState.currentLap} (Open Trading)`}
              </span>
            </button>

            {/* Pause (Trading Halt) */}
            <button
              onClick={() => pauseRace("Market Circuit Breaker & Trading Halt Protocol")}
              className={`p-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                raceState.status === "SAFETY_CAR"
                  ? "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/40 cursor-default"
                  : "bg-[#F59E0B] hover:bg-[#D97706] text-slate-950 font-black shadow-sm active:scale-[0.99]"
              }`}
            >
              <Pause className="w-3.5 h-3.5 fill-current" />
              <span>Pause Market (Trading Halt)</span>
            </button>

            {/* End / Conclude Stock Market */}
            <button
              onClick={() => {
                if (window.confirm("Conclude the stock market simulation and lock final portfolio rankings?")) {
                  endRace();
                }
              }}
              className={`p-3 rounded-lg font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                raceState.status === "CHECKERED_FLAG"
                  ? "bg-[#E10600]/15 text-[#FF4D4D] border border-[#E10600]/40 cursor-default"
                  : "bg-[#E10600] hover:bg-[#C50500] text-white font-black shadow-sm active:scale-[0.99]"
              }`}
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Conclude Market (Close Trading)</span>
            </button>
          </div>

          {/* Minimal 7-Round Segmented Controller */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#E10600]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Stage Stock Market Round (1 - 7)
                </span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Clicking stages round in Pre-Market (Timer paused until Start)
              </span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-[#070A0F] p-1.5 rounded-lg border border-[#1A2234]">
              {[1, 2, 3, 4, 5, 6, 7].map((lap) => {
                const isCurrent = raceState.currentLap === lap;
                const isCompleted = raceState.currentLap > lap;
                return (
                  <button
                    key={lap}
                    type="button"
                    onClick={() =>
                      stageLap(
                        lap,
                        null,
                        lap === 1
                          ? "Stock market opens upon Market Director Flag-Off. Pre-market warmup in progress."
                          : `Round ${lap - 1} completed. Round ${lap} staged in Pre-Market. Awaiting Market Open.`
                      )
                    }
                    className={`py-2 px-1 rounded-md text-xs font-mono font-bold transition-all flex flex-col items-center justify-center gap-0.5 ${
                      isCurrent
                        ? "bg-[#E10600] text-white shadow-sm shadow-[#E10600]/40 ring-1 ring-white/30"
                        : isCompleted
                        ? "bg-[#0E1520] text-emerald-400 border border-emerald-500/25 hover:border-emerald-500/40"
                        : "bg-transparent text-slate-400 hover:text-white hover:bg-[#141B26]"
                    }`}
                  >
                    <span className="text-xs font-black">R{lap}</span>
                    <span className="text-[9px] uppercase tracking-tighter opacity-80">
                      {isCurrent ? "Active" : isCompleted ? "Done" : `Round ${lap}`}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Minimal Round Duration Configurator */}
          <div className="p-3 rounded-lg bg-[#070A0F] border border-[#1A2234] flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 mr-1">
                <Clock className="w-3.5 h-3.5 text-[#06B6D4]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Duration:
                </span>
              </div>
              <div className="flex items-center gap-1">
                {[5, 10, 15, 20, 25, 30].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handlePresetTimer(m)}
                    className="px-2 py-0.5 rounded bg-[#121720] hover:bg-[#1A2232] text-slate-300 text-[11px] font-mono font-bold border border-[#232B3B] transition-colors"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <form onSubmit={handleSetTimer} className="flex items-center gap-1.5">
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="120"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-12 px-1.5 py-1 rounded bg-[#121720] border border-[#232B3B] text-xs text-white font-mono text-center outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">m</span>
                </div>

                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="59"
                    value={customSeconds}
                    onChange={(e) => setCustomSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                    className="w-12 px-1.5 py-1 rounded bg-[#121720] border border-[#232B3B] text-xs text-white font-mono text-center outline-none"
                  />
                  <span className="text-[10px] text-slate-400 font-mono">s</span>
                </div>

                <button
                  type="submit"
                  className="px-2.5 py-1 rounded bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black text-xs uppercase tracking-wider transition-colors ml-1"
                >
                  Apply
                </button>
              </form>

              {timerSuccess && (
                <span className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{timerSuccess}</span>
                </span>
              )}
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
                  <th className="pb-2.5 text-center">Random Nudge (3–10%)</th>
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
                          onClick={() => handleRandomNudgeStockPrice(s, true)}
                          className="px-2.5 py-1 rounded-md bg-[#10B981]/20 hover:bg-[#10B981]/35 active:scale-95 text-[#10B981] font-mono text-xs font-bold border border-[#10B981]/40 flex items-center gap-1 transition-all shadow-sm"
                          title="Increase price by random 3% to 10%"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
                          <span>Increase (+3–10%)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRandomNudgeStockPrice(s, false)}
                          className="px-2.5 py-1 rounded-md bg-[#E10600]/20 hover:bg-[#E10600]/35 active:scale-95 text-[#FF8080] font-mono text-xs font-bold border border-[#E10600]/40 flex items-center gap-1 transition-all shadow-sm"
                          title="Decrease price by random 3% to 10%"
                        >
                          <TrendingDown className="w-3.5 h-3.5 text-[#FF8080]" />
                          <span>Decrease (-3–10%)</span>
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

        {/* Section 4: Pre-Curated Market News & Telemetry Wire */}
        <section className="p-4 sm:p-5 rounded-xl bg-[#0F141C] border border-[#1E2638] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1A2234] pb-3.5">
            <div>
              <div className="flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-[#06B6D4]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Pre-Curated Market News &amp; Telemetry Wire
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pre-scripted market intelligence and regulatory events. Click <strong>Publish to Players</strong> on any story to instantly push it live to all participants' News feeds.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowCustomNewsComposer((prev) => !prev)}
                className="px-3 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white text-xs font-bold border border-[#232B3B] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                {showCustomNewsComposer ? <X className="w-3.5 h-3.5 text-rose-400" /> : <Plus className="w-3.5 h-3.5 text-[#06B6D4]" />}
                <span>{showCustomNewsComposer ? "Close Composer" : "+ Custom Story"}</span>
              </button>

              {(marketNews || []).length > 0 && (
                <button
                  type="button"
                  onClick={handleClearLiveNews}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold border border-rose-500/30 transition-colors flex items-center gap-1.5 shadow-sm"
                  title="Wipe published stories from live participant feed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Feed</span>
                </button>
              )}

              <Link
                to="/news"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] text-xs font-bold border border-[#06B6D4]/30 transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span>Live Feed ({marketNews?.length || 0})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {newsPublishNotice && (
            <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2 font-medium animate-fadeIn">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{newsPublishNotice}</span>
            </div>
          )}

          {/* Optional Collapsible Custom News Composer */}
          {showCustomNewsComposer && (
            <form onSubmit={handlePublishCustomNews} className="p-4 rounded-xl bg-[#070A0F] border border-[#06B6D4]/40 space-y-3.5 animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#1A2234]">
                <div className="text-xs font-black uppercase tracking-wider text-[#06B6D4] flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5" />
                  <span>Compose Ad-Hoc Breaking Headline</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomNewsComposer(false)}
                  className="text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                <div className="lg:col-span-8">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Headline Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Semiconductor Secures ₹3,500 Cr AI Accelerator Contract"
                    value={customHeadline}
                    onChange={(e) => setCustomHeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E131B] border border-[#1A2234] focus:border-[#06B6D4] text-xs text-white outline-none"
                  />
                </div>

                <div className="lg:col-span-4">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Category
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E131B] border border-[#1A2234] focus:border-[#06B6D4] text-xs text-white outline-none"
                  >
                    <option value="ANNOUNCEMENT">Official Announcement</option>
                    <option value="EQUITIES">Equities &amp; Stocks</option>
                    <option value="TECH">Tech &amp; AI</option>
                    <option value="ENERGY">Energy &amp; EV</option>
                    <option value="MACRO">Macro &amp; Rates</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Summary &amp; Briefing *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Details that will appear on player news feed..."
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#0E131B] border border-[#1A2234] focus:border-[#06B6D4] text-xs text-white outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Market Sentiment
                  </label>
                  <select
                    value={customSentiment}
                    onChange={(e) => setCustomSentiment(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E131B] border border-[#1A2234] text-xs text-white outline-none"
                  >
                    <option value="BULLISH">Bullish (Positive)</option>
                    <option value="BEARISH">Bearish (Negative)</option>
                    <option value="NEUTRAL">Neutral (Informational)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Tag Ticker (Optional)
                  </label>
                  <select
                    value={customTicker}
                    onChange={(e) => setCustomTicker(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0E131B] border border-[#1A2234] text-xs text-white outline-none"
                  >
                    <option value="">General Market</option>
                    {(stocks || []).map((s) => (
                      <option key={s.ticker} value={s.ticker}>
                        {s.ticker} - {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={customIsOfficial}
                      onChange={(e) => setCustomIsOfficial(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#06B6D4]"
                    />
                    <span>Official Announcement</span>
                  </label>
                </div>
              </div>

              <div className="pt-1 flex justify-end">
                <button
                  type="submit"
                  disabled={publishingStoryId === "custom"}
                  className="px-5 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{publishingStoryId === "custom" ? "Publishing..." : "Publish Custom Story"}</span>
                </button>
              </div>
            </form>
          )}

          {/* Category Filter Chips & Quick Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {newsCategories.map((cat) => {
                const isSelected = selectedNewsCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedNewsCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#06B6D4] text-slate-950 shadow-sm shadow-[#06B6D4]/30"
                        : "bg-[#070A0F] text-slate-400 hover:text-white border border-[#1A2234] hover:border-slate-600"
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search predefined stories..."
                value={newsSearchTerm}
                onChange={(e) => setNewsSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-[#070A0F] border border-[#1A2234] focus:border-[#06B6D4] text-xs text-white outline-none placeholder:text-slate-600 transition-colors"
              />
            </div>
          </div>

          {/* Pre-Defined News Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-1">
            {filteredPredefinedNews.map((story) => {
              const isLive = publishedStoryTitles.has((story.title || "").trim().toLowerCase());
              const isPublishing = publishingStoryId === (story.id || story.title);

              return (
                <div
                  key={story.id || story.title}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between gap-3 ${
                    isLive
                      ? "bg-[#070A0F] border-[#10B981]/40 shadow-sm shadow-[#10B981]/5"
                      : "bg-[#070A0F] border-[#1A2234] hover:border-[#2A344A]"
                  }`}
                >
                  <div className="space-y-2">
                    {/* Card Tags Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase tracking-wider ${
                            story.category === "TECH"
                              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30"
                              : story.category === "ENERGY"
                              ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                              : story.category === "EQUITIES"
                              ? "bg-purple-500/15 text-purple-400 border border-purple-500/30"
                              : story.category === "MACRO"
                              ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                              : "bg-rose-500/15 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {story.category}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase flex items-center gap-1 ${
                            story.sentiment === "BULLISH"
                              ? "bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30"
                              : story.sentiment === "BEARISH"
                              ? "bg-[#E10600]/15 text-[#FF8080] border border-[#E10600]/30"
                              : "bg-slate-800 text-slate-300 border border-slate-700"
                          }`}
                        >
                          {story.sentiment === "BULLISH" && <TrendingUp className="w-3 h-3" />}
                          {story.sentiment === "BEARISH" && <TrendingDown className="w-3 h-3" />}
                          <span>{story.sentiment}</span>
                        </span>

                        {story.ticker && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#161B24] text-slate-300 border border-[#232B3B]">
                            ${story.ticker}
                          </span>
                        )}
                      </div>

                      {/* Live Status Badge */}
                      {isLive ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1 font-mono shrink-0">
                          <Check className="w-3 h-3" />
                          <span>LIVE ON FEED</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800/60 text-slate-400 border border-slate-700/60 font-mono shrink-0">
                          READY TO PUBLISH
                        </span>
                      )}
                    </div>

                    {/* Headline Title */}
                    <h3 className="text-sm font-bold text-white leading-snug group-hover:text-[#06B6D4] transition-colors">
                      {story.title}
                    </h3>

                    {/* Summary Briefing */}
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  {/* Card Action Footer */}
                  <div className="pt-2.5 border-t border-[#141A24] flex items-center justify-between gap-3">
                    <span className="text-[10px] text-slate-500 font-mono truncate max-w-[180px] sm:max-w-[240px]">
                      Source: {story.source || "Market Desk Wire"}
                    </span>

                    {/* Publish Button */}
                    <button
                      type="button"
                      disabled={isPublishing}
                      onClick={() => handlePublishPredefinedStory(story)}
                      className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shrink-0 shadow-sm active:scale-95 disabled:opacity-50 ${
                        isLive
                          ? "bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40"
                          : "bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black shadow-md shadow-[#06B6D4]/20"
                      }`}
                    >
                      {isPublishing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Publishing...</span>
                        </>
                      ) : isLive ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Live ✓ (Re-Send)</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Publish to Players</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredPredefinedNews.length === 0 && (
            <div className="p-8 text-center text-xs text-slate-500 bg-[#070A0F] rounded-xl border border-[#1A2234]">
              No predefined news stories match the filter "{selectedNewsCategory}" or search query "{newsSearchTerm}".
            </div>
          )}

          {/* Quick Preview of Recent 3 Articles on Live Feed */}
          {(marketNews || []).length > 0 && (
            <div className="pt-3 border-t border-[#1A2234]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Currently Live on Participant Feed ({marketNews.length} articles total)
                </span>
                <Link
                  to="/news"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-[#06B6D4] hover:underline flex items-center gap-1"
                >
                  <span>Open Feed in New Tab</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-1.5">
                {(marketNews || []).slice(0, 3).map((n, idx) => (
                  <div
                    key={n._id || n.id || idx}
                    className="p-2.5 rounded-lg bg-[#070A0F] border border-[#1A2234] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase shrink-0 ${
                          n.sentiment === "BULLISH"
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : n.sentiment === "BEARISH"
                            ? "bg-[#E10600]/15 text-[#FF8080]"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {n.category || "NEWS"}
                      </span>
                      <span className="font-bold text-white truncate">{n.title}</span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono shrink-0">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        {/* Section 5: Canonical 15-Team Grid & Participant Accounts Controller */}
        <section className="p-5 sm:p-6 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[#232B3B] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#E10600]" />
                <h2 className="text-sm font-black uppercase tracking-widest text-white">
                  Canonical 15-Team Grid &amp; Participant Accounts Operations
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Hard-capped grid of 15 canonical teams (#1 to #15) with 30 pre-provisioned participant accounts (1 Leader &amp; 1 Member each). Real-time telemetry heartbeat monitoring with &lt;60s presence calculation.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded bg-[#0A0D12] border border-[#232B3B] text-xs font-mono font-bold text-white">
                {(adminTeamsAndAccounts.length > 0 ? adminTeamsAndAccounts : teams).length} / 15 Teams Active
              </span>

              <button
                type="button"
                onClick={() => setShowCredentialsModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] border border-[#06B6D4]/30 text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>30 Accounts Credentials</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAuditLogsModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white border border-[#232B3B] text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5"
              >
                <History className="w-3.5 h-3.5" />
                <span>Audit Logs</span>
              </button>

              <button
                type="button"
                onClick={() => handleSeedTeams((adminTeamsAndAccounts.length > 0 ? adminTeamsAndAccounts : teams).length > 0)}
                className="px-3 py-1.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{(adminTeamsAndAccounts.length > 0 ? adminTeamsAndAccounts : teams).length === 0 ? "Seed 15 Canonical Teams & Accounts" : "Reset / Re-Seed 15 Teams"}</span>
              </button>
            </div>
          </div>

          {(adminTeamsAndAccounts.length > 0 ? adminTeamsAndAccounts : teams).length === 0 ? (
            <div className="py-12 text-center bg-[#0A0D12] rounded-lg border border-[#1A202C] text-slate-400 text-xs font-medium space-y-3">
              <Users className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-white font-bold">No teams seeded on the competition grid yet.</p>
              <p className="text-slate-400 max-w-md mx-auto">
                Click below to initialize the 15 canonical teams (Team Alpha to Team Phoenix) and pre-provision 30 Leader and Member participant credentials with salted PBKDF2/SHA-256 hashes.
              </p>
              <button
                type="button"
                onClick={() => handleSeedTeams(false)}
                className="px-4 py-2 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-bold uppercase tracking-wider"
              >
                Seed 15 Canonical Teams &amp; 30 Accounts
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {(adminTeamsAndAccounts.length > 0 ? adminTeamsAndAccounts : teams).map((t, idx) => {
                const accounts = t.accounts || [];
                const leaderAccount = accounts.find((a) => a.role === "LEADER");
                const memberAccount = accounts.find((a) => a.role === "MEMBER");
                const teamNum = t.teamNumber || idx + 1;

                return (
                  <div
                    key={t.id || t._id}
                    className="p-4 sm:p-5 rounded-2xl bg-[#0D121B] border border-[#1E293B] hover:border-[#2D3F5E] shadow-xl transition-all space-y-3.5"
                  >
                    {/* Team Header Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2232]">
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1E293B] to-[#0A0D12] border border-[#334155] font-mono font-black text-sm text-[#06B6D4] flex items-center justify-center shrink-0 shadow-inner">
                          #{teamNum}
                        </span>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span className="font-mono font-bold text-xs text-[#06B6D4] bg-[#06B6D4]/10 px-2 py-0.5 rounded border border-[#06B6D4]/25">
                              {t.teamCode}
                            </span>
                            <span className="text-xs text-slate-600">•</span>
                            <h3 className="font-bold text-base text-white tracking-tight">{t.teamName}</h3>
                            
                            {/* Prominent Team Password / PIN Badge */}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-xs font-mono shadow-sm">
                              <Key className="w-3.5 h-3.5 text-[#06B6D4]" />
                              <span className="text-[10px] uppercase font-sans font-extrabold text-cyan-200">Password / PIN:</span>
                              <span className="tracking-widest text-[#22D3EE] font-black text-xs bg-[#051017] px-2 py-0.5 rounded border border-cyan-500/30">
                                {t.teamPin || "1001"}
                              </span>
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-400 flex items-center gap-4 mt-1 font-mono">
                            <span>Portfolio: <strong className="text-white">₹{(t.portfolioValue || t.cashBalance || 100000).toLocaleString("en-IN")}</strong></span>
                            <span>Orders: <strong className="text-white">{t.totalTrades || 0}</strong></span>
                            <span>Status: <strong className={t.status === "ACTIVE" ? "text-[#10B981]" : "text-[#EF4444]"}>{t.status}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Cash Balance & Team Level Controls */}
                      <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                        <div className="font-mono text-xs">
                          {editingTeamId === (t.id || t._id) ? (
                            <div className="flex items-center gap-1">
                              <span className="text-slate-400">₹</span>
                              <input
                                type="number"
                                value={newCashAmount}
                                onChange={(e) => setNewCashAmount(e.target.value)}
                                className="w-24 px-2 py-1 rounded bg-[#0A0D12] border border-[#232B3B] text-xs text-white font-mono outline-none"
                                placeholder={t.cashBalance.toString()}
                                autoFocus
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveTeamCash(t.id || t._id)}
                                className="px-2.5 py-1 rounded bg-[#10B981] hover:bg-[#059669] text-slate-950 text-[10px] font-bold uppercase transition-colors"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTeamId(null);
                                  setNewCashAmount("");
                                }}
                                className="px-2 py-1 rounded bg-[#161B24] text-slate-400 text-[10px] font-bold uppercase hover:text-white"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 bg-[#080B10] px-3 py-1.5 rounded-lg border border-[#1E293B]">
                              <span className="text-slate-400 text-[11px]">Cash:</span>
                              <span className="font-bold text-[#10B981]">₹{t.cashBalance.toLocaleString("en-IN")}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingTeamId(t.id || t._id);
                                  setNewCashAmount(t.cashBalance.toString());
                                }}
                                className="text-[10px] text-[#06B6D4] hover:underline font-bold ml-0.5"
                              >
                                Edit
                              </button>
                            </div>
                          )}
                        </div>

                        {t.activeLeaderSessionId && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                            <span>Connected</span>
                            <button
                              type="button"
                              onClick={() => handleClearSession(t.id || t._id, t.teamName)}
                              className="text-slate-400 hover:text-[#E10600] underline ml-1"
                              title="Reset session lock"
                            >
                              Reset
                            </button>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleOpenEditRoster(t)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white text-[10px] font-bold uppercase border border-[#232B3B] flex items-center gap-1 transition-colors"
                        >
                          <Users className="w-3 h-3 text-[#06B6D4]" />
                          <span>Roster</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            adminUpdateTeam(t.id || t._id, {
                              status: t.status === "ACTIVE" ? "DISQUALIFIED" : "ACTIVE"
                            })
                          }
                          className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase border transition-colors flex items-center gap-1 ${
                            t.status === "ACTIVE"
                              ? "bg-[#161B24] hover:bg-[#F59E0B]/20 text-slate-300 hover:text-[#F59E0B] border-[#232B3B]"
                              : "bg-[#10B981]/20 text-[#10B981] border-[#10B981]/40"
                          }`}
                        >
                          {t.status === "ACTIVE" ? (
                            <>
                              <Lock className="w-3 h-3" />
                              <span>Lock</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3" />
                              <span>Unlock</span>
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Permanently delete team "${t.teamName}" and all associated orders?`)) {
                              adminDeleteTeam(t.id || t._id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-[#161B24] hover:bg-[#E10600] text-slate-400 hover:text-white border border-[#232B3B] transition-colors"
                          title="Delete team"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Participant Accounts 2-Column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      {/* Account 1: Team Leader */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#0C1017] to-[#080B10] border border-[#1A2232] hover:border-[#223046] transition-all flex flex-col justify-between gap-3 shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-[#E10600]/15 text-[#FF6B6B] border border-[#E10600]/30 flex items-center justify-center font-bold text-xs shadow-inner">
                              L
                            </span>
                            <div>
                              <div className="font-mono font-bold text-xs text-white">
                                {leaderAccount ? leaderAccount.username : `${t.teamCode.split("-")[0].toLowerCase()}_leader`}
                              </div>
                              <div className="text-[11px] text-slate-400 font-sans">
                                {t.leaderName || "Team Leader"}
                              </div>
                            </div>
                          </div>

                          {/* Leader Presence Badge */}
                          {leaderAccount ? (
                            leaderAccount.status === "DISABLED" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Disabled
                              </span>
                            ) : leaderAccount.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold shadow-sm shadow-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : leaderAccount.lastLoginAt ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-medium font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Offline ({formatPresenceTime(leaderAccount.lastHeartbeatAt || leaderAccount.lastLoginAt)})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 text-[10px] font-medium font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Never Logged In
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Account Pending Seed</span>
                          )}
                        </div>

                        {/* Leader Password / Credentials Badge */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#05080E] border border-[#151D2A] text-[11px] font-mono">
                          <span className="text-slate-400 font-sans flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-[#10B981]" />
                            <span className="font-semibold text-slate-300">Login Password:</span>
                          </span>
                          <span className="font-mono font-black text-xs text-[#10B981] bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30 tracking-widest shadow-sm">
                            {leaderAccount?.password || t.teamPin || "1001"}
                          </span>
                        </div>

                        {/* Leader Account Actions */}
                        {leaderAccount && (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#161B24] text-[10px]">
                            <span className="text-slate-400 font-mono">
                              Role: <strong className="text-[#FF6B6B] uppercase font-bold">Leader (Trade &amp; Bid)</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={togglingAccountId === leaderAccount._id}
                                onClick={() => handleToggleAccount(leaderAccount._id, leaderAccount.status, leaderAccount.username)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors border ${
                                  leaderAccount.status === "ACTIVE"
                                    ? "bg-[#161B24] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-[#232B3B]"
                                    : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border-emerald-800"
                                }`}
                              >
                                {leaderAccount.status === "ACTIVE" ? "Disable" : "Enable"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResetModal(leaderAccount, t.teamName)}
                                className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white border border-[#232B3B] text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Key className="w-3 h-3 text-[#06B6D4]" />
                                <span>Reset Pass</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Account 2: Team Member */}
                      <div className="p-3.5 rounded-xl bg-gradient-to-b from-[#0C1017] to-[#080B10] border border-[#1A2232] hover:border-[#223046] transition-all flex flex-col justify-between gap-3 shadow-md">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30 flex items-center justify-center font-bold text-xs shadow-inner">
                              M
                            </span>
                            <div>
                              <div className="font-mono font-bold text-xs text-white">
                                {memberAccount ? memberAccount.username : `${t.teamCode.split("-")[0].toLowerCase()}_member`}
                              </div>
                              <div className="text-[11px] text-slate-400 font-sans">
                                {t.member2 || (t.members && t.members[1]) || "Team Member"}
                              </div>
                            </div>
                          </div>

                          {/* Member Presence Badge */}
                          {memberAccount ? (
                            memberAccount.status === "DISABLED" ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-950/60 border border-red-800 text-red-400 text-[10px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Disabled
                              </span>
                            ) : memberAccount.isOnline ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-[10px] font-bold shadow-sm shadow-emerald-500/20">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                              </span>
                            ) : memberAccount.lastLoginAt ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 text-[10px] font-medium font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                                Offline ({formatPresenceTime(memberAccount.lastHeartbeatAt || memberAccount.lastLoginAt)})
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/60 border border-amber-800 text-amber-400 text-[10px] font-medium font-mono">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                Never Logged In
                              </span>
                            )
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Account Pending Seed</span>
                          )}
                        </div>

                        {/* Member Password / Credentials Badge */}
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#05080E] border border-[#151D2A] text-[11px] font-mono">
                          <span className="text-slate-400 font-sans flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-[#06B6D4]" />
                            <span className="font-semibold text-slate-300">Login Password:</span>
                          </span>
                          <span className="font-mono font-black text-xs text-[#06B6D4] bg-[#06B6D4]/15 px-2 py-0.5 rounded border border-[#06B6D4]/30 tracking-widest shadow-sm">
                            {memberAccount?.password || t.teamPin || "1001"}
                          </span>
                        </div>

                        {/* Member Account Actions */}
                        {memberAccount && (
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#161B24] text-[10px]">
                            <span className="text-slate-400 font-mono">
                              Role: <strong className="text-[#06B6D4] uppercase font-bold">Member (View Only)</strong>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={togglingAccountId === memberAccount._id}
                                onClick={() => handleToggleAccount(memberAccount._id, memberAccount.status, memberAccount.username)}
                                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase transition-colors border ${
                                  memberAccount.status === "ACTIVE"
                                    ? "bg-[#161B24] hover:bg-red-950/40 text-slate-400 hover:text-red-400 border-[#232B3B]"
                                    : "bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50 border-emerald-800"
                                }`}
                              >
                                {memberAccount.status === "ACTIVE" ? "Disable" : "Enable"}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleOpenResetModal(memberAccount, t.teamName)}
                                className="px-2.5 py-1 rounded bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white border border-[#232B3B] text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm transition-colors"
                              >
                                <Key className="w-3 h-3 text-[#06B6D4]" />
                                <span>Reset Pass</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
                    4-Digit Security PIN (Numbers Only)
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={editTeamPin}
                    onChange={(e) => setEditTeamPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
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

        {/* Reset Password Modal */}
        {resetModalAccount && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#232B3B] pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-[#E10600]" />
                  <h3 className="text-sm font-black uppercase text-white">
                    Reset Participant Password
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setResetModalAccount(null)}
                  className="text-slate-400 hover:text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              {resetNotice && (
                <div className="p-2.5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>{resetNotice}</span>
                </div>
              )}

              {resetError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{resetError}</span>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="space-y-3">
                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-xs space-y-1">
                  <div className="text-slate-400">Team: <strong className="text-white">{resetModalAccount.teamName}</strong></div>
                  <div className="text-slate-400">Username: <strong className="text-[#06B6D4] font-mono">{resetModalAccount.username}</strong></div>
                  <div className="text-slate-400">Role: <strong className="text-[#FF6B6B]">{resetModalAccount.role}</strong></div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase text-slate-400">
                      New Password *
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateRandomPassword}
                      className="text-[10px] text-[#06B6D4] hover:underline font-mono"
                    >
                      Generate Random
                    </button>
                  </div>
                  <input
                    type="text"
                    maxLength={4}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white font-mono outline-none focus:border-[#06B6D4]"
                    placeholder="Enter 4-digit PIN (numbers only)"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Password must be a 4-digit numeric code.
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 py-2 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50"
                  >
                    {resetLoading ? "Hashing & Saving..." : "Confirm Password Reset"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetModalAccount(null)}
                    className="px-3 py-2 rounded-lg bg-[#161B24] text-slate-300 text-xs font-bold uppercase"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 30 Participant Accounts Credentials Modal */}
        {showCredentialsModal && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl max-h-[90vh] bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-6 shadow-2xl flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-[#232B3B] pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[#E10600]" />
                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Pre-Provisioned 30 Participant Credentials
                    </h3>
                    <p className="text-xs text-slate-400">
                      Standard initial credentials for the 15 canonical motorsport teams (1 Leader &amp; 1 Member each).
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyCredentials}
                    className="px-3 py-1.5 rounded-lg bg-[#161B24] hover:bg-[#232B3B] text-slate-200 text-xs font-bold uppercase transition-colors border border-[#232B3B] flex items-center gap-1.5"
                  >
                    {copiedCredentials ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCredentials ? "Copied All!" : "Copy Text"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadCredentialsCSV}
                    className="px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#06B6D4] border border-[#06B6D4]/30 text-xs font-bold uppercase transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCredentialsModal(false)}
                    className="p-1.5 rounded bg-[#161B24] text-slate-400 hover:text-white text-xs font-bold uppercase ml-2"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Credentials Table */}
              <div className="overflow-y-auto flex-1 border border-[#1E2638] rounded-lg">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#0A0D12] sticky top-0 border-b border-[#232B3B] text-[11px] font-bold uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 px-3">#</th>
                      <th className="py-2.5 px-3">Team</th>
                      <th className="py-2.5 px-3">PIN</th>
                      <th className="py-2.5 px-3">Leader Username</th>
                      <th className="py-2.5 px-3">Leader Initial Pass</th>
                      <th className="py-2.5 px-3">Member Username</th>
                      <th className="py-2.5 px-3">Member Initial Pass</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A202C]">
                    {(adminInitialCredentials || []).map((c) => (
                      <tr key={c.teamCode} className="hover:bg-[#161B24] transition-colors">
                        <td className="py-2 px-3 font-mono text-slate-500">#{c.teamNumber}</td>
                        <td className="py-2 px-3">
                          <div className="font-bold text-white">{c.teamName}</div>
                          <div className="text-[10px] font-mono text-[#06B6D4]">{c.teamCode}</div>
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-400">10{c.teamNumber < 10 ? `0${c.teamNumber}` : c.teamNumber}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">{c.leaderUsername}</td>
                        <td className="py-2 px-3 font-mono text-slate-300 bg-[#0A0D12]/50">{c.leaderInitialPasswordPattern}</td>
                        <td className="py-2 px-3 font-mono font-bold text-white">{c.memberUsername}</td>
                        <td className="py-2 px-3 font-mono text-slate-300 bg-[#0A0D12]/50">{c.memberInitialPasswordPattern}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Security Audit Logs Modal */}
        {showAuditLogsModal && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl max-h-[85vh] bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-6 shadow-2xl flex flex-col space-y-4">
              <div className="flex items-center justify-between border-b border-[#232B3B] pb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <History className="w-5 h-5 text-[#06B6D4]" />
                  <div>
                    <h3 className="text-sm font-black uppercase text-white">
                      Security &amp; Operations Audit Logs
                    </h3>
                    <p className="text-xs text-slate-400">
                      Real-time chronological telemetry trail of logins, status adjustments, and password updates.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAuditLogsModal(false)}
                  className="px-3 py-1.5 rounded-lg bg-[#161B24] text-slate-400 hover:text-white text-xs font-bold uppercase"
                >
                  Close
                </button>
              </div>

              <div className="overflow-y-auto flex-1 border border-[#1E2638] rounded-lg">
                {(adminAuditLogs || []).length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    No security audit events recorded yet.
                  </div>
                ) : (
                  <div className="divide-y divide-[#1A202C]">
                    {(adminAuditLogs || []).map((log, i) => (
                      <div key={log._id || i} className="p-3 flex items-start justify-between gap-3 text-xs hover:bg-[#161B24] transition-colors">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                              log.action === "LOGIN"
                                ? "bg-[#06B6D4]/15 text-[#06B6D4]"
                                : log.action === "PASSWORD_RESET"
                                ? "bg-purple-950/40 text-purple-400 border border-purple-800"
                                : log.action === "STATUS_CHANGE"
                                ? "bg-amber-950/40 text-amber-400 border border-amber-800"
                                : "bg-[#10B981]/15 text-[#10B981]"
                            }`}>
                              {log.action}
                            </span>
                            <span className="font-mono text-slate-400 text-[11px]">
                              Actor: <strong className="text-white">{log.actor}</strong>
                            </span>
                            {log.target && (
                              <span className="font-mono text-slate-500 text-[11px]">
                                Target: {log.target}
                              </span>
                            )}
                          </div>
                          <div className="text-slate-300">{log.details}</div>
                        </div>

                        <div className="text-[10px] font-mono text-slate-500 shrink-0">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
