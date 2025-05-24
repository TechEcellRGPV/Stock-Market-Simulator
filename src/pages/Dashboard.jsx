"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "../components/ui/card"
import { Progress } from "../components/ui/progress"
import { Button } from "../components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "../components/ui/sheet"
import { motion } from "framer-motion"
import { Leaf, BarChart3, Clock, Building2, ArrowUpRight, Layers, LineChart, Menu, X, ChevronRight, ArrowDownRight } from "lucide-react"
import { useMobile } from "../hooks/use-mobile"

const MotionCard = motion(Card)

// Add this custom hook at the top of the file, before the Dashboard component
const useCountUp = (end, duration = 1500) => {
  const [count, setCount] = useState(0)
  const countRef = useRef(count)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isAnimating) return

    setIsAnimating(true)
    const startTime = Date.now()
    const startValue = countRef.current
    const endValue = end

    const animate = () => {
      const now = Date.now()
      const progress = Math.min((now - startTime) / duration, 1)
      
      if (progress < 1) {
        const currentValue = Math.floor(startValue + (endValue - startValue) * progress)
        setCount(currentValue)
        countRef.current = currentValue
        requestAnimationFrame(animate)
      } else {
        setCount(endValue)
        countRef.current = endValue
        setIsAnimating(false)
      }
    }

    requestAnimationFrame(animate)
  }, [end, duration])

  return count
}

export default function Dashboard() {
  const isMobile = useMobile()
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Theme colors for sustainability
  const colors = {
    pureWhite: "#FFFFFF",
    lightestYellow: "#F9F7DC",
    lightYellow: "#F2EFBB",
    // Base green colors
    mutedGreen: "#9EBC63",
    mediumGreen: "#82AA57",
    darkGreen: "#618943",
    accentPaleGreen: "#C5D86D",
    softBlue: "#D1E3F5",
    leafGreen: "#2E7D32",
    // Add danger colors
    dangerRed: "#D32F2F",
    dangerLight: "#EF5350",
    // Nature-inspired gradients
    gradients: {
      leaf: "bg-gradient-to-br from-green-600 to-green-800",
      danger: "linear-gradient(135deg, #D32F2F 0%, #EF5350 100%)",
      forest: "bg-gradient-to-br from-green-600 to-green-800",
      meadow: "bg-gradient-to-br from-green-600 to-green-800",
      sunrise: "linear-gradient(135deg, #F2EFBB 0%, #C5D86D 100%)",
      cardBg: "linear-gradient(145deg, rgba(255, 255, 255, 0.95), rgba(249, 247, 220, 0.3))",
      pageBg: "linear-gradient(145deg, rgba(255, 255, 255, 1), rgba(249, 247, 220, 0.4))"
    },
    borderColor: "rgba(97, 137, 67, 0.15)"
  }

  // Progress bar colors for different sectors
  const progressColors = {
    renewable: {
      bg: "rgba(158, 188, 99, 0.15)",
      fill: "#82AA57"
    },
    tech: {
      bg: "rgba(130, 170, 87, 0.15)",
      fill: "#9EBC63"
    },
    transport: {
      bg: "rgba(197, 216, 109, 0.15)",
      fill: "#82AA57"
    },
    waste: {
      bg: "rgba(242, 239, 187, 0.15)",
      fill: "#9EBC63"
    },
    buildings: {
      bg: "rgba(209, 227, 245, 0.15)",
      fill: "#82AA57"
    },
    overall: {
      bg: "rgba(158, 188, 99, 0.15)",
      fill: "#82AA57"
    }
  }

  // Basic animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 }
    },
  }

  // Define target values
  const targetScores = {
    esg: 84,
    diversity: 78,
    overall: 81,
    portfolioValue: {
      current: 157500,
      change: -8.5,
      isProfit: false
    },
    sectors: [35, 25, 20, 15, 5]
  }

  // States for progress values
  const [esgProgress, setEsgProgress] = useState(0)
  const [diversityProgress, setDiversityProgress] = useState(0)
  const [overallProgress, setOverallProgress] = useState(0)
  const [sectorsProgress, setSectorsProgress] = useState([0, 0, 0, 0, 0])

  // Animated values using custom hook
  const esgCount = useCountUp(targetScores.esg)
  const diversityCount = useCountUp(targetScores.diversity)
  const overallCount = useCountUp(targetScores.overall)
  const portfolioValueCount = useCountUp(targetScores.portfolioValue.current)

  // Create individual hooks for each sector
  const sectorCounts = targetScores.sectors.map(value => useCountUp(value))

  useEffect(() => {
    if (!mounted) {
      setMounted(true)
      // Start with 0
      setEsgProgress(0)
      setDiversityProgress(0)
      setOverallProgress(0)
      setSectorsProgress(targetScores.sectors)

      // Animate to target values after a short delay
      const timer = setTimeout(() => {
        setEsgProgress(targetScores.esg)
        setDiversityProgress(targetScores.diversity)
        setOverallProgress(targetScores.overall)
        setSectorsProgress(targetScores.sectors)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [mounted])

  if (!mounted) return null

  const NavItem = ({ icon, label, active, onClick }) => {
    // Define gradients for each nav item
    const getGradient = (label) => {
      switch (label) {
        case "Dashboard":
          return `linear-gradient(135deg, ${colors.mutedGreen}33, ${colors.accentPaleGreen}4D)`;
        case "Trade":
          return `linear-gradient(135deg, ${colors.mediumGreen}33, ${colors.lightYellow}4D)`;
        case "Companies":
          return `linear-gradient(135deg, ${colors.mutedGreen}33, ${colors.accentPaleGreen}4D)`;
        default:
          return `linear-gradient(135deg, ${colors.mutedGreen}22, ${colors.accentPaleGreen}44)`;
      }
    };

    return (
      <motion.a
        whileHover={{ x: 5 }}
        whileTap={{ scale: 0.95 }}
        href="#"
        className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 ${
          active 
            ? `font-medium shadow-sm`
            : "hover:bg-opacity-10"
        }`}
        style={{
          background: active ? getGradient(label) : "transparent",
          color: active ? colors.darkGreen : colors.mutedGreen,
        }}
        onClick={onClick}
      >
        {icon}
        {label}
        {active && <ChevronRight className="h-4 w-4 ml-auto" />}
      </motion.a>
    )
  }

  return (
    <div 
      className="flex flex-col md:flex-row min-h-screen relative"
      style={{
        background: colors.gradients.pageBg
      }}
    >
      {/* Desktop Sidebar */}
      <div className="hidden md:flex flex-col w-64 border-r p-6" style={{ borderColor: colors.borderColor }}>
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <img 
            src="/images/logo.svg" 
            alt="Logo" 
            className="h-8 w-8"
            style={{ filter: `brightness(0) saturate(100%) invert(56%) sepia(24%) saturate(845%) hue-rotate(54deg) brightness(92%) contrast(86%)` }}
          />
          <h2 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: colors.darkGreen }}>Imprenditore </h2>
        </div>

        {/* Trader Profile */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
              style={{ 
                background: colors.gradients.leaf,
                color: colors.pureWhite
              }}
            >
              T
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: colors.darkGreen }}>Trader</div>
              <div className="text-sm font-medium" style={{ color: colors.mutedGreen }}>Active</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          <NavItem
            icon={<BarChart3 className="h-5 w-5" />}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <NavItem
            icon={<LineChart className="h-5 w-5" />}
            label="Trade"
            active={activeTab === "trade"}
            onClick={() => setActiveTab("trade")}
          />
          <NavItem
            icon={<Building2 className="h-5 w-5" />}
            label="Companies"
            active={activeTab === "companies"}
            onClick={() => setActiveTab("companies")}
          />
        </nav>

        {/* Round Info */}
        <div className="mt-auto pt-4" style={{ borderTop: `1px solid ${colors.borderColor}` }}>
          <div className="flex items-center gap-2 text-sm" style={{ color: colors.mutedGreen }}>
            <Clock className="h-4 w-4" />
            <span>Round 3 of 5</span>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div 
        className="md:hidden sticky top-0 z-50 border-b p-4 flex justify-between items-center bg-white"
        style={{
          borderColor: colors.borderColor
        }}
      >
        <div className="flex items-center gap-2">
          <img 
            src="/images/logo.svg" 
            alt="Logo" 
            className="h-8 w-8"
            style={{ filter: `brightness(0) saturate(100%) invert(56%) sepia(24%) saturate(845%) hue-rotate(54deg) brightness(92%) contrast(86%)` }}
          />
          <h2 className="text-xl font-extrabold uppercase tracking-wide" style={{ color: colors.darkGreen }}>Imprenditore</h2>
        </div>

        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg"
          style={{ 
            background: isMobileMenuOpen ? colors.gradients.leaf : 'transparent',
            color: isMobileMenuOpen ? colors.pureWhite : colors.darkGreen,
            boxShadow: isMobileMenuOpen ? `0 2px 8px ${colors.mutedGreen}40` : 'none'
          }}
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile Menu */}
      <div 
        className={`md:hidden fixed inset-0 z-50 transition-all duration-300 ${isMobileMenuOpen ? 'visible opacity-100' : 'invisible opacity-0'}`}
      >
        {/* Overlay */}
        <div 
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-30' : 'opacity-0'}`}
          onClick={() => setIsMobileMenuOpen(false)}
        />
        
        {/* Menu Content */}
        <div 
          className={`absolute right-0 top-[64px] w-[250px] h-[calc(100vh-64px)] border-l p-4 transition-transform duration-300 ease-out`}
          style={{ 
            borderColor: colors.borderColor,
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(242, 239, 187, 0.9))",
            transform: isMobileMenuOpen ? "translateX(0)" : "translateX(100%)",
            boxShadow: "-4px 0 12px rgba(0, 0, 0, 0.05)"
          }}
        >
          {/* User Profile */}
          <div 
            className="flex items-center gap-3 mb-6 pb-4" 
            style={{ 
              borderBottom: `1px solid ${colors.borderColor}`
            }}
          >
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold"
              style={{ 
                background: colors.gradients.leaf,
                color: colors.pureWhite
              }}
            >
              T
            </div>
            <div>
              <div className="text-base font-bold" style={{ color: colors.darkGreen }}>Trader</div>
              <div className="text-sm font-medium" style={{ color: colors.mutedGreen }}>Active</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <NavItem
              icon={<BarChart3 className="h-5 w-5" style={{ color: colors.darkGreen }} />}
              label="Dashboard"
              active={activeTab === "dashboard"}
              onClick={() => {
                setActiveTab("dashboard");
                setIsMobileMenuOpen(false);
              }}
              className={`transition-colors duration-200 ${activeTab === "dashboard" ? "bg-white/50" : "hover:bg-white/30"}`}
            />
            <NavItem
              icon={<LineChart className="h-5 w-5" style={{ color: colors.darkGreen }} />}
              label="Trade"
              active={activeTab === "trade"}
              onClick={() => {
                setActiveTab("trade");
                setIsMobileMenuOpen(false);
              }}
              className={`transition-colors duration-200 ${activeTab === "trade" ? "bg-white/50" : "hover:bg-white/30"}`}
            />
            <NavItem
              icon={<Building2 className="h-5 w-5" style={{ color: colors.darkGreen }} />}
              label="Companies"
              active={activeTab === "companies"}
              onClick={() => {
                setActiveTab("companies");
                setIsMobileMenuOpen(false);
              }}
              className={`transition-colors duration-200 ${activeTab === "companies" ? "bg-white/50" : "hover:bg-white/30"}`}
            />
          </nav>

          {/* Round Info */}
          <div 
            className="mt-6 pt-4"
            style={{ 
              borderTop: `1px solid ${colors.borderColor}`
            }}
          >
            <div className="flex items-center gap-2 text-sm" style={{ color: colors.mutedGreen }}>
              <Clock className="h-4 w-4" />
              <span>Round 3 of 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        <div className="p-2 md:p-6 lg:p-8 max-w-full overflow-x-hidden">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-6xl font-extrabold mb-4 md:mb-6 px-4 md:px-6"
            style={{ color: "rgb(97, 137, 67)" }}
          >
            Dashboard
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5 }}
            className="h-px mb-4 md:mb-6 origin-left mx-4 md:mx-6"
            style={{ background: `linear-gradient(to right, rgb(97, 137, 67), ${colors.lightestYellow})` }}
          ></motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b px-4 md:px-6"
            style={{ borderColor: colors.borderColor }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-800"
                style={{ 
                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                }}
              >
                <Leaf 
                  className="h-5 w-5" 
                  style={{ color: colors.pureWhite }} 
                />
              </div>
              <h2 
                className="text-xl md:text-3xl font-bold"
                style={{ color: colors.darkGreen }}
              >
                Stock Market Simulator
              </h2>
            </div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center gap-2 md:gap-3 w-full sm:w-auto bg-gradient-to-br from-green-600 to-green-800"
              style={{ 
                boxShadow: "0 4px 15px rgba(97, 137, 67, 0.2)",
                border: `1px solid rgba(255, 255, 255, 0.2)`
              }}
            >
              <Clock className="h-5 w-5 md:h-6 md:w-6 text-white" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base md:text-lg font-bold text-white">Round 3</span>
                  <span className="text-xs md:text-sm text-white/80">of</span>
                  <span className="text-base md:text-lg font-bold text-white">5</span>
                </div>
                <div className="text-xs md:text-sm text-white/90">Time remaining: 01:23:45</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats Section */}
          <div className="mb-8 md:mb-12 px-4 md:px-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <MotionCard
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="overflow-hidden shadow-lg backdrop-blur-md w-full"
                style={{
                  background: colors.gradients.cardBg
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p 
                        className="text-base font-medium mb-1"
                        style={{ color: colors.darkGreen }}
                      >
                        ESG Score
                      </p>
                      <h3 
                        className="text-2xl font-extrabold"
                        style={{ color: colors.mutedGreen }}
                      >
                        {esgCount}%
                      </h3>
                    </div>
                    <div 
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(to bottom right, rgb(22, 163, 74), rgb(21, 128, 61))',
                        boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                      }}
                    >
                      <ArrowUpRight 
                        className="h-3.5 w-3.5" 
                        style={{ color: colors.pureWhite }} 
                      />
                    </div>
                  </div>
                  <Progress
                    value={esgCount}
                    className="h-2 rounded-full"
                    style={{
                      '--progress-color': progressColors.renewable.fill,
                      backgroundColor: progressColors.renewable.bg
                    }}
                  />
                </CardContent>
              </MotionCard>

              <MotionCard
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="overflow-hidden shadow-lg backdrop-blur-md w-full"
                style={{
                  background: colors.gradients.cardBg
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p 
                        className="text-base font-medium mb-1"
                        style={{ color: colors.darkGreen }}
                      >
                        Diversity Score
                      </p>
                      <h3 
                        className="text-2xl font-extrabold"
                        style={{ color: colors.mutedGreen }}
                      >
                        {diversityCount}%
                      </h3>
                    </div>
                    <div 
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(to bottom right, rgb(22, 163, 74), rgb(21, 128, 61))',
                        boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                      }}
                    >
                      <Layers 
                        className="h-3.5 w-3.5" 
                        style={{ color: colors.pureWhite }} 
                      />
                    </div>
                  </div>
                  <Progress
                    value={diversityCount}
                    className="h-2 rounded-full"
                    style={{
                      '--progress-color': progressColors.tech.fill,
                      backgroundColor: progressColors.tech.bg
                    }}
                  />
                </CardContent>
              </MotionCard>

              <MotionCard
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="overflow-hidden shadow-lg backdrop-blur-md w-full"
                style={{
                  background: colors.gradients.cardBg
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p 
                        className="text-base font-medium mb-1"
                        style={{ color: colors.darkGreen }}
                      >
                        Performance
                      </p>
                      <h3 
                        className="text-2xl font-extrabold"
                        style={{ color: colors.mutedGreen }}
                      >
                        {overallCount}%
                      </h3>
                    </div>
                    <div 
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(to bottom right, rgb(22, 163, 74), rgb(21, 128, 61))',
                        boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                      }}
                    >
                      <BarChart3 
                        className="h-3.5 w-3.5" 
                        style={{ color: colors.pureWhite }} 
                      />
                    </div>
                  </div>
                  <Progress
                    value={overallCount}
                    className="h-2 rounded-full"
                    style={{
                      '--progress-color': progressColors.overall.fill,
                      backgroundColor: progressColors.overall.bg
                    }}
                  />
                </CardContent>
              </MotionCard>

              <MotionCard
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="overflow-hidden shadow-lg backdrop-blur-md w-full"
                style={{
                  background: colors.gradients.cardBg
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p 
                        className="text-base font-medium mb-1"
                        style={{ color: colors.darkGreen }}
                      >
                        Portfolio Value
                      </p>
                      <div className="flex items-center gap-2">
                        <h3 
                          className="text-2xl font-extrabold"
                          style={{ color: colors.mutedGreen }}
                        >
                          ${(portfolioValueCount/1000).toFixed(1)}K
                        </h3>
                        <span 
                          className="text-xs font-bold flex items-center"
                          style={{ 
                            color: targetScores.portfolioValue.isProfit ? colors.leafGreen : colors.dangerRed 
                          }}
                        >
                          {targetScores.portfolioValue.isProfit ? '+' : '-'}{Math.abs(targetScores.portfolioValue.change)}%
                        </span>
                      </div>
                    </div>
                    <div 
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ 
                        background: targetScores.portfolioValue.isProfit ? 'linear-gradient(to bottom right, rgb(22, 163, 74), rgb(21, 128, 61))' : colors.gradients.danger,
                        boxShadow: targetScores.portfolioValue.isProfit 
                          ? "0 2px 8px rgba(46, 125, 50, 0.3)"
                          : "0 2px 8px rgba(211, 47, 47, 0.3)"
                      }}
                    >
                      {targetScores.portfolioValue.isProfit ? (
                        <ArrowUpRight 
                          className="h-3.5 w-3.5" 
                          style={{ color: colors.pureWhite }} 
                        />
                      ) : (
                        <ArrowDownRight 
                          className="h-3.5 w-3.5" 
                          style={{ color: colors.pureWhite }} 
                        />
                      )}
                    </div>
                  </div>
                  <Progress
                    value={targetScores.portfolioValue.change}
                    className="h-2 rounded-full"
                    style={{
                      '--progress-color': targetScores.portfolioValue.isProfit ? progressColors.overall.fill : colors.dangerRed,
                      backgroundColor: targetScores.portfolioValue.isProfit ? progressColors.overall.bg : 'rgba(211, 47, 47, 0.15)'
                    }}
                  />
                </CardContent>
              </MotionCard>
            </div>
          </div>

          {/* Portfolio Distribution */}
          <div className="px-4 md:px-6">
            <MotionCard
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              className="mb-6 overflow-hidden shadow-lg backdrop-blur-md"
              style={{
                background: colors.gradients.cardBg
              }}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-3 mb-8">
                  <div 
                    className="p-2 rounded-full flex items-center justify-center"
                    style={{ 
                      background: 'linear-gradient(to bottom right, rgb(22, 163, 74), rgb(21, 128, 61))',
                      boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                    }}
                  >
                    <Layers 
                      className="h-3.5 w-3.5" 
                      style={{ color: colors.pureWhite }} 
                    />
                  </div>
                  <h3 
                    className="text-2xl font-extrabold"
                    style={{ color: colors.darkGreen }}
                  >
                    Portfolio Distribution
                  </h3>
                </div>
                <div className="space-y-6">
                  {[
                    { name: "Renewable Energy", color: progressColors.renewable },
                    { name: "Sustainable Tech", color: progressColors.tech },
                    { name: "Clean Transportation", color: progressColors.transport },
                    { name: "Waste Management", color: progressColors.waste },
                    { name: "Green Buildings", color: progressColors.buildings },
                  ].map((sector, index) => (
                    <div key={sector.name} className="bg-white/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <div>
                          <h4 
                            className="text-lg font-semibold"
                            style={{ color: colors.darkGreen }}
                          >
                            {sector.name}
                          </h4>
                          <div 
                            className="text-sm mt-1"
                            style={{ color: colors.mutedGreen }}
                          >
                            {sectorCounts[index]} holdings
                          </div>
                        </div>
                        <div 
                          className="text-2xl font-bold"
                          style={{ color: colors.darkGreen }}
                        >
                          {sectorCounts[index]}%
                        </div>
                      </div>
                      <Progress 
                        value={sectorCounts[index]}
                        className="h-2 rounded-full"
                        style={{
                          '--progress-color': sector.color.fill,
                          backgroundColor: sector.color.bg
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </MotionCard>
          </div>

          {/* Holdings Table */}
          <div className="px-4 md:px-6">
            <motion.div variants={containerVariants} initial="hidden" animate="visible">
              <MotionCard 
                variants={itemVariants}
                className="backdrop-blur-md"
                style={{
                  background: colors.gradients.cardBg
                }}
              >
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div 
                      className="p-2 rounded-full flex items-center justify-center"
                      style={{ 
                        background: 'linear-gradient(to bottom right, rgb(22, 163, 74), rgb(21, 128, 61))',
                        boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                      }}
                    >
                      <BarChart3 
                        className="h-3.5 w-3.5" 
                        style={{ color: colors.pureWhite }} 
                      />
                    </div>
                    <h3 
                      className="text-xl md:text-2xl font-extrabold"
                      style={{ color: colors.mutedGreen }}
                    >
                      Holdings
                    </h3>
                  </div>

                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <div className="inline-block min-w-full align-middle p-4 md:p-0">
                      <table className="min-w-full divide-y" style={{ borderColor: colors.borderColor }}>
                        <thead>
                          <tr>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase"
                              style={{ color: colors.darkGreen }}
                            >
                              Company
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase hidden sm:table-cell px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              Sector
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              Shares
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase hidden md:table-cell px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              Avg. Buy
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              Current
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              Day %
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              Value
                            </th>
                            <th 
                              className="pb-3 text-left text-xs font-bold tracking-wider uppercase hidden lg:table-cell px-4"
                              style={{ color: colors.darkGreen }}
                            >
                              ESG
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y text-sm" style={{ borderColor: colors.borderColor }}>
                          <motion.tr
                            className="hover:bg-opacity-50 transition-colors cursor-pointer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            style={{ 
                              '&:hover': { backgroundColor: `${colors.mutedGreen}0D` }
                            }}
                          >
                            <td className="py-3 font-medium" style={{ color: colors.darkGreen }}>EcoMobility</td>
                            <td className="py-3 hidden sm:table-cell px-4 font-medium" style={{ color: colors.darkGreen }}>Green Transport</td>
                            <td className="py-3 px-4 tabular-nums" style={{ color: colors.darkGreen }}>30</td>
                            <td className="py-3 hidden md:table-cell px-4 tabular-nums" style={{ color: colors.darkGreen }}>$78.20</td>
                            <td className="py-3 px-4 tabular-nums" style={{ color: colors.darkGreen }}>$92.50</td>
                            <td className="py-3 px-4 flex items-center tabular-nums" style={{ color: colors.darkGreen }}>
                              <div 
                                className="p-1 rounded-lg mr-1 bg-gradient-to-br from-green-600 to-green-800"
                                style={{ 
                                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                                }}
                              >
                                <ArrowUpRight 
                                  className="h-3 w-3" 
                                  style={{ color: colors.pureWhite }} 
                                />
                              </div>
                              2.8%
                            </td>
                            <td className="py-3 px-4 tabular-nums font-medium" style={{ color: colors.darkGreen }}>$2,775.00</td>
                            <td className="py-3 hidden lg:table-cell px-4 tabular-nums">
                              <div 
                                className="px-2 py-1 rounded-md inline-flex items-center bg-gradient-to-br from-green-600 to-green-800"
                                style={{ 
                                  color: colors.pureWhite,
                                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                                }}
                              >
                                8.5
                              </div>
                            </td>
                          </motion.tr>
                          <motion.tr
                            className="hover:bg-opacity-50 transition-colors cursor-pointer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            style={{ 
                              '&:hover': { backgroundColor: `${colors.mutedGreen}0D` }
                            }}
                          >
                            <td className="py-3 font-medium" style={{ color: colors.darkGreen }}>GreenChip Tech</td>
                            <td className="py-3 hidden sm:table-cell px-4 font-medium" style={{ color: colors.darkGreen }}>Sustainable Tech</td>
                            <td className="py-3 px-4 tabular-nums" style={{ color: colors.darkGreen }}>18</td>
                            <td className="py-3 hidden md:table-cell px-4 tabular-nums" style={{ color: colors.darkGreen }}>$110.75</td>
                            <td className="py-3 px-4 tabular-nums" style={{ color: colors.darkGreen }}>$125.20</td>
                            <td className="py-3 px-4 flex items-center tabular-nums" style={{ color: colors.darkGreen }}>
                              <div 
                                className="p-1 rounded-lg mr-1 bg-gradient-to-br from-green-600 to-green-800"
                                style={{ 
                                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                                }}
                              >
                                <ArrowUpRight 
                                  className="h-3 w-3" 
                                  style={{ color: colors.pureWhite }} 
                                />
                              </div>
                              4.3%
                            </td>
                            <td className="py-3 px-4 tabular-nums font-medium" style={{ color: colors.darkGreen }}>$2,253.60</td>
                            <td className="py-3 hidden lg:table-cell px-4 tabular-nums">
                              <div 
                                className="px-2 py-1 rounded-md inline-flex items-center bg-gradient-to-br from-green-600 to-green-800"
                                style={{ 
                                  color: colors.pureWhite,
                                  boxShadow: "0 2px 8px rgba(46, 125, 50, 0.3)"
                                }}
                              >
                                7.8
                              </div>
                            </td>
                          </motion.tr>
                          <motion.tr
                            className="hover:bg-opacity-50 transition-colors cursor-pointer"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.9 }}
                            style={{ 
                              '&:hover': { backgroundColor: `${colors.mutedGreen}0D` }
                            }}
                          >
                            <td className="py-3 font-medium" style={{ color: colors.darkGreen }}>EcoWaste Solutions</td>
                            <td className="py-3 hidden sm:table-cell px-4 font-medium" style={{ color: colors.darkGreen }}>Waste Management</td>
                            <td className="py-3 px-4 tabular-nums" style={{ color: colors.darkGreen }}>45</td>
                            <td className="py-3 hidden md:table-cell px-4 tabular-nums" style={{ color: colors.darkGreen }}>$64.30</td>
                            <td className="py-3 px-4 tabular-nums" style={{ color: colors.darkGreen }}>$58.75</td>
                            <td className="py-3 px-4 flex items-center tabular-nums" style={{ color: colors.dangerRed }}>
                              <div 
                                className="p-1 rounded-lg mr-1"
                                style={{ 
                                  background: colors.gradients.danger,
                                  boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)"
                                }}
                              >
                                <ArrowDownRight 
                                  className="h-3 w-3" 
                                  style={{ color: colors.pureWhite }} 
                                />
                              </div>
                              -8.6%
                            </td>
                            <td className="py-3 px-4 tabular-nums font-medium" style={{ color: colors.darkGreen }}>$2,643.75</td>
                            <td className="py-3 hidden lg:table-cell px-4 tabular-nums">
                              <div 
                                className="px-2 py-1 rounded-md inline-flex items-center"
                                style={{ 
                                  background: colors.gradients.danger,
                                  color: colors.pureWhite,
                                  boxShadow: "0 2px 8px rgba(211, 47, 47, 0.3)"
                                }}
                              >
                                4.2
                              </div>
                            </td>
                          </motion.tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </MotionCard>
            </motion.div>
          </div>

          {/* Issue Notification */}
          <motion.div
            className="fixed bottom-4 left-4 z-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, type: "spring" }}
            whileHover={{ scale: 1.05 }}
          >
            <div 
              className="px-4 py-2 rounded-full flex items-center gap-2 shadow-md"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "#B91C1C"
              }}
            >
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: "#EF4444",
                  color: colors.pureWhite
                }}
              >
                N
              </div>
              <span className="font-medium">1 issue</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full p-0 hover:bg-red-200 transition-colors"
                style={{ color: "#EF4444" }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
