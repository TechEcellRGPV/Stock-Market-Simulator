import { query, mutation } from "./_generated/server";

/**
 * @file leaderboard.ts
 * @description Real-time Leaderboard calculation engine for Imprenditore 5.0.
 * Implements the 50/30/20 Pole Position formula:
 * 1. 50% Portfolio Growth: Absolute return clamped between -20% and +20% (0 to 50 pts)
 * 2. 30% Strategy & Diversification: Number of unique active sectors (10 to 30 pts)
 * 3. 20% Decision-Making & Execution: Capital deployed (≥50%) + order volume (0 to 20 pts)
 */

/**
 * Query: Compute and return live Leaderboard ranked by the 50/30/20 Formula.
 * Dynamically evaluates current equity market prices across team holdings,
 * derives portfolio net worth, and assigns competitive 1-indexed ranks.
 */
export const getLeaderboard = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const stocks = await ctx.db.query("stocks").collect();
    const allHoldings = await ctx.db.query("holdings").collect();
    const raceState = await ctx.db.query("raceState").first();
    const startingCapital = raceState?.defaultStartingCapital || 100000;

    // Map of current stock prices by ticker
    const stockPriceMap = new Map<
      string,
      { price: number; sector: string; name: string }
    >();
    for (const stock of stocks) {
      stockPriceMap.set(stock.ticker, {
        price: stock.currentPrice,
        sector: stock.sector,
        name: stock.name,
      });
    }

    const leaderboard = [];

    for (const team of teams) {
      if (team.status === "DISQUALIFIED") continue;

      const teamHoldings = allHoldings.filter((h) => h.teamId === team._id);

      // 1. Calculate Total Holdings Value & Sectors Invested
      let holdingsValue = 0;
      const sectorsInvested = new Set<string>();

      for (const holding of teamHoldings) {
        const stockData = stockPriceMap.get(holding.ticker);
        const currentPrice = stockData ? stockData.price : holding.avgBuyPrice;
        holdingsValue += holding.shares * currentPrice;

        if (stockData) {
          sectorsInvested.add(stockData.sector);
        }
      }

      const totalPortfolioValue =
        Math.round((team.cashBalance + holdingsValue) * 100) / 100;
      const returnPercent =
        Math.round(((totalPortfolioValue - startingCapital) / startingCapital) * 1000) / 10;

      // 2. Score Component 1: 50% Portfolio Value (0 to 50 points)
      // Baseline 25 pts for 0% gain; +20% gain gives 50 pts; -20% gives 0 pts
      const normalizedReturn = returnPercent / 20; // 1.0 at +20%
      const portfolioScore = Math.max(
        0,
        Math.min(50, Math.round((25 + normalizedReturn * 25) * 10) / 10),
      );

      // 3. Score Component 2: 30% Strategy & Risk (0 to 30 points)
      // 1 sector = 10 pts, 2 sectors = 20 pts, 3+ sectors = 30 pts
      const uniqueSectorCount = sectorsInvested.size;
      let strategyScore = 0;
      if (uniqueSectorCount === 1) strategyScore = 10;
      else if (uniqueSectorCount === 2) strategyScore = 20;
      else if (uniqueSectorCount >= 3) strategyScore = 30;

      // 4. Score Component 3: 20% Decision-Making & Execution (0 to 20 points)
      // Rewarding deployed capital (not holding 100% cash) and trading activity
      const capitalDeployedPercent = Math.min(
        100,
        (holdingsValue / startingCapital) * 100,
      );
      const tradesCount = team.tradeCount || 0;

      const deploymentScore = Math.min(10, (capitalDeployedPercent / 50) * 10); // 10 pts for 50%+ deployed
      const activityScore = Math.min(10, (tradesCount / 4) * 10); // 10 pts for 4+ trades
      const executionScore =
        Math.round((deploymentScore + activityScore) * 10) / 10;

      // Total Combined Score (out of 100)
      const totalScore =
        Math.round((portfolioScore + strategyScore + executionScore) * 10) / 10;
      const netProfit =
        Math.round((totalPortfolioValue - startingCapital) * 100) / 100;

      leaderboard.push({
        teamId: team._id,
        teamCode: team.teamCode,
        teamName: team.teamName,
        leaderName: team.leaderName,
        membersCount: team.members.length,
        cashBalance: team.cashBalance,
        holdingsValue,
        totalPortfolioValue,
        netProfit,
        returnPercent,
        portfolioScore,
        strategyScore,
        executionScore,
        totalScore,
        tradeCount: tradesCount,
        uniqueSectorCount,
        status: team.status,
      });
    }

    // Sort descending strictly by profit (totalPortfolioValue)
    leaderboard.sort((a, b) => {
      if (b.totalPortfolioValue !== a.totalPortfolioValue) {
        return b.totalPortfolioValue - a.totalPortfolioValue;
      }
      return b.returnPercent - a.returnPercent;
    });

    // Add 1-indexed ranks
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }));
  },
});

// Mutation: Sync calculated scores back to team records
export const recalculateTeamScores = mutation({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const stocks = await ctx.db.query("stocks").collect();
    const allHoldings = await ctx.db.query("holdings").collect();

    const stockPriceMap = new Map<string, { price: number; sector: string }>();
    for (const stock of stocks) {
      stockPriceMap.set(stock.ticker, {
        price: stock.currentPrice,
        sector: stock.sector,
      });
    }

    for (const team of teams) {
      const teamHoldings = allHoldings.filter((h) => h.teamId === team._id);
      let holdingsValue = 0;
      const sectors = new Set<string>();

      for (const h of teamHoldings) {
        const s = stockPriceMap.get(h.ticker);
        holdingsValue += h.shares * (s ? s.price : h.avgBuyPrice);
        if (s) sectors.add(s.sector);
      }

      const totalVal = team.cashBalance + holdingsValue;
      const returnPct = ((totalVal - 100000) / 100000) * 100;
      const pScore = Math.max(
        0,
        Math.min(50, Math.round((25 + (returnPct / 20) * 25) * 10) / 10),
      );

      let sScore = 0;
      if (sectors.size === 1) sScore = 10;
      else if (sectors.size === 2) sScore = 20;
      else if (sectors.size >= 3) sScore = 30;

      const depScore = Math.min(10, (holdingsValue / 50000) * 10);
      const actScore = Math.min(10, ((team.tradeCount || 0) / 4) * 10);
      const eScore = Math.round((depScore + actScore) * 10) / 10;
      const tScore = Math.round((pScore + sScore + eScore) * 10) / 10;

      await ctx.db.patch(team._id, {
        totalScore: tScore,
        portfolioScore: pScore,
        strategyScore: sScore,
        executionScore: eScore,
      });
    }
  },
});
