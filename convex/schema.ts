import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Teams Table
  teams: defineTable({
    teamCode: v.string(),
    teamName: v.string(),
    teamPin: v.string(),
    leaderName: v.string(),
    member2: v.optional(v.string()),
    member3: v.optional(v.string()),
    members: v.array(v.string()),
    activeLeaderSessionId: v.optional(v.string()),
    lastLeaderLoginAt: v.optional(v.number()),
    cashBalance: v.number(),
    totalScore: v.number(),
    portfolioScore: v.number(),
    strategyScore: v.number(),
    executionScore: v.number(),
    tradeCount: v.number(),
    status: v.string(), // "ACTIVE" | "DISQUALIFIED" | "LOCKED"
    createdAt: v.number(),
  })
    .index("by_code", ["teamCode"])
    .index("by_score", ["totalScore"]),

  // Stocks Table
  stocks: defineTable({
    ticker: v.string(),
    name: v.string(),
    sector: v.string(),
    description: v.string(),
    currentPrice: v.number(),
    openingPrice: v.number(),
    dayHigh: v.number(),
    dayLow: v.number(),
    changePercent: v.number(),
    volatility: v.number(),
    sparkline: v.array(v.number()),
    updatedAt: v.number(),
  })
    .index("by_ticker", ["ticker"])
    .index("by_sector", ["sector"]),

  // Team Holdings Table
  holdings: defineTable({
    teamId: v.id("teams"),
    ticker: v.string(),
    shares: v.number(),
    avgBuyPrice: v.number(),
    totalInvested: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_ticker", ["teamId", "ticker"]),

  // Orders Ledger Table
  orders: defineTable({
    teamId: v.id("teams"),
    teamName: v.string(),
    ticker: v.string(),
    stockName: v.string(),
    type: v.string(), // "BUY" | "SELL"
    shares: v.number(),
    price: v.number(),
    totalAmount: v.number(),
    executedBy: v.string(),
    status: v.string(), // "EXECUTED" | "REJECTED"
    rejectionReason: v.optional(v.string()),
    lap: v.number(),
    timestamp: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_timestamp", ["timestamp"]),

  // Track Alerts and News Events
  trackEvents: defineTable({
    title: v.string(),
    description: v.string(),
    type: v.string(), // "NEWS_FLASH" | "YELLOW_FLAG" | "GREEN_FLAG" | "SAFETY_CAR"
    affectedSectors: v.array(v.string()),
    priceImpactPercent: v.number(),
    lap: v.number(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  // Global Race / Simulation State
  raceState: defineTable({
    currentLap: v.number(), // 1 to 5
    status: v.string(), // "GRID_WARMUP" | "GREEN_FLAG" | "SAFETY_CAR" | "CHECKERED_FLAG"
    lapTimeRemaining: v.number(), // seconds
    lapDuration: v.number(), // seconds
    lapStartedAt: v.optional(v.union(v.number(), v.null())),
    isRegistrationOpen: v.optional(v.boolean()),
    isSimulationEntryOpen: v.optional(v.boolean()),
    targetEventDate: v.optional(v.union(v.string(), v.null())),
    scheduledStartTime: v.optional(v.union(v.string(), v.null())),
    defaultStartingCapital: v.optional(v.number()),
    activeNews: v.optional(v.string()),
    updatedAt: v.number(),
  }),
});
