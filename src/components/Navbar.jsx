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
  Clock,
  Flag
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

  // User requested exact order: Dashboard, Market, Trade, Leaderboard
  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Market", path: "/companies", icon: TrendingUp },
    { label: "Trade", path: "/trade", icon: Activity },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy }
  ];

  const getStatusBadge = () => {
    if (raceState?.status === "GREEN_FLAG") {
      return {
        label: `LAP ${raceState.currentLap}/5`,
        color: "text-[#E10600] bg-[#E10600]/10 border-[#E10600]/30",
        dot: "bg-[#E10600] animate-pulse"
      };
    }
    if (raceState?.status === "SAFETY_CAR") {
      return {
        label: "SAFETY CAR",
        color: "text-amber-400 bg-amber-500/10 border-amber-500/30",
        dot: "bg-amber-400"
      };
    }
    if (raceState?.status === "CHECKERED_FLAG") {
      return {
        label: "CHECKERED",
        color: "text-slate-300 bg-white/10 border-white/20",
        dot: "bg-white"
      };
    }
    return {
      label: "GRID WARMUP",
      color: "text-[#06B6D4] bg-[#06B6D4]/10 border-[#06B6D4]/30",
      dot: "bg-[#06B6D4]"
    };
  };

  const status = getStatusBadge();

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0A0D12]/95 backdrop-blur-md border-b border-[#232B3B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        {/* F1 Brand Lockup */}
        <Link to="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="relative w-8 h-8 rounded overflow-hidden flex items-center justify-center bg-[#121720] border border-[#232B3B] group-hover:border-[#E10600] transition-colors">
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-6 h-6 object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#E10600]">
                E-Cell RGPV
              </span>
            </div>
            <span className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-white leading-tight">
              Imprenditore <span className="text-[#E10600]">5.0</span>
            </span>
          </div>
        </Link>

        {/* Center Navigation in Requested Order: Dashboard, Market, Trade, Leaderboard */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  active
                    ? "bg-[#161B24] text-white border border-[#E10600]/40 shadow-xs"
                    : "text-slate-400 hover:text-white hover:bg-[#121720]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? "text-[#E10600]" : "text-slate-400"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Section: Telemetry Lap Status & Auth Profile */}
        <div className="flex items-center gap-2.5">
          {/* F1 Race Status Pill */}
          <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded border text-[11px] font-mono font-bold ${status.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            <span>{status.label}</span>
            {raceState?.lapTimeRemaining > 0 && raceState?.status === "GREEN_FLAG" && (
              <span className="text-slate-400 pl-1 border-l border-white/10 flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-[#06B6D4]" />
                <span className="text-white">{formatTime(raceState.lapTimeRemaining)}</span>
              </span>
            )}
          </div>

          {/* User Account / Login */}
          {currentTeam ? (
            <div className="flex items-center gap-1.5">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-2.5 py-1 rounded bg-[#121720] hover:bg-[#1A202C] border border-[#232B3B] hover:border-[#E10600]/50 text-xs transition-colors"
                title="View Team Cockpit"
              >
                <div className="w-2 h-2 rounded-full bg-[#E10600]" />
                <span className="font-bold uppercase tracking-wider text-slate-200 max-w-28 sm:max-w-36 truncate">
                  {currentTeam.teamName}
                </span>
                {currentRank && (
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-black bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40">
                    {currentRank}
                  </span>
                )}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 rounded text-slate-400 hover:text-[#FF4D4D] hover:bg-[#E10600]/10 transition-colors border border-transparent hover:border-[#E10600]/30"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-xs flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded text-slate-400 hover:text-white hover:bg-[#161B24] transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer (exact order) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#232B3B] bg-[#0A0D12] px-4 py-3 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded text-xs font-bold uppercase tracking-wider ${
                  active
                    ? "bg-[#161B24] text-[#E10600] border border-[#E10600]/30"
                    : "text-slate-300 hover:bg-[#121720]"
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
