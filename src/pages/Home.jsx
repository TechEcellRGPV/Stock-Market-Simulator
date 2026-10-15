import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Trophy,
  ShieldCheck,
  Zap,
  BarChart3,
  Clock,
  Layers,
  Sparkles,
  ChevronRight
} from "lucide-react";
import Navbar from "../components/Navbar";
import CirculatingBanner from "../components/CirculatingBanner";
import MiniSparklineCanvas from "../components/MiniSparklineCanvas";
import EventCountdown from "../components/EventCountdown";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";

export default function Home() {
  useSEO({
    title: "Formula 1 Stock Market Simulator",
    description: "Official Stock Market Simulation presented by E-Cell RGPV for Imprenditore 5.0. Trade 17 scrips across 5 sectors with ₹1,00,000 mock capital."
  });

  const { currentTeam, raceState, stocks } = useSimulation();
  const startingCapital = raceState?.defaultStartingCapital || 100000;

  // Curate 6 featured stocks for the live preview
  const featuredStocks = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];
    return stocks.slice(0, 6);
  }, [stocks]);

  return (
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* Unified Minimal Header */}
      <Navbar />

      {/* Sleek Ticker Ribbon */}
      <CirculatingBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-12 sm:space-y-16">
        {/* Minimal Hero Section */}
        <section className="text-center max-w-3xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#121824] border border-[#202B3E] text-slate-300 text-xs font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>E-Cell RGPV • Imprenditore 5.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]"
          >
            High-Speed <br />
            <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Stock Market Simulator
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto leading-relaxed"
          >
            Deploy ₹{startingCapital.toLocaleString("en-IN")} mock capital across 17 equities and 5 sectors. Formulate your strategy, execute instant trades, and top the leaderboard.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2"
          >
            {currentTeam ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <span>Enter Cockpit ({currentTeam.teamName})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
              >
                <span>Team Login &amp; Register</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/companies"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#121824] hover:bg-[#182132] text-slate-200 font-semibold text-xs uppercase tracking-wider transition-all border border-[#20293D] flex items-center justify-center gap-2"
            >
              <span>Explore Market</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              to="/leaderboard"
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-transparent hover:bg-[#121824] text-amber-400 font-semibold text-xs uppercase tracking-wider transition-all border border-amber-500/20 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Standings</span>
            </Link>
          </motion.div>
        </section>

        {/* Minimal Stats Ribbon */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1C263B] text-center">
            <div className="text-xl sm:text-2xl font-mono font-bold text-white">
              ₹{startingCapital.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Virtual Capital
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1C263B] text-center">
            <div className="text-xl sm:text-2xl font-mono font-bold text-emerald-400">
              17
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Scrip Equities
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1C263B] text-center">
            <div className="text-xl sm:text-2xl font-mono font-bold text-cyan-400">
              5
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Market Sectors
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1C263B] text-center">
            <div className="text-xl sm:text-2xl font-mono font-bold text-amber-400">
              5
            </div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mt-0.5">
              Competition Rounds
            </div>
          </div>
        </section>

        {/* Live Market Snapshot */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Market Snapshot</h2>
              <p className="text-xs text-slate-400">Live prices updated in real-time</p>
            </div>
            <Link
              to="/companies"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
            >
              <span>View All 17 Equities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featuredStocks.map((stock) => {
              const isPositive = (stock.changePercent || 0) >= 0;
              return (
                <Link
                  key={stock.ticker}
                  to={`/trade?ticker=${stock.ticker}`}
                  className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] hover:border-[#2A3854] transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-white">
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.2 rounded bg-[#141B29] border border-[#1F293D]">
                          {stock.sector.split("&")[0].trim()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-medium truncate mt-1">
                        {stock.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-bold text-sm text-white">
                        ₹{stock.currentPrice.toFixed(2)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold ${
                          isPositive ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {isPositive ? "+" : ""}{stock.changePercent}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#161F30] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      Day Low: ₹{stock.dayLow?.toFixed(1) || stock.currentPrice.toFixed(1)}
                    </span>
                    <MiniSparklineCanvas
                      sparkline={stock.sparkline && stock.sparkline.length > 1 ? stock.sparkline : [stock.openingPrice, stock.currentPrice]}
                      isPositive={isPositive}
                      width={80}
                      height={24}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      High: ₹{stock.dayHigh?.toFixed(1) || stock.currentPrice.toFixed(1)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How It Works: Clean 3-Card Grid */}
        <section className="space-y-4">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">How It Works</h2>
            <p className="text-xs text-slate-400">Master the simulation rules and build your edge</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <BarChart3 className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">1. Capital &amp; Strategy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive ₹1,00,000 initial virtual cash. Diversify across 5 sectors to maximize strategy score and hedge market shocks.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">2. Real-Time Order Execution</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                React instantly to sector shocks and price swings. Submit market orders with atomic precision during 5 active laps.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Trophy className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-white">3. Net Profit Ranking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Leaderboard positions are strictly determined by net profit generated over initial capital. Finish on the podium.
              </p>
            </div>
          </div>
        </section>

        {/* Optional Event Countdown (compact) */}
        {raceState?.targetEventDate && (
          <section className="max-w-xl mx-auto">
            <EventCountdown />
          </section>
        )}
      </main>

      {/* Minimal Clean Footer */}
      <footer className="mt-auto border-t border-[#141B28] bg-[#070A0F] py-6 px-4 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Imprenditore 5.0</span>
            <span>•</span>
            <span>E-Cell RGPV</span>
          </div>
          <div>Motorsport Edition Trading Simulator</div>
        </div>
      </footer>
    </div>
  );
}
