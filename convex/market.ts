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

// Initial 17 real market companies
export const INITIAL_STOCKS = [
  // Electric Vehicles & Clean Energy
  {
    ticker: "TSLA",
    name: "Tesla, Inc.",
    sector: "Electric Vehicles & Clean Energy",
    description: "Global leader in electric cars, solar roof tech, and clean energy battery storage.",
    currentPrice: 850,
    openingPrice: 835,
    dayHigh: 865,
    dayLow: 825,
    changePercent: 1.8,
    volatility: 1.5,
    sparkline: [835, 840, 838, 846, 844, 850],
  },
  {
    ticker: "F",
    name: "Ford Motor Company",
    sector: "Electric Vehicles & Clean Energy",
    description: "Historic American automaker producing commercial pickup trucks, SUVs, and electric vehicles.",
    currentPrice: 260,
    openingPrice: 256,
    dayHigh: 268,
    dayLow: 252,
    changePercent: 1.56,
    volatility: 1.2,
    sparkline: [256, 258, 257, 262, 259, 260],
  },

  // AI & Semiconductor Computing
  {
    ticker: "NVDA",
    name: "NVIDIA Corporation",
    sector: "AI & Semiconductor Computing",
    description: "World leader in graphics chips, AI computing processors, and deep learning platforms.",
    currentPrice: 1250,
    openingPrice: 1228,
    dayHigh: 1265,
    dayLow: 1220,
    changePercent: 1.79,
    volatility: 1.4,
    sparkline: [1228, 1235, 1240, 1238, 1245, 1250],
  },
  {
    ticker: "AMD",
    name: "Advanced Micro Devices, Inc.",
    sector: "AI & Semiconductor Computing",
    description: "Innovator in computer processors, gaming graphics cards, and cloud data center chips.",
    currentPrice: 540,
    openingPrice: 532,
    dayHigh: 548,
    dayLow: 528,
    changePercent: 1.5,
    volatility: 1.6,
    sparkline: [532, 535, 534, 538, 537, 540],
  },
  {
    ticker: "INTC",
    name: "Intel Corporation",
    sector: "AI & Semiconductor Computing",
    description: "Major designer and manufacturer of central microprocessors for PCs and server centers.",
    currentPrice: 310,
    openingPrice: 305,
    dayHigh: 318,
    dayLow: 300,
    changePercent: 1.64,
    volatility: 1.3,
    sparkline: [305, 307, 306, 312, 309, 310],
  },

  // Technology & Consumer Devices
  {
    ticker: "AAPL",
    name: "Apple Inc.",
    sector: "Technology & Consumer Devices",
    description: "Iconic maker of iPhone, Mac computers, wearables, and digital subscription services.",
    currentPrice: 720,
    openingPrice: 712,
    dayHigh: 730,
    dayLow: 708,
    changePercent: 1.12,
    volatility: 1.2,
    sparkline: [712, 715, 714, 722, 718, 720],
  },
  {
    ticker: "MSFT",
    name: "Microsoft Corporation",
    sector: "Technology & Consumer Devices",
    description: "Global tech giant powering Windows, cloud computing services, enterprise software, and gaming.",
    currentPrice: 1100,
    openingPrice: 1085,
    dayHigh: 1115,
    dayLow: 1080,
    changePercent: 1.38,
    volatility: 1.3,
    sparkline: [1085, 1090, 1088, 1098, 1095, 1100],
  },
  {
    ticker: "GOOGL",
    name: "Alphabet Inc. (Google)",
    sector: "Technology & Consumer Devices",
    description: "Parent company of Google search, Android mobile OS, YouTube video streaming, and smart AI.",
    currentPrice: 580,
    openingPrice: 572,
    dayHigh: 588,
    dayLow: 568,
    changePercent: 1.4,
    volatility: 1.4,
    sparkline: [572, 575, 574, 582, 578, 580],
  },
  {
    ticker: "META",
    name: "Meta Platforms, Inc.",
    sector: "Technology & Consumer Devices",
    description: "Connects billions of users across Instagram, WhatsApp, Facebook, and VR metaverse tech.",
    currentPrice: 890,
    openingPrice: 875,
    dayHigh: 902,
    dayLow: 870,
    changePercent: 1.71,
    volatility: 1.5,
    sparkline: [875, 880, 878, 886, 884, 890],
  },

  // Aerospace & Healthcare
  {
    ticker: "BA",
    name: "The Boeing Company",
    sector: "Aerospace & Aviation",
    description: "Premier aerospace manufacturer building commercial jetliners, defense platforms, and space flight systems.",
    currentPrice: 680,
    openingPrice: 685,
    dayHigh: 692,
    dayLow: 674,
    changePercent: -0.73,
    volatility: 1.2,
    sparkline: [685, 682, 686, 680, 678, 680],
  },
  {
    ticker: "PFE",
    name: "Pfizer Inc.",
    sector: "Healthcare & Pharmaceuticals",
    description: "Global biopharmaceutical leader researching life-saving medicines, vaccines, and medical therapies.",
    currentPrice: 290,
    openingPrice: 288,
    dayHigh: 295,
    dayLow: 284,
    changePercent: 0.69,
    volatility: 1.1,
    sparkline: [288, 290, 289, 292, 289, 290],
  },

  // Clean Energy & Hydrogen
  {
    ticker: "PLUG",
    name: "Plug Power Inc.",
    sector: "Clean Energy & Hydrogen",
    description: "Innovator in green hydrogen turnkey solutions, zero-emission fuel cell mobility, and clean energy storage.",
    currentPrice: 380,
    openingPrice: 372,
    dayHigh: 388,
    dayLow: 368,
    changePercent: 2.15,
    volatility: 1.8,
    sparkline: [372, 375, 374, 381, 378, 380],
  },

  // Global Logistics & E-Commerce
  {
    ticker: "FDX",
    name: "FedEx Corporation",
    sector: "Global Logistics & Delivery",
    description: "Global leader in express courier delivery, automated freight logistics, and enterprise supply chain solutions.",
    currentPrice: 920,
    openingPrice: 912,
    dayHigh: 928,
    dayLow: 906,
    changePercent: 0.88,
    volatility: 1.1,
    sparkline: [912, 915, 914, 918, 916, 920],
  },
  {
    ticker: "AMZN",
    name: "Amazon.com, Inc.",
    sector: "Global Logistics & Delivery",
    description: "Largest global online retail marketplace and leader in cloud computing and logistics.",
    currentPrice: 640,
    openingPrice: 630,
    dayHigh: 648,
    dayLow: 625,
    changePercent: 1.59,
    volatility: 1.3,
    sparkline: [630, 634, 632, 642, 638, 640],
  },
  {
    ticker: "NKE",
    name: "NIKE, Inc.",
    sector: "Consumer Retail & Apparel",
    description: "World leader in athletic footwear, sportswear apparel, sports equipment, and fitness accessories.",
    currentPrice: 350,
    openingPrice: 345,
    dayHigh: 358,
    dayLow: 342,
    changePercent: 1.45,
    volatility: 1.2,
    sparkline: [345, 348, 346, 352, 349, 350],
  },

  // Media & Entertainment
  {
    ticker: "NFLX",
    name: "Netflix, Inc.",
    sector: "Media & Entertainment",
    description: "Leading global internet entertainment service with movies, TV shows, and original streaming series.",
    currentPrice: 460,
    openingPrice: 452,
    dayHigh: 468,
    dayLow: 448,
    changePercent: 1.77,
    volatility: 1.4,
    sparkline: [452, 455, 454, 462, 458, 460],
  },
  {
    ticker: "DIS",
    name: "The Walt Disney Company",
    sector: "Media & Entertainment",
    description: "World-renowned entertainment company with Disney theme parks, Pixar, Marvel, and streaming networks.",
    currentPrice: 410,
    openingPrice: 405,
    dayHigh: 418,
    dayLow: 400,
    changePercent: 1.23,
    volatility: 1.2,
    sparkline: [405, 408, 406, 412, 409, 410],
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
      recentEvents: await ctx.db.query("trackEvents").order("desc").take(30),
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
  if (!raceState) {
    throw new Error("Failed to initialize raceState document.");
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

// Mutation: Sync live stocks table to Twelve Data API stocks
export const syncStocksToApiSymbols = mutation({
  args: {},
  handler: async (ctx) => {
    const existingStocks = await ctx.db.query("stocks").collect();
    for (const s of existingStocks) {
      await ctx.db.delete(s._id);
    }
    const now = Date.now();
    for (const s of INITIAL_STOCKS) {
      await ctx.db.insert("stocks", { ...s, updatedAt: now });
    }
    return { success: true, count: INITIAL_STOCKS.length };
  },
});
