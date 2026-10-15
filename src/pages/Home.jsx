import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowRight,
  TrendingUp,
  Trophy,
  Zap,
  Gauge,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Wallet
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
    description: "Official Formula 1 Stock Market Simulation presented by E-Cell RGPV for Imprenditore 5.0. Trade 17 scrips across 5 sectors with ₹1,00,000 mock capital."
  });

  const [currentSlide, setCurrentSlide] = useState(0);
  const { currentTeam, raceState, stocks } = useSimulation();
  const startingCapital = raceState?.defaultStartingCapital || 100000;

  // Exact 4 Official Announcement Slides from the Event Rulebook (Content preserved verbatim)
  const slides = useMemo(() => [
    {
      id: 1,
      badge: "RULES & REGULATIONS • SLIDE 1 OF 4",
      title: "THE RULEBOOK",
      subtitle: "THE MARKET IS UNPREDICTABLE. THE RULES SHOULDN'T BE.",
      description:
        "Before you make your move, understand the simulation, trading process, and official evaluation criteria.",
      icon: Gauge,
      accentColor: "#E10600",
      points: [
        "Venue: RGPV Conference Hall • Timing: 3:00 PM - 5:30 PM.",
        "Stock Market Simulation: 5 synchronized competition laps with dynamic sector price events.",
        "Before you make your move, understand the simulation, trading process and evaluation criteria.",
        "Follow all operational instructions given by the organizers."
      ]
    },
    {
      id: 2,
      badge: "SIMULATION DYNAMICS • SLIDE 2 OF 4",
      title: "HOW THE SIMULATION WORKS",
      subtitle: "INVEST SMART. TRADE FAST. WIN BIG.",
      description:
        "Your goal is simple: make your capital work and finish with the strongest portfolio.",
      icon: Zap,
      accentColor: "#10B981",
      points: [
        `Start with ₹${startingCapital.toLocaleString("en-IN")} mock capital and decide how you want to build your portfolio.`,
        "Read the market, spot opportunities, and decide where to put your money.",
        "Buy, sell or hold based on your strategy and the situation in the market.",
        "Make your capital work and finish with the strongest portfolio."
      ]
    },
    {
      id: 3,
      badge: "GRID REGULATIONS • SLIDE 3 OF 4",
      title: "RULES OF THE MARKET",
      subtitle: "PLAY FAIR. TRADE SMART.",
      description:
        "Disciplined execution and fair play are strictly enforced throughout the trading session.",
      icon: ShieldAlert,
      accentColor: "#06B6D4",
      points: [
        `Start with the allotted ₹${startingCapital.toLocaleString("en-IN")} virtual capital.`,
        "Make all trades within the given simulation platform.",
        "Keep an eye on your portfolio while you trade.",
        "Market updates can change things, so be ready to change your strategy.",
        "Follow all instructions given by the organisers."
      ]
    },
    {
      id: 4,
      badge: "EVALUATION CRITERIA • SLIDE 4 OF 4",
      title: "THE WINNING FORMULA",
      subtitle: "RETURNS MATTER. BUT STRATEGY AND EXECUTION MATTER TOO.",
      description:
        "Will your strategy take you to the top of the podium? 100 total evaluation points distributed across 3 key pillars.",
      icon: Trophy,
      accentColor: "#EAB308",
      points: [
        "50% PORTFOLIO VALUE: Net capital growth and final portfolio valuation.",
        "30% STRATEGY & RISK MANAGEMENT: Sector diversification across 5 distinct industry sectors.",
        "20% DECISION-MAKING & EXECUTION: Disciplined capital deployment, order timing, and speed."
      ]
    }
  ], [startingCapital]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  // Curate 6 featured stocks for the live preview
  const featuredStocks = useMemo(() => {
    if (!stocks || stocks.length === 0) return [];
    return stocks.slice(0, 6);
  }, [stocks]);


  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white flex flex-col">
      {/* Unified F1 Navbar */}
      <Navbar />

      {/* Real-time Circulating Live Update Banner */}
      <CirculatingBanner />

      {/* Harmonized Main Content Container: Balanced max-w-5xl throughout */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-12">
        {/* F1 Hero Section: Bold, Clean & Proportional */}
        <section className="text-center w-full space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#121720] border border-[#232B3B] text-slate-300 text-xs font-mono font-bold"
          >
            <span className="w-2 h-2 rounded-full bg-[#E10600] animate-pulse" />
            <span className="text-[#E10600]">E-CELL RGPV</span>
            <span className="text-slate-500">•</span>
            <span>IMPRENDITORE 5.0</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tight text-white leading-tight"
          >
            THE MARKET IS LIVE. <br />
            <span className="text-[#E10600]">WHAT'S YOUR MOVE?</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="text-xs sm:text-sm text-slate-300 font-bold max-w-xl mx-auto leading-relaxed tracking-wide"
          >
            ₹{startingCapital.toLocaleString("en-IN")} MOCK CAPITAL • INVEST SMART. TRADE FAST. WIN BIG.
          </motion.p>

          {/* Quick Location & Details Pills */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="flex flex-wrap items-center justify-center gap-2 text-xs"
          >
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#121720] border border-[#232B3B] text-slate-300 font-mono text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
              <span>RGPV Conference Hall</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#121720] border border-[#232B3B] text-slate-300 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>3:00 PM - 5:30 PM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#121720] border border-[#232B3B] text-slate-300 font-mono text-[11px]">
              <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Capital: ₹{startingCapital.toLocaleString("en-IN")}</span>
            </div>
          </motion.div>

          {/* Action Trigger Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.15 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-1"
          >
            {currentTeam ? (
              <Link
                to="/dashboard"
                className="w-full sm:w-auto px-7 py-3 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Enter Cockpit ({currentTeam.teamName})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3 rounded bg-[#E10600] hover:bg-[#C50500] text-white font-black text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Team Login &amp; Register</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}

            <Link
              to="/companies"
              className="w-full sm:w-auto px-7 py-3 rounded bg-[#161B24] hover:bg-[#1D232E] text-white font-bold text-xs uppercase tracking-wider transition-colors border border-[#232B3B] flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>Browse 17 Equities</span>
            </Link>

            <Link
              to="/leaderboard"
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#121720] hover:bg-[#1A202C] text-[#EAB308] font-bold text-xs uppercase tracking-wider transition-colors border border-[#EAB308]/30 flex items-center justify-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Standings</span>
            </Link>
          </motion.div>

          {/* Timer Placed Cleanly In Hero Flow */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="pt-2 max-w-xl mx-auto w-full"
          >
            <EventCountdown />
          </motion.div>
        </section>

        {/* F1 Telemetry Stats Ribbon: Aligned with max-w-5xl grid */}
        <section className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] text-center hover:border-[#38455E] transition-colors">
            <div className="text-xl sm:text-2xl font-mono font-black text-white">
              ₹{startingCapital.toLocaleString("en-IN")}
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Starting Capital
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] text-center hover:border-[#38455E] transition-colors">
            <div className="text-xl sm:text-2xl font-mono font-black text-[#E10600]">
              17
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Scrip Equities
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] text-center hover:border-[#38455E] transition-colors">
            <div className="text-xl sm:text-2xl font-mono font-black text-[#06B6D4]">
              5
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Industry Sectors
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] text-center hover:border-[#38455E] transition-colors">
            <div className="text-xl sm:text-2xl font-mono font-black text-[#EAB308]">
              5 Laps
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mt-1">
              Live Synchronized Rounds
            </div>
          </div>
        </section>

        {/* Simple & Clean Official Event Briefing / Rulebook */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Official Event Briefing
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-slate-400">
                Slide {currentSlide + 1} of {slides.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={prevSlide}
                  className="p-1.5 rounded bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white border border-[#232B3B] transition-colors"
                  aria-label="Previous Slide"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={nextSlide}
                  className="p-1.5 rounded bg-[#161B24] hover:bg-[#232B3B] text-slate-300 hover:text-white border border-[#232B3B] transition-colors"
                  aria-label="Next Slide"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#121720] rounded-xl border border-[#232B3B] p-6 sm:p-8">
            {/* Simple Slide Progress Indicator */}
            <div className="flex gap-2 mb-6">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    idx === currentSlide ? "bg-[#E10600]" : "bg-[#232B3B]"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
              >
                <div className="md:col-span-8 space-y-3">
                  <div className="inline-block px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#1A202C] text-slate-300 border border-[#232B3B]">
                    {slides[currentSlide].badge}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-black uppercase italic tracking-wide text-white">
                    {slides[currentSlide].title}
                  </h4>
                  <p className="text-xs sm:text-sm font-bold text-[#EAB308]">
                    {slides[currentSlide].subtitle}
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>

                  <div className="space-y-2 pt-2">
                    {slides[currentSlide].points.map((pt, i) => (
                      <div key={i} className="flex items-start gap-2.5">
                        <CheckCircle2
                          className="w-4 h-4 shrink-0 mt-0.5 text-[#E10600]"
                        />
                        <span className="text-xs text-slate-200 font-medium leading-relaxed">
                          {pt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 flex justify-center">
                  <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl flex items-center justify-center border border-[#232B3B] bg-[#161B24]">
                    {(() => {
                      const IconComponent = slides[currentSlide].icon;
                      return (
                        <IconComponent
                          className="w-12 h-12 sm:w-14 sm:h-14 text-[#E10600]"
                        />
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* Live Market Telemetry Section: Perfectly aligned with max-w-5xl proportions */}
        <section className="w-full space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <h2 className="text-base font-black uppercase italic tracking-wide text-white">
                  Live Market Telemetry
                </h2>
              </div>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Real-time scrip prices across active laps
              </p>
            </div>
            <Link
              to="/companies"
              className="text-xs font-bold uppercase tracking-wider text-[#E10600] hover:text-[#FF4D4D] flex items-center gap-1 transition-colors"
            >
              <span>View All 17 Equities</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {featuredStocks.map((stock) => {
              const isPositive = (stock.changePercent || 0) >= 0;
              return (
                <Link
                  key={stock.ticker}
                  to={`/trade?ticker=${stock.ticker}`}
                  className="p-4 rounded-xl bg-[#121720] border border-[#232B3B] hover:border-[#38455E] transition-all group flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-xs text-white px-1.5 py-0.5 rounded bg-[#1A202C] border border-[#2A3447]">
                          {stock.ticker}
                        </span>
                        <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-[#0A0D12]">
                          {stock.sector.split("&")[0].trim()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-200 font-bold truncate mt-1.5">
                        {stock.name}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-mono font-black text-sm text-white">
                        ₹{stock.currentPrice.toFixed(2)}
                      </div>
                      <div
                        className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-bold ${
                          isPositive ? "text-[#10B981]" : "text-[#E10600]"
                        }`}
                      >
                        {isPositive ? "+" : ""}{stock.changePercent}%
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#1A202C] flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-mono">
                      L: ₹{stock.dayLow?.toFixed(1) || stock.currentPrice.toFixed(1)}
                    </span>
                    <MiniSparklineCanvas
                      sparkline={stock.sparkline && stock.sparkline.length > 1 ? stock.sparkline : [stock.openingPrice, stock.currentPrice]}
                      isPositive={isPositive}
                      width={80}
                      height={24}
                    />
                    <span className="text-[10px] text-slate-400 font-mono">
                      H: ₹{stock.dayHigh?.toFixed(1) || stock.currentPrice.toFixed(1)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </main>

      {/* Clean F1 Footer: Proportional to max-w-5xl */}
      <footer className="mt-auto border-t border-[#1A202C] bg-[#080B10] py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white uppercase">Imprenditore 5.0</span>
            <span>•</span>
            <span className="text-[#E10600] font-black uppercase">E-Cell RGPV</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Formula 1 Stock Simulator • RGPV Conference Hall
          </div>
        </div>
      </footer>
    </div>
  );
}
