import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  LogIn,
  AlertCircle,
  CheckCircle,
  Shield,
  Radio,
  Lock,
  Clock,
  UserPlus
} from "lucide-react";
import Navbar from "../components/Navbar";
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

export default function Login() {
  useSEO({
    title: "Team Login & Registration",
    description: "Login for Imprenditore 5.0. Authenticate your 3-member team roster or enter your 4-digit PIN."
  });

  const navigate = useNavigate();
  const { teams, registerTeamSlot, joinTeam, raceState } = useSimulation();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isTeamRegistered = (t) => {
    if (!t) return false;
    if (t.isRegistered) return true;
    if (t.registeredAt && t.registeredAt > 0) return true;
    if (
      t.leaderName &&
      !t.leaderName.toLowerCase().startsWith("team leader") &&
      !t.leaderName.toLowerCase().startsWith("driver lead") &&
      t.leaderName !== "Unassigned"
    ) {
      return true;
    }
    return false;
  };

  const gridTeams = useMemo(() => {
    if (Array.isArray(teams) && teams.length > 0) {
      return teams.slice(0, 15);
    }
    return FALLBACK_15_GRID;
  }, [teams]);

  const availableTeams = useMemo(() => {
    return gridTeams.filter((t) => !isTeamRegistered(t));
  }, [gridTeams]);

  const [loginForm, setLoginForm] = useState({
    teamCode: "RBR-01",
    teamPin: "",
    memberName: "",
    role: "LEADER" // "LEADER" | "MEMBER"
  });

  const [registerForm, setRegisterForm] = useState(() => ({
    teamCode: "RBR-01",
    teamPin: "",
    leaderName: "",
    member2: "",
    member3: ""
  }));

  // Auto-switch register teamCode to first available team if selected is taken
  const effectiveRegisterTeamCode = useMemo(() => {
    if (availableTeams.length === 0) return registerForm.teamCode;
    const isCurrentTaken = gridTeams.some((t) => t.teamCode === registerForm.teamCode && isTeamRegistered(t));
    if (isCurrentTaken) {
      return availableTeams[0].teamCode;
    }
    return registerForm.teamCode;
  }, [availableTeams, gridTeams, registerForm.teamCode]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!loginForm.teamPin || loginForm.teamPin.trim().length !== 4) {
      setError("Please enter a valid 4-digit PIN.");
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

      setSuccess(`Authenticated as ${team.teamName}! Redirecting...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
    } catch (err) {
      setError(err?.message || "Failed to authenticate.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (raceState.isRegistrationOpen === false) {
      setError("Team Registration is currently locked by Race Control.");
      return;
    }

    const selected = gridTeams.find((t) => t.teamCode === effectiveRegisterTeamCode);
    if (selected && isTeamRegistered(selected)) {
      setError(`Team "${selected.teamName}" (${selected.teamCode}) is already registered by another player. Please select an available team.`);
      return;
    }

    if (!registerForm.teamPin || registerForm.teamPin.trim().length !== 4) {
      setError("4-digit Team PIN is required.");
      return;
    }

    if (!registerForm.leaderName.trim() || !registerForm.member2.trim() || !registerForm.member3.trim()) {
      setError("Each team requires 3 members: Team Leader, Member 2, and Member 3.");
      return;
    }

    setIsSubmitting(true);
    try {
      const team = await registerTeamSlot({
        teamCode: effectiveRegisterTeamCode,
        teamPin: registerForm.teamPin,
        leaderName: registerForm.leaderName,
        member2: registerForm.member2,
        member3: registerForm.member3
      });

      setSuccess(`Team ${team.teamName} confirmed! Redirecting...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 600);
    } catch (err) {
      setError(err?.message || "Failed to register team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="max-w-md w-full bg-[#0D121D] rounded-2xl border border-[#1A2336] p-6 sm:p-8 space-y-6 shadow-xl">
          {/* Header */}
          <div className="text-center space-y-1">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {mode === "login" ? "Team Sign In" : "Register Team Roster"}
            </h1>
            <p className="text-xs text-slate-400">
              {mode === "login"
                ? "Enter your team code and 4-digit PIN to access cockpit"
                : "Register exactly 3 team members to secure your grid slot"}
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-[#090D14] border border-[#1A2336] gap-1">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); setSuccess(""); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-[#161F30] text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); setSuccess(""); }}
              className={`py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-[#161F30] text-emerald-400 shadow-xs"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Tab 1: Login Form */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Team
                </label>
                <select
                  value={loginForm.teamCode}
                  onChange={(e) => setLoginForm({ ...loginForm, teamCode: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white outline-none"
                >
                  {gridTeams.map((team) => (
                    <option key={team.teamCode} value={team.teamCode} className="bg-[#0D121D] text-white">
                      {team.teamCode} — {team.teamName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Toggle */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginForm({ ...loginForm, role: "LEADER" })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      loginForm.role === "LEADER"
                        ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                        : "bg-[#090D14] border-[#1A2336] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Shield className="w-3.5 h-3.5" />
                      <span>Leader</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Executes trades</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLoginForm({ ...loginForm, role: "MEMBER" })}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      loginForm.role === "MEMBER"
                        ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-400"
                        : "bg-[#090D14] border-[#1A2336] text-slate-400 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Radio className="w-3.5 h-3.5" />
                      <span>Member</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">View-only telemetry</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Smith"
                  value={loginForm.memberName}
                  onChange={(e) => setLoginForm({ ...loginForm, memberName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  4-Digit Security PIN
                </label>
                <input
                  type="password"
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={loginForm.teamPin}
                  onChange={(e) => setLoginForm({ ...loginForm, teamPin: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none font-mono tracking-widest"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{isSubmitting ? "Connecting..." : "Sign In to Cockpit"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Tab 2: Register Form */}
          {mode === "register" && (
            !raceState.isRegistrationOpen ? (
              <div className="py-6 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/20">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Registration Locked</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Registration will open prior to competition flag-off
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Select Team
                    </label>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {availableTeams.length} of {gridTeams.length} available
                    </span>
                  </div>

                  {availableTeams.length === 0 ? (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs text-center">
                      All 15 teams are already registered! Please switch to the <strong>Sign In</strong> tab.
                    </div>
                  ) : (
                    <select
                      value={effectiveRegisterTeamCode}
                      onChange={(e) => setRegisterForm((prev) => ({ ...prev, teamCode: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white outline-none"
                    >
                      {gridTeams.map((team) => {
                        const registered = isTeamRegistered(team);
                        return (
                          <option
                            key={team.teamCode}
                            value={team.teamCode}
                            disabled={registered}
                            className={`bg-[#0D121D] ${registered ? "text-slate-500" : "text-white"}`}
                          >
                            {team.teamCode} — {team.teamName} {registered ? "(Registered - Taken)" : "(Available)"}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                    Set 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="e.g. 1001"
                    value={registerForm.teamPin}
                    onChange={(e) => setRegisterForm({ ...registerForm, teamPin: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none font-mono tracking-widest"
                  />
                </div>

                <div className="space-y-2 pt-1 border-t border-[#1A2336]">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    3-Member Roster
                  </span>

                  <input
                    type="text"
                    required
                    placeholder="Team Leader Name"
                    value={registerForm.leaderName}
                    onChange={(e) => setRegisterForm({ ...registerForm, leaderName: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Member 2 Name"
                    value={registerForm.member2}
                    onChange={(e) => setRegisterForm({ ...registerForm, member2: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none"
                  />

                  <input
                    type="text"
                    required
                    placeholder="Member 3 Name"
                    value={registerForm.member3}
                    onChange={(e) => setRegisterForm({ ...registerForm, member3: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-[#090D14] border border-[#1A2336] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xs"
                >
                  <span>{isSubmitting ? "Registering..." : "Confirm Team Roster"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )
          )}
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400">
        <Link to="/" className="hover:text-slate-300 transition-colors">
          Return to Home
        </Link>
      </footer>
    </div>
  );
}
