import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  LogIn,
  AlertCircle,
  CheckCircle,
  Flag,
  Lock,
  Clock,
  Shield,
  Users,
  UserCheck,
  Radio
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

const FALLBACK_15_GRID = [
  { teamCode: "RBR-01", teamName: "Oracle Red Bull Racing", defaultPin: "1001" },
  { teamCode: "FER-02", teamName: "Scuderia Ferrari HP", defaultPin: "1002" },
  { teamCode: "MER-03", teamName: "Mercedes-AMG Petronas", defaultPin: "1003" },
  { teamCode: "MCL-04", teamName: "McLaren Formula 1 Team", defaultPin: "1004" },
  { teamCode: "AST-05", teamName: "Aston Martin Aramco", defaultPin: "1005" },
  { teamCode: "ALP-06", teamName: "BWT Alpine Motorsport", defaultPin: "1006" },
  { teamCode: "WIL-07", teamName: "Williams Racing", defaultPin: "1007" },
  { teamCode: "SAU-08", teamName: "Stake F1 Kick Sauber", defaultPin: "1008" },
  { teamCode: "VCB-09", teamName: "Visa Cash App RB", defaultPin: "1009" },
  { teamCode: "HAA-10", teamName: "MoneyGram Haas F1 Team", defaultPin: "1010" },
  { teamCode: "POR-11", teamName: "Porsche Motorsport Formula", defaultPin: "1011" },
  { teamCode: "AUD-12", teamName: "Audi Sport Racing", defaultPin: "1012" },
  { teamCode: "BMW-13", teamName: "BMW M Motorsport", defaultPin: "1013" },
  { teamCode: "TOY-14", teamName: "Toyota Gazoo Racing", defaultPin: "1014" },
  { teamCode: "KOE-15", teamName: "Koenigsegg Racing Dynamics", defaultPin: "1015" }
];

/**
 * @file Login.jsx
 * @description Paddock Access & Authentication Gate for Imprenditore 5.0.
 * Enforces:
 * 1. 15 Pre-decided Motorsport Teams Grid.
 * 2. Exactly 3 Members per Team: Leader, Strategist, Telemetry Analyst.
 * 3. Role-Based Access: Team Leader (exclusive bidding privileges, 1 active login session) vs Team Member (spectator view-only).
 */
export default function Login() {
  useSEO({
    title: "Paddock Login & Team Registration",
    description: "Enter the Paddock Lounge for Imprenditore 5.0. Authenticate your 3-member team roster or enter your 4-digit PIN."
  });

  const navigate = useNavigate();
  const { teams, registerTeamSlot, joinTeam, raceState } = useSimulation();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available teams list (combining convex teams or fallback canonical list)
  const gridTeams = useMemo(() => {
    if (Array.isArray(teams) && teams.length > 0) {
      return teams.slice(0, 15);
    }
    return FALLBACK_15_GRID;
  }, [teams]);

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    teamCode: "RBR-01",
    teamPin: "",
    memberName: "",
    role: "LEADER" // "LEADER" | "MEMBER"
  });

  // 3-Member Registration Form State
  const [registerForm, setRegisterForm] = useState({
    teamCode: "RBR-01",
    teamPin: "",
    leaderName: "",
    member2: "",
    member3: ""
  });

  const selectedLoginTeam = useMemo(() => {
    return gridTeams.find((t) => t.teamCode === loginForm.teamCode) || gridTeams[0];
  }, [gridTeams, loginForm.teamCode]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginForm.teamPin || loginForm.teamPin.trim().length !== 4) {
      setError("Please enter a valid 4-digit team security PIN.");
      return;
    }
    if (!loginForm.memberName || !loginForm.memberName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const team = await joinTeam({
        teamIdentifier: loginForm.teamCode,
        teamPin: loginForm.teamPin,
        memberName: loginForm.memberName,
        role: loginForm.role
      });

      const roleLabel = loginForm.role === "LEADER" ? "Team Leader (Bidding Access)" : "Team Member (Spectator Mode)";
      setSuccess(`Connected to ${team.teamName} as ${roleLabel}! Entering cockpit...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      setError(err?.message || "Failed to authenticate team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (raceState.isRegistrationOpen === false) {
      setError("Team Registration is currently locked by Race Control. Registration will open on event day.");
      return;
    }

    if (!registerForm.teamPin || registerForm.teamPin.trim().length !== 4) {
      setError("4-digit Team PIN is required.");
      return;
    }

    if (!registerForm.leaderName.trim() || !registerForm.member2.trim() || !registerForm.member3.trim()) {
      setError("Each team requires exactly 3 distinct members: Team Leader, Member 2 (Strategist), and Member 3 (Telemetry Analyst).");
      return;
    }

    setIsSubmitting(true);
    try {
      const team = await registerTeamSlot({
        teamCode: registerForm.teamCode,
        teamPin: registerForm.teamPin,
        leaderName: registerForm.leaderName,
        member2: registerForm.member2,
        member3: registerForm.member3
      });

      setSuccess(`Team ${team.teamName} [${team.teamCode}] 3-member roster confirmed! Logged in as Team Leader.`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 900);
    } catch (err) {
      setError(err?.message || "Failed to register team roster.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-center items-center px-4 sm:px-6 py-10 font-sans">
      {/* Header Link and Logos */}
      <div className="mb-6 text-center max-w-md">
        <div className="flex items-center justify-center gap-3 mb-3">
          <img src="/rgpv-logo.jpeg" alt="RGPV Bhopal" className="h-8 w-8 object-contain rounded-full bg-white p-0.5" />
          <img src="/logo.png" alt="E-Cell RGPV" className="h-8 object-contain" />
          <img src="/logo_D.png" alt="Imprenditore 5.0" className="h-8 object-contain" />
        </div>
        <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#E10600] hover:text-[#FF4D4D] transition-colors">
          <Flag className="w-3.5 h-3.5" />
          <span>E-Cell RGPV : Imprenditore 5.0</span>
        </Link>
        <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tight text-white mt-1">
          Paddock Entry
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          15 Canonical Teams : Exactly 3 Members per Team
        </p>
      </div>

      {/* Main Login / Roster Box */}
      <div className="w-full max-w-md bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-7 shadow-sm">
        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 gap-1 bg-[#0A0D12] p-1 rounded-lg border border-[#1A202C] mb-5">
          <button
            type="button"
            onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
            className={`py-2 rounded text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              mode === "login"
                ? "bg-[#10B981] text-slate-950 font-black shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Team Login</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
            className={`py-2 rounded text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
              mode === "register"
                ? "bg-[#E10600] text-white shadow-sm"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Register 3 Members</span>
          </button>
        </div>

        {/* Error / Success Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-[#E10600]/10 border border-[#E10600]/30 text-xs text-[#FF8080] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E10600]" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-[#10B981]/10 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 text-[#10B981]" />
            <span>{success}</span>
          </div>
        )}

        {/* Tab 1: Team Login with Role Select */}
        {mode === "login" && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Team Grid Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Select Your Grid Team (1 of 15) *
              </label>
              <select
                value={loginForm.teamCode}
                onChange={(e) => setLoginForm({ ...loginForm, teamCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#10B981] text-xs text-white outline-none font-medium"
              >
                {gridTeams.map((team) => (
                  <option key={team.teamCode} value={team.teamCode} className="bg-[#121720] text-white">
                    {team.teamCode} : {team.teamName}
                  </option>
                ))}
              </select>
              {selectedLoginTeam && (
                <div className="mt-1 text-[11px] text-slate-400 font-mono">
                  Assigned Team: <span className="text-[#10B981] font-bold">{selectedLoginTeam.teamName}</span>
                </div>
              )}
            </div>

            {/* Role Selection Toggle */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Authentication Role *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLoginForm({ ...loginForm, role: "LEADER" })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    loginForm.role === "LEADER"
                      ? "bg-[#E10600]/15 border-[#E10600] text-white"
                      : "bg-[#0A0D12] border-[#232B3B] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-xs uppercase text-[#FF4D4D]">
                    <Shield className="w-3.5 h-3.5" />
                    <span>Team Leader</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Exclusive Bidding Access (1 active login session)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginForm({ ...loginForm, role: "MEMBER" })}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    loginForm.role === "MEMBER"
                      ? "bg-[#10B981]/15 border-[#10B981] text-white"
                      : "bg-[#0A0D12] border-[#232B3B] text-slate-400 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-xs uppercase text-[#10B981]">
                    <Radio className="w-3.5 h-3.5" />
                    <span>Team Member</span>
                  </div>
                  <div className="text-[10px] text-slate-400 leading-tight">
                    Spectator View-Only (Telemetry, charts, orders)
                  </div>
                </button>
              </div>
            </div>

            {/* Member Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                {loginForm.role === "LEADER" ? "Team Leader Driver Name *" : "Teammate Name (Strategist / Telemetry) *"}
              </label>
              <input
                type="text"
                required
                placeholder={loginForm.role === "LEADER" ? "Enter designated Team Leader name" : "Enter your member name"}
                value={loginForm.memberName}
                onChange={(e) => setLoginForm({ ...loginForm, memberName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#10B981] text-xs text-white placeholder:text-slate-600 outline-none"
              />
            </div>

            {/* 4-Digit PIN */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                4-Digit Team Security PIN *
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="Enter 4-digit PIN"
                value={loginForm.teamPin}
                onChange={(e) => setLoginForm({ ...loginForm, teamPin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#10B981] text-xs text-white placeholder:text-slate-600 outline-none tracking-widest font-mono"
              />
            </div>

            <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-[11px] text-slate-400">
              {loginForm.role === "LEADER" ? (
                <span>
                  <strong className="text-[#FF4D4D] font-bold">Leader Privilege:</strong> Only the Team Leader can submit market orders and bids. Only 1 active leader device session is allowed.
                </span>
              ) : (
                <span>
                  <strong className="text-[#10B981] font-bold">Spectator Mode:</strong> Members 2 &amp; 3 have real-time live access to portfolio valuation, telemetry charts, order ledger, and competition leaderboard.
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                isSubmitting
                  ? "bg-[#1A202C] text-slate-500 cursor-not-allowed"
                  : loginForm.role === "LEADER"
                    ? "bg-[#E10600] hover:bg-[#C50500] text-white"
                    : "bg-[#10B981] hover:bg-[#059669] text-slate-950 font-black"
              }`}
            >
              <span>{isSubmitting ? "Connecting to Paddock..." : loginForm.role === "LEADER" ? "Enter Cockpit as Leader" : "Enter Cockpit in Spectator Mode"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Tab 2: Register Team Roster (Strictly 3 Members) */}
        {mode === "register" && (
          !raceState.isRegistrationOpen ? (
            <div className="py-4 text-center space-y-4">
              <div className="w-12 h-12 rounded-xl bg-[#E10600]/15 text-[#E10600] flex items-center justify-center mx-auto border border-[#E10600]/30">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase italic text-white">
                  Registration Locked
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                  Team roster registration is currently locked by Race Control. Registration will open on event day.
                </p>
              </div>

              {raceState.scheduledStartTime && (
                <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-[11px] text-[#EAB308] font-medium flex items-center justify-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Starts: {raceState.scheduledStartTime}</span>
                </div>
              )}

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-[#161B24] hover:bg-[#1D232E] text-slate-200 text-xs font-bold uppercase tracking-wider border border-[#232B3B] transition-colors"
              >
                <span>View Event Countdown On Home</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              {/* Select Allocated Grid Slot */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Select Allocated Grid Slot (1 of 15) *
                </label>
                <select
                  value={registerForm.teamCode}
                  onChange={(e) => setRegisterForm({ ...registerForm, teamCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white outline-none font-medium"
                >
                  {gridTeams.map((team) => (
                    <option key={team.teamCode} value={team.teamCode} className="bg-[#121720] text-white">
                      {team.teamCode} : {team.teamName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Set 4-digit PIN */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Set 4-Digit Security PIN *
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="e.g. 1001"
                  value={registerForm.teamPin}
                  onChange={(e) => setRegisterForm({ ...registerForm, teamPin: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none tracking-widest font-mono"
                />
              </div>

              {/* Exact 3 Members Section */}
              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-300">
                  <UserCheck className="w-4 h-4 text-[#E10600]" />
                  <span>Mandatory 3-Member Roster</span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Member 1: Team Leader (Driver Lead - Bidding Access) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (Team Leader)"
                    value={registerForm.leaderName}
                    onChange={(e) => setRegisterForm({ ...registerForm, leaderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#121720] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Member 2: Strategist (Spectator Mode) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (Strategist)"
                    value={registerForm.member2}
                    onChange={(e) => setRegisterForm({ ...registerForm, member2: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#121720] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Member 3: Telemetry Analyst (Spectator Mode) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name (Telemetry Analyst)"
                    value={registerForm.member3}
                    onChange={(e) => setRegisterForm({ ...registerForm, member3: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#121720] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-[11px] text-slate-400">
                Starting capital of <strong className="text-[#10B981]">₹{(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}</strong> is allocated to this team slot upon registration.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
                  isSubmitting
                    ? "bg-[#1A202C] text-slate-500 cursor-not-allowed"
                    : "bg-[#E10600] hover:bg-[#C50500] text-white"
                }`}
              >
                <span>{isSubmitting ? "Confirming Roster..." : "Confirm 3-Member Roster"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )
        )}
      </div>

      {/* Return to Home link */}
      <div className="mt-6 text-center">
        <Link to="/" className="text-xs text-slate-400 hover:text-slate-200 transition-colors uppercase tracking-wider font-bold">
          Back to Event Home
        </Link>
      </div>
    </div>
  );
}
