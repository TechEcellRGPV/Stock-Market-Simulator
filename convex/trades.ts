import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * @file trades.ts
 * @description Real-time order routing, position accounting, and trade execution for Imprenditore 5.0.
 * Guarantees serializable ACID order processing:
 * - Atomic portfolio cash balance adjustments
 * - Weighted-average cost basis accounting for incremental buys
 * - FIFO share decrements and position removal on full liquidation
 * - Permanent order audit ledger recording lap, timestamp, driver, and price
 */

/**
 * Query: Retrieve real-time active stock holdings for a specific team.
 */
export const getTeamHoldings = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("holdings")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
  },
});

/**
 * Query: Retrieve chronological order execution ledger for a specific team (bounded to 100).
 */
export const getTeamOrders = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .take(100);
  },
});

/**
 * Query: Retrieve all holdings across the entire grid (bounded to 1000).
 */
export const getAllHoldings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("holdings").take(1000);
  },
});

/**
 * Query: Retrieve global order audit stream across all teams (bounded to 100).
 */
export const getAllOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").take(100);
  },
});

/**
 * Mutation: Execute Atomic Buy / Sell Order.
 * Validates race state (GREEN_FLAG), checks cash balance / holding limits,
 * updates cashBalance and holdings in a single transaction, and creates an order record.
 */
export const executeTrade = mutation({
  args: {
    teamId: v.id("teams"),
    ticker: v.string(),
    type: v.string(), // "BUY" | "SELL"
    shares: v.number(),
    executedBy: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const shares = Math.floor(args.shares);
    if (shares <= 0 || !Number.isFinite(shares)) {
      throw new Error("Share quantity must be a positive whole number.");
    }

    // 1. Check Race State
    const raceState = await ctx.db.query("raceState").first();
    if (raceState && raceState.status === "GRID_WARMUP") {
      throw new Error(
        "Trading is currently locked. The market opens on Green Flag.",
      );
    }
    if (raceState && raceState.status === "SAFETY_CAR") {
      throw new Error(
        "Safety Car deployed: Trading is temporarily paused by Race Control.",
      );
    }
    if (raceState && raceState.status === "CHECKERED_FLAG") {
      throw new Error(
        "Checkered Flag: Simulation has concluded. Market is permanently closed.",
      );
    }
    if (raceState && raceState.isSimulationEntryOpen === false) {
      throw new Error(
        "Trading floor access is currently locked by Race Control.",
      );
    }

    // 2. Fetch Team and verify Leader Trade Authorization
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found.");
    }
    if (team.status === "DISQUALIFIED") {
      throw new Error("This team has been disqualified from placing trades.");
    }
    if (team.status === "LOCKED") {
      throw new Error("Team portfolio is locked.");
    }

    // Role-Based Access: Strictly the Team Leader can execute trades
    const caller = (args.executedBy || "").trim().toLowerCase();
    const leader = (team.leaderName || "").trim().toLowerCase();

    if (
      leader &&
      !leader.startsWith("driver lead") &&
      !leader.startsWith("team leader") &&
      caller !== leader
    ) {
      throw new Error(
        `Order rejected: Only the designated Team Leader (${team.leaderName}) is authorized to execute trades. Other team members have view-only access.`,
      );
    }

    // Single active leader session guard
    if (
      args.sessionId &&
      team.activeLeaderSessionId &&
      args.sessionId !== team.activeLeaderSessionId
    ) {
      throw new Error(
        "Leader session expired: Another device has logged in as Team Leader.",
      );
    }

    // 3. Fetch Stock
    const stock = await ctx.db
      .query("stocks")
      .withIndex("by_ticker", (q) => q.eq("ticker", args.ticker))
      .first();
    if (!stock) {
      throw new Error(`Stock ticker ${args.ticker} not found.`);
    }

    const currentPrice = stock.currentPrice;
    const totalAmount = Math.round(shares * currentPrice * 100) / 100;
    const now = Date.now();
    const currentLap = raceState ? raceState.currentLap : 1;

    // 4. Execute BUY
    if (args.type === "BUY") {
      if (team.cashBalance < totalAmount) {
        throw new Error(
          `Insufficient cash. Order requires ₹${totalAmount.toLocaleString("en-IN")}, but available cash is ₹${Math.floor(team.cashBalance).toLocaleString("en-IN")}.`,
        );
      }

      // Deduct cash
      const newCash = Math.round((team.cashBalance - totalAmount) * 100) / 100;

      // Update or insert holding
      const existingHolding = await ctx.db
        .query("holdings")
        .withIndex("by_team_and_ticker", (q) =>
          q.eq("teamId", args.teamId).eq("ticker", args.ticker),
        )
        .first();

      if (existingHolding) {
        const updatedShares = existingHolding.shares + shares;
        const updatedInvested = existingHolding.totalInvested + totalAmount;
        const updatedAvgPrice =
          Math.round((updatedInvested / updatedShares) * 100) / 100;

        await ctx.db.patch(existingHolding._id, {
          shares: updatedShares,
          totalInvested: updatedInvested,
          avgBuyPrice: updatedAvgPrice,
          updatedAt: now,
        });
      } else {
        await ctx.db.insert("holdings", {
          teamId: args.teamId,
          ticker: args.ticker,
          shares,
          avgBuyPrice: currentPrice,
          totalInvested: totalAmount,
          updatedAt: now,
        });
      }

      // Record Order in Ledger
      await ctx.db.insert("orders", {
        teamId: args.teamId,
        teamName: team.teamName,
        ticker: stock.ticker,
        stockName: stock.name,
        type: "BUY",
        shares,
        price: currentPrice,
        totalAmount,
        executedBy: args.executedBy || team.leaderName,
        status: "EXECUTED",
        lap: currentLap,
        timestamp: now,
      });

      // Update team trade count and cash
      await ctx.db.patch(team._id, {
        cashBalance: newCash,
        tradeCount: (team.tradeCount || 0) + 1,
      });

      return {
        success: true,
        type: "BUY",
        ticker: stock.ticker,
        shares,
        price: currentPrice,
        totalAmount,
        remainingCash: newCash,
      };
    }

    // 5. Execute SELL
    if (args.type === "SELL") {
      const existingHolding = await ctx.db
        .query("holdings")
        .withIndex("by_team_and_ticker", (q) =>
          q.eq("teamId", args.teamId).eq("ticker", args.ticker),
        )
        .first();

      if (!existingHolding || existingHolding.shares < shares) {
        const owned = existingHolding ? existingHolding.shares : 0;
        throw new Error(
          `Short selling is not permitted. You attempted to sell ${shares} shares of ${stock.ticker}, but only own ${owned} shares.`,
        );
      }

      // Credit cash
      const newCash = Math.round((team.cashBalance + totalAmount) * 100) / 100;
      const remainingShares = existingHolding.shares - shares;

      if (remainingShares === 0) {
        await ctx.db.delete(existingHolding._id);
      } else {
        const remainingInvested =
          Math.round(remainingShares * existingHolding.avgBuyPrice * 100) / 100;
        await ctx.db.patch(existingHolding._id, {
          shares: remainingShares,
          totalInvested: remainingInvested,
          updatedAt: now,
        });
      }

      // Record Order in Ledger
      await ctx.db.insert("orders", {
        teamId: args.teamId,
        teamName: team.teamName,
        ticker: stock.ticker,
        stockName: stock.name,
        type: "SELL",
        shares,
        price: currentPrice,
        totalAmount,
        executedBy: args.executedBy || team.leaderName,
        status: "EXECUTED",
        lap: currentLap,
        timestamp: now,
      });

      // Update team trade count and cash
      await ctx.db.patch(team._id, {
        cashBalance: newCash,
        tradeCount: (team.tradeCount || 0) + 1,
      });

      return {
        success: true,
        type: "SELL",
        ticker: stock.ticker,
        shares,
        price: currentPrice,
        totalAmount,
        remainingCash: newCash,
      };
    }

    throw new Error(`Invalid order type: ${args.type}`);
  },
});
