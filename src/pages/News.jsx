import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Newspaper,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Minus,
  Megaphone,
  ExternalLink,
  RefreshCw,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building2,
  Zap,
  Radio,
  Trophy
} from "lucide-react";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";
import CirculatingBanner from "../components/CirculatingBanner";

const CATEGORIES = [
  { id: "ALL", label: "All News" },
  { id: "ANNOUNCEMENT", label: "Announcements" },
  { id: "EQUITIES", label: "Equities" },
  { id: "TECH", label: "Tech & AI" },
  { id: "ENERGY", label: "Energy & EV" },
  { id: "MACRO", label: "Macro & Rates" },
];

function formatTimeAgo(timestamp) {
  if (!timestamp) return "Recent";
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function News() {
  useSEO({
    title: "Market News & Telemetry Intelligence",
    description: "Live real-time news feed, sector shocks, race director announcements, and fundamental corporate intelligence for Imprenditore 5.0.",
  });

  const {
    marketNews,
    seedInitialMarketNews,
    isAdmin,
    currentTeam,
    raceState,
  } = useSimulation();

  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTicker, setSelectedTicker] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [seedNotice, setSeedNotice] = useState("");

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSeedNews = async () => {
    try {
      const res = await seedInitialMarketNews(false);
      setSeedNotice(
        res.seeded
          ? `Populated ${res.count} curated market intelligence articles!`
          : `News feed is already active with ${res.count} articles.`
      );
      setTimeout(() => setSeedNotice(""), 4000);
    } catch (err) {
      setSeedNotice(err.message || "Failed to seed news.");
      setTimeout(() => setSeedNotice(""), 4000);
    }
  };

  const filteredNews = useMemo(() => {
    const list = Array.isArray(marketNews) ? marketNews : [];
    return list.filter((item) => {
      if (selectedCategory !== "ALL" && item.category !== selectedCategory) {
        return false;
      }
      if (selectedTicker && item.ticker !== selectedTicker) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const inTitle = item.title?.toLowerCase().includes(q);
        const inSummary = item.summary?.toLowerCase().includes(q);
        const inTicker = item.ticker?.toLowerCase().includes(q);
        const inSource = item.source?.toLowerCase().includes(q);
        return inTitle || inSummary || inTicker || inSource;
      }
      return true;
    });
  }, [marketNews, selectedCategory, selectedTicker, searchQuery]);

  // Unique tickers in news items
  const availableTickers = useMemo(() => {
    const list = Array.isArray(marketNews) ? marketNews : [];
    const set = new Set();
    list.forEach((item) => {
      if (item.ticker) set.add(item.ticker);
    });
    return Array.from(set);
  }, [marketNews]);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-slate-100 flex flex-col antialiased selection:bg-[#E10600]/30 selection:text-white">
      {/* Top Header */}
      <header className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-[#1A202C]">
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 min-w-0 hover:opacity-95 transition-opacity">
          <img
            src="/logo_D.png"
            alt="Imprenditore 5.0"
            className="w-8 h-8 sm:w-9 sm:h-9 object-contain rounded shrink-0"
          />
          <div className="min-w-0">
            <div className="text-[9px] font-black tracking-widest text-[#E10600] uppercase truncate">
              E-Cell RGPV
            </div>
            <h1 className="text-xs sm:text-base font-black tracking-wider uppercase text-white leading-none mt-0.5 truncate">
              Market Intelligence
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            to="/companies"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#161B24] transition-colors border border-transparent hover:border-[#232B3B]"
          >
            Companies
          </Link>
          <Link
            to="/trade"
            className="hidden sm:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#161B24] transition-colors border border-transparent hover:border-[#232B3B]"
          >
            Trade Desk
          </Link>
          <Link
            to="/leaderboard"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#EAB308] hover:bg-[#EAB308]/10 transition-colors border border-[#EAB308]/30 flex items-center gap-1.5 shrink-0"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ranks</span>
          </Link>
          {currentTeam ? (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#E10600] hover:bg-[#C50500] text-white transition-colors flex items-center gap-1.5 shrink-0 shadow-sm"
            >
              <span>Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-[#E10600] hover:bg-[#C50500] text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span>Login</span>
            </Link>
          )}
        </nav>
      </header>

      {/* Circulating Live Ticker Banner */}
      <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 pt-4">
        <div className="rounded-xl overflow-hidden border border-[#20293D] shadow-md shadow-black/40">
          <CirculatingBanner />
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#1A202C]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#06B6D4]">
              <Radio className="w-4 h-4 animate-pulse" />
              <span>Real-Time Bloomberg &amp; Race Control Telemetry</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-white mt-1">
              Market Intelligence &amp; Breaking Wire
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Track fundamental catalysts, central bank monetary policy, sector-wide supply shifts, and official Race Director lap alerts in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={handleRefresh}
              className="px-3 py-1.5 rounded-lg bg-[#121720] hover:bg-[#1A2234] border border-[#232B3B] text-xs font-bold uppercase text-slate-300 hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#06B6D4] ${isRefreshing ? "animate-spin" : ""}`} />
              <span>Refresh Wire</span>
            </button>

            {isAdmin && (
              <Link
                to="/admin"
                className="px-3 py-1.5 rounded-lg bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 border border-[#06B6D4]/30 text-xs font-bold uppercase text-[#06B6D4] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>Admin News Wire</span>
              </Link>
            )}
          </div>
        </div>

        {seedNotice && (
          <div className="p-3 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-xs text-[#10B981] flex items-center gap-2 font-mono">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>{seedNotice}</span>
          </div>
        )}

        {/* Filter & Search Bar Controls */}
        <div className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search headlines, company tickers (APEX, VOLT), or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06B6D4] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs font-bold"
                >
                  ×
                </button>
              )}
            </div>

            {/* Total Results Count */}
            <div className="text-xs font-mono text-slate-400 shrink-0 self-center">
              Showing <span className="font-bold text-white">{filteredNews.length}</span> articles
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-t border-[#1A202C] pt-3">
            {CATEGORIES.map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedTicker(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-all ${
                    active
                      ? "bg-[#E10600] text-white shadow-sm"
                      : "bg-[#0A0D12] hover:bg-[#161B24] text-slate-400 hover:text-slate-200 border border-[#1A202C]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Quick Ticker Filter Pills */}
          {availableTickers.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
              <span className="text-slate-500 font-mono">Filter by Scrip:</span>
              {availableTickers.map((ticker) => {
                const isSelected = selectedTicker === ticker;
                return (
                  <button
                    key={ticker}
                    onClick={() => setSelectedTicker(isSelected ? null : ticker)}
                    className={`px-2 py-0.5 rounded font-mono font-bold transition-colors ${
                      isSelected
                        ? "bg-[#06B6D4] text-slate-950 font-black shadow-xs"
                        : "bg-[#0A0D12] hover:bg-[#161B24] text-slate-400 hover:text-[#06B6D4] border border-[#1A202C]"
                    }`}
                  >
                    ${ticker}
                  </button>
                );
              })}
              {selectedTicker && (
                <button
                  onClick={() => setSelectedTicker(null)}
                  className="text-xs text-red-400 hover:text-red-300 underline font-mono"
                >
                  Clear scrip
                </button>
              )}
            </div>
          )}
        </div>

        {/* News Feed Cards Grid */}
        {filteredNews.length === 0 ? (
          <div className="py-20 text-center bg-[#121720] rounded-xl border border-[#232B3B] space-y-3 px-4">
            <div className="w-12 h-12 rounded-full bg-[#1A2234] border border-[#2A344A] flex items-center justify-center mx-auto text-slate-500">
              <Newspaper className="w-6 h-6 text-[#06B6D4]" />
            </div>
            <div className="text-sm sm:text-base font-bold text-white">No Market Intelligence Articles Published Yet</div>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              {searchQuery || selectedCategory !== "ALL" || selectedTicker
                ? "Try adjusting your search keywords or switching category filters."
                : "The live telemetry wire is currently on standby. Market shocks, regulatory bulletins, and corporate updates will appear here once published by organizers."}
            </p>
            {isAdmin && (
              <div className="pt-2">
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-slate-950 text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-[#06B6D4]/20"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Open Admin News Desk to Publish</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNews.map((article) => {
              const isBullish = article.sentiment === "BULLISH";
              const isBearish = article.sentiment === "BEARISH";
              const isOfficial = article.isOfficialAnnouncement;

              return (
                <article
                  key={article._id || article.id || article.title}
                  className={`group relative p-5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                    isOfficial
                      ? "bg-linear-to-br from-[#1C1214] via-[#151720] to-[#0E121A] border-[#E10600]/40 shadow-lg shadow-[#E10600]/5 hover:border-[#E10600]"
                      : "bg-[#121720] hover:bg-[#151B26] border-[#232B3B] hover:border-slate-700 shadow-md"
                  }`}
                >
                  <div className="space-y-3">
                    {/* Card Badges Row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap text-[10px] font-mono">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isOfficial && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E10600] text-white font-black tracking-wider uppercase shadow-xs">
                            <ShieldCheck className="w-3 h-3" />
                            Official Announcement
                          </span>
                        )}

                        <span className="px-2 py-0.5 rounded bg-[#0A0D12] border border-[#232B3B] text-slate-300 font-bold uppercase tracking-wider">
                          {article.category}
                        </span>

                        {article.ticker && (
                          <Link
                            to={`/trade?ticker=${article.ticker}`}
                            className="px-2 py-0.5 rounded bg-[#06B6D4]/15 hover:bg-[#06B6D4]/30 text-[#06B6D4] font-black uppercase border border-[#06B6D4]/30 transition-colors flex items-center gap-1"
                            title={`Trade ${article.ticker}`}
                          >
                            <span>${article.ticker}</span>
                            <ArrowRight className="w-2.5 h-2.5" />
                          </Link>
                        )}
                      </div>

                      {/* Sentiment Badge */}
                      <div className="shrink-0">
                        {isBullish ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-bold">
                            <TrendingUp className="w-3 h-3" />
                            <span>BULLISH</span>
                          </span>
                        ) : isBearish ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/60 border border-red-800 text-red-400 font-bold">
                            <TrendingDown className="w-3 h-3" />
                            <span>BEARISH</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-400 font-medium">
                            <Minus className="w-3 h-3" />
                            <span>NEUTRAL</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Headline */}
                    <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-[#06B6D4] transition-colors">
                      {article.title}
                    </h3>

                    {/* Summary */}
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      {article.summary}
                    </p>
                  </div>

                  {/* Card Footer: Metadata and Link */}
                  <div className="pt-4 mt-3 border-t border-[#1F2736] flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate font-medium text-slate-300">
                        {article.source || "Market Wire"}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-slate-500 shrink-0 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(article.timestamp)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {article.ticker && (
                        <Link
                          to={`/trade?ticker=${article.ticker}`}
                          className="text-xs font-bold text-[#E10600] hover:text-[#FF6B6B] uppercase font-mono flex items-center gap-1"
                        >
                          <span>Pit Stop Trade</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      )}
                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded text-slate-500 hover:text-white transition-colors"
                          title="Open external source"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
