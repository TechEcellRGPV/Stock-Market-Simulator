import { mutation, query, MutationCtx } from "./_generated/server";
import { v } from "convex/values";

/**
 * @file market.ts
 * @description Core Market Engine & Race Operations Controller for Imprenditore 5.0.
 * Orchestrates:
 * - 17 canonical equities across 5 mobility and engineering sectors
 * - F1 Race state transitions (GRID_WARMUP, GREEN_FLAG, SAFETY_CAR, CHECKERED_FLAG)
 * - Timed competition laps with configurable durations (5-30 min)
 * - Macro sector price shock events (+25%, -11%) and breaking news alerts
 * - Pre-event access gates (Team Registration and Simulation Cockpit gates)
 * - Automatic date migration to October 29, 2026 at 3:00 PM
 */

// Initial 15 motorsport and tech grid companies
export const INITIAL_STOCKS = [
  // Powertrain & Electric Vehicles
  {
    ticker: "APEX",
    name: "Apex Dynamics EV",
    sector: "Powertrain & Electric Vehicles",
    description:
      "Next-generation solid-state battery drivetrains and high-output EV racing platforms.",
    currentPrice: 850,
    openingPrice: 830,
    dayHigh: 865,
    dayLow: 825,
    changePercent: 2.41,
    volatility: 1.5,
    sparkline: [830, 835, 842, 838, 848, 850],
  },
  {
    ticker: "REDL",
    name: "Redline Motors (BMW Motorsport)",
    sector: "Powertrain & Electric Vehicles",
    description:
      "High-performance hybrid powertrains and precision-tuned motorsport engineering.",
    currentPrice: 1250,
    openingPrice: 1228,
    dayHigh: 1265,
    dayLow: 1220,
    changePercent: 1.79,
    volatility: 1.2,
    sparkline: [1228, 1235, 1240, 1238, 1245, 1250],
  },
  {
    ticker: "ECOM",
    name: "EcoMobility High-Speed",
    sector: "Powertrain & Electric Vehicles",
    description:
      "Lightweight urban electric platforms and rapid-charge fleet drivetrains.",
    currentPrice: 420,
    openingPrice: 423.4,
    dayHigh: 428,
    dayLow: 415,
    changePercent: -0.8,
    volatility: 1.8,
    sparkline: [423, 421, 418, 422, 419, 420],
  },
  {
    ticker: "ETRN",
    name: "Electric Transport Corp",
    sector: "Powertrain & Electric Vehicles",
    description:
      "Commercial zero-emission transport vehicles and modular battery swapping grids.",
    currentPrice: 620,
    openingPrice: 610.8,
    dayHigh: 628,
    dayLow: 605,
    changePercent: 1.51,
    volatility: 1.4,
    sparkline: [610, 614, 612, 618, 616, 620],
  },

  // Aerodynamics & Advanced Materials
  {
    ticker: "VRTX",
    name: "Vortex Aerodynamics",
    sector: "Aerodynamics & Advanced Materials",
    description:
      "Computational fluid dynamics, active aero wings, and ground-effect chassis design.",
    currentPrice: 740,
    openingPrice: 717.7,
    dayHigh: 752,
    dayLow: 715,
    changePercent: 3.11,
    volatility: 2.1,
    sparkline: [718, 725, 730, 728, 735, 740],
  },
  {
    ticker: "EMAT",
    name: "Eco Carbon Materials",
    sector: "Aerodynamics & Advanced Materials",
    description:
      "Recycled carbon fiber composites and high-impact sustainable biopolymers.",
    currentPrice: 380,
    openingPrice: 375.5,
    dayHigh: 386,
    dayLow: 372,
    changePercent: 1.2,
    volatility: 1.6,
    sparkline: [375, 378, 376, 381, 379, 380],
  },
  {
    ticker: "ATC",
    name: "AeroTech Composites",
    sector: "Aerodynamics & Advanced Materials",
    description:
      "Aerospace-grade ultra-light alloys and ceramic thermal barrier coatings.",
    currentPrice: 910,
    openingPrice: 922.9,
    dayHigh: 930,
    dayLow: 902,
    changePercent: -1.4,
    volatility: 1.3,
    sparkline: [923, 920, 915, 918, 912, 910],
  },

  // Telemetry, AI & Autonomous Tech
  {
    ticker: "CTEL",
    name: "CyberTelemetry AI",
    sector: "Telemetry, AI & Autonomous Tech",
    description:
      "Real-time edge telemetry sensors, predictive tire degradation, and AI race strategy engines.",
    currentPrice: 1150,
    openingPrice: 1102.6,
    dayHigh: 1165,
    dayLow: 1095,
    changePercent: 4.3,
    volatility: 2.4,
    sparkline: [1102, 1115, 1130, 1125, 1140, 1150],
  },
  {
    ticker: "GCHP",
    name: "GreenChip Semiconductors",
    sector: "Telemetry, AI & Autonomous Tech",
    description:
      "Ultra-low power microcontrollers and optical sensors for automotive telemetry.",
    currentPrice: 980,
    openingPrice: 953.3,
    dayHigh: 995,
    dayLow: 948,
    changePercent: 2.8,
    volatility: 1.9,
    sparkline: [953, 960, 972, 968, 975, 980],
  },
  {
    ticker: "TECH",
    name: "Tech Solutions Global",
    sector: "Telemetry, AI & Autonomous Tech",
    description:
      "Cloud-native fleet management, digital twin simulation, and telemetry visualization.",
    currentPrice: 540,
    openingPrice: 537.3,
    dayHigh: 548,
    dayLow: 532,
    changePercent: 0.5,
    volatility: 1.1,
    sparkline: [537, 539, 536, 542, 538, 540],
  },

  // Sustainable Fuels & Energy
  {
    ticker: "SFEL",
    name: "SynthoFuel Energy",
    sector: "Sustainable Fuels & Energy",
    description:
      "Drop-in 100% synthetic e-fuels capturing carbon directly from the atmosphere.",
    currentPrice: 310,
    openingPrice: 316.6,
    dayHigh: 322,
    dayLow: 305,
    changePercent: -2.08,
    volatility: 2.2,
    sparkline: [317, 314, 310, 312, 308, 310],
  },
  {
    ticker: "CBST",
    name: "Clean Energy Storage",
    sector: "Sustainable Fuels & Energy",
    description:
      "Grid-scale flow batteries and high-density capacitors for pit lane charging.",
    currentPrice: 780,
    openingPrice: 761,
    dayHigh: 792,
    dayLow: 755,
    changePercent: 2.5,
    volatility: 1.7,
    sparkline: [761, 768, 775, 770, 776, 780],
  },
  {
    ticker: "GNRG",
    name: "Green Energy Corp",
    sector: "Sustainable Fuels & Energy",
    description:
      "Zero-emission hydrogen production facilities and high-pressure cryogenic fuel cells.",
    currentPrice: 650,
    openingPrice: 642.9,
    dayHigh: 660,
    dayLow: 638,
    changePercent: 1.1,
    volatility: 1.4,
    sparkline: [643, 646, 652, 648, 651, 650],
  },
  {
    ticker: "CWS",
    name: "Clean Water & Coolants",
    sector: "Sustainable Fuels & Energy",
    description:
      "Eco-friendly dielectric cooling liquids and high-performance closed-loop radiator fluids.",
    currentPrice: 290,
    openingPrice: 288.8,
    dayHigh: 296,
    dayLow: 284,
    changePercent: 0.42,
    volatility: 1.0,
    sparkline: [289, 291, 288, 292, 289, 290],
  },

  // Logistics & Precision Engineering
  {
    ticker: "PITP",
    name: "Pitstop Precision Labs",
    sector: "Logistics & Precision Engineering",
    description:
      "Ultra-fast automated pit stop pneumatic tooling and robotic chassis alignment rigs.",
    currentPrice: 490,
    openingPrice: 481.8,
    dayHigh: 498,
    dayLow: 478,
    changePercent: 1.7,
    volatility: 1.5,
    sparkline: [482, 485, 488, 486, 492, 490],
  },
  {
    ticker: "CEI",
    name: "Circular Logistics Inc",
    sector: "Logistics & Precision Engineering",
    description:
      "Carbon-neutral freight tracking, route optimization AI, and returnable packaging networks.",
    currentPrice: 510,
    openingPrice: 515.7,
    dayHigh: 522,
    dayLow: 504,
    changePercent: -1.11,
    volatility: 1.3,
    sparkline: [516, 514, 511, 513, 508, 510],
  },
  {
    ticker: "HLTH",
    name: "BioTelemetry Healthcare",
    sector: "Logistics & Precision Engineering",
    description:
      "Driver biometric telemetry, hydration sensors, and g-force impact monitoring suits.",
    currentPrice: 820,
    openingPrice: 805.5,
    dayHigh: 832,
    dayLow: 800,
    changePercent: 1.8,
    volatility: 1.6,
    sparkline: [806, 810, 818, 815, 822, 820],
  },
];

// Query: Get full live grid stocks and race state
export const getLiveGrid = query({
  args: {},
  handler: async (ctx) => {
    const stocks = await ctx.db.query("stocks").collect();
    const raceState = await ctx.db.query("raceState").first();
    const latestEvent = await ctx.db.query("trackEvents").order("desc").first();

    let liveRaceState = raceState;
    if (
      liveRaceState &&
      (liveRaceState.targetEventDate === "2026-09-16T15:00:00" ||
        liveRaceState.targetEventDate === "2026-09-16T10:00:00" ||
        (typeof liveRaceState.scheduledStartTime === "string" &&
          liveRaceState.scheduledStartTime.includes("September 16")))
    ) {
      liveRaceState = {
        ...liveRaceState,
        targetEventDate: "2026-10-29T15:00:00",
        scheduledStartTime: "October 29, 2026 at 3:00 PM",
      };
    }

    return {
      stocks,
      raceState: liveRaceState || {
        currentLap: 1,
        status: "GREEN_FLAG",
        lapTimeRemaining: 1500,
        lapDuration: 1500,
        activeNews:
          "Race flag-off: Market is officially open across all sectors.",
        updatedAt: Date.now(),
      },
      latestEvent,
    };
  },
});

// Mutation: Seed initial stock grid if empty
export const seedInitialGrid = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("stocks").first();
    if (existing) return; // Already seeded

    const now = Date.now();
    for (const stock of INITIAL_STOCKS) {
      await ctx.db.insert("stocks", {
        ...stock,
        updatedAt: now,
      });
    }

    // Initialize race state
    const existingRaceState = await ctx.db.query("raceState").first();
    if (!existingRaceState) {
      await ctx.db.insert("raceState", {
        currentLap: 1,
        status: "GREEN_FLAG",
        lapTimeRemaining: 1500,
        lapDuration: 1500,
        activeNews: "Lap 1 Green Flag: Market is live. Make your moves!",
        updatedAt: now,
      });
    }
  },
});

// Mutation: Advance lap (1 to 5)
export const advanceLap = mutation({
  args: {
    lapNumber: v.number(),
    lapDurationSeconds: v.number(),
    newsTitle: v.string(),
  },
  handler: async (ctx, args) => {
    let raceState = await ctx.db.query("raceState").first();
    const now = Date.now();

    const isFinalLap = args.lapNumber >= 5;
    const status = isFinalLap ? "CHECKERED_FLAG" : "GREEN_FLAG";

    if (raceState) {
      await ctx.db.patch(raceState._id, {
        currentLap: args.lapNumber,
        status,
        lapTimeRemaining: args.lapDurationSeconds,
        lapDuration: args.lapDurationSeconds,
        activeNews: args.newsTitle,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("raceState", {
        currentLap: args.lapNumber,
        status,
        lapTimeRemaining: args.lapDurationSeconds,
        lapDuration: args.lapDurationSeconds,
        activeNews: args.newsTitle,
        updatedAt: now,
      });
    }

    // Post track event
    await ctx.db.insert("trackEvents", {
      title: `Lap ${args.lapNumber} Initiated`,
      description: args.newsTitle,
      type: isFinalLap ? "CHECKERED_FLAG" : "GREEN_FLAG",
      affectedSectors: [],
      priceImpactPercent: 0,
      lap: args.lapNumber,
      timestamp: now,
    });
  },
});

// Mutation: Broadcast a Track Event / Breaking News shock
export const broadcastTrackEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    type: v.string(), // "NEWS_FLASH" | "YELLOW_FLAG" | "SAFETY_CAR"
    affectedSectors: v.array(v.string()),
    priceImpactPercent: v.number(), // e.g. -12 or +15
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const raceState = await ctx.db.query("raceState").first();
    const currentLap = raceState ? raceState.currentLap : 1;

    // 1. Insert Track Event
    await ctx.db.insert("trackEvents", {
      title: args.title,
      description: args.description,
      type: args.type,
      affectedSectors: args.affectedSectors,
      priceImpactPercent: args.priceImpactPercent,
      lap: currentLap,
      timestamp: now,
    });

    // 2. Update Race State banner
    if (raceState) {
      await ctx.db.patch(raceState._id, {
        activeNews: `${args.title}: ${args.description}`,
        updatedAt: now,
      });
    }

    // 3. Apply sector price shock if specified
    if (args.affectedSectors.length > 0 && args.priceImpactPercent !== 0) {
      const allStocks = await ctx.db.query("stocks").collect();
      for (const stock of allStocks) {
        if (args.affectedSectors.includes(stock.sector)) {
          const multiplier = 1 + args.priceImpactPercent / 100;
          const newPrice = Math.max(
            10,
            Math.round(stock.currentPrice * multiplier * 10) / 10,
          );
          const changePercent =
            Math.round(
              ((newPrice - stock.openingPrice) / stock.openingPrice) * 1000,
            ) / 10;
          const newSparkline = [...stock.sparkline.slice(-10), newPrice];

          await ctx.db.patch(stock._id, {
            currentPrice: newPrice,
            dayHigh: Math.max(stock.dayHigh, newPrice),
            dayLow: Math.min(stock.dayLow, newPrice),
            changePercent,
            sparkline: newSparkline,
            updatedAt: now,
          });
        }
      }
    }
  },
});

// Mutation: Admin directly edit an individual stock's price, volatility, and properties
export const adminUpdateStock = mutation({
  args: {
    ticker: v.string(),
    currentPrice: v.number(),
    volatility: v.optional(v.number()),
    name: v.optional(v.string()),
    sector: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();

    if (!stock) {
      throw new Error(`Stock ticker ${args.ticker} not found.`);
    }

    const now = Date.now();
    const newPrice = Math.max(1, Math.round(args.currentPrice * 10) / 10);
    const changePercent =
      Math.round(
        ((newPrice - stock.openingPrice) / stock.openingPrice) * 1000,
      ) / 10;
    const newSparkline = [...stock.sparkline.slice(-10), newPrice];

    const patchData: Record<string, unknown> = {
      currentPrice: newPrice,
      dayHigh: Math.max(stock.dayHigh, newPrice),
      dayLow: Math.min(stock.dayLow, newPrice),
      changePercent,
      sparkline: newSparkline,
      updatedAt: now,
    };

    if (args.volatility !== undefined) patchData.volatility = args.volatility;
    if (args.name !== undefined) patchData.name = args.name.trim();
    if (args.sector !== undefined) patchData.sector = args.sector.trim();

    await ctx.db.patch(stock._id, patchData);
    return {
      success: true,
      ticker: stock.ticker,
      currentPrice: newPrice,
      changePercent,
    };
  },
});

// Mutation: Admin trigger macro sector shock (impacts entire industry)
export const adminTriggerSectorShock = mutation({
  args: {
    sector: v.string(),
    percentChange: v.number(), // e.g. +15 or -12
    newsTitle: v.string(),
    newsDescription: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const raceState = await ctx.db.query("raceState").first();
    const currentLap = raceState ? raceState.currentLap : 1;

    // 1. Fetch all stocks in target sector
    const sectorStocks = await ctx.db
      .query("stocks")
      .withIndex("by_sector", (q) => q.eq("sector", args.sector))
      .collect();

    if (sectorStocks.length === 0) {
      throw new Error(`No equities found for sector: ${args.sector}`);
    }

    // 2. Adjust prices for all stocks in the sector
    const multiplier = 1 + args.percentChange / 100;
    for (const stock of sectorStocks) {
      const newPrice = Math.max(
        10,
        Math.round(stock.currentPrice * multiplier * 10) / 10,
      );
      const changePercent =
        Math.round(
          ((newPrice - stock.openingPrice) / stock.openingPrice) * 1000,
        ) / 10;
      const newSparkline = [...stock.sparkline.slice(-10), newPrice];

      await ctx.db.patch(stock._id, {
        currentPrice: newPrice,
        dayHigh: Math.max(stock.dayHigh, newPrice),
        dayLow: Math.min(stock.dayLow, newPrice),
        changePercent,
        sparkline: newSparkline,
        updatedAt: now,
      });
    }

    // 3. Insert breaking news track event
    await ctx.db.insert("trackEvents", {
      title: args.newsTitle,
      description: args.newsDescription,
      type: args.percentChange >= 0 ? "NEWS_FLASH" : "YELLOW_FLAG",
      affectedSectors: [args.sector],
      priceImpactPercent: args.percentChange,
      lap: currentLap,
      timestamp: now,
    });

    // 4. Update raceState marquee
    if (raceState) {
      await ctx.db.patch(raceState._id, {
        activeNews: `Sector Shock [${args.sector} ${args.percentChange >= 0 ? "+" : ""}${args.percentChange}%]: ${args.newsTitle}`,
        updatedAt: now,
      });
    }

    return {
      success: true,
      sector: args.sector,
      percentChange: args.percentChange,
      affectedCount: sectorStocks.length,
    };
  },
});

// Mutation: Apply organic micro-jitter (1-2%) to simulate active trading ticks
export const applyOrganicJitter = mutation({
  args: {},
  handler: async (ctx) => {
    const stocks = await ctx.db.query("stocks").collect();
    const now = Date.now();

    for (const stock of stocks) {
      const deltaPercent = (Math.random() * 2 - 1) * (stock.volatility || 1.0);
      const delta = (stock.currentPrice * deltaPercent) / 100;
      const newPrice = Math.max(
        10,
        Math.round((stock.currentPrice + delta) * 10) / 10,
      );
      const changePercent =
        Math.round(
          ((newPrice - stock.openingPrice) / stock.openingPrice) * 1000,
        ) / 10;
      const newSparkline = [...stock.sparkline.slice(-10), newPrice];

      await ctx.db.patch(stock._id, {
        currentPrice: newPrice,
        dayHigh: Math.max(stock.dayHigh, newPrice),
        dayLow: Math.min(stock.dayLow, newPrice),
        changePercent,
        sparkline: newSparkline,
        updatedAt: now,
      });
    }
  },
});

// Helper to ensure raceState row exists
async function getOrCreateRaceState(ctx: MutationCtx) {
  let raceState = await ctx.db.query("raceState").first();
  if (!raceState) {
    const id = await ctx.db.insert("raceState", {
      currentLap: 1,
      status: "GRID_WARMUP",
      isRegistrationOpen: false,
      isSimulationEntryOpen: false,
      targetEventDate: "2026-10-29T15:00:00",
      scheduledStartTime: "October 29, 2026 at 3:00 PM",
      defaultStartingCapital: 100000,
      lapStartedAt: null,
      lapTimeRemaining: 900,
      lapDuration: 900,
      activeNews: "The race will start upon Race Director Flag-Off. Paddock warmup in progress.",
      updatedAt: Date.now(),
    });
    raceState = await ctx.db.get(id);
  } else if (
    raceState.targetEventDate === "2026-09-16T15:00:00" ||
    raceState.targetEventDate === "2026-09-16T10:00:00" ||
    (typeof raceState.scheduledStartTime === "string" && raceState.scheduledStartTime.includes("September 16"))
  ) {
    await ctx.db.patch(raceState._id, {
      targetEventDate: "2026-10-29T15:00:00",
      scheduledStartTime: "October 29, 2026 at 3:00 PM",
      updatedAt: Date.now(),
    });
    raceState = await ctx.db.get(raceState._id);
  }
  return raceState;
}

// Mutation: Toggle Registration Gate
export const toggleRegistration = mutation({
  args: { isRegistrationOpen: v.boolean() },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      isRegistrationOpen: args.isRegistrationOpen,
      activeNews: args.isRegistrationOpen
        ? "Paddock Notice: Team registration is now OPEN on the grid."
        : "Paddock Notice: Team registration is currently LOCKED by Race Control.",
      updatedAt: now,
    });
    return { success: true, isRegistrationOpen: args.isRegistrationOpen };
  },
});

// Mutation: Toggle Simulation Cockpit Access Gate
export const toggleSimulationEntry = mutation({
  args: { isSimulationEntryOpen: v.boolean() },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      isSimulationEntryOpen: args.isSimulationEntryOpen,
      activeNews: args.isSimulationEntryOpen
        ? "Paddock Notice: Driver cockpit access has been UNLOCKED."
        : "Paddock Notice: Driver cockpit access is currently LOCKED by Race Control.",
      updatedAt: now,
    });
    return { success: true, isSimulationEntryOpen: args.isSimulationEntryOpen };
  },
});

// Mutation: Set Event Target Date
export const setTargetEventDate = mutation({
  args: {
    dateIsoString: v.union(v.string(), v.null()),
    summaryText: v.string(),
  },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      targetEventDate: args.dateIsoString,
      scheduledStartTime: args.summaryText,
      activeNews: `Flag-Off Scheduled: ${args.summaryText}. Paddock warmup in progress.`,
      updatedAt: now,
    });
    return { success: true };
  },
});

// Mutation: Set Default Starting Capital
export const adminSetDefaultStartingCapital = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      defaultStartingCapital: args.amount,
      updatedAt: now,
    });
    return { success: true, defaultStartingCapital: args.amount };
  },
});

// Mutation: Start Race (Flag-Off)
export const startRace = mutation({
  args: { lapDuration: v.number() },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      status: "GREEN_FLAG",
      isSimulationEntryOpen: true,
      lapStartedAt: now,
      lapDuration: args.lapDuration,
      lapTimeRemaining: args.lapDuration,
      activeNews: `Lap ${raceState.currentLap} Green Flag: Market is LIVE. Pit Stop order execution active!`,
      updatedAt: now,
    });
    return { success: true };
  },
});

// Mutation: Pause Race (Safety Car)
export const pauseRace = mutation({
  args: {},
  handler: async (ctx) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      status: "SAFETY_CAR",
      activeNews: "Safety Car Deployed: Simulation paused by Race Control.",
      updatedAt: now,
    });
    return { success: true };
  },
});

// Mutation: Conclude Race (Checkered Flag)
export const endRace = mutation({
  args: {},
  handler: async (ctx) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      status: "CHECKERED_FLAG",
      activeNews: "Checkered Flag: Simulation concluded. All trading closed.",
      updatedAt: now,
    });
    return { success: true };
  },
});

// Mutation: Stage Lap
export const stageLap = mutation({
  args: {
    lapNumber: v.number(),
    lapDuration: v.number(),
  },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      currentLap: args.lapNumber,
      status: "GRID_WARMUP",
      lapStartedAt: null,
      lapDuration: args.lapDuration,
      lapTimeRemaining: args.lapDuration,
      activeNews: `Lap ${args.lapNumber} Staged: Race will resume upon Race Director Flag-Off.`,
      updatedAt: now,
    });
    return { success: true };
  },
});

// Mutation: Set Custom Lap Duration
export const setRaceTimer = mutation({
  args: { durationSeconds: v.number() },
  handler: async (ctx, args) => {
    const raceState = await getOrCreateRaceState(ctx);
    const now = Date.now();
    await ctx.db.patch(raceState._id, {
      lapDuration: args.durationSeconds,
      lapTimeRemaining: args.durationSeconds,
      lapStartedAt: null,
      updatedAt: now,
    });
    return { success: true };
  },
});

// Mutation: Full Reset Event Grid
export const resetGrid = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    // 1. Delete all teams
    const teams = await ctx.db.query("teams").collect();
    for (const t of teams) {
      await ctx.db.delete(t._id);
    }

    // 2. Delete all holdings
    const holdings = await ctx.db.query("holdings").collect();
    for (const h of holdings) {
      await ctx.db.delete(h._id);
    }

    // 3. Delete all orders
    const orders = await ctx.db.query("orders").collect();
    for (const o of orders) {
      await ctx.db.delete(o._id);
    }

    // 4. Reset stocks
    const stocks = await ctx.db.query("stocks").collect();
    for (const s of stocks) {
      await ctx.db.delete(s._id);
    }
    for (const s of INITIAL_STOCKS) {
      await ctx.db.insert("stocks", { ...s, updatedAt: now });
    }

    // 5. Reset raceState (preserving event target date and capital configured by admin)
    const raceState = await ctx.db.query("raceState").first();
    const freshData = {
      currentLap: 1,
      status: "GRID_WARMUP",
      isRegistrationOpen: false,
      isSimulationEntryOpen: false,
      targetEventDate:
        raceState?.targetEventDate && !raceState.targetEventDate.includes("2026-09")
          ? raceState.targetEventDate
          : "2026-10-29T15:00:00",
      scheduledStartTime:
        raceState?.scheduledStartTime && !raceState.scheduledStartTime.includes("September")
          ? raceState.scheduledStartTime
          : "October 29, 2026 at 3:00 PM",
      defaultStartingCapital: raceState?.defaultStartingCapital || 100000,
      lapStartedAt: null,
      lapTimeRemaining: 900,
      lapDuration: 900,
      activeNews: "The race will start upon Race Director Flag-Off. Paddock warmup in progress.",
      updatedAt: now,
    };
    if (raceState) {
      await ctx.db.patch(raceState._id, freshData);
    } else {
      await ctx.db.insert("raceState", freshData);
    }

    return { success: true };
  },
});
