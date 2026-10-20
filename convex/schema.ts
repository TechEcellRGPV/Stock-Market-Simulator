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
    isRegistered: v.optional(v.boolean()),
    registeredAt: v.optional(v.number()),
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
    idempotencyKey: v.optional(v.string()),
  })
    .index("by_team", ["teamId"])
    .index("by_timestamp", ["timestamp"])
    .index("by_team_idempotency", ["teamId", "idempotencyKey"]),

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

    // Historical Replay State
    activeDatasetId: v.optional(v.union(v.string(), v.null())),
    replayStatus: v.optional(v.string()),
    replayMinute: v.optional(v.number()),
    replayLapMinute: v.optional(v.number()),
    replayGeneration: v.optional(v.number()),
    replayMinuteStartedAt: v.optional(v.union(v.number(), v.null())),
    pausedElapsedSeconds: v.optional(v.number()),
    replayTickIntervalMs: v.optional(v.number()),
  }),

  // Admin Sessions Table
  adminSessions: defineTable({
    tokenHash: v.string(),
    issuedTo: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  }).index("by_token_hash", ["tokenHash"]),

  // Admin Login Attempts Table
  adminLoginAttempts: defineTable({
    identifier: v.string(),
    attemptCount: v.number(),
    lastAttemptAt: v.number(),
    lockedUntil: v.optional(v.number()),
  }).index("by_identifier", ["identifier"]),

  // Historical Datasets Table
  historicalDatasets: defineTable({
    datasetId: v.string(),
    name: v.string(),
    source: v.string(),
    status: v.string(),
    isActive: v.boolean(),
    redistributionRightsConfirmed: v.boolean(),
    organizerConfirmed: v.boolean(),
    totalCandles: v.number(),
    symbolCount: v.number(),
    startEpochMs: v.number(),
    endEpochMs: v.number(),
    symbolMappings: v.array(
      v.object({
        fictionalTicker: v.string(),
        realSymbol: v.string(),
        baseMultiplier: v.number(),
        sourceExchange: v.optional(v.string()),
      })
    ),
    validationErrors: v.optional(v.array(v.string())),
    createdAt: v.number(),
    committedAt: v.optional(v.number()),
  })
    .index("by_dataset_id", ["datasetId"])
    .index("by_status", ["status"])
    .index("by_active", ["isActive"]),

  // Historical 1-Minute Price Candles Table
  historicalCandles: defineTable({
    datasetId: v.string(),
    symbol: v.string(),
    realSymbol: v.string(),
    lap: v.number(),
    minute: v.number(),
    lapMinute: v.number(),
    timestamp: v.number(),
    open: v.number(),
    high: v.number(),
    low: v.number(),
    close: v.number(),
    volume: v.number(),
  })
    .index("by_dataset_symbol_minute", ["datasetId", "symbol", "minute"])
    .index("by_dataset_minute", ["datasetId", "minute"])
    .index("by_dataset_lap_lapMinute", ["datasetId", "lap", "lapMinute"])
    .index("by_dataset_symbol", ["datasetId", "symbol"]),

  // Historical Market Session Controller (Twelve Data 180+ Minute Engine)
  historicalSessions: defineTable({
    sessionId: v.string(),
    status: v.string(), // "IDLE" | "GENERATING" | "READY" | "RUNNING" | "PAUSED" | "COMPLETED"
    totalMinutes: v.number(),
    currentMinuteIndex: v.number(),
    tickIntervalSeconds: v.number(),
    volatilityMultiplier: v.number(),
    sourceInfo: v.string(),
    symbolsUsed: v.array(v.string()),
    lastTickedAt: v.optional(v.number()),
    startedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_sessionId", ["sessionId"]),

  // 180+ Minute Historical Time Series & Valid News Tickers
  historicalTimeline: defineTable({
    sessionId: v.string(),
    minuteIndex: v.number(),
    datetime: v.string(),
    timestamp: v.number(),
    stockPrices: v.array(
      v.object({
        ticker: v.string(),
        name: v.string(),
        sector: v.string(),
        currentPrice: v.number(),
        openingPrice: v.number(),
        dayHigh: v.number(),
        dayLow: v.number(),
        changePercent: v.number(),
        volume: v.number(),
        sparkline: v.array(v.number()),
      })
    ),
    newsEvents: v.array(
      v.object({
        title: v.string(),
        description: v.string(),
        ticker: v.optional(v.string()),
        sector: v.optional(v.string()),
        type: v.string(), // "NEWS_FLASH" | "YELLOW_FLAG" | "GREEN_FLAG" | "SAFETY_CAR"
        priceImpactPercent: v.number(),
        source: v.string(),
      })
    ),
  })
    .index("by_session_and_minute", ["sessionId", "minuteIndex"])
    .index("by_minute", ["minuteIndex"]),
});

