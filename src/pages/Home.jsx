"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  LogIn,
  Leaf,
  TrendingUp,
  Briefcase,
  PieChart,
  Award,
} from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const colors = {
    pureWhite: "#FFFFFF",
    lightestYellow: "#F9F7DC",
    lightYellow: "#F2EFBB",
    mutedGreen: "#9EBC63",
    mediumGreen: "#82AA57",
    darkGreen: "#618943",
    accentPaleGreen: "#C5D86D",
    softBlue: "#D1E3F5",
  };

  const steps = [
    {
      number: 1,
      title: "Discover & Invest:",
      description: "Explore virtual eco-friendly companies and invest wisely.",
      icon: TrendingUp,
    },
    {
      number: 2,
      title: "Cultivate Your Portfolio:",
      description: "Build a portfolio balancing growth and ESG impact.",
      icon: Briefcase,
    },
    {
      number: 3,
      title: "Strategize for Diversification:",
      description:
        "Diversify across green sectors to boost scores and stability.",
      icon: PieChart,
    },
    {
      number: 4,
      title: "Ascend the Leaderboard:",
      description: "Compete globally based on portfolio, ESG, and diversity.",
      icon: Award,
    },
  ];

  const floatingElements = [
    { icon: <TrendingUp />, delay: 0, x: -15, y: 20, top: "30%", left: "20%" },
    { icon: <Briefcase />, delay: 0.5, x: 25, y: -15, top: "55%", left: "75%" },
    { icon: <PieChart />, delay: 1, x: -20, y: -25, top: "75%", left: "40%" },
    { icon: <Award />, delay: 1.5, x: 15, y: 15, top: "40%", left: "60%" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${colors.pureWhite}, ${colors.lightestYellow})`,
      }}
    >
      {/* Floating icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {floatingElements.map((el, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{
              opacity: [0, 0.3, 0],
              x: [el.x * 2, el.x * 3, el.x * 2],
              y: [el.y * 2, el.y * 3, el.y * 2],
            }}
            transition={{
              duration: 12,
              delay: el.delay,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute text-5xl"
            style={{
              top: el.top,
              left: el.left,
              color: `${colors.accentPaleGreen}44`,
            }}
            aria-hidden="true"
          >
            {el.icon}
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -30 }}
        transition={{ duration: 0.7 }}
        className="text-center mt-12 mb-10 relative z-10 max-w-4xl px-4"
      >
        <h1 className="text-4xl md:text-6xl font-extrabold flex items-center justify-center flex-wrap gap-3 text-green-900">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: isVisible ? 1 : 0, rotate: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.3,
              type: "spring",
              bounce: 0.5,
            }}
            className="rounded-full p-3 shadow-lg inline-flex bg-gradient-to-br from-green-600 to-green-800"
            style={{ boxShadow: `0 4px 15px -5px ${colors.mediumGreen}88` }}
          >
            <Leaf className="h-8 w-8 text-white" aria-label="Leaf Icon" />
          </motion.div>
          <span>
            <span style={{ color: colors.darkGreen }}>Stock Market</span>{" "}
            <span
              className="bg-clip-text text-transparent font-extrabold"
              style={{
                backgroundImage: `linear-gradient(to right, ${colors.mediumGreen}, ${colors.darkGreen})`,
              }}
            >
              Simulator
            </span>
          </span>
        </h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-6 text-lg md:text-xl max-w-3xl mx-auto px-2 leading-relaxed"
          style={{ color: colors.darkGreen }}
        >
          Learn sustainable investing by trading virtual stocks of green
          companies and competing globally.
        </motion.p>
      </motion.header>

      {/* How It Works */}
      <motion.section
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="backdrop-blur-sm rounded-3xl shadow-xl border p-8 md:p-12 w-full max-w-4xl relative z-10 bg-white/90 border-blue-100"
      >
        <h2
          className="text-3xl font-bold mb-10 flex items-center text-green-900"
          style={{ color: colors.darkGreen }}
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="h-12 w-2 rounded-full mr-5 inline-block bg-gradient-to-b from-green-600 to-green-800"
          ></motion.span>
          How It Works
        </h2>

        <div className="space-y-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <motion.article
                key={step.number}
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: isVisible ? 1 : 0, x: isVisible ? 0 : -40 }}
                transition={{ duration: 0.6, delay: 0.7 + index * 0.15 }}
                className="flex items-center gap-6 group"
              >
                {/* Number badge */}
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-white font-bold shadow-md"
                  style={{
                    background: `linear-gradient(to bottom right, ${colors.mediumGreen}, ${colors.darkGreen})`,
                    boxShadow: `0 6px 15px -5px ${colors.mediumGreen}cc`,
                  }}
                >
                  {step.number}
                </motion.div>

                {/* Step content and icon */}
                <div className="flex-1 flex justify-between items-center">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <motion.span
                        whileHover={{ x: 5 }}
                        className="font-semibold text-xl"
                        style={{ color: colors.darkGreen }}
                      >
                        {step.title}
                      </motion.span>
                    </div>
                    <p className="text-green-900 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    <IconComponent
                      className="h-6 w-6"
                      style={{ color: colors.darkGreen }}
                    />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </motion.section>

      {/* Footer Buttons */}
      <motion.footer
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 40 }}
        transition={{ duration: 0.7, delay: 0.7 }}
        className="mt-auto flex flex-col md:flex-row gap-6 items-center justify-center w-full max-w-md pt-12 pb-8 z-10 px-4"
      >
        <button
          className="flex items-center justify-center gap-3 px-8 py-4 w-full md:w-auto text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
          style={{
            background: `linear-gradient(to right, ${colors.darkGreen}, ${colors.mutedGreen})`,
            boxShadow: `0 6px 20px -5px ${colors.darkGreen}bb`,
          }}
          aria-label="Start Simulation"
        >
          <ArrowRight className="h-6 w-6" />
          Start Simulation
        </button>

        <button
          className="flex items-center justify-center gap-3 px-8 py-4 w-full md:w-auto text-white rounded-full font-semibold shadow-lg hover:scale-105 transition-transform duration-300"
          style={{
            background: `linear-gradient(to right, ${colors.mediumGreen}, ${colors.darkGreen})`,
            boxShadow: `0 6px 20px -5px ${colors.darkGreen}bb`,
          }}
          aria-label="Login"
        >
          <LogIn className="h-6 w-6" />
          Login
        </button>
      </motion.footer>
    </div>
  );
}
