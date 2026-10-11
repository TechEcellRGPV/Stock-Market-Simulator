import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowRight,
  UserPlus,
  LogIn,
  AlertCircle,
  CheckCircle,
  Flag,
  Lock,
  Clock
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

/**
 * @file Login.jsx
 * @description Paddock Access & Authentication Gate for Imprenditore 5.0.
 * Provides two primary interaction modes:
 * 1. Create Team: Registers a new team on the event grid with initial starting capital
 *    (guarded by the admin Registration Gate).
 * 2. Join Team: Authenticates drivers into existing team sessions using team code/name and 4-digit PIN.
 *
 * Logged-in teams are held in the Paddock Waiting Lounge until flag-off.
 *
 * @returns {JSX.Element} Authentication portal or registration locked alert
 */
export default function Login() {
  useSEO({
    title: "Paddock Login & Team Registration",
    description: "Enter the Paddock Lounge for Imprenditore 5.0. Register your collegiate trading team or enter your 4-digit PIN to access the cockpit."
  });

  const navigate = useNavigate();
  const { createTeam, joinTeam, raceState } = useSimulation();

  const [mode, setMode] = useState("create"); // "create" | "join"
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Team Form
  const [createForm, setCreateForm] = useState({
    teamName: "",
    teamPin: "",
    leaderName: "",
    member2: "",
    member3: "",
    member4: ""
  });

  // Join Team Form
  const [joinForm, setJoinForm] = useState({
    teamIdentifier: "",
    teamPin: "",
    memberName: ""
  });

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (raceState.isRegistrationOpen === false) {
      setError("Team Registration is currently locked by Race Control. Registration will open on event day.");
      return;
    }

    setIsSubmitting(true);
    try {
      const memberNames = [createForm.member2, createForm.member3, createForm.member4].filter(Boolean);
      const team = await createTeam({
        teamName: createForm.teamName,
        teamPin: createForm.teamPin,
        leaderName: createForm.leaderName,
        memberNames
      });

      setSuccess(`Team ${team.teamName} registered! Team Code: ${team.teamCode}`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (err) {
      setError(err?.message || "Failed to register team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    setIsSubmitting(true);
    try {
      const team = await joinTeam({
        teamIdentifier: joinForm.teamIdentifier,
        teamPin: joinForm.teamPin,
        memberName: joinForm.memberName
      });

      setSuccess(`Connected to ${team.teamName}! Entering cockpit...`);
      setTimeout(() => {
        navigate("/dashboard");
      }, 800);
    } catch (err) {
      setError(err?.message || "Failed to join team.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white flex flex-col justify-center items-center px-4 sm:px-6 py-10 font-sans">
      {/* Header Link & Logos */}
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
          Register a new team or join an existing team session
        </p>
      </div>

      {/* Main Login Box */}
      <div className="w-full max-w-md bg-[#121720] rounded-xl border border-[#232B3B] p-5 sm:p-7 shadow-sm">
        {/* Mode Switch Tabs: 2 Tabs only */}
        <div className="grid grid-cols-2 gap-1 bg-[#0A0D12] p-1 rounded-lg border border-[#1A202C] mb-5">
          <button
            type="button"
            onClick={() => { setMode("create"); setError(""); setSuccess(""); }}
            className={`py-2 rounded text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${mode === "create"
                ? "bg-[#E10600] text-white"
                : "text-slate-400 hover:text-white"
              }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Create Team</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode("join"); setError(""); setSuccess(""); }}
            className={`py-2 rounded text-xs font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 ${mode === "join"
                ? "bg-[#10B981] text-slate-950 font-black"
                : "text-slate-400 hover:text-white"
              }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Join Team</span>
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

        {/* Tab 1: Create Team */}
        {mode === "create" && (
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
                  Team registration is currently closed. The Race Director will open paddock registrations on the official event day.
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
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                  Team / Scuderia Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Racing, Scuderia Alpha"
                  value={createForm.teamName}
                  onChange={(e) => setCreateForm({ ...createForm, teamName: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    4-Digit Team PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="e.g. 4821"
                    value={createForm.teamPin}
                    onChange={(e) => setCreateForm({ ...createForm, teamPin: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none tracking-widest font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Team Leader Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rohan Sharma"
                    value={createForm.leaderName}
                    onChange={(e) => setCreateForm({ ...createForm, leaderName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Teammate Names (Optional)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Driver 2"
                    value={createForm.member2}
                    onChange={(e) => setCreateForm({ ...createForm, member2: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Driver 3"
                    value={createForm.member3}
                    onChange={(e) => setCreateForm({ ...createForm, member3: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Driver 4"
                    value={createForm.member4}
                    onChange={(e) => setCreateForm({ ...createForm, member4: e.target.value })}
                    className="w-full px-2.5 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white placeholder:text-slate-600 outline-none"
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#0A0D12] border border-[#1A202C] text-[11px] text-slate-400">
                <strong className="text-white font-bold">Rule:</strong> Initial wallet credit of <strong className="text-[#10B981]">₹{(raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}</strong> is issued immediately upon team registration.
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm ${isSubmitting
                    ? "bg-[#1A202C] text-slate-500 cursor-not-allowed"
                    : "bg-[#E10600] hover:bg-[#C50500] text-white"
                  }`}
              >
                <span>{isSubmitting ? "Registering Team..." : "Register Team & Enter Grid"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )
        )}

        {/* Tab 2: Join Team */}
        {mode === "join" && (
          <form onSubmit={handleJoinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Team Code or Registered Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. APEX-501 or Apex Racing"
                value={joinForm.teamIdentifier}
                onChange={(e) => setJoinForm({ ...joinForm, teamIdentifier: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#10B981] text-xs text-white placeholder:text-slate-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                4-Digit Team Security PIN *
              </label>
              <input
                type="password"
                maxLength={4}
                required
                placeholder="Enter 4-digit PIN"
                value={joinForm.teamPin}
                onChange={(e) => setJoinForm({ ...joinForm, teamPin: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#10B981] text-xs text-white placeholder:text-slate-600 outline-none tracking-widest font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                Your Driver / Member Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Patel"
                value={joinForm.memberName}
                onChange={(e) => setJoinForm({ ...joinForm, memberName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#10B981] text-xs text-white placeholder:text-slate-600 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-lg font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${isSubmitting
                  ? "bg-[#1A202C] text-slate-500 cursor-not-allowed"
                  : "bg-[#10B981] hover:bg-[#059669] text-slate-950"
                }`}
            >
              <span>{isSubmitting ? "Connecting To Cockpit..." : "Connect To Cockpit"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
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
