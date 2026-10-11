import { useSyncExternalStore, useMemo } from "react";
import { Clock, Calendar } from "lucide-react";
import { useSimulation } from "../context/SimulationContext";

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

export default function EventCountdown() {
  const { raceState } = useSimulation();
  const now = useSyncExternalStore(subscribeToSeconds, getNowSnapshot, getServerSnapshot);

  const timeLeft = useMemo(() => {
    if (!raceState.targetEventDate) return null;
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
          month: "long",
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

  if (!raceState.targetEventDate || !timeLeft) {
    return null;
  }

  return (
    <div className="w-full bg-[#121720] border border-[#232B3B] rounded-xl p-4 sm:p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 border-b border-[#232B3B] pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded bg-[#EAB308]/15 text-[#EAB308] flex items-center justify-center border border-[#EAB308]/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#EAB308]">
              Official Flag-Off Countdown
            </div>
            <div className="text-xs font-bold text-slate-200">
              {displayScheduledTime}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">
              Venue: RGPV Conference Hall • Timing: 3:00 PM - 5:30 PM
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span className={`px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
            raceState.isRegistrationOpen
              ? "bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40"
              : "bg-[#E10600]/20 text-[#FF8080] border border-[#E10600]/40"
          }`}>
            {raceState.isRegistrationOpen ? "Registration Open" : "Registration Locked"}
          </span>

          <span className={`px-2 sm:px-2.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-wider ${
            raceState.isSimulationEntryOpen
              ? "bg-[#06B6D4]/20 text-[#06B6D4] border border-[#06B6D4]/40"
              : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}>
            {raceState.isSimulationEntryOpen ? "Paddock Entry Open" : "Paddock Entry Locked"}
          </span>
        </div>
      </div>

      {timeLeft.isPassed ? (
        <div className="text-center py-2 text-xs font-black uppercase tracking-wider text-[#10B981] flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>Scheduled Time Reached. Flag-Off Under Race Director Control.</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-1.5 sm:gap-3 text-center">
          <div className="bg-[#0A0D12] p-2 sm:p-3 rounded-lg border border-[#232B3B]">
            <div className="text-base sm:text-2xl font-black font-mono text-white">
              {timeLeft.days.toString().padStart(2, "0")}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
              Days
            </div>
          </div>

          <div className="bg-[#0A0D12] p-2 sm:p-3 rounded-lg border border-[#232B3B]">
            <div className="text-base sm:text-2xl font-black font-mono text-white">
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
              Hours
            </div>
          </div>

          <div className="bg-[#0A0D12] p-2 sm:p-3 rounded-lg border border-[#232B3B]">
            <div className="text-base sm:text-2xl font-black font-mono text-[#EAB308]">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
              Minutes
            </div>
          </div>

          <div className="bg-[#0A0D12] p-2 sm:p-3 rounded-lg border border-[#232B3B]">
            <div className="text-base sm:text-2xl font-black font-mono text-[#06B6D4]">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
            <div className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400">
              Seconds
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
