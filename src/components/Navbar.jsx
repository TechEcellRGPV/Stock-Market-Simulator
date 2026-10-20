import { useState, useEffect } from "react";
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
  Wallet,
  ChevronRight
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTeam, raceState, leaderboard, logout } = useSimulation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  // Lock body scroll when mobile menu is open to prevent page scrolling underneath
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

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
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard, color: "text-[#06B6D4]" },
    { label: "Market", path: "/companies", icon: TrendingUp, color: "text-[#10B981]" },
    { label: "Trade", path: "/trade", icon: Activity, color: "text-[#E10600]" },
    { label: "Leaderboard", path: "/leaderboard", icon: Trophy, color: "text-[#F59E0B]" }
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
    <>
      <header className="sticky top-0 z-40 w-full bg-[#0A0D12]/95 backdrop-blur-md border-b border-[#232B3B]">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
          {/* F1 Brand Lockup (Optimized for all viewports so it never breaks line) */}
          <Link to="/" className="flex items-center gap-2 sm:gap-2.5 group shrink-0">
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-7 h-7 sm:w-8 sm:h-8 object-contain transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#E10600] leading-tight">
                E-Cell RGPV
              </span>
              <span className="text-xs sm:text-sm font-black uppercase italic tracking-tight text-white leading-tight">
                Imprenditore <span className="text-[#E10600]">5.0</span>
              </span>
            </div>
          </Link>

          {/* Desktop Center Navigation (Exact order: Dashboard, Market, Trade, Leaderboard) */}
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
                  <Icon className={`w-3.5 h-3.5 ${link.color} shrink-0`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Desktop Right Section: Telemetry Lap Status & Auth Profile */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* F1 Race Status Pill */}
            <div className={`flex items-center gap-2 px-2.5 py-1 rounded border text-[11px] font-mono font-bold ${status.color}`}>
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
                  className="p-1.5 rounded text-slate-400 hover:text-[#FF4D4D] hover:bg-[#E10600]/10 transition-colors border border-transparent hover:border-[#E10600]/30 cursor-pointer"
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
          </div>

          {/* Mobile Right Section: Clean, high-visibility Hamburger Button ONLY */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2 rounded-xl bg-[#121720] border border-[#232B3B] text-slate-300 hover:text-white hover:border-[#E10600]/50 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {/* Telemetry live status indicator dot */}
              <span
                className={`w-2 h-2 rounded-full ${
                  currentTeam ? "bg-emerald-400" : "bg-[#E10600]"
                } ${raceState?.status === "GREEN_FLAG" ? "animate-pulse" : ""}`}
              />
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-white" />
              ) : (
                <Menu className="w-4 h-4 text-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer & Backdrop */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-start">
          {/* Backdrop (Tapping closes menu) */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-Down Drawer Container */}
          <div className="relative z-10 w-full bg-[#0A0D12] border-b border-[#232B3B] max-h-[85vh] overflow-y-auto shadow-2xl p-4 space-y-3.5 animate-fadeIn">
            {/* Top Bar inside Drawer: Status & Close */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#1A2336]">
              {/* Live Race Telemetry Pill */}
              <div className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${status.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                <span>{status.label}</span>
                {raceState?.lapTimeRemaining > 0 && raceState?.status === "GREEN_FLAG" && (
                  <span className="text-slate-400 pl-1 border-l border-white/10 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#06B6D4]" />
                    <span className="text-white">{formatTime(raceState.lapTimeRemaining)}</span>
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg bg-[#141B29] text-slate-400 hover:text-white border border-[#232B3B] transition-colors"
                aria-label="Close Navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Team Account Cockpit Card */}
            {currentTeam ? (
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#101522] via-[#141B29] to-[#101522] border border-[#232B3B] space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#E10600] shrink-0" />
                    <span className="font-black text-sm uppercase tracking-wider text-white truncate">
                      {currentTeam.teamName}
                    </span>
                  </div>
                  {currentRank && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-[#EAB308]/20 text-[#EAB308] border border-[#EAB308]/40 shrink-0">
                      RANK {currentRank}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-[#1C2436]">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Available Cash</span>
                  </div>
                  <span className="font-mono font-bold text-[#10B981]">
                    ₹{(currentTeam.cashBalance ?? currentTeam.cash ?? 0).toLocaleString("en-IN", {
                      minimumFractionDigits: 2
                    })}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center justify-between">
                  <span>Leader: <strong className="text-slate-200">{currentTeam.leaderName || "Pilot"}</strong></span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#0A0D12] border border-[#1A2336] text-slate-400">
                    {currentTeam.userRole === "LEADER" ? "TEAM LEADER" : "TEAM MEMBER"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-[#101522] border border-[#232B3B] text-center space-y-2.5">
                <p className="text-xs text-slate-300">
                  Join the race or log in to access your team cockpit and trade live equities.
                </p>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#E10600] to-[#B80500] text-white font-black text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  <span>Login to Team Cockpit</span>
                </Link>
              </div>
            )}

            {/* Navigation Links (Requested Order: Dashboard, Market, Trade, Leaderboard) */}
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 px-1">
                Race Telemetry Navigation
              </div>
              {navLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      active
                        ? "bg-[#161F30] text-white border border-[#E10600]/50 shadow-sm ring-1 ring-[#E10600]/30"
                        : "text-slate-300 bg-[#0E121B] hover:bg-[#141A26] border border-[#1A2336]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 rounded-lg bg-[#0A0D12] border border-white/5">
                        <Icon className={`w-4 h-4 ${link.color}`} />
                      </div>
                      <span>{link.label}</span>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        active ? "text-[#E10600] translate-x-0.5" : "text-slate-500"
                      }`}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Action Button (if logged in) */}
            {currentTeam && (
              <div className="pt-2 border-t border-[#1A2336]">
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-[#FF4D4D] text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of Team</span>
                </button>
              </div>
            )}

            {/* Mobile Footer tag */}
            <div className="text-center pt-1 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Imprenditore 5.0 • E-Cell RGPV
            </div>
          </div>
        </div>
      )}
    </>
  );
}

