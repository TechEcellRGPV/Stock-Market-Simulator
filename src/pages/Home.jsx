import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  Trophy,
  Gauge,
  ShieldAlert,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Zap,
  CheckCircle2,
  Users,
  MapPin,
  Clock,
  Wallet
} from "lucide-react";
import CirculatingBanner from "../components/CirculatingBanner";
import EventCountdown from "../components/EventCountdown";
import { useSimulation } from "../context/SimulationContext";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { currentTeam, raceState } = useSimulation();

  const startingCapital = raceState?.defaultStartingCapital || 100000;

  // Exact 4 Official Announcement Slides from the Event Draft
  const slides = [
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
        "30% STRATEGY & RISK MANAGEMENT: Sector diversification across 5 distinct motorsport sectors.",
        "20% DECISION-MAKING & EXECUTION: Disciplined capital deployment, order timing, and speed."
      ]
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="min-h-screen bg-[#0A0D12] text-white font-sans selection:bg-[#E10600] selection:text-white">
      {/* Real-time Circulating Live Update Banner */}
      <CirculatingBanner />

      {/* Main Navigation Header */}
      <header className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex items-center justify-between border-b border-[#1A202C]">
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
              Imprenditore 5.0
            </h1>
          </div>
        </Link>

        <nav className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <Link
            to="/companies"
            className="hidden md:inline-flex px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white hover:bg-[#161B24] transition-colors border border-transparent hover:border-[#232B3B]"
          >
            Companies
          </Link>
          <Link
            to="/leaderboard"
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider text-[#EAB308] hover:bg-[#EAB308]/10 transition-colors border border-[#EAB308]/30 flex items-center gap-1.5 shrink-0"
            title="Pole Position Leaderboard"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ranks</span>
          </Link>
          {currentTeam ? (
            <Link
              to="/dashboard"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#E10600] hover:bg-[#C50500] text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <span className="truncate max-w-24 sm:max-w-none">{currentTeam.teamName}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>
          ) : !raceState.isRegistrationOpen ? (
            <a
              href="#countdown"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#161B24] hover:bg-[#1D232E] text-[#FF8080] border border-[#E10600]/30 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Registration Locked</span>
            </a>
          ) : (
            <Link
              to="/login"
              className="px-2.5 sm:px-3.5 py-1.5 rounded-lg text-[11px] sm:text-xs font-black uppercase tracking-wider bg-[#E10600] hover:bg-[#C50500] text-white transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Enter Grid</span>
            </Link>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-16">
        <div className="text-center max-w-3xl mx-auto mb-12">
          {/* Official Institutional Presenter Lockup */}
          <div className="inline-flex flex-wrap items-center justify-center gap-2.5 sm:gap-5 max-w-full px-3 sm:px-4 py-2 rounded-2xl bg-[#121720] border border-[#232B3B] mb-6 shadow-md">
            <div className="flex items-center gap-2">
              <img
                src="/rgpv-logo.jpeg"
                alt="RGPV Bhopal"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-full bg-white p-0.5"
              />
              <span className="hidden sm:inline text-[10px] font-bold tracking-wider text-slate-300 uppercase">
                RGPV Bhopal
              </span>
            </div>
            <div className="w-[1px] h-5 bg-[#232B3B]" />
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="E-Cell RGPV"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-white uppercase">
                E-Cell RGPV
              </span>
            </div>
            <div className="w-[1px] h-5 bg-[#232B3B]" />
            <div className="flex items-center gap-2">
              <img
                src="/logo_D.png"
                alt="Imprenditore 5.0"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
              />
              <span className="text-[10px] sm:text-xs font-black tracking-wider text-[#E10600] uppercase">
                Imprenditore 5.0
              </span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase italic tracking-tight text-white leading-tight mb-4">
            THE MARKET IS LIVE. <br />
            <span className="text-[#E10600]">WHAT'S YOUR MOVE?</span>
          </h2>

          <p className="text-sm sm:text-base text-slate-300 font-bold max-w-xl mx-auto mb-5 leading-relaxed tracking-wide">
            ₹{startingCapital.toLocaleString("en-IN")} MOCK CAPITAL • INVEST SMART. TRADE FAST. WIN BIG.
          </p>

          {/* Official Venue & Timing Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121720] border border-[#232B3B] text-xs font-mono font-bold text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-[#E10600]" />
              <span>Venue: RGPV Conference Hall</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121720] border border-[#232B3B] text-xs font-mono font-bold text-slate-200">
              <Clock className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>Timing: 3:00 PM - 5:30 PM</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121720] border border-[#232B3B] text-xs font-mono font-bold text-slate-200">
              <Wallet className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Mock Capital: ₹{startingCapital.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            {!raceState.isRegistrationOpen ? (
              <a
                href="#countdown"
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#161B24] hover:bg-[#1D232E] text-[#FF8080] font-black text-xs uppercase tracking-wider transition-colors border border-[#E10600]/40 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Registration Opens on Event Day</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <Link
                to="/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#E10600] hover:bg-[#C50500] text-white font-black text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Join As Team / Driver</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            <Link
              to="/companies"
              className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-[#161B24] hover:bg-[#1D232E] text-white font-bold text-xs uppercase tracking-wider transition-colors border border-[#232B3B] flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-[#10B981]" />
              <span>Explore Stock Telemetry</span>
            </Link>
          </div>

          {/* Official Flag-Off Countdown Banner */}
          <div id="countdown" className="mt-8 max-w-xl mx-auto scroll-mt-20">
            <EventCountdown />
          </div>
        </div>

        {/* 4-Slide Official Event Briefing Carousel */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                Official Event Briefing
              </h3>
            </div>
            <div className="flex items-center gap-1.5">
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

          <div className="bg-[#121720] rounded-xl border border-[#232B3B] p-6 sm:p-8">
            {/* Slide Progress Indicator */}
            <div className="flex gap-1.5 mb-6">
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
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
                          className="w-3.5 h-3.5 shrink-0 mt-0.5"
                          style={{ color: slides[currentSlide].accentColor }}
                        />
                        <span className="text-xs text-slate-200 font-medium leading-normal">
                          {pt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-4 flex justify-center">
                  <div
                    className="w-28 h-28 sm:w-36 sm:h-36 rounded-xl flex items-center justify-center border bg-[#161B24]"
                    style={{ borderColor: `${slides[currentSlide].accentColor}50` }}
                  >
                    {(() => {
                      const IconComponent = slides[currentSlide].icon;
                      return (
                        <IconComponent
                          className="w-12 h-12 sm:w-16 sm:h-16"
                          style={{ color: slides[currentSlide].accentColor }}
                        />
                      );
                    })()}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A202C] bg-[#0A0D12] px-4 sm:px-6 py-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-6 mb-4 opacity-80 hover:opacity-100 transition-opacity">
          <img src="/rgpv-logo.jpeg" alt="RGPV Bhopal" className="h-7 w-7 object-contain rounded-full bg-white p-0.5" />
          <img src="/logo.png" alt="E-Cell RGPV" className="h-7 object-contain" />
          <img src="/logo_D.png" alt="Imprenditore 5.0" className="h-7 object-contain" />
        </div>
        <p className="font-medium text-slate-400">
          E-Cell RGPV : Imprenditore 5.0 : Stock Market Simulation : RGPV Conference Hall
        </p>
        <p className="text-[11px] text-slate-600 mt-1">
          Motorsport Edition Trading Simulator for Rajiv Gandhi Proudyogiki Vishwavidyalaya
        </p>
      </footer>
    </div>
  );
}
