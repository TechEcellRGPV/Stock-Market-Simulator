import { useState, useMemo, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  Users,
  Clock,
  TrendingUp,
  MapPin,
  Calendar,
  Award,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import Navbar from "./Navbar";
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
  stocks
}) {
  const [activeTab, setActiveTab] = useState("scrips"); // "scrips" | "rules" | "schedule"
  const now = useSyncExternalStore(subscribeToSeconds, getNowSnapshot, getServerSnapshot);

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
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <Navbar />
      <CirculatingBanner />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Team Waiting Hero */}
        <div className="rounded-2xl bg-[#0D121D] border border-[#1A2336] p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-[#1A2336]">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
                  Grid Standby
                </span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {currentTeam.teamCode}
                </span>
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
                {currentTeam.teamName}
              </h1>
            </div>

            <div className="bg-[#090D14] px-3.5 py-2 rounded-xl border border-[#1A2336] self-start sm:self-auto text-left sm:text-right">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Starting Capital
              </div>
              <div className="text-xl font-mono font-bold text-emerald-400">
                ₹{(currentTeam.cashBalance || raceState.defaultStartingCapital || 100000).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          {/* Countdown Clock */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-amber-400 font-semibold flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Flag-Off Countdown</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {displayScheduledTime}
              </span>
            </div>

            {countdown ? (
              countdown.isPassed ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center text-xs font-semibold text-emerald-400 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Scheduled Time Reached • Ready for Flag-Off</span>
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-[#090D14] p-2 sm:p-2.5 rounded-xl border border-[#161F30]">
                    <div className="text-lg sm:text-xl font-mono font-bold text-white">
                      {countdown.days.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase font-medium text-slate-400">Days</div>
                  </div>
                  <div className="bg-[#090D14] p-2 sm:p-2.5 rounded-xl border border-[#161F30]">
                    <div className="text-lg sm:text-xl font-mono font-bold text-white">
                      {countdown.hours.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase font-medium text-slate-400">Hours</div>
                  </div>
                  <div className="bg-[#090D14] p-2 sm:p-2.5 rounded-xl border border-[#161F30]">
                    <div className="text-lg sm:text-xl font-mono font-bold text-emerald-400">
                      {countdown.minutes.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase font-medium text-slate-400">Mins</div>
                  </div>
                  <div className="bg-[#090D14] p-2 sm:p-2.5 rounded-xl border border-[#161F30]">
                    <div className="text-lg sm:text-xl font-mono font-bold text-cyan-400">
                      {countdown.seconds.toString().padStart(2, "0")}
                    </div>
                    <div className="text-[10px] uppercase font-medium text-slate-400">Secs</div>
                  </div>
                </div>
              )
            ) : null}
          </div>

          {/* Members list */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1A2336] text-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400">Roster:</span>
              <span className="px-2 py-0.5 rounded bg-[#121824] text-slate-200 text-[11px] font-medium border border-[#1A2336]">
                Leader: {currentTeam.leaderName}
              </span>
              {Array.isArray(currentTeam.members) &&
                currentTeam.members.map((member, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded bg-[#090D14] text-slate-400 text-[11px] font-medium border border-[#161F30]"
                  >
                    {member}
                  </span>
                ))}
            </div>

            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Unlocks at Round 1 flag-off</span>
            </div>
          </div>
        </div>

        {/* Tabbed Info */}
        <div className="border-b border-[#1A2336] flex items-center gap-6">
          <button
            onClick={() => setActiveTab("scrips")}
            className={`pb-2.5 text-xs font-semibold relative transition-colors ${
              activeTab === "scrips" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Companies ({stocks.length})</span>
            {activeTab === "scrips" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("rules")}
            className={`pb-2.5 text-xs font-semibold relative transition-colors ${
              activeTab === "rules" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Rules</span>
            {activeTab === "rules" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`pb-2.5 text-xs font-semibold relative transition-colors ${
              activeTab === "schedule" ? "text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Venue &amp; Event</span>
            {activeTab === "schedule" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
            )}
          </button>
        </div>

        {/* Content */}
        {activeTab === "scrips" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {stocks.map((stock) => (
              <div
                key={stock.ticker}
                className="p-3 rounded-xl bg-[#0D121D] border border-[#1A2336] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono font-bold text-xs text-white">
                      {stock.ticker}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] uppercase bg-[#141B29] text-slate-400">
                      {stock.sector?.split("&")[0].trim()}
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-medium truncate mt-0.5">
                    {stock.name}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs text-emerald-400">
                    ₹{stock.currentPrice.toFixed(2)}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400">
                    Base: ₹{stock.openingPrice.toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "rules" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-1">
                <div className="text-lg font-bold font-mono text-emerald-400">Net Profit</div>
                <div className="text-xs font-semibold text-white">Primary Metric</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Net Profit = (Cash + Stock Value) - ₹1,00,000 initial capital.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-1">
                <div className="text-lg font-bold font-mono text-cyan-400">Return %</div>
                <div className="text-xs font-semibold text-white">Portfolio Gain</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Calculated against your ₹1,00,000 virtual capital in real time.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-1">
                <div className="text-lg font-bold font-mono text-amber-400">5 Rounds</div>
                <div className="text-xs font-semibold text-white">Event Duration</div>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Dynamic price events and sector news flashes across 5 laps.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>Venue</span>
              </div>
              <div className="text-sm font-bold text-white">RGPV Conference Hall</div>
              <div className="text-xs text-slate-400">Campus Auditorium</div>
            </div>

            <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Timing</span>
              </div>
              <div className="text-sm font-bold text-white">3:00 PM - 5:30 PM</div>
              <div className="text-xs text-slate-400">Official Flag-Off Session</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
