import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const INITIAL_MARKET_NEWS = [
  {
    title: "Apex Semiconductor Unveils 3nm Quantum AI Accelerator Chips",
    summary:
      "Apex Semiconductor (APEX) surges on massive enterprise orders for its next-gen AI server accelerators, beating quarterly silicon volume guidance.",
    source: "Bloomberg Market Telemetry",
    category: "TECH",
    ticker: "APEX",
    sentiment: "BULLISH",
    url: "https://finance.yahoo.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 15 * 60 * 1000,
  }, 
  {
    title: "Global Lithium Supply Surplus Compresses Battery Pack Prices by 18%",
    summary:
      "Battery pack raw material costs fall sharply across global supply hubs. Volt Dynamics (VOLT) accelerates solid-state EV commercial production.",
    source: "Reuters Industrial",
    category: "ENERGY",
    ticker: "VOLT",
    sentiment: "BULLISH",
    url: "https://reuters.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 32 * 60 * 1000,
  },
  {
    title: "Quantum Defence Corp Secures ₹4,200 Cr Hypersonic Avionics Contract",
    summary:
      "Federal defense procurement awards Quantum Defence (QNTM) full multi-year contract for next-generation drone interceptor avionics.",
    source: "Financial Times Defense",
    category: "EQUITIES",
    ticker: "QNTM",
    sentiment: "BULLISH",
    url: "https://ft.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 50 * 60 * 1000,
  },
  {
    title: "Helios Renewable Energy Commission 1.2 GW Solar-Wind Hybrid Paddock Grid",
    summary:
      "Clean megawatt transmission operational ahead of target schedule in Gujarat energy corridor. Helios (HLIO) grid tariff yield climbs +3.4%.",
    source: "Economic Times Energy",
    category: "ENERGY",
    ticker: "HLIO",
    sentiment: "BULLISH",
    url: "https://economictimes.indiatimes.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 75 * 60 * 1000,
  },
  {
    title: "Central Reserve Bank Holds Benchmark Policy Rates at 6.50%",
    summary:
      "Monetary Policy Committee votes 5-1 to maintain liquidity balance, signalling macro stability and strong commercial banking capital adequacy.",
    source: "Mint Macro Bureau",
    category: "MACRO",
    ticker: "NXBN",
    sentiment: "NEUTRAL",
    url: "https://livemint.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 110 * 60 * 1000,
  },
  {
    title: "Nexus Commercial Bank Reports Record 19.2% Return on Equity",
    summary:
      "Nexus Bank (NXBN) net interest margins widen on commercial infrastructure loan expansion while non-performing asset ratios reach historic lows.",
    source: "CNBC Financials",
    category: "EQUITIES",
    ticker: "NXBN",
    sentiment: "BULLISH",
    url: "https://cnbc.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 140 * 60 * 1000,
  },
  {
    title: "Titan Infrastructure Wins ₹8,900 Cr High-Speed Freight Transit Tender",
    summary:
      "Titan Infra (TITN) order book hits all-time high with greenfield industrial freight corridor development connecting western ports.",
    source: "Business Standard",
    category: "EQUITIES",
    ticker: "TITN",
    sentiment: "BULLISH",
    url: "https://business-standard.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 180 * 60 * 1000,
  },
  {
    title: "Race Control Announcement: Lap Staging and Market Volatility Protocol",
    summary:
      "All 15 participating teams are reminded that sector shocks trigger price resets. Only designated Team Leaders can submit pit-stop market orders.",
    source: "Race Director Operations",
    category: "ANNOUNCEMENT",
    ticker: undefined,
    sentiment: "NEUTRAL",
    url: undefined,
    isOfficialAnnouncement: true,
    timestamp: Date.now() - 210 * 60 * 1000,
  },
  {
    title: "CyberPulse Security Unveils Zero-Trust Quantum Mesh Defense Suite",
    summary:
      "CyberPulse (CYBR) expands enterprise cloud footprint across tier-1 financial institutions amid surge in global ransomware mitigation demand.",
    source: "TechCrunch Enterprise",
    category: "TECH",
    ticker: "CYBR",
    sentiment: "BULLISH",
    url: "https://techcrunch.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 240 * 60 * 1000,
  },
  {
    title: "BioVanguard Therapeutics Receives Phase III Fast-Track Clearance",
    summary:
      "Regulatory advisory committee issues unanimous recommendation for accelerated clinical launch of BioVanguard (BIOV) novel oncology molecule.",
    source: "Health & Pharma Wire",
    category: "EQUITIES",
    ticker: "BIOV",
    sentiment: "BULLISH",
    url: "https://reuters.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 300 * 60 * 1000,
  },
  {
    title: "Global Supply Chain Delays Affect Rare-Earth Magnet Imports",
    summary:
      "Shipping route disruptions create short-term raw material friction for automotive powertrain sub-assemblies. Volatility expected across mid-cap auto.",
    source: "Wall Street Journal Logistics",
    category: "MACRO",
    ticker: "VOLT",
    sentiment: "BEARISH",
    url: "https://wsj.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 360 * 60 * 1000,
  },
  {
    title: "Starlight Aerospace Completes Orbital Satellite Constellation Deployment",
    summary:
      "Starlight Aerospace (STAR) launches 48 low-earth-orbit commercial broadband satellites, completing first-phase telecommunications ring.",
    source: "SpaceNews Gazette",
    category: "TECH",
    ticker: "STAR",
    sentiment: "BULLISH",
    url: "https://spacenews.com",
    isOfficialAnnouncement: false,
    timestamp: Date.now() - 420 * 60 * 1000,
  },
];

// Query: Fetch Market News with optional category filter, keyword search, and limit
export const getMarketNews = query({
  args: {
    category: v.optional(v.string()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let news = await ctx.db.query("marketNews").order("desc").collect();

    // News starts empty until Admin explicitly publishes articles

    if (args.category && args.category !== "ALL") {
      const cat = args.category.toUpperCase();
      news = news.filter((n) => n.category.toUpperCase() === cat);
    }

    if (args.search && args.search.trim()) {
      const term = args.search.trim().toLowerCase();
      news = news.filter(
        (n) =>
          n.title.toLowerCase().includes(term) ||
          n.summary.toLowerCase().includes(term) ||
          (n.ticker && n.ticker.toLowerCase().includes(term)) ||
          n.source.toLowerCase().includes(term),
      );
    }

    const limit = args.limit || 50;
    return news.slice(0, limit);
  },
});

// Mutation: Seed initial demonstration market news
export const seedInitialMarketNews = mutation({
  args: { overwrite: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("marketNews").collect();
    if (existing.length > 0 && !args.overwrite) {
      return { seeded: false, count: existing.length };
    }

    if (args.overwrite) {
      for (const item of existing) {
        await ctx.db.delete(item._id);
      }
    }

    for (const item of INITIAL_MARKET_NEWS) {
      await ctx.db.insert("marketNews", item);
    }

    return { seeded: true, count: INITIAL_MARKET_NEWS.length };
  },
});

// Mutation: Publish official simulation announcement or breaking news (Admin only)
export const publishMarketNews = mutation({
  args: {
    title: v.string(),
    summary: v.string(),
    source: v.optional(v.string()),
    category: v.string(), // "EQUITIES" | "TECH" | "ENERGY" | "MACRO" | "ANNOUNCEMENT"
    ticker: v.optional(v.string()),
    sentiment: v.optional(v.string()), // "BULLISH" | "BEARISH" | "NEUTRAL"
    url: v.optional(v.string()),
    isOfficialAnnouncement: v.boolean(),
  },
  handler: async (ctx, args) => {
    const title = args.title.trim();
    const summary = args.summary.trim();
    if (!title || !summary) {
      throw new ConvexError("Headline and summary are required.");
    }

    const now = Date.now();
    const newsId = await ctx.db.insert("marketNews", {
      title,
      summary,
      source: (args.source || "Race Control Announcement").trim(),
      category: args.category.toUpperCase(),
      ticker: args.ticker ? args.ticker.trim().toUpperCase() : undefined,
      sentiment: args.sentiment ? (args.sentiment.toUpperCase() as "BULLISH" | "BEARISH" | "NEUTRAL") : "NEUTRAL",
      url: args.url ? args.url.trim() : undefined,
      isOfficialAnnouncement: args.isOfficialAnnouncement,
      publishedBy: "RACE_DIRECTOR",
      timestamp: now,
    });

    // Also register audit log
    await ctx.db.insert("auditLogs", {
      action: "PUBLISH_MARKET_NEWS",
      actor: "ADMIN",
      target: title,
      details: `Published news article in category ${args.category}: "${title}"`,
      timestamp: now,
    });

    return { success: true, newsId };
  },
});

// Mutation: Clear all published market news articles (Admin only)
export const clearMarketNews = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("marketNews").collect();
    for (const item of existing) {
      await ctx.db.delete(item._id);
    }
    return { success: true, count: existing.length };
  },
});
