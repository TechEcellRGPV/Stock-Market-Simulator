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

// Canonical 15 Motorsport Teams Grid
export const CANONICAL_15_TEAMS = [
  {
    teamCode: "RBR-01",
    teamName: "Oracle Red Bull Racing",
    teamPin: "1001",
    leaderName: "Team Leader 01",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "FER-02",
    teamName: "Scuderia Ferrari HP",
    teamPin: "1002",
    leaderName: "Team Leader 02",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "MER-03",
    teamName: "Mercedes-AMG Petronas",
    teamPin: "1003",
    leaderName: "Team Leader 03",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "MCL-04",
    teamName: "McLaren Formula 1 Team",
    teamPin: "1004",
    leaderName: "Team Leader 04",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "AST-05",
    teamName: "Aston Martin Aramco",
    teamPin: "1005",
    leaderName: "Team Leader 05",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "ALP-06",
    teamName: "BWT Alpine Motorsport",
    teamPin: "1006",
    leaderName: "Team Leader 06",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "WIL-07",
    teamName: "Williams Racing",
    teamPin: "1007",
    leaderName: "Team Leader 07",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "SAU-08",
    teamName: "Stake F1 Kick Sauber",
    teamPin: "1008",
    leaderName: "Team Leader 08",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "VCB-09",
    teamName: "Visa Cash App RB",
    teamPin: "1009",
    leaderName: "Team Leader 09",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "HAA-10",
    teamName: "MoneyGram Haas F1 Team",
    teamPin: "1010",
    leaderName: "Team Leader 10",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "POR-11",
    teamName: "Porsche Motorsport Formula",
    teamPin: "1011",
    leaderName: "Team Leader 11",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "AUD-12",
    teamName: "Audi Sport Racing",
    teamPin: "1012",
    leaderName: "Team Leader 12",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "BMW-13",
    teamName: "BMW M Motorsport",
    teamPin: "1013",
    leaderName: "Team Leader 13",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "TOY-14",
    teamName: "Toyota Gazoo Racing",
    teamPin: "1014",
    leaderName: "Team Leader 14",
    member2: "Member 2",
    member3: "Member 3",
  },
  {
    teamCode: "KOE-15",
    teamName: "Koenigsegg Racing Dynamics",
    teamPin: "1015",
    leaderName: "Team Leader 15",
    member2: "Member 2",
    member3: "Member 3",
  },
];

// Mutation: Seed the 15 Pre-Decided Teams
export const seedCanonical15Teams = mutation({
  args: {
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingTeams = await ctx.db.query("teams").collect();
    if (existingTeams.length > 0 && !args.overwrite) {
      return {
        seeded: false,
        count: existingTeams.length,
        message: "Teams already seeded on the grid.",
      };
    }

    if (args.overwrite) {
      for (const t of existingTeams) {
        const holdings = await ctx.db
          .query("holdings")
          .withIndex("by_team", (q) => q.eq("teamId", t._id))
          .collect();
        for (const h of holdings) await ctx.db.delete(h._id);

        const orders = await ctx.db
          .query("orders")
          .withIndex("by_team", (q) => q.eq("teamId", t._id))
          .collect();
        for (const o of orders) await ctx.db.delete(o._id);

        await ctx.db.delete(t._id);
      }
    }

    const raceState = await ctx.db.query("raceState").first();
    const initialCapital = raceState?.defaultStartingCapital || 100000;
    const now = Date.now();

    for (const team of CANONICAL_15_TEAMS) {
      await ctx.db.insert("teams", {
        teamCode: team.teamCode,
        teamName: team.teamName,
        teamPin: team.teamPin,
        leaderName: team.leaderName,
        member2: team.member2,
        member3: team.member3,
        members: [team.leaderName, team.member2, team.member3],
        cashBalance: initialCapital,
        totalScore: 0,
        portfolioScore: 0,
        strategyScore: 0,
        executionScore: 0,
        tradeCount: 0,
        status: "ACTIVE",
        createdAt: now,
      });
    }

    return { seeded: true, count: CANONICAL_15_TEAMS.length };
  },
});

// Mutation: Register members for an allocated team slot (Strictly 3 members)
export const registerTeamSlot = mutation({
  args: {
    teamCode: v.string(),
    teamPin: v.string(),
    leaderName: v.string(),
    member2: v.string(),
    member3: v.string(),
  },
  handler: async (ctx, args) => {
    const raceState = await ctx.db.query("raceState").first();
    if (raceState && raceState.isRegistrationOpen === false) {
      throw new Error(
        "Team registration is currently locked by Race Control. Registration will open on event day.",
      );
    }

    const code = args.teamCode.trim().toUpperCase();
    const pin = args.teamPin.trim();
    const leader = args.leaderName.trim();
    const m2 = args.member2.trim();
    const m3 = args.member3.trim();

    if (!leader || !m2 || !m3) {
      throw new Error(
        "Each team requires exactly 3 members: Team Leader, Member 2 (Strategist), and Member 3 (Telemetry Analyst).",
      );
    }

    if (
      leader.toLowerCase() === m2.toLowerCase() ||
      leader.toLowerCase() === m3.toLowerCase() ||
      m2.toLowerCase() === m3.toLowerCase()
    ) {
      throw new Error("All 3 team members must have distinct names.");
    }

    if (!/^\d{4}$/.test(pin)) {
      throw new Error("Team PIN must be a 4-digit numeric code.");
    }

    const team = await ctx.db
      .query("teams")
      .withIndex("by_code", (q) => q.eq("teamCode", code))
      .first();

    if (!team) {
      throw new Error(`Team ${code} not found on the 15-team grid.`);
    }

    const members = [leader, m2, m3];
    await ctx.db.patch(team._id, {
      leaderName: leader,
      member2: m2,
      member3: m3,
      members,
      teamPin: pin,
    });

    return {
      teamId: team._id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      leaderName: leader,
      member2: m2,
      member3: m3,
      members,
      cashBalance: team.cashBalance,
    };
  },
});

// Mutation: Register a new team (Max 15 grid slots, strictly 3 members)
export const createTeam = mutation({
  args: {
    teamName: v.string(),
    teamPin: v.string(),
    leaderName: v.string(),
    member2: v.optional(v.string()),
    member3: v.optional(v.string()),
    memberNames: v.optional(v.array(v.string())),
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

    // 1. Grid capacity check (Strictly 15 teams maximum)
    const allTeams = await ctx.db.query("teams").collect();
    if (allTeams.length >= 15) {
      throw new Error(
        "Grid capacity limit reached. Maximum 15 teams permitted on the competition grid.",
      );
    }

    // 2. Validate name
    const validation = sanitizeAndValidateName(args.teamName);
    if (!validation.valid) {
      throw new Error(validation.error);
    }
    const cleanTeamName = validation.cleanName!;

    // 3. Validate PIN
    if (!/^\d{4}$/.test(args.teamPin.trim())) {
      throw new Error("Team PIN must be a 4-digit numeric code.");
    }

    // 4. Check for duplicate team name
    const existing = allTeams.find(
      (t) => t.teamName.toLowerCase() === cleanTeamName.toLowerCase(),
    );
    if (existing) {
      throw new Error(
        "A team with this name is already registered. Please choose a different name or use Join Team.",
      );
    }

    const leader = args.leaderName.trim();
    const m2 =
      args.member2?.trim() ||
      args.memberNames?.[0]?.trim() ||
      "Strategist Lead";
    const m3 =
      args.member3?.trim() ||
      args.memberNames?.[1]?.trim() ||
      "Telemetry Lead";

    if (!leader) {
      throw new Error("Team Leader name is required.");
    }

    const teamCode = generateTeamCode(cleanTeamName);
    const members = [leader, m2, m3];
    const now = Date.now();

    const teamId = await ctx.db.insert("teams", {
      teamCode,
      teamName: cleanTeamName,
      teamPin: args.teamPin.trim(),
      leaderName: leader,
      member2: m2,
      member3: m3,
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
      leaderName: leader,
      member2: m2,
      member3: m3,
      cashBalance: initialCapital,
    };
  },
});

// Mutation: Join / Authenticate into a Team Session
export const joinTeam = mutation({
  args: {
    teamIdentifier: v.string(), // teamCode or teamName
    teamPin: v.string(),
    memberName: v.string(),
    role: v.optional(v.string()), // "LEADER" | "MEMBER"
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identifier = args.teamIdentifier.trim();
    const pin = args.teamPin.trim();
    const memberName = args.memberName.trim();
    const requestedRole = args.role === "LEADER" ? "LEADER" : "MEMBER";
    const sessionId =
      args.sessionId || Math.random().toString(36).substring(2, 12);

    if (!memberName) {
      throw new Error("Please enter your name to authenticate.");
    }

    const allTeams = await ctx.db.query("teams").collect();
    const team = allTeams.find(
      (t) =>
        t.teamCode.toLowerCase() === identifier.toLowerCase() ||
        t.teamName.toLowerCase() === identifier.toLowerCase(),
    );

    if (!team) {
      throw new Error(
        "Team not found. Please verify the Team Name or Grid Code.",
      );
    }

    if (team.teamPin !== pin) {
      throw new Error("Invalid 4-digit Team PIN.");
    }

    if (team.status === "DISQUALIFIED") {
      throw new Error("This team has been disqualified from the simulation.");
    }

    const now = Date.now();
    let finalRole = "MEMBER";

    if (requestedRole === "LEADER") {
      const cleanMember = memberName.toLowerCase();
      const cleanLeader = team.leaderName.toLowerCase();

      // If the team has an explicit leader name that is not a placeholder, verify match
      if (
        cleanLeader &&
        !cleanLeader.startsWith("driver lead") &&
        !cleanLeader.startsWith("team leader") &&
        cleanMember !== cleanLeader
      ) {
        throw new Error(
          `Only ${team.leaderName} can log in as Team Leader. If you are a teammate, please select 'Team Member (View Only)'.`,
        );
      }

      // Strict Single Leader Login Check:
      // If a leader is already active on another device within the last 30 minutes, block this login!
      const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
      const isAnotherLeaderActive =
        team.activeLeaderSessionId &&
        team.lastLeaderLoginAt &&
        now - team.lastLeaderLoginAt < SESSION_TIMEOUT_MS &&
        team.activeLeaderSessionId !== sessionId;

      if (isAnotherLeaderActive) {
        throw new Error(
          `A Team Leader is already logged in for ${team.teamName} on another device. Only one leader can be logged in at a time. Please login as 'Team Member (View Only)', or ask your leader to log out.`,
        );
      }

      // Record active leader session
      await ctx.db.patch(team._id, {
        activeLeaderSessionId: sessionId,
        lastLeaderLoginAt: now,
      });

      finalRole = "LEADER";
    }

    // Ensure member is in members list
    if (!team.members.includes(memberName)) {
      const updatedMembers = [...team.members, memberName];
      await ctx.db.patch(team._id, { members: updatedMembers });
    }

    return {
      teamId: team._id,
      teamCode: team.teamCode,
      teamName: team.teamName,
      leaderName: team.leaderName,
      member2: team.member2,
      member3: team.member3,
      members: team.members,
      cashBalance: team.cashBalance,
      status: team.status,
      userRole: finalRole,
      sessionId,
      activeLeaderSessionId:
        requestedRole === "LEADER" ? sessionId : team.activeLeaderSessionId,
    };
  },
});

// Mutation: Team Leader Logout (releases active leader session lock)
export const logoutTeamLeader = mutation({
  args: {
    teamId: v.id("teams"),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) return { success: false };

    if (!args.sessionId || team.activeLeaderSessionId === args.sessionId) {
      await ctx.db.patch(args.teamId, {
        activeLeaderSessionId: undefined,
        lastLeaderLoginAt: undefined,
      });
    }

    return { success: true };
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

// Mutation: Admin update / rename / status / cash of a team
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

// Mutation: Admin edit team members roster and credentials
export const adminUpdateTeamMembers = mutation({
  args: {
    teamId: v.id("teams"),
    teamName: v.optional(v.string()),
    teamPin: v.optional(v.string()),
    leaderName: v.optional(v.string()),
    member2: v.optional(v.string()),
    member3: v.optional(v.string()),
    cashBalance: v.optional(v.number()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const team = await ctx.db.get(args.teamId);
    if (!team) throw new Error("Team not found.");

    const patchData: Record<string, unknown> = {};
    if (args.teamName !== undefined) patchData.teamName = args.teamName.trim();
    if (args.teamPin !== undefined) patchData.teamPin = args.teamPin.trim();
    if (args.cashBalance !== undefined)
      patchData.cashBalance = args.cashBalance;
    if (args.status !== undefined) patchData.status = args.status;

    const leader =
      args.leaderName !== undefined
        ? args.leaderName.trim()
        : team.leaderName;
    const m2 =
      args.member2 !== undefined
        ? args.member2.trim()
        : team.member2 || "Strategist Lead";
    const m3 =
      args.member3 !== undefined
        ? args.member3.trim()
        : team.member3 || "Telemetry Lead";

    patchData.leaderName = leader;
    patchData.member2 = m2;
    patchData.member3 = m3;
    patchData.members = [leader, m2, m3];

    await ctx.db.patch(args.teamId, patchData);
    return { success: true };
  },
});

// Mutation: Admin clear active leader session (unlocks session in case of logout/disconnect)
export const adminClearLeaderSession = mutation({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.teamId, {
      activeLeaderSessionId: undefined,
    });
    return { success: true };
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
