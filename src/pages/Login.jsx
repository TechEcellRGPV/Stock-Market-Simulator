import { useState, useMemo, useEffect } from "react";
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
  Radio,
  Eye,
  EyeOff,
  Search,
  KeyRound
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

// Exactly 15 Default Teams (Feature C)
const DEFAULT_15_GRID = [
  { teamNumber: 1, teamCode: "ALPHA-01", teamName: "Team Alpha", leaderUsername: "alpha_leader", memberUsername: "alpha_member", defaultPin: "1001" },
  { teamNumber: 2, teamCode: "BRAVO-02", teamName: "Team Bravo", leaderUsername: "bravo_leader", memberUsername: "bravo_member", defaultPin: "1002" },
  { teamNumber: 3, teamCode: "CHARLIE-03", teamName: "Team Charlie", leaderUsername: "charlie_leader", memberUsername: "charlie_member", defaultPin: "1003" },
  { teamNumber: 4, teamCode: "DELTA-04", teamName: "Team Delta", leaderUsername: "delta_leader", memberUsername: "delta_member", defaultPin: "1004" },
  { teamNumber: 5, teamCode: "ECHO-05", teamName: "Team Echo", leaderUsername: "echo_leader", memberUsername: "echo_member", defaultPin: "1005" },
  { teamNumber: 6, teamCode: "FOXTROT-06", teamName: "Team Foxtrot", leaderUsername: "foxtrot_leader", memberUsername: "foxtrot_member", defaultPin: "1006" },
  { teamNumber: 7, teamCode: "GALAXY-07", teamName: "Team Galaxy", leaderUsername: "galaxy_leader", memberUsername: "galaxy_member", defaultPin: "1007" },
  { teamNumber: 8, teamCode: "HORIZON-08", teamName: "Team Horizon", leaderUsername: "horizon_leader", memberUsername: "horizon_member", defaultPin: "1008" },
  { teamNumber: 9, teamCode: "INFINITY-09", teamName: "Team Infinity", leaderUsername: "infinity_leader", memberUsername: "infinity_member", defaultPin: "1009" },
  { teamNumber: 10, teamCode: "JAGUAR-10", teamName: "Team Jaguar", leaderUsername: "jaguar_leader", memberUsername: "jaguar_member", defaultPin: "1010" },
  { teamNumber: 11, teamCode: "KNIGHT-11", teamName: "Team Knight", leaderUsername: "knight_leader", memberUsername: "knight_member", defaultPin: "1011" },
  { teamNumber: 12, teamCode: "LEGENDS-12", teamName: "Team Legends", leaderUsername: "legends_leader", memberUsername: "legends_member", defaultPin: "1012" },
  { teamNumber: 13, teamCode: "MAVERICKS-13", teamName: "Team Mavericks", leaderUsername: "mavericks_leader", memberUsername: "mavericks_member", defaultPin: "1013" },
  { teamNumber: 14, teamCode: "NOVA-14", teamName: "Team Nova", leaderUsername: "nova_leader", memberUsername: "nova_member", defaultPin: "1014" },
  { teamNumber: 15, teamCode: "PHOENIX-15", teamName: "Team Phoenix", leaderUsername: "phoenix_leader", memberUsername: "phoenix_member", defaultPin: "1015" }
];

export default function Login() {
  useSEO({
    title: "Participant Login & Team Authentication",
    description: "Login for Imprenditore 5.0. Secure Leader & Member participant accounts for all 15 competition teams."
  });

  const navigate = useNavigate();
  const {
    teams,
    loginParticipantAccount,
    joinTeam,
    registerTeamSlot,
    raceState
  } = useSimulation();

  const [authMethod, setAuthMethod] = useState("pin"); // Team PIN mode
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [teamSearch, setTeamSearch] = useState("");

  // Available teams list (combining convex teams or fallback 15 grid)
  const gridTeams = useMemo(() => {
    if (Array.isArray(teams) && teams.length > 0) {
      // Sort by teamNumber
      const sorted = [...teams].sort((a, b) => (a.teamNumber || 99) - (b.teamNumber || 99));
      return sorted.slice(0, 15);
    }
    return DEFAULT_15_GRID;
  }, [teams]);

  // Filtered teams for selection
  const filteredTeams = useMemo(() => {
    if (!teamSearch.trim()) return gridTeams;
    const q = teamSearch.toLowerCase();
    return gridTeams.filter(
      (t) =>
        t.teamName.toLowerCase().includes(q) ||
        t.teamCode.toLowerCase().includes(q) ||
        String(t.teamNumber || "").includes(q)
    );
  }, [gridTeams, teamSearch]);

  // Selected Team Code
  const [selectedTeamCode, setSelectedTeamCode] = useState(() => {
    return gridTeams[0]?.teamCode || "KOE-15";
  });

  // Keep selectedTeamCode synchronized with available teams
  useEffect(() => {
    if (gridTeams.length > 0) {
      const exists = gridTeams.some((t) => t.teamCode === selectedTeamCode);
      if (!exists) {
        setSelectedTeamCode(gridTeams[0].teamCode);
      }
    }
  }, [gridTeams, selectedTeamCode]);

  // Selected Role: LEADER or MEMBER
  const [selectedRole, setSelectedRole] = useState("LEADER");

  // Credentials State (Feature D & E)
  const [username, setUsername] = useState("alpha_leader");
  const [password, setPassword] = useState("");

  // PIN Login State (Legacy / Backup)
  const [pinForm, setPinForm] = useState({
    memberName: "",
    teamPin: ""
  });

  // 3-Member Registration Form State
  const [registerForm, setRegisterForm] = useState({
    teamCode: "ALPHA-01",
    teamPin: "",
    leaderName: "",
    member2: "",
    member3: ""
  });

  // Auto-populate default username suggestion when team or role changes
  useEffect(() => {
    const activeTeam = gridTeams.find((t) => t.teamCode === selectedTeamCode) || gridTeams[0];
    if (activeTeam) {
      const slug = (activeTeam.teamCode || "").split("-")[0].toLowerCase();
      const suggestedUser = selectedRole === "LEADER" ? `${slug}_leader` : `${slug}_member`;
      setUsername((prev) => (prev.endsWith("_leader") || prev.endsWith("_member") || !prev ? suggestedUser : prev));
    }
  }, [selectedTeamCode, selectedRole, gridTeams]);

  const activeTeamInfo = useMemo(() => {
    return gridTeams.find((t) => t.teamCode === selectedTeamCode) || gridTeams[0];
  }, [gridTeams, selectedTeamCode]);

  // Submit Handler: Participant Account Login (Feature D)
  const handleCredentialSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username.trim()) {
      setError("Please enter your account username.");
      return;
    }
    if (!password) {
      setError("Please enter your account password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const team = await loginParticipantAccount({
        teamIdentifier: selectedTeamCode,
        role: selectedRole,
        username: username.trim(),
        password
      });

      const roleLabel = selectedRole === "LEADER" ? "Team Leader (Trading Active)" : "Team Member (Shared Telemetry)";
      setSuccess(`Authenticated as ${roleLabel} for ${team.teamName}! Entering cockpit...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      const msg =
        (typeof err?.data === "string" ? err.data : err?.data?.message) ||
        (typeof err?.message === "string" && err.message.includes("Server Error")
          ? "Authentication error. Please check your username and password, or verify with the administrator."
          : err?.message) ||
        "Invalid username or password.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: Backup 4-Digit PIN Login
  const handlePinSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!pinForm.teamPin || !/^\d{4}$/.test(pinForm.teamPin.trim())) {
      setError("Please enter a valid 4-digit numeric team security PIN.");
      return;
    }
    if (!pinForm.memberName || !pinForm.memberName.trim()) {
      setError("Please enter your name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const team = await joinTeam({
        teamIdentifier: selectedTeamCode,
        teamPin: pinForm.teamPin,
        memberName: pinForm.memberName,
        role: selectedRole
      });

      const roleLabel = selectedRole === "LEADER" ? "Team Leader" : "Team Member";
      setSuccess(`Connected to ${team.teamName} as ${roleLabel}! Entering dashboard...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 700);
    } catch (err) {
      let msg =
        (typeof err?.data === "string" ? err.data : err?.data?.message) ||
        err?.message ||
        "Failed to authenticate team.";

      if (typeof msg === "string") {
        msg = msg
          .replace(/^\[.*?\]\s*/g, "")
          .replace(/Server Error:\s*/gi, "")
          .replace(/Uncaught ConvexError:\s*/gi, "")
          .trim();
      }
      setError(msg || "Failed to authenticate team. Please verify team code and 4-digit PIN.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler: 3-Member Grid Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (raceState.isRegistrationOpen === false) {
      setError("Team Registration is currently locked by Race Control. Registration will open on event day.");
      return;
    }

    if (!registerForm.teamPin || !/^\d{4}$/.test(registerForm.teamPin.trim())) {
      setError("Team PIN must be a 4-digit numeric code (e.g. 1001).");
      return;
    }

    const leader = registerForm.leaderName.trim();
    const m2 = registerForm.member2.trim();
    const m3 = registerForm.member3.trim();

    if (!leader || !m2 || !m3) {
      setError("Each team requires exactly 3 members: Team Leader, Member 2, and Member 3.");
      return;
    }

    if (
      leader.toLowerCase() === m2.toLowerCase() ||
      leader.toLowerCase() === m3.toLowerCase() ||
      m2.toLowerCase() === m3.toLowerCase()
    ) {
      setError("All 3 team members must have distinct names.");
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
      const msg =
        (typeof err?.data === "string" ? err.data : err?.data?.message) ||
        (typeof err?.message === "string" && err.message.includes("Server Error")
          ? "Server error registering team slot. Please verify distinct member names."
          : err?.message) ||
        "Failed to register team roster.";
      setError(msg);
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
          Competition Grid Access
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-1">
          15 Teams • Team PIN Access • Shared Portfolio Telemetry
        </p>
      </div>

      {/* Main Authentication Box */}
      <div className="w-full max-w-md bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-7 shadow-xl">
        {/* Mode Header */}
        <div className="flex items-center justify-between p-2.5 mb-5 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-xs text-[#06B6D4]">
          <div className="flex items-center gap-2 font-bold uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>Team PIN Authentication</span>
          </div>
          <span className="text-[10px] bg-[#06B6D4]/20 text-[#06B6D4] px-2 py-0.5 rounded font-mono font-bold">
            GRID ACCESS
          </span>
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

        {/* TEAM PIN AUTHENTICATION FORM */}
        <form onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Select Team (1 of 15) *
              </label>
              <span className="text-[10px] font-mono text-[#06B6D4] font-bold">
                #{activeTeamInfo?.teamNumber || 1} • {activeTeamInfo?.teamCode}
              </span>
            </div>
            <select
              value={selectedTeamCode}
              onChange={(e) => setSelectedTeamCode(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#06B6D4] text-xs text-white outline-none font-medium"
            >
              {gridTeams.map((team, idx) => (
                <option key={team.teamCode || idx} value={team.teamCode} className="bg-[#121720] text-white">
                  #{team.teamNumber || idx + 1} : {team.teamName} [{team.teamCode}]
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Account Role *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedRole("LEADER")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedRole === "LEADER"
                    ? "bg-[#E10600]/15 border-[#E10600] text-white ring-1 ring-[#E10600]"
                    : "bg-[#0A0D12] border-[#232B3B] text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold text-xs uppercase text-[#FF4D4D]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Team Leader</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Authorized to submit live market buy/sell orders
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole("MEMBER")}
                className={`p-2.5 rounded-lg border text-left transition-all ${
                  selectedRole === "MEMBER"
                    ? "bg-[#10B981]/15 border-[#10B981] text-white ring-1 ring-[#10B981]"
                    : "bg-[#0A0D12] border-[#232B3B] text-slate-400 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 font-bold text-xs uppercase text-[#10B981]">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Team Member</span>
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  Shared portfolio telemetry, charts &amp; rankings
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              Participant Name *
            </label>
            <input
              type="text"
              required
              value={pinForm.memberName}
              onChange={(e) => setPinForm({ ...pinForm, memberName: e.target.value })}
              placeholder="Enter your name"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#06B6D4] text-xs text-white placeholder:text-slate-600 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
              4-Digit Security PIN (Numbers Only) *
            </label>
            <div className="relative">
              <input
                type={showPin ? "text" : "password"}
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]*"
                required
                value={pinForm.teamPin}
                onChange={(e) => {
                  const numOnly = e.target.value.replace(/\D/g, "").slice(0, 4);
                  setPinForm({ ...pinForm, teamPin: numOnly });
                }}
                placeholder="e.g. 1001"
                className="w-full pl-3.5 pr-10 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#06B6D4] text-xs text-white placeholder:text-slate-600 outline-none tracking-widest font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-[11px] text-slate-400">
            <span className="text-[#06B6D4] font-bold">Shared Portfolio:</span> Both Leader and Member access the same team balance of <strong className="text-white">₹{(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}</strong>, live holdings, and competition ranking.
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${
              isSubmitting
                ? "bg-[#1A202C] text-slate-500 cursor-not-allowed"
                : selectedRole === "LEADER"
                  ? "bg-[#E10600] hover:bg-[#C50500] text-white shadow-md shadow-[#E10600]/20"
                  : "bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 font-black shadow-md shadow-[#06B6D4]/20"
            }`}
          >
            <span>
              {isSubmitting
                ? "Connecting..."
                : `Enter Dashboard as ${selectedRole === "LEADER" ? "Team Leader" : "Team Member"}`}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Navigation Footer */}
        <div className="mt-5 pt-4 border-t border-[#1A202C] flex items-center justify-between text-xs text-slate-400">
          <Link to="/news" className="text-[#06B6D4] hover:underline flex items-center gap-1 font-semibold">
            <span>Market News &amp; Flashes</span>
          </Link>
          <Link to="/admin" className="text-slate-500 hover:text-slate-300 transition-colors">
            Race Director Access &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
