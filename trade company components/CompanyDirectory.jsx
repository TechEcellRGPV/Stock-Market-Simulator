import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  Zap,
  TrendingUp,
  TrendingDown,
  LayoutGrid,
  List,
  X
} from "lucide-react";
import Navbar from "../src/components/Navbar";
import CirculatingBanner from "../src/components/CirculatingBanner";
import MiniSparklineCanvas from "../src/components/MiniSparklineCanvas";
import { useSimulation } from "../src/context/SimulationContext";

export default function CompanyDirectory() {
  const { stocks } = useSimulation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");
  const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"

  const sectors = [
    { label: "All Sectors", value: "ALL" },
    { label: "EV & Powertrain", value: "Powertrain & Electric Vehicles" },
    { label: "Aerodynamics", value: "Aerodynamics & Advanced Materials" },
    { label: "AI & Telemetry", value: "Telemetry, AI & Autonomous Tech" },
    { label: "Energy & Fuels", value: "Sustainable Fuels & Energy" },
    { label: "Logistics", value: "Logistics & Precision Engineering" }
  ];

  const filteredStocks = useMemo(() => {
    return stocks.filter((stock) => {
      const matchSector = selectedSector === "ALL" || stock.sector === selectedSector;
      const matchQuery =
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.ticker.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchQuery;
    });
  }, [stocks, selectedSector, searchQuery]);

  return (
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <Navbar />
      <CirculatingBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Title + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Market Directory
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Browse 17 equities across 5 motorsport and mobility sectors
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Toggle */}
            <div className="flex items-center bg-[#0E1420] p-1 rounded-lg border border-[#1A2336]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#182234] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === "table"
                    ? "bg-[#182234] text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Table View"
                aria-label="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 rounded-xl bg-[#0D121D] border border-[#1A2336]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter by company or ticker (e.g. APEX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#090D14] border border-[#1F2A3F] focus:border-emerald-500 text-xs text-white placeholder:text-slate-400 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                aria-label="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sector Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {sectors.map((sec) => (
              <button
                key={sec.value}
                type="button"
                onClick={() => setSelectedSector(sec.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedSector === sec.value
                    ? "bg-emerald-500 text-slate-950 font-semibold shadow-xs"
                    : "bg-[#090D14] text-slate-400 hover:text-slate-200 border border-[#1A2336] hover:border-[#24314A]"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty Search Results */}
        {filteredStocks.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-[#0D121D] border border-[#1A2336]">
            <p className="text-sm font-semibold text-slate-300">No equities match your search</p>
            <p className="text-xs text-slate-400 mt-1">Try searching for a different ticker or clear sector filters</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSelectedSector("ALL"); }}
              className="mt-3 px-3 py-1.5 rounded-lg bg-[#161F30] text-emerald-400 text-xs font-medium hover:bg-[#1D283E] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* View Mode: Grid */}
        {viewMode === "grid" && filteredStocks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredStocks.map((stock) => {
              const isPositive = (stock.changePercent || 0) >= 0;
              const rangeLow = stock.dayLow || stock.openingPrice;
              const rangeHigh = stock.dayHigh || stock.currentPrice;

              return (
                <motion.div
                  key={stock.ticker}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] hover:border-[#25324C] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Ticker, Name, Price & Change */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-[#141B29] border border-[#1F293D]">
                            {stock.sector.split("&")[0].trim()}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-white mt-1 leading-snug">
                          {stock.name}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-base text-white">
                          ₹{stock.currentPrice.toFixed(2)}
                        </div>
                        <div
                          className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold ${
                            isPositive ? "text-emerald-400" : "text-rose-400"
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isPositive ? "+" : ""}{stock.changePercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Sparkline & Range */}
                    <div className="p-2 rounded-lg bg-[#080B10] border border-[#151D2C] flex items-center justify-between mb-3">
                      <div className="text-[10px] font-mono text-slate-400 space-y-0.5">
                        <div>L: ₹{rangeLow.toFixed(1)}</div>
                        <div>H: ₹{rangeHigh.toFixed(1)}</div>
                      </div>
                      <MiniSparklineCanvas
                        sparkline={stock.sparkline && stock.sparkline.length > 1 ? stock.sparkline : [stock.openingPrice, stock.currentPrice]}
                        isPositive={isPositive}
                        width={90}
                        height={26}
                      />
                    </div>

                    {/* Concise Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {stock.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2.5 border-t border-[#161F30] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Open: ₹{stock.openingPrice.toFixed(2)}
                    </span>

                    <Link
                      to={`/trade?ticker=${stock.ticker}`}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Trade</span>
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View Mode: Table */}
        {viewMode === "table" && filteredStocks.length > 0 && (
          <div className="rounded-xl bg-[#0D121D] border border-[#1A2336] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#1A2336] text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-[#0A0E17]">
                    <th className="py-3 px-4">Scrip</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">24h Change</th>
                    <th className="py-3 px-4 text-right">Day Range</th>
                    <th className="py-3 px-4 text-center">Trend</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#161F30]">
                  {filteredStocks.map((stock) => {
                    const isPositive = (stock.changePercent || 0) >= 0;
                    return (
                      <tr key={stock.ticker} className="hover:bg-[#121824] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-white">{stock.ticker}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-48">{stock.name}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {stock.sector}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-white">
                          ₹{stock.currentPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold">
                          <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                            {isPositive ? "+" : ""}{stock.changePercent}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-[11px] text-slate-400">
                          ₹{stock.dayLow?.toFixed(1) || stock.currentPrice.toFixed(1)} - ₹{stock.dayHigh?.toFixed(1) || stock.currentPrice.toFixed(1)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-block">
                            <MiniSparklineCanvas
                              sparkline={stock.sparkline && stock.sparkline.length > 1 ? stock.sparkline : [stock.openingPrice, stock.currentPrice]}
                              isPositive={isPositive}
                              width={70}
                              height={20}
                            />
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Link
                            to={`/trade?ticker=${stock.ticker}`}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-md bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-[11px] transition-colors"
                          >
                            <Zap className="w-3 h-3" />
                            <span>Trade</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
