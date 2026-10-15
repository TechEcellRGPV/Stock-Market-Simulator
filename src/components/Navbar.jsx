import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  TrendingUp,
  Trophy,
  Activity,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  User,
  Clock
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTeam, raceState, leaderboard, logout } = useSimulation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const formatTime = (secs) => {
    const m = Math.floor(Math.max(0, secs || 0) / 60);
    const s = Math.floor(Math.max(0, secs || 0) % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const currentRank = (() => {
    if (!currentTeam || !leaderboard) return null;
    const found = leaderboard.find(
      (entry) =>
        entry.teamId === currentTeam.id ||
        entry.teamId === currentTeam._id ||
        entry.teamCode === currentTeam.teamCode
    );
    return found ? `#${found.rank}` : null;
  })();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { label: "Market", path: "/companies", icon: TrendingUp },
    { label: "Trade", path: "/trade", icon: Activity },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy },
    ...(currentTeam ? [{ label: "Dashboard", path: "/dashboard", icon: LayoutDashboard }] : [])
  ];

  const getStatusBadge = () => {
    if (raceState?.status === "GREEN_FLAG") {
      return {
        label: `Lap ${raceState.currentLap}/5`,
        color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        dot: "bg-emerald-400 animate-pulse"
      };
    }
    if (raceState?.status === "SAFETY_CAR") {
      return {
        label: "Paused",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        dot: "bg-amber-400"
      };
    }
    if (raceState?.status === "CHECKERED_FLAG") {
      return {
        label: "Ended",
        color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        dot: "bg-rose-400"
      };
    }
    return {
      label: "Warmup",
      color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
      dot: "bg-cyan-400"
    };
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090D14]/90 backdrop-blur-md border-b border-[#1A2234]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-[#121826] border border-[#232D42]">
            <img
              src="/logo_D.png"
              alt="Logo"
              className="w-5 h-5 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-tight text-white leading-tight">
              Imprenditore <span className="text-emerald-400 font-mono text-xs font-normal">5.0</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide leading-none">
              Stock Simulator
            </span>
          </div>
        </Link>

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-[#161F30] text-white font-semibold shadow-xs"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#121824]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-emerald-400" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Status Pill & Auth / Profile */}
        <div className="flex items-center gap-2.5">
          {/* Race Status Pill */}
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border text-[11px] font-mono ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
            {raceState?.lapTimeRemaining > 0 && raceState?.status === "GREEN_FLAG" && (
              <span className="text-slate-400 pl-1 border-l border-white/10 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5" />
                {formatTime(raceState.lapTimeRemaining)}
              </span>
            )}
          </div>

          {/* User Account / Login */}
          {currentTeam ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#121824] hover:bg-[#182132] border border-[#20293D] text-xs transition-colors"
                title="View Team Cockpit"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-semibold text-slate-200 max-w-28 sm:max-w-36 truncate">
                  {currentTeam.teamName}
                </span>
                {currentRank && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#EAB308]/15 text-[#EAB308]">
                    {currentRank}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs transition-colors shadow-xs flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#141B28] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1A2234] bg-[#090D14] px-4 py-3 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                  active
                    ? "bg-[#161F30] text-emerald-400 font-semibold"
                    : "text-slate-300 hover:bg-[#121824]"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
