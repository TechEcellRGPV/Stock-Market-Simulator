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

  if (!raceState.targetEventDate || !timeLeft) {
    return null;
  }

  return (
    <div className="w-full bg-[#0D121D] border border-[#1A2336] rounded-xl p-4 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#1A2336]">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-white">Event Flag-Off Target</span>
          <span className="text-[11px] font-mono text-slate-400">({displayScheduledTime})</span>
        </div>

        <span className={`self-start sm:self-auto px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
          raceState.isRegistrationOpen
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            : "bg-slate-800 text-slate-400"
        }`}>
          {raceState.isRegistrationOpen ? "Registration Open" : "Registration Locked"}
        </span>
      </div>

      {timeLeft.isPassed ? (
        <div className="text-center py-2 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>Scheduled Time Reached • Ready for Flag-Off</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#161F30]">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">
              {timeLeft.days.toString().padStart(2, "0")}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Days</div>
          </div>
          <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#161F30]">
            <div className="text-lg sm:text-xl font-bold font-mono text-white">
              {timeLeft.hours.toString().padStart(2, "0")}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Hours</div>
          </div>
          <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#161F30]">
            <div className="text-lg sm:text-xl font-bold font-mono text-emerald-400">
              {timeLeft.minutes.toString().padStart(2, "0")}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Mins</div>
          </div>
          <div className="bg-[#090D14] p-2.5 rounded-lg border border-[#161F30]">
            <div className="text-lg sm:text-xl font-bold font-mono text-cyan-400">
              {timeLeft.seconds.toString().padStart(2, "0")}
            </div>
            <div className="text-[10px] text-slate-400 uppercase font-medium">Secs</div>
          </div>
        </div>
      )}
    </div>
  );
}
