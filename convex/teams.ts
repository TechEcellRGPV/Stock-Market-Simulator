import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Profanity / Inappropriate words blocklist
const PROFANITY_PATTERNS = [
  /fuck/i,
  /shit/i,
  /bitch/i,
  /asshole/i,
  /bastard/i,
  /dick/i,
  /pussy/i,
  /cunt/i,
  /slut/i,
  /whore/i,
  /nigger/i,
  /nigga/i,
  /fag/i,
  /chutiya/i,
  /gandu/i,
  /madarchod/i,
  /bhenchod/i,
  /bhosadi/i,
  /harami/i,
  /randi/i,
  /f\*ck/i,
  /sh\*t/i,
  /b\*tch/i,
  /a\$\$hole/i,
  /d\*ck/i,
  /p\*ssy/i,
];

function sanitizeAndValidateName(name: string): {
  valid: boolean;
  error?: string;
  cleanName?: string;
} {
  const trimmed = name.trim();
  if (trimmed.length < 3) {
    return {
      valid: false,
      error: "Team name must be at least 3 characters long.",
    };
  }
  if (trimmed.length > 25) {
    return { valid: false, error: "Team name cannot exceed 25 characters." };
  }
  if (!/^[a-zA-Z0-9\s\-]+$/.test(trimmed)) {
    return {
      valid: false,
      error:
        "Team name can only contain letters, numbers, spaces, and hyphens.",
    };
  }
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        error:
          "Team name violates event community guidelines. Please choose a clean motorsport or team name.",
      };
    }
  }
  return { valid: true, cleanName: trimmed };
}

// Generate human-friendly unique team code (e.g., APEX-702)
function generateTeamCode(teamName: string): string {
  const prefix =
    teamName
      .replace(/[^a-zA-Z]/g, "")
      .slice(0, 4)
      .toUpperCase() || "TEAM";
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${randomSuffix}`;
}

// Mutation: Register a new team
export const createTeam = mutation({
  args: {
    teamName: v.string(),
    teamPin: v.string(),
    leaderName: v.string(),
    memberNames: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // 0. Check Registration Gate
    const raceState = await ctx.db.query("raceState").first();
    if (raceState && raceState.isRegistrationOpen === false) {
      throw new Error(
        "Team registration is currently locked by Race Control. Registration will open on event day.",
      );
    }
    const initialCapital = raceState?.defaultStartingCapital || 100000;

    // 1. Validate name
    const validation = sanitizeAndValidateName(args.teamName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const cleanTeamName = validation.cleanName!;

    // 2. Validate PIN
    if (!/^\d{4}$/.test(args.teamPin.trim())) {
      throw new Error("Team PIN must be a 4-digit numeric code.");
    }

    // 3. Check for duplicate team name
    const allTeams = await ctx.db.query("teams").collect();
    const existing = allTeams.find(
      (t) => t.teamName.toLowerCase() === cleanTeamName.toLowerCase(),
    );
    if (existing) {
      throw new Error(
        "A team with this name is already registered. Please choose a different name or use Join Team.",
      );
    }

    const teamCode = generateTeamCode(cleanTeamName);
    const members = [
      args.leaderName.trim(),
      ...args.memberNames
        .map((m) => m.trim())
        .filter((m) => m.length > 0 && m !== args.leaderName.trim()),
    ];

    const now = Date.now();
    const teamId = await ctx.db.insert("teams", {
      teamCode,
      teamName: cleanTeamName,
      teamPin: args.teamPin.trim(),
      leaderName: args.leaderName.trim(),
      members,
      cashBalance: initialCapital,
      totalScore: 0,
      portfolioScore: 0,
      strategyScore: 0,
      executionScore: 0,
      tradeCount: 0,
      status: "ACTIVE",
      createdAt: now,
    });

    return {
      teamId,
      teamCode,
      teamName: cleanTeamName,
      leaderName: args.leaderName.trim(),
      cashBalance: initialCapital,
    };
  },
});

// Mutation: Join an existing team
export const joinTeam = mutation({
  args: {
    teamIdentifier: v.string(), // teamCode or teamName
    teamPin: v.string(),
    memberName: v.string(),
  },
  handler: async (ctx, args) => {
    const identifier = args.teamIdentifier.trim();
    const pin = args.teamPin.trim();
    const memberName = args.memberName.trim();

    if (!memberName) {
      throw new Error("Please enter your name to join.");
    }

    const allTeams = await ctx.db.query("teams").collect();
    const team = allTeams.find(
      (t) =>
        t.teamCode.toLowerCase() === identifier.toLowerCase() ||
        t.teamName.toLowerCase() === identifier.toLowerCase(),
    );

    if (!team) {
      throw new Error("Team not found. Please verify the Team Name / Code.");
    }

    if (team.teamPin !== pin) {
      throw new Error("Invalid 4-digit Team PIN.");
    }

    if (team.status === "DISQUALIFIED") {
      throw new Error("This team has been disqualified from the simulation.");
    }

    // Add member if not already listed
    if (!team.members.includes(memberName)) {
      const updatedMembers = [...team.members, memberName];
      await ctx.db.patch(team._id, { members: updatedMembers });
    }

    return {
      teamId: team._id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      leaderName: team.leaderName,
      cashBalance: team.cashBalance,
      status: team.status,
    };
  },
});

// Query: Get live team profile and holdings
export const getTeamSession = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return null;

    const holdings = await ctx.db
      .query("holdings")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .order("desc")
      .take(20);

    return {
      team,
      holdings,
      recentOrders: orders,
    };
  },
});

// Query: Admin list of all registered teams
export const adminListTeams = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("teams").order("desc").collect();
  },
});

// Mutation: Admin update / rename / disqualify team
export const adminUpdateTeam = mutation({
  args: {
    teamId: v.id("teams"),
    teamName: v.optional(v.string()),
    status: v.optional(v.string()),
    cashBalance: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const patchData: Record<string, unknown> = {};
    if (args.teamName) patchData.teamName = args.teamName.trim();
    if (args.status) patchData.status = args.status;
    if (args.cashBalance !== undefined)
      patchData.cashBalance = args.cashBalance;

    await ctx.db.patch(args.teamId, patchData);
  },
});

// Mutation: Admin delete team and associated records
export const adminDeleteTeam = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    // Delete holdings
    const holdings = await ctx.db
      .query("holdings")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const h of holdings) {
      await ctx.db.delete(h._id);
    }
    // Delete orders
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_team", (q) => q.eq("teamId", args.teamId))
      .collect();
    for (const o of orders) {
      await ctx.db.delete(o._id);
    }
    // Delete team
    await ctx.db.delete(args.teamId);
    return { success: true };
  },
});
