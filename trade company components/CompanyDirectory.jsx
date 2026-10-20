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

  const sectors = useMemo(() => {
    const unique = Array.from(new Set(stocks.map((s) => s.sector).filter(Boolean)));
    return [
      { label: "ALL SECTORS", value: "ALL" },
      ...unique.map((sec) => ({
        label: sec.length > 20 ? sec.split("&")[0].trim().toUpperCase() : sec.toUpperCase(),
        value: sec,
      })),
    ];
  }, [stocks]);

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
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white flex flex-col">
      <Navbar />
      <CirculatingBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Header Title + Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#E10600]">
              Stock Catalog
            </div>
            <h1 className="text-xl sm:text-2xl font-black uppercase italic tracking-tight text-white">
              Market Equities &amp; Sectors
            </h1>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {/* View Toggle */}
            <div className="flex items-center bg-[#121720] p-1 rounded border border-[#232B3B]">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "grid"
                    ? "bg-[#161B24] text-[#E10600]"
                    : "text-slate-400 hover:text-white"
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded transition-colors ${
                  viewMode === "table"
                    ? "bg-[#161B24] text-[#E10600]"
                    : "text-slate-400 hover:text-white"
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
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-2.5 rounded-xl bg-[#121720] border border-[#232B3B]">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search company or ticker (e.g. TSLA, NVDA)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-500 outline-none transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white"
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
                className={`px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider transition-all ${
                  selectedSector === sec.value
                    ? "bg-[#E10600] text-white shadow-xs"
                    : "bg-[#0A0D12] text-slate-400 hover:text-white border border-[#232B3B]"
                }`}
              >
                {sec.label}
              </button>
            ))}
          </div>
        </div>

        {/* Empty Search Results */}
        {filteredStocks.length === 0 && (
          <div className="text-center py-12 rounded-xl bg-[#121720] border border-[#232B3B]">
            <p className="text-sm font-bold text-slate-300">No stocks match your search query</p>
            <p className="text-xs text-slate-500 mt-1">Try another stock name or clear sector filters</p>
            <button
              type="button"
              onClick={() => { setSearchQuery(""); setSelectedSector("ALL"); }}
              className="mt-3 px-3 py-1.5 rounded bg-[#161B24] text-[#E10600] text-xs font-bold uppercase border border-[#232B3B] hover:bg-[#1D232E] transition-colors"
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
                  className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] hover:border-[#38455E] transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Ticker, Name, Price & Change */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white px-1.5 py-0.5 rounded bg-[#1A202C] border border-[#2A3447]">
                            {stock.ticker}
                          </span>
                          <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#0A0D12]">
                            {stock.sector.split("&")[0].trim()}
                          </span>
                        </div>
                        <h3 className="text-sm font-black text-white mt-1.5 leading-snug">
                          {stock.name}
                        </h3>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-black text-base text-white">
                          ₹{stock.currentPrice.toFixed(2)}
                        </div>
                        <div
                          className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                            isPositive ? "text-[#10B981]" : "text-[#E10600]"
                          }`}
                        >
                          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isPositive ? "+" : ""}{stock.changePercent}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Sparkline & Range */}
                    <div className="p-2 rounded-lg bg-[#0A0D12] border border-[#1A202C] flex items-center justify-between mb-3">
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

                    {/* Description */}
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {stock.description}
                    </p>
                  </div>

                  {/* Footer Action */}
                  <div className="pt-2.5 border-t border-[#1A202C] flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      OPEN: ₹{stock.openingPrice.toFixed(2)}
                    </span>

                    <Link
                      to={`/trade?ticker=${stock.ticker}`}
                      className="px-3 py-1.5 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-[11px] uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
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
          <div className="rounded-xl bg-[#121720] border border-[#232B3B] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead>
                  <tr className="border-b border-[#232B3B] text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-[#0E131C]">
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Sector</th>
                    <th className="py-3 px-4 text-right">Price</th>
                    <th className="py-3 px-4 text-right">24h Change</th>
                    <th className="py-3 px-4 text-right">Day Range</th>
                    <th className="py-3 px-4 text-center">Telemetry</th>
                    <th className="py-3 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A202C]">
                  {filteredStocks.map((stock) => {
                    const isPositive = (stock.changePercent || 0) >= 0;
                    return (
                      <tr key={stock.ticker} className="hover:bg-[#161B24] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-black text-white">{stock.ticker}</div>
                          <div className="text-[11px] text-slate-400 truncate max-w-48">{stock.name}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-400">
                          {stock.sector}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-black text-white">
                          ₹{stock.currentPrice.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={isPositive ? "text-[#10B981]" : "text-[#E10600]"}>
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
                            className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-[11px] uppercase tracking-wider transition-colors"
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
