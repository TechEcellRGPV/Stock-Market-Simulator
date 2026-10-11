import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  Search,
  Zap,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useSimulation } from "../src/context/SimulationContext";
import CirculatingBanner from "../src/components/CirculatingBanner";
import MiniSparklineCanvas from "../src/components/MiniSparklineCanvas";

export default function CompanyDirectory() {
  const { stocks, raceState, currentTeam } = useSimulation();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("ALL");

  const sectors = [
    "ALL",
    "Powertrain & Electric Vehicles",
    "Aerodynamics & Advanced Materials",
    "Telemetry, AI & Autonomous Tech",
    "Sustainable Fuels & Energy",
    "Logistics & Precision Engineering"
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
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Top Telemetry Header */}
      <div className="bg-[#121720] border-b border-[#232B3B] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="w-8 h-8 rounded shrink-0 hover:opacity-90 transition-opacity"
          >
            <img
              src="/logo_D.png"
              alt="Imprenditore 5.0"
              className="w-8 h-8 object-contain rounded"
            />
          </Link>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-[#E10600]">
              E-Cell RGPV : Imprenditore 5.0
            </div>
            <h1 className="text-lg font-black uppercase italic tracking-tight text-white">
              Grid Telemetry & Companies
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="px-2.5 py-1 rounded bg-[#0A0D12] border border-[#232B3B] text-xs font-mono text-[#06B6D4]">
            LAP {raceState.currentLap}/5
          </div>
          {currentTeam ? (
            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded bg-[#161B24] hover:bg-[#1D232E] border border-[#232B3B] text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              Cockpit ({currentTeam.teamName})
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-3.5 py-1.5 rounded bg-[#E10600] hover:bg-[#C50500] text-white text-xs font-black uppercase tracking-wider transition-colors"
            >
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Real-time Circulating Live Update Banner */}
      <CirculatingBanner />

      {/* Main Grid Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Search & Sector Filter Bar */}
        <div className="p-3.5 rounded-xl bg-[#121720] border border-[#232B3B] flex flex-col md:flex-row gap-3 justify-between items-center">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by company or ticker (e.g. APEX)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-lg bg-[#0A0D12] border border-[#232B3B] focus:border-[#E10600] text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>

          {/* Sector Filter Chips */}
          <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
            {sectors.map((sec) => (
              <button
                key={sec}
                onClick={() => setSelectedSector(sec)}
                className={`px-3 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${selectedSector === sec
                    ? "bg-[#E10600] text-white"
                    : "bg-[#0A0D12] text-slate-400 hover:text-white border border-[#232B3B]"
                  }`}
              >
                {sec === "ALL" ? "All Sectors" : sec.split("&")[0].trim()}
              </button>
            ))}
          </div>
        </div>

        {/* 15 Companies Card Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredStocks.map((stock) => {
            const isPositive = stock.changePercent >= 0;

            return (
              <motion.div
                key={stock.ticker}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-xl bg-[#121720] border border-[#232B3B] hover:border-[#323D52] transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#1A202C] text-slate-300 border border-[#2A3447]">
                        {stock.ticker}
                      </span>
                      <h3 className="text-sm font-black text-white mt-1.5">
                        {stock.name}
                      </h3>
                      <div className="text-[11px] font-medium text-slate-400 mt-0.5">
                        {stock.sector}
                      </div>
                    </div>

                    {/* Price & Change Badge */}
                    <div className="text-right">
                      <div className="text-base font-black text-white font-mono">
                        ₹{stock.currentPrice.toFixed(2)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-1 text-[11px] font-bold font-mono px-1.5 py-0.5 rounded mt-0.5 ${isPositive
                            ? "bg-[#10B981]/15 text-[#10B981]"
                            : "bg-[#E10600]/15 text-[#E10600]"
                          }`}
                      >
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        <span>
                          {isPositive ? "+" : ""}
                          {stock.changePercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3 bg-[#0A0D12] p-2 rounded-lg border border-[#1A202C]">
                    <div className="text-[10px] font-mono text-slate-400">
                      <div>H: ₹{stock.dayHigh.toFixed(1)}</div>
                      <div>L: ₹{stock.dayLow.toFixed(1)}</div>
                    </div>
                    <MiniSparklineCanvas
                      sparkline={stock.sparkline && stock.sparkline.length > 1 ? stock.sparkline : [stock.openingPrice, stock.currentPrice]}
                      isPositive={isPositive}
                      width={105}
                      height={32}
                    />
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-3">
                    {stock.description}
                  </p>
                </div>

                {/* Day Range & Trade Button */}
                <div className="pt-2.5 border-t border-[#1A202C] flex items-center justify-between text-[11px]">
                  <div className="text-slate-400 font-mono text-[10px]">
                    OPEN: ₹{stock.openingPrice.toFixed(1)}
                  </div>

                  <Link
                    to={`/trade?ticker=${stock.ticker}`}
                    className="px-3 py-1.5 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-[10px] uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Pit Stop</span>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
