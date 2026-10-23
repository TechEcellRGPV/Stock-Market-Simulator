import { useState } from "react";
import {
  Newspaper,
  Radio,
  Send,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
} from "lucide-react";

export default function AdminNewsPublisher({
  stocks = [],
  sectors = [],
  onPublishNews,
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [source, setSource] = useState("Race Operations Command");
  const [category, setCategory] = useState("Simulation Announcements");
  const [sentiment, setSentiment] = useState("BULLISH"); // "BULLISH" | "BEARISH" | "NEUTRAL"
  const [isSimulationOnly, setIsSimulationOnly] = useState(true);
  const [selectedTicker, setSelectedTicker] = useState("ALL");
  const [affectedSector, setAffectedSector] = useState("ALL");
  const [priceImpactPercent, setPriceImpactPercent] = useState(0);
  const [broadcastToSimulation, setBroadcastToSimulation] = useState(true);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!title.trim() || title.trim().length < 5) {
      setError("Headline must be at least 5 characters.");
      return;
    }
    if (!summary.trim() || summary.trim().length < 10) {
      setError("Summary must be at least 10 characters.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onPublishNews({
        title: title.trim(),
        summary: summary.trim(),
        source: source.trim(),
        ticker: selectedTicker !== "ALL" ? selectedTicker : undefined,
        category,
        sentiment,
        isSimulationAnnouncement: isSimulationOnly,
        affectedSector: affectedSector !== "ALL" ? affectedSector : undefined,
        priceImpactPercent: Number(priceImpactPercent) || 0,
        broadcastToSimulation,
      });

      setNotice(`Broadcasted: "${title.trim()}"`);
      setTitle("");
      setSummary("");
      setPriceImpactPercent(0);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Failed to publish article.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#0D121D] border border-[#1A2336] space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-[#1A2336] pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-[#8B5CF6]" />
          <h3 className="text-sm font-black uppercase tracking-wider text-white">
            Publish Market News &amp; Simulation Announcements
          </h3>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/30">
          News Wire Dispatch
        </span>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Distinction Toggle: Simulation Announcement vs Market News */}
        <div className="flex rounded-xl bg-[#090D14] p-1 border border-[#1A2336] text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setIsSimulationOnly(true);
              setCategory("Simulation Announcements");
              setSource("Race Operations Command");
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              isSimulationOnly
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Fictional Simulation Announcement</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsSimulationOnly(false);
              setCategory("Technology & Consumer Devices");
              setSource("Financial Wire");
            }}
            className={`flex-1 py-1.5 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              !isSimulationOnly
                ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-sky-400" />
            <span>Real External Market News</span>
          </button>
        </div>

        {/* Title */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">
            Article / Bulletin Headline
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Breakthrough in Solid-State Battery Yield Bolsters Clean Energy Sector"
            required
            className="w-full px-3.5 py-2 bg-[#090D14] border border-[#1A2336] rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">
            Short Summary / Body
          </label>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Provide context, affected companies, or expected market implications..."
            rows={2}
            required
            className="w-full px-3.5 py-2 bg-[#090D14] border border-[#1A2336] rounded-xl text-xs font-mono text-white placeholder:text-slate-600 focus:outline-hidden focus:border-purple-500"
          />
        </div>

        {/* Category, Sentiment, Ticker, and Source in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <label className="block text-slate-400 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#090D14] border border-[#1A2336] rounded-lg text-white"
            >
              <option value="Simulation Announcements">⚡ Simulation Bulletins</option>
              <option value="Electric Vehicles & Clean Energy">Electric Vehicles &amp; Clean Energy</option>
              <option value="AI & Semiconductor Computing">AI &amp; Semiconductor Computing</option>
              <option value="Aviation & Heavy Engineering">Aviation &amp; Heavy Engineering</option>
              <option value="Logistics & Global Freight">Logistics &amp; Global Freight</option>
              <option value="Technology & Consumer Devices">Technology &amp; Consumer Devices</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Market Sentiment</label>
            <select
              value={sentiment}
              onChange={(e) => setSentiment(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#090D14] border border-[#1A2336] rounded-lg text-white"
            >
              <option value="BULLISH">🟢 BULLISH</option>
              <option value="BEARISH">🔴 BEARISH</option>
              <option value="NEUTRAL">⚪ NEUTRAL</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Target Stock Ticker</label>
            <select
              value={selectedTicker}
              onChange={(e) => setSelectedTicker(e.target.value)}
              className="w-full px-2.5 py-2 bg-[#090D14] border border-[#1A2336] rounded-lg text-white"
            >
              <option value="ALL">ALL (Macro / Sector-Wide)</option>
              {(stocks || []).map((s) => (
                <option key={s.ticker} value={s.ticker}>
                  {s.ticker} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-400 mb-1">Publisher / Source</label>
            <input
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
              placeholder="e.g. Bloomberg / Race Control"
              className="w-full px-2.5 py-2 bg-[#090D14] border border-[#1A2336] rounded-lg text-white"
            />
          </div>
        </div>

        {/* Optional Simulation Impact */}
        {isSimulationOnly && (
          <div className="p-3 rounded-xl bg-[#090D14] border border-[#1A2336] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <label className="flex items-center gap-2 cursor-pointer text-slate-300">
              <input
                type="checkbox"
                checked={broadcastToSimulation}
                onChange={(e) => setBroadcastToSimulation(e.target.checked)}
                className="rounded accent-emerald-500"
              />
              <span>Broadcast to live simulation ticker &amp; track alerts banner</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Price Impact (%):</span>
              <input
                type="number"
                value={priceImpactPercent}
                onChange={(e) => setPriceImpactPercent(Number(e.target.value))}
                placeholder="0"
                className="w-16 px-2 py-1 bg-[#0D121D] border border-[#1A2336] rounded text-white text-center"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-mono font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-950/40 transition-all cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{isSubmitting ? "Publishing..." : "Broadcast News Article to Feed"}</span>
        </button>
      </form>
    </div>
  );
}
