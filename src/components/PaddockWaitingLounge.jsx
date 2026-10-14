import { useState, useMemo, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Users,
  Clock,
  TrendingUp,
  FileText,
  MapPin,
  Calendar,
  LogOut,
  Home,
  Award,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import CirculatingBanner from "./CirculatingBanner";

function subscribeToSeconds(callback) {
  const timer = setInterval(callback, 1000);
  return () => clearInterval(timer);
}

function getNowSnapshot() {
  return Math.floor(Date.now() / 1000) * 1000;
}

function getServerSnapshot() {
  return 0;
}

export default function PaddockWaitingLounge({
  currentTeam,
  raceState,
  stocks,
  onLogout
}) {
  const [activeTab, setActiveTab] = useState("scrips"); // "scrips" | "rules" | "schedule"
  const now = useSyncExternalStore(subscribeToSeconds, getNowSnapshot, getServerSnapshot);

  // Compute Live Event Countdown directly inside the hero card
  const countdown = useMemo(() => {
    if (!raceState.targetEventDate || !now) return null;
    const target = new Date(raceState.targetEventDate).getTime();
    if (isNaN(target)) return null;

    const diff = target - now;
    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return { days, hours, minutes, seconds, isPassed: false };
  }, [raceState.targetEventDate, now]);

  const displayScheduledTime = useMemo(() => {
    if (raceState.targetEventDate) {
      const d = new Date(raceState.targetEventDate);
      if (!isNaN(d.getTime())) {
        return d.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true
        });
      }
    }
    return raceState.scheduledStartTime || "October 29, 2026 at 3:00 PM";
  }, [raceState.targetEventDate, raceState.scheduledStartTime]);

  return (
    <div className="min-h-screen bg-[#080B10] text-white font-sans selection:bg-[#E10600] selection:text-white flex flex-col">
      {/* 1. Sleek Mobile-First Top App Bar */}
      <header className="sticky top-0 z-30 bg-[#0E131D]/95 backdrop-blur-md border-b border-slate-800/80 px-3.5 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-3">
        {/* Left: Brand Lockup */}
        <Link to="/" className="flex items-center gap-2.5 min-w-0 hover:opacity-90 transition-opacity">
          <img
            src="/logo_D.png"
            alt="Imprenditore 5.0"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded shrink-0"
          />
          <img
            src="/logo.png"
            alt="E-Cell RGPV"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded hidden sm:inline-block shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[9px] font-mono font-bold tracking-widest text-[#E10600] uppercase truncate leading-tight">
              E-Cell RGPV
            </div>
            <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-white truncate leading-tight">
              Imprenditore 5.0
            </div>
          </div>
        </Link>

        {/* Right: Team Chip & Fast Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#141A26] border border-slate-800">
            <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-[#06B6D4]">
              {currentTeam.teamCode}
            </span>
          </div>

          <Link
            to="/"
            className="w-8 h-8 rounded-lg bg-[#141A26] hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
            title="Return Home"
            aria-label="Return Home"
          >
            <Home className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={onLogout}
            className="h-8 px-2.5 rounded-lg bg-[#E10600]/15 hover:bg-[#E10600] text-[#FF6B6B] hover:text-white text-xs font-bold border border-[#E10600]/30 transition-colors flex items-center gap-1"
            title="Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* 2. Circulating Live Update Ticker */}
      <CirculatingBanner />

      {/* 3. Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-5">
        {/* Unified Hero Card: Team Dossier + Live Countdown in One Master Tile */}
        <div className="rounded-2xl bg-gradient-to-b from-[#131926] via-[#101420] to-[#0C0F17] border border-slate-800 p-4 sm:p-6 shadow-xl relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#E10600]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-4 relative z-10">
            {/* Row A: Team Identity + Starting Capital */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E10600]/15 border border-[#E10600]/30 text-[#E10600] flex items-center justify-center font-black text-sm shrink-0">
                  5.0
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">
                      Team Grid Slot
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30">
                      {currentTeam.teamCode}
                    </span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-black uppercase text-white tracking-tight">
                    {currentTeam.teamName}
                  </h1>
                </div>
              </div>

              {/* Capital Badge */}
              <div className="flex items-baseline gap-2 bg-[#080B10] px-3 py-2 rounded-xl border border-slate-800 sm:text-right">
                <div>
                  <div className="text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    Mock Capital Ready
                  </div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-[#10B981] leading-none mt-0.5">
                    ₹{(currentTeam.cashBalance || raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}
                  </div>
                </div>
              </div>
            </div>

            {/* Row B: Live Flag-Off Digital Countdown */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-[#EAB308]">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider">
                    Official Flag-Off Countdown
                  </span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  {displayScheduledTime}
                </span>
              </div>

              {countdown ? (
                countdown.isPassed ? (
                  <div className="py-3 px-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/30 text-center text-xs font-bold text-[#10B981] flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Scheduled Time Reached. Flag-Off Under Host Control.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="bg-[#080B10] p-2 sm:p-2.5 rounded-xl border border-slate-800">
                      <div className="text-lg sm:text-2xl font-black font-mono text-white">
                        {countdown.days.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        Days
                      </div>
                    </div>
                    <div className="bg-[#080B10] p-2 sm:p-2.5 rounded-xl border border-slate-800">
                      <div className="text-lg sm:text-2xl font-black font-mono text-white">
                        {countdown.hours.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        Hours
                      </div>
                    </div>
                    <div className="bg-[#080B10] p-2 sm:p-2.5 rounded-xl border border-slate-800">
                      <div className="text-lg sm:text-2xl font-black font-mono text-[#EAB308]">
                        {countdown.minutes.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        Mins
                      </div>
                    </div>
                    <div className="bg-[#080B10] p-2 sm:p-2.5 rounded-xl border border-slate-800">
                      <div className="text-lg sm:text-2xl font-black font-mono text-[#06B6D4]">
                        {countdown.seconds.toString().padStart(2, "0")}
                      </div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">
                        Secs
                      </div>
                    </div>
                  </div>
                )
              ) : null}
            </div>

            {/* Row C: Team Members & Status Pill */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
              {/* Member Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 mr-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>Team:</span>
                </span>
                {currentTeam.leaderName && (
                  <span className="px-2 py-0.5 rounded-md bg-[#141A26] text-slate-200 text-[10px] font-medium border border-slate-800">
                    Leader: <strong className="text-white">{currentTeam.leaderName}</strong>
                  </span>
                )}
                {Array.isArray(currentTeam.members) &&
                  currentTeam.members.map((member, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#0C1018] text-slate-300 text-[10px] font-medium border border-slate-800/80"
                    >
                      {member}
                    </span>
                  ))}
              </div>

              {/* Status Indicator */}
              <div className="inline-flex items-center gap-1.5 text-[10px] font-mono font-bold text-[#EAB308]">
                <Lock className="w-3 h-3 text-[#EAB308]" />
                <span>Unlocks automatically at Flag-Off</span>
              </div>
            </div>
          </div>
        </div>

        {/* Clean Modern Underline Tabs */}
        <div className="border-b border-slate-800/90 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pt-1">
          <div className="flex items-center gap-6 sm:gap-8 shrink-0">
            <button
              onClick={() => setActiveTab("scrips")}
              className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-2 ${
                activeTab === "scrips"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Companies</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === "scrips"
                  ? "bg-[#E10600]/20 text-[#FF6B6B] border border-[#E10600]/40"
                  : "bg-slate-800 text-slate-400"
              }`}>
                {stocks.length}
              </span>
              {activeTab === "scrips" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E10600] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("rules")}
              className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-1.5 ${
                activeTab === "rules"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Competition Rules</span>
              {activeTab === "rules" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E10600] rounded-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("schedule")}
              className={`pb-2.5 text-xs sm:text-sm font-bold transition-colors relative flex items-center gap-1.5 ${
                activeTab === "schedule"
                  ? "text-white"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Event Details</span>
              {activeTab === "schedule" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E10600] rounded-full" />
              )}
            </button>
          </div>

          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline-block">
            Pre-Market Briefing
          </span>
        </div>

        {/* Tab 1: Companies List */}
        {activeTab === "scrips" && (
          <div className="space-y-2.5 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {stocks.map((stock) => (
                <div
                  key={stock.ticker}
                  className="p-3 sm:p-3.5 rounded-xl bg-[#0E131D] border border-slate-800/90 hover:border-slate-700 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-xs text-white">
                        {stock.ticker}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-[#141A26] text-slate-300 border border-slate-800">
                        {stock.sector?.split(" ")[0] || "Equities"}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-slate-300 truncate mt-0.5">
                      {stock.name}
                    </div>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {stock.description}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-xs sm:text-sm text-[#10B981]">
                      ₹{stock.currentPrice.toFixed(2)}
                    </div>
                    <div className="text-[9px] font-mono text-slate-500">
                      Base: ₹{stock.openingPrice.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-[11px] text-slate-400">
              Strategy Tip: Diversifying across multiple industries shields your capital from sudden single-sector news volatility.
            </div>
          </div>
        )}

        {/* Tab 2: Official Competition Rulebook */}
        {activeTab === "rules" && (
          <div className="space-y-3.5">
            <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#EAB308] font-bold">
                Official Imprenditore 5.0 Scoring
              </div>
              <div className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                Rankings and winner positions are evaluated strictly on Net Profit generated across the competition:
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-[#10B981]/30">
                <div className="text-xl font-black font-mono text-[#10B981]">Net Profit</div>
                <div className="text-xs font-bold text-white uppercase mt-0.5">Primary Ranking Metric</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Net Profit = (Cash Balance + Stock Holdings Value) - ₹1,00,000 Starting Capital.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-[#06B6D4]/30">
                <div className="text-xl font-black font-mono text-[#06B6D4]">Return %</div>
                <div className="text-xs font-bold text-white uppercase mt-0.5">Portfolio Growth</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Percentage gain on your initial capital, updated live with each stock price change.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-[#EAB308]/30">
                <div className="text-xl font-black font-mono text-[#EAB308]">Live Ranks</div>
                <div className="text-xs font-bold text-white uppercase mt-0.5">Real-Time Sync</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Podium P1, P2, and P3 positions update instantaneously on the auditorium leaderboard.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Simulation Rules
              </div>
              <ul className="text-slate-300 space-y-1.5 leading-relaxed list-disc list-inside text-[11px]">
                <li>₹1,00,000 starting mock capital per team.</li>
                <li>5 timed trading rounds with dynamic price updates.</li>
                <li>Breaking News flashes will trigger price shocks across specific sectors.</li>
                <li>All orders match instantly at live market price.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 3: Event Information & Venue */}
        {activeTab === "schedule" && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#E10600]" />
                  <span>Venue</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">RGPV Conference Hall</div>
                <div className="text-[10px] text-slate-400">Campus Auditorium</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#EAB308]" />
                  <span>Timing</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">3:00 PM - 5:30 PM</div>
                <div className="text-[10px] text-slate-400">Official Flag-Off</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                  <span>Capital</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">₹1,00,000</div>
                <div className="text-[10px] text-slate-400">Allocated Mock Funds</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800">
                <div className="text-[10px] font-mono text-slate-400 uppercase flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#06B6D4]" />
                  <span>Rounds</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-1">5 Rounds</div>
                <div className="text-[10px] text-slate-400">Final Podium Standing</div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#0E131D] border border-slate-800 text-xs text-slate-400 leading-relaxed">
              <strong className="text-white block mb-1">Auditorium Projector Display:</strong>
              The main auditorium screen is synced live. Your rank and portfolio movements will update on the hall projector in real time.
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
