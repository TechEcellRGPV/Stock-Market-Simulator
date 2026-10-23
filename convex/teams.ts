import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { hashPassword, verifyPassword } from "./auth_crypto";

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

// Exactly 15 Default Teams (Feature C)
export const DEFAULT_15_TEAMS = [
  {
    teamNumber: 1,
    teamCode: "ALPHA-01",
    teamName: "Team Alpha",
    defaultPin: "1001",
    leaderName: "Alpha Leader",
    member2: "Alpha Member",
    member3: "Strategist",
    leaderUsername: "alpha_leader",
    memberUsername: "alpha_member",
  },
  {
    teamNumber: 2,
    teamCode: "BRAVO-02",
    teamName: "Team Bravo",
    defaultPin: "1002",
    leaderName: "Bravo Leader",
    member2: "Bravo Member",
    member3: "Strategist",
    leaderUsername: "bravo_leader",
    memberUsername: "bravo_member",
  },
  {
    teamNumber: 3,
    teamCode: "CHARLIE-03",
    teamName: "Team Charlie",
    defaultPin: "1003",
    leaderName: "Charlie Leader",
    member2: "Charlie Member",
    member3: "Strategist",
    leaderUsername: "charlie_leader",
    memberUsername: "charlie_member",
  },
  {
    teamNumber: 4,
    teamCode: "DELTA-04",
    teamName: "Team Delta",
    defaultPin: "1004",
    leaderName: "Delta Leader",
    member2: "Delta Member",
    member3: "Strategist",
    leaderUsername: "delta_leader",
    memberUsername: "delta_member",
  },
  {
    teamNumber: 5,
    teamCode: "ECHO-05",
    teamName: "Team Echo",
    defaultPin: "1005",
    leaderName: "Echo Leader",
    member2: "Echo Member",
    member3: "Strategist",
    leaderUsername: "echo_leader",
    memberUsername: "echo_member",
  },
  {
    teamNumber: 6,
    teamCode: "FOXTROT-06",
    teamName: "Team Foxtrot",
    defaultPin: "1006",
    leaderName: "Foxtrot Leader",
    member2: "Foxtrot Member",
    member3: "Strategist",
    leaderUsername: "foxtrot_leader",
    memberUsername: "foxtrot_member",
  },
  {
    teamNumber: 7,
    teamCode: "GALAXY-07",
    teamName: "Team Galaxy",
    defaultPin: "1007",
    leaderName: "Galaxy Leader",
    member2: "Galaxy Member",
    member3: "Strategist",
    leaderUsername: "galaxy_leader",
    memberUsername: "galaxy_member",
  },
  {
    teamNumber: 8,
    teamCode: "HORIZON-08",
    teamName: "Team Horizon",
    defaultPin: "1008",
    leaderName: "Horizon Leader",
    member2: "Horizon Member",
    member3: "Strategist",
    leaderUsername: "horizon_leader",
    memberUsername: "horizon_member",
  },
  {
    teamNumber: 9,
    teamCode: "INFINITY-09",
    teamName: "Team Infinity",
    defaultPin: "1009",
    leaderName: "Infinity Leader",
    member2: "Infinity Member",
    member3: "Strategist",
    leaderUsername: "infinity_leader",
    memberUsername: "infinity_member",
  },
  {
    teamNumber: 10,
    teamCode: "JAGUAR-10",
    teamName: "Team Jaguar",
    defaultPin: "1010",
    leaderName: "Jaguar Leader",
    member2: "Jaguar Member",
    member3: "Strategist",
    leaderUsername: "jaguar_leader",
    memberUsername: "jaguar_member",
  },
  {
    teamNumber: 11,
    teamCode: "KNIGHT-11",
    teamName: "Team Knight",
    defaultPin: "1011",
    leaderName: "Knight Leader",
    member2: "Knight Member",
    member3: "Strategist",
    leaderUsername: "knight_leader",
    memberUsername: "knight_member",
  },
  {
    teamNumber: 12,
    teamCode: "LEGENDS-12",
    teamName: "Team Legends",
    defaultPin: "1012",
    leaderName: "Legends Leader",
    member2: "Legends Member",
    member3: "Strategist",
    leaderUsername: "legends_leader",
    memberUsername: "legends_member",
  },
  {
    teamNumber: 13,
    teamCode: "MAVERICKS-13",
    teamName: "Team Mavericks",
    defaultPin: "1013",
    leaderName: "Mavericks Leader",
    member2: "Mavericks Member",
    member3: "Strategist",
    leaderUsername: "mavericks_leader",
    memberUsername: "mavericks_member",
  },
  {
    teamNumber: 14,
    teamCode: "NOVA-14",
    teamName: "Team Nova",
    defaultPin: "1014",
    leaderName: "Nova Leader",
    member2: "Nova Member",
    member3: "Strategist",
    leaderUsername: "nova_leader",
    memberUsername: "nova_member",
  },
  {
    teamNumber: 15,
    teamCode: "PHOENIX-15",
    teamName: "Team Phoenix",
    defaultPin: "1015",
    leaderName: "Phoenix Leader",
    member2: "Phoenix Member",
    member3: "Strategist",
    leaderUsername: "phoenix_leader",
    memberUsername: "phoenix_member",
  },
];

// Alias for backwards compatibility
export const CANONICAL_15_TEAMS = DEFAULT_15_TEAMS;

// Mutation: Idempotent Seeding of 15 Default Teams & 30 Participant Accounts (Features C, D, E)
export const seedCanonical15Teams = mutation({
  args: {
    overwrite: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existingTeams = await ctx.db.query("teams").collect();
    const existingAccounts = await ctx.db.query("accounts").collect();

    if (args.overwrite) {
      for (const a of existingAccounts) await ctx.db.delete(a._id);
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

    let teamsCreated = 0;
    let accountsCreated = 0;

    for (const def of DEFAULT_15_TEAMS) {
      const currentTeams = await ctx.db.query("teams").collect();
      let team = currentTeams.find(
        (t) =>
          t.teamNumber === def.teamNumber ||
          t.teamName.toLowerCase() === def.teamName.toLowerCase() ||
          t.teamCode.toUpperCase() === def.teamCode.toUpperCase(),
      );

      if (!team) {
        const teamId = await ctx.db.insert("teams", {
          teamNumber: def.teamNumber,
          teamCode: def.teamCode,
          teamName: def.teamName,
          teamPin: def.defaultPin,
          leaderName: def.leaderName,
          member2: def.member2,
          member3: def.member3,
          members: [def.leaderName, def.member2, def.member3],
          cashBalance: initialCapital,
          totalScore: 0,
          portfolioScore: 0,
          strategyScore: 0,
          executionScore: 0,
          tradeCount: 0,
          status: "ACTIVE",
          createdAt: now,
        });
        team = (await ctx.db.get(teamId))!;
        teamsCreated++;
      } else {
        const patch: Record<string, unknown> = {};
        if (team.teamNumber !== def.teamNumber) patch.teamNumber = def.teamNumber;
        if (team.teamName !== def.teamName) patch.teamName = def.teamName;
        if (team.teamCode !== def.teamCode) patch.teamCode = def.teamCode;
        if (Object.keys(patch).length > 0) {
          await ctx.db.patch(team._id, patch);
        }
      }

      // Provision Leader Account
      const slug = def.teamCode.split("-")[0].toLowerCase();
      const currentAccounts = await ctx.db.query("accounts").collect();

      let leaderAcc = currentAccounts.find(
        (a) =>
          a.username === def.leaderUsername ||
          (a.teamId === team!._id && a.role === "LEADER"),
      );

      if (!leaderAcc) {
        const defaultLeaderPass = def.defaultPin || (team.teamPin ? team.teamPin : `10${String(def.teamNumber).padStart(2, "0")}`);
        const { hashHex, saltHex } = await hashPassword(defaultLeaderPass);
        await ctx.db.insert("accounts", {
          accountId: `ACC-${slug.toUpperCase()}-LEAD`,
          teamId: team._id,
          teamNumber: def.teamNumber,
          teamCode: def.teamCode,
          teamName: def.teamName,
          username: def.leaderUsername,
          passwordHash: hashHex,
          passwordSalt: saltHex,
          role: "LEADER",
          status: "ACTIVE",
          isOnline: false,
          createdAt: now,
          updatedAt: now,
        });
        accountsCreated++;
      } else {
        await ctx.db.patch(leaderAcc._id, {
          teamId: team._id,
          teamNumber: def.teamNumber,
          teamCode: def.teamCode,
          teamName: def.teamName,
          username: def.leaderUsername,
          role: "LEADER",
          updatedAt: now,
        });
      }

      // Provision Member Account
      let memberAcc = currentAccounts.find(
        (a) =>
          a.username === def.memberUsername ||
          (a.teamId === team!._id && a.role === "MEMBER"),
      );

      if (!memberAcc) {
        const defaultMemberPass = def.defaultPin || (team.teamPin ? team.teamPin : `10${String(def.teamNumber).padStart(2, "0")}`);
        const { hashHex, saltHex } = await hashPassword(defaultMemberPass);
        await ctx.db.insert("accounts", {
          accountId: `ACC-${slug.toUpperCase()}-MEM`,
          teamId: team._id,
          teamNumber: def.teamNumber,
          teamCode: def.teamCode,
          teamName: def.teamName,
          username: def.memberUsername,
          passwordHash: hashHex,
          passwordSalt: saltHex,
          role: "MEMBER",
          status: "ACTIVE",
          isOnline: false,
          createdAt: now,
          updatedAt: now,
        });
        accountsCreated++;
      } else {
        await ctx.db.patch(memberAcc._id, {
          teamId: team._id,
          teamNumber: def.teamNumber,
          teamCode: def.teamCode,
          teamName: def.teamName,
          username: def.memberUsername,
          role: "MEMBER",
          updatedAt: now,
        });
      }
    }

    await ctx.db.insert("auditLogs", {
      action: "SEED_DEFAULT_15_TEAMS_AND_ACCOUNTS",
      actor: "ADMIN",
      target: "SYSTEM",
      details: `Initialized 15 Teams & 30 Participant Accounts (${teamsCreated} new teams, ${accountsCreated} new accounts).`,
      timestamp: now,
    });

    return {
      seeded: true,
      count: DEFAULT_15_TEAMS.length,
      teamsCreated,
      accountsCreated,
      message: `Grid Ready: 15 default teams and 30 participant accounts verified.`,
    };
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
      throw new ConvexError(
        "Team registration is currently locked by Race Control. Registration will open on event day.",
      );
    }

    const code = args.teamCode.trim().toUpperCase();
    const pin = args.teamPin.trim();
    const leader = args.leaderName.trim();
    const m2 = args.member2.trim();
    const m3 = args.member3.trim();

    if (!leader || !m2 || !m3) {
      throw new ConvexError(
        "Each team requires exactly 3 members: Team Leader, Member 2 (Strategist), and Member 3 (Telemetry Analyst).",
      );
    }

    if (
      leader.toLowerCase() === m2.toLowerCase() ||
      leader.toLowerCase() === m3.toLowerCase() ||
      m2.toLowerCase() === m3.toLowerCase()
    ) {
      throw new ConvexError("All 3 team members must have distinct names.");
    }

    if (!/^\d{4}$/.test(pin)) {
      throw new ConvexError("Team PIN must be a 4-digit numeric code.");
    }

    let team = await ctx.db
      .query("teams")
      .withIndex("by_code", (q) => q.eq("teamCode", code))
      .first();

    const initialCapital = raceState?.defaultStartingCapital || 100000;
    const members = [leader, m2, m3];

    if (!team) {
      // Auto-provision canonical slot if not pre-seeded on the grid
      const canonicalMatch = CANONICAL_15_TEAMS.find(
        (t) => t.teamCode.toUpperCase() === code,
      );
      if (canonicalMatch) {
        const teamId = await ctx.db.insert("teams", {
          teamCode: canonicalMatch.teamCode,
          teamName: canonicalMatch.teamName,
          teamPin: pin,
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
          createdAt: Date.now(),
        });
        team = await ctx.db.get(teamId);
      } else {
        throw new ConvexError(`Team ${code} not found on the 15-team grid.`);
      }
    } else {
      await ctx.db.patch(team._id, {
        leaderName: leader,
        member2: m2,
        member3: m3,
        members,
        teamPin: pin,
      });
    }

    if (!team) {
      throw new ConvexError(`Failed to initialize team ${code}.`);
    }

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
      throw new ConvexError(
        "Team registration is currently locked by Race Control. Registration will open on event day.",
      );
    }
    const initialCapital = raceState?.defaultStartingCapital || 100000;

    // 1. Grid capacity check (Strictly 15 teams maximum)
    const allTeams = await ctx.db.query("teams").collect();
    if (allTeams.length >= 15) {
      throw new ConvexError(
        "Grid capacity limit reached. Maximum 15 teams permitted on the competition grid.",
      );
    }

    // 2. Validate name
    const validation = sanitizeAndValidateName(args.teamName);
    if (!validation.valid) {
      throw new ConvexError(validation.error || "Invalid team name.");
    }
    const cleanTeamName = validation.cleanName!;

    // 3. Validate PIN
    if (!/^\d{4}$/.test(args.teamPin.trim())) {
      throw new ConvexError("Team PIN must be a 4-digit numeric code.");
    }

    // 4. Check for duplicate team name
    const existing = allTeams.find(
      (t) => t.teamName.toLowerCase() === cleanTeamName.toLowerCase(),
    );
    if (existing) {
      throw new ConvexError(
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
      throw new ConvexError("Team Leader name is required.");
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
      throw new ConvexError("Please enter your name to authenticate.");
    }

    const allTeams = await ctx.db.query("teams").collect();
    const team = allTeams.find(
      (t) =>
        t.teamCode.toLowerCase() === identifier.toLowerCase() ||
        t.teamName.toLowerCase() === identifier.toLowerCase(),
    );

    if (!team) {
      throw new ConvexError(
        "Team not found. Please verify the Team Name or Grid Code.",
      );
    }

    if (team.teamPin !== pin) {
      throw new ConvexError("Invalid 4-digit Team PIN.");
    }

    if (team.status === "DISQUALIFIED") {
      throw new ConvexError("This team has been disqualified from the simulation.");
    }

    const now = Date.now();
    let finalRole = "MEMBER";

    if (requestedRole === "LEADER") {
      finalRole = "LEADER";

      const patchData: Record<string, unknown> = {
        activeLeaderSessionId: sessionId,
        lastLeaderLoginAt: now,
      };

      // If leaderName is not set or is a default placeholder, bind to this authenticated leader
      if (
        !team.leaderName ||
        team.leaderName.toLowerCase().includes("leader") ||
        team.leaderName.toLowerCase().startsWith("driver")
      ) {
        patchData.leaderName = memberName;
      }

      await ctx.db.patch(team._id, patchData);
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

// Mutation: Authenticate participant account (Leader or Member) using username & password
export const loginParticipant = mutation({
  args: {
    teamIdentifier: v.string(), // teamNumber, teamCode, or teamName
    role: v.string(), // "LEADER" | "MEMBER"
    username: v.string(),
    password: v.string(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const rawUsername = args.username.trim().toLowerCase();
    const cleanPassword = args.password;
    const requestedRole = args.role.toUpperCase() === "LEADER" ? "LEADER" : "MEMBER";
    const sessionId = args.sessionId || "sess_" + Math.random().toString(36).substring(2, 12);
    const now = Date.now();

    if (!rawUsername || !cleanPassword) {
      throw new ConvexError("Username and password are required.");
    }

    // Lookup account by username
    const account = await ctx.db
      .query("accounts")
      .withIndex("by_username", (q) => q.eq("username", rawUsername))
      .first();

    if (!account) {
      throw new ConvexError("Invalid username or password.");
    }

    if (account.role !== requestedRole) {
      throw new ConvexError(
        `This account is registered as a ${account.role}. Please select the ${account.role} role.`,
      );
    }

    if (account.status === "DISABLED") {
      throw new ConvexError(
        "This account has been disabled by the event administrator.",
      );
    }

    // Verify Password Hash
    const isPasswordValid = await verifyPassword(
      cleanPassword,
      account.passwordHash,
      account.passwordSalt,
    );
    if (!isPasswordValid) {
      throw new ConvexError("Invalid username or password.");
    }

    // Verify Team
    const team = await ctx.db.get(account.teamId);
    if (!team) {
      throw new ConvexError("Assigned team record not found on the competition grid.");
    }

    if (team.status === "DISQUALIFIED") {
      throw new ConvexError("This team has been disqualified from the competition.");
    }

    // Verify team identifier matches teamNumber, teamCode, or teamName
    const cleanIdent = args.teamIdentifier.trim().toLowerCase();
    const matchesCode = team.teamCode.toLowerCase() === cleanIdent;
    const matchesName = team.teamName.toLowerCase() === cleanIdent;
    const matchesNum = String(team.teamNumber || "") === cleanIdent;

    if (!matchesCode && !matchesName && !matchesNum && cleanIdent !== "") {
      throw new ConvexError(
        `This account belongs to ${team.teamName} (#${team.teamNumber || ""}). Please select the correct team.`,
      );
    }

    // If Leader: Manage single-active session check
    if (requestedRole === "LEADER") {
      const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
      const isAnotherLeaderActive =
        team.activeLeaderSessionId &&
        team.lastLeaderLoginAt &&
        now - team.lastLeaderLoginAt < SESSION_TIMEOUT_MS &&
        team.activeLeaderSessionId !== sessionId;

      if (isAnotherLeaderActive) {
        throw new ConvexError(
          `A Team Leader is already active for ${team.teamName} on another device. Only one active leader session is permitted at a time.`,
        );
      }

      await ctx.db.patch(team._id, {
        activeLeaderSessionId: sessionId,
        lastLeaderLoginAt: now,
      });
    }

    // Update account presence and login timestamps
    await ctx.db.patch(account._id, {
      lastLoginAt: now,
      lastHeartbeatAt: now,
      isOnline: true,
      updatedAt: now,
    });

    // Record Audit Log
    await ctx.db.insert("auditLogs", {
      action: "PARTICIPANT_LOGIN",
      actor: account.username,
      target: team.teamName,
      details: `${account.role} logged in for Team #${team.teamNumber || 1} (${team.teamName}).`,
      timestamp: now,
    });

    return {
      accountId: account._id,
      username: account.username,
      role: account.role,
      teamId: team._id,
      teamNumber: team.teamNumber || 1,
      teamCode: team.teamCode,
      teamName: team.teamName,
      cashBalance: team.cashBalance,
      status: team.status,
      sessionId,
    };
  },
});

// Mutation: Active session heartbeat (called periodically to maintain online status)
export const heartbeatParticipant = mutation({
  args: {
    accountId: v.id("accounts"),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const acc = await ctx.db.get(args.accountId);
    if (!acc) return { ok: false };
    const now = Date.now();
    await ctx.db.patch(args.accountId, {
      lastHeartbeatAt: now,
      isOnline: true,
    });
    return { ok: true, timestamp: now };
  },
});

// Mutation: Participant Logout (sets presence offline and releases leader session)
export const logoutParticipant = mutation({
  args: {
    accountId: v.id("accounts"),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const acc = await ctx.db.get(args.accountId);
    if (!acc) return { ok: false };
    const now = Date.now();

    await ctx.db.patch(args.accountId, {
      isOnline: false,
      lastHeartbeatAt: now - 120000,
    });

    const team = await ctx.db.get(acc.teamId);
    if (
      team &&
      acc.role === "LEADER" &&
      (!args.sessionId || team.activeLeaderSessionId === args.sessionId)
    ) {
      await ctx.db.patch(team._id, {
        activeLeaderSessionId: undefined,
      });
    }

    await ctx.db.insert("auditLogs", {
      action: "PARTICIPANT_LOGOUT",
      actor: acc.username,
      target: team ? team.teamName : acc.teamName,
      details: `${acc.role} logged out.`,
      timestamp: now,
    });

    return { ok: true };
  },
});

// Query: Admin list of all 15 teams and their 30 participant accounts with presence
export const adminListTeamsAndAccounts = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const accounts = await ctx.db.query("accounts").collect();
    const stocks = await ctx.db.query("stocks").collect();
    const holdings = await ctx.db.query("holdings").collect();
    const orders = await ctx.db.query("orders").collect();

    const stockPriceMap = new Map(stocks.map((s) => [s.ticker, s.currentPrice]));
    const now = Date.now();

    // Sort teams by teamNumber ascending
    teams.sort((a, b) => (a.teamNumber || 99) - (b.teamNumber || 99));

    return teams.map((team) => {
      const teamAccounts = accounts.filter((a) => a.teamId === team._id);
      const leaderAcc = teamAccounts.find((a) => a.role === "LEADER");
      const memberAcc = teamAccounts.find((a) => a.role === "MEMBER");

      // Compute total portfolio value
      const teamHoldings = holdings.filter((h) => h.teamId === team._id);
      const holdingsValue = teamHoldings.reduce((sum, h) => {
        const currPrice = stockPriceMap.get(h.ticker) || h.avgBuyPrice;
        return sum + h.shares * currPrice;
      }, 0);
      const totalPortfolioValue = team.cashBalance + holdingsValue;

      // Compute trade count
      const teamOrders = orders.filter((o) => o.teamId === team._id);

      const formatAccountInfo = (acc?: (typeof accounts)[0]) => {
        if (!acc) return null;
        // Expire presence after 60s without heartbeat
        const isActuallyOnline = Boolean(
          acc.isOnline &&
            acc.lastHeartbeatAt &&
            now - acc.lastHeartbeatAt < 60000,
        );

        let presenceLabel = "Offline";
        if (acc.status === "DISABLED") {
          presenceLabel = "Account disabled";
        } else if (!acc.lastLoginAt) {
          presenceLabel = "Never logged in";
        } else if (isActuallyOnline) {
          presenceLabel = "Online";
        } else {
          presenceLabel = "Offline";
        }

        return {
          id: acc._id,
          accountId: acc.accountId,
          username: acc.username,
          role: acc.role,
          status: acc.status,
          isOnline: isActuallyOnline,
          presenceLabel,
          lastLoginAt: acc.lastLoginAt || null,
          lastHeartbeatAt: acc.lastHeartbeatAt || null,
          createdAt: acc.createdAt,
        };
      };

      return {
        id: team._id,
        teamNumber: team.teamNumber || 1,
        teamCode: team.teamCode,
        teamName: team.teamName,
        teamPin: team.teamPin,
        cashBalance: team.cashBalance,
        totalPortfolioValue,
        totalScore: team.totalScore,
        tradeCount: teamOrders.length,
        status: team.status,
        leaderAccount: formatAccountInfo(leaderAcc),
        memberAccount: formatAccountInfo(memberAcc),
      };
    });
  },
});

// Mutation: Admin toggle account status (Active <-> Disabled)
export const adminToggleAccountStatus = mutation({
  args: {
    accountId: v.id("accounts"),
    status: v.string(), // "ACTIVE" | "DISABLED"
  },
  handler: async (ctx, args) => {
    const acc = await ctx.db.get(args.accountId);
    if (!acc) throw new ConvexError("Account not found.");

    await ctx.db.patch(args.accountId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      action: "ADMIN_TOGGLE_ACCOUNT_STATUS",
      actor: "ADMIN",
      target: acc.username,
      details: `Account ${acc.username} status changed to ${args.status}.`,
      timestamp: Date.now(),
    });

    return { success: true, status: args.status };
  },
});

// Mutation: Admin reset account password
export const adminResetAccountPassword = mutation({
  args: {
    accountId: v.id("accounts"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.newPassword || !/^\d{4}$/.test(args.newPassword.trim())) {
      throw new ConvexError("Password must be exactly 4 digits (numbers only).");
    }
    const acc = await ctx.db.get(args.accountId);
    if (!acc) throw new ConvexError("Account not found.");

    const { hashHex, saltHex } = await hashPassword(args.newPassword.trim());

    await ctx.db.patch(args.accountId, {
      passwordHash: hashHex,
      passwordSalt: saltHex,
      updatedAt: Date.now(),
    });

    await ctx.db.insert("auditLogs", {
      action: "ADMIN_PASSWORD_RESET",
      actor: "ADMIN",
      target: acc.username,
      details: `Password reset for user ${acc.username} (${acc.role}).`,
      timestamp: Date.now(),
    });

    return { success: true, username: acc.username };
  },
});

// Query: Admin review initial credentials mapping for the 30 participant accounts
export const adminGetInitialCredentials = query({
  args: {},
  handler: async (ctx) => {
    const teams = await ctx.db.query("teams").collect();
    const accounts = await ctx.db.query("accounts").collect();

    teams.sort((a, b) => (a.teamNumber || 99) - (b.teamNumber || 99));

    return teams.map((team) => {
      const teamAccounts = accounts.filter((a) => a.teamId === team._id);
      const leader = teamAccounts.find((a) => a.role === "LEADER");
      const member = teamAccounts.find((a) => a.role === "MEMBER");
      const slug = (team.teamCode || "").split("-")[0].toLowerCase();

      const teamPin = team.teamPin || `10${String(team.teamNumber || 1).padStart(2, "0")}`;
      return {
        teamNumber: team.teamNumber || 1,
        teamCode: team.teamCode,
        teamName: team.teamName,
        leaderUsername: leader ? leader.username : `${slug}_leader`,
        leaderInitialPasswordPattern: teamPin,
        memberUsername: member ? member.username : `${slug}_member`,
        memberInitialPasswordPattern: teamPin,
      };
    });
  },
});

// Query: Admin audit logs
export const adminGetAuditLogs = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("auditLogs").order("desc").take(50);
  },
});
