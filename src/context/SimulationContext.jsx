import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from "react";
import { useQuery, useMutation, useConvexConnectionState } from "convex/react";
import { api } from "../../convex/_generated/api";
import { INITIAL_STOCKS as CANONICAL_INITIAL_STOCKS } from "../data/stocks";
import { INITIAL_MARKET_NEWS } from "../data/news";

/**
 * @file SimulationContext.jsx
 * @description Central State Coordinator & Real-Time Sync Provider for Imprenditore 5.0.
 * Bridges Convex Cloud WebSocket subscriptions with client UI components:
 * - Reactive subscriptions to live grid stocks, team rosters, and 50/30/20 leaderboards
 * - Individual team holdings and execution order ledgers
 * - Race state transitions (GRID_WARMUP, GREEN_FLAG, SAFETY_CAR, CHECKERED_FLAG)
 * - Broadcasted macro sector price shocks and breaking news alerts
 * - Pre-event access gates (Team Registration and Cockpit Lounge)
 * - Fallback offline resilience and optimistic state reconciliation
 */

const SimulationContext = createContext(null);

const DEFAULT_ADMIN_KEY = "RACE_CONTROL_2026";

const getCleanAdminKeys = () => {
  const rawEnv = import.meta.env.VITE_ADMIN_KEY;
  const envKey = typeof rawEnv === "string" ? rawEnv.trim().replace(/^["']|["']$/g, "") : "";
  return {
    envKey,
    hasEnvKey: Boolean(envKey),
    defaultKey: DEFAULT_ADMIN_KEY
  };
};

// Canonical 15 Motorsport & Energy Companies from data/stocks.js
const INITIAL_STOCKS = CANONICAL_INITIAL_STOCKS;

// Unique identifier for this specific browser tab session to prevent message echo loops
const TAB_ID = typeof window !== "undefined" ? Math.random().toString(36).substring(2, 9) : "tab_default";

export function SimulationProvider({ children }) {
  const channelRef = useRef(null);
  const isRemoteUpdateRef = useRef(false);

  // Live WebSocket Connection State Telemetry
  const connectionState = useConvexConnectionState();
  const isConnected = Boolean(connectionState?.isWebSocketConnected);

  // Convex Cloud Real-Time WebSocket Subscriptions
  const convexLiveGrid = useQuery(api.market.getLiveGrid, {});
  const convexTeams = useQuery(api.teams.adminListTeams, {});
  const convexLeaderboard = useQuery(api.leaderboard.getLeaderboard, {});

  // Convex Cloud Mutations
  const toggleRegistrationMutation = useMutation(api.market.toggleRegistration);
  const toggleSimulationEntryMutation = useMutation(api.market.toggleSimulationEntry);
  const setTargetEventDateMutation = useMutation(api.market.setTargetEventDate);
  const adminSetDefaultStartingCapitalMutation = useMutation(api.market.adminSetDefaultStartingCapital);
  const startRaceMutation = useMutation(api.market.startRace);
  const pauseRaceMutation = useMutation(api.market.pauseRace);
  const endRaceMutation = useMutation(api.market.endRace);
  const stageLapMutation = useMutation(api.market.stageLap);
  const setRaceTimerMutation = useMutation(api.market.setRaceTimer);
  const broadcastTrackEventMutation = useMutation(api.market.broadcastTrackEvent);
  const resetGridMutation = useMutation(api.market.resetGrid);
  const createTeamMutation = useMutation(api.teams.createTeam);
  const joinTeamMutation = useMutation(api.teams.joinTeam);
  const logoutTeamLeaderMutation = useMutation(api.teams.logoutTeamLeader);
  const seedCanonical15TeamsMutation = useMutation(api.teams.seedCanonical15Teams);
  const registerTeamSlotMutation = useMutation(api.teams.registerTeamSlot);
  const adminUpdateTeamMembersMutation = useMutation(api.teams.adminUpdateTeamMembers);
  const adminClearLeaderSessionMutation = useMutation(api.teams.adminClearLeaderSession);
  const adminUpdateTeamMutation = useMutation(api.teams.adminUpdateTeam);
  const adminDeleteTeamMutation = useMutation(api.teams.adminDeleteTeam);
  const executeTradeMutation = useMutation(api.trades.executeTrade);
  const adminUpdateStockMutation = useMutation(api.market.adminUpdateStock);
  const adminTriggerSectorShockMutation = useMutation(api.market.adminTriggerSectorShock);

  // Feature D, E, G: Participant Accounts & Real-Time Presence
  const loginParticipantMutation = useMutation(api.teams.loginParticipant);
  const heartbeatParticipantMutation = useMutation(api.teams.heartbeatParticipant);
  const logoutParticipantMutation = useMutation(api.teams.logoutParticipant);
  const adminToggleAccountStatusMutation = useMutation(api.teams.adminToggleAccountStatus);
  const adminResetAccountPasswordMutation = useMutation(api.teams.adminResetAccountPassword);

  // Feature B: Market News
  const publishMarketNewsMutation = useMutation(api.news.publishMarketNews);
  const seedInitialMarketNewsMutation = useMutation(api.news.seedInitialMarketNews);
  const clearMarketNewsMutation = useMutation(api.news.clearMarketNews);

  // Local overrides & offline resilience for participant accounts
  const [accountOverrides, setAccountOverrides] = useState(() => {
    const saved = localStorage.getItem("imprenditore_account_overrides");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {};
  });

  // Dedicated Market News State (starts empty until Admin publishes news)
  const [marketNews, setMarketNews] = useState(() => {
    // Clear legacy default initial news so feed starts empty
    const isWiped = localStorage.getItem("imprenditore_news_empty_v1");
    if (!isWiped) {
      localStorage.setItem("imprenditore_news_empty_v1", "true");
      localStorage.setItem("imprenditore_market_news", JSON.stringify([]));
      return [];
    }
    const saved = localStorage.getItem("imprenditore_market_news");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [];
  });

  // Security & Operations Audit Logs State
  const [auditLogs, setAuditLogs] = useState(() => {
    const saved = localStorage.getItem("imprenditore_audit_logs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
    return [
      {
        _id: "log_init",
        action: "SYSTEM_INITIALIZE",
        actor: "SYSTEM",
        target: "GRID",
        details: "Imprenditore 5.0 operations command initialized.",
        timestamp: Date.now() - 3600000,
      }
    ];
  });

  // 1. Stocks State
  const [stocks, setStocks] = useState(() => {
    const saved = localStorage.getItem("imprenditore_stocks");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed.some((s) => s.ticker === "APEX")) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return CANONICAL_INITIAL_STOCKS;
  });

  // 2. Teams State
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem("imprenditore_teams");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // 3. Current Authenticated Team (Driver / Participant)
  const [currentTeam, setCurrentTeam] = useState(() => {
    const saved = localStorage.getItem("imprenditore_active_team");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return null;
  });

  const teamConvexId = useMemo(() => {
    if (!currentTeam) return null;
    const cid = currentTeam._id || currentTeam.id;
    return typeof cid === "string" && cid.length > 10 ? cid : null;
  }, [currentTeam]);

  // Convex Real-Time Holdings & Orders for the Active Team Session
  const convexHoldings = useQuery(
    api.trades.getTeamHoldings,
    teamConvexId ? { teamId: teamConvexId } : "skip"
  );
  const convexOrders = useQuery(
    api.trades.getTeamOrders,
    teamConvexId ? { teamId: teamConvexId } : "skip"
  );

  // 4. Holdings: { [teamId]: Holding[] }
  const [allHoldings, setAllHoldings] = useState(() => {
    const saved = localStorage.getItem("imprenditore_holdings");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return {};
  });

  // 5. Orders: Order[]
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem("imprenditore_orders");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [];
  });

  // 6. Race State (Default strictly locked for pre-event orchestration)
  const [raceState, setRaceState] = useState(() => {
    const defaultState = {
      currentLap: 1,
      totalLaps: 7,
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
      updatedAt: Date.now()
    };

    const saved = localStorage.getItem("imprenditore_race_state");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isOldDate =
          parsed.targetEventDate === "2026-09-16T10:00:00" ||
          parsed.targetEventDate === "2026-09-16T15:00:00" ||
          (typeof parsed.targetEventDate === "string" && parsed.targetEventDate.startsWith("2026-09")) ||
          (typeof parsed.scheduledStartTime === "string" &&
            (parsed.scheduledStartTime.includes("10:00 AM") || parsed.scheduledStartTime.includes("September 16")));

        return {
          ...defaultState,
          ...parsed,
          targetEventDate: isOldDate ? defaultState.targetEventDate : (parsed.targetEventDate || defaultState.targetEventDate),
          scheduledStartTime: isOldDate ? defaultState.scheduledStartTime : (parsed.scheduledStartTime || defaultState.scheduledStartTime),
          isRegistrationOpen: typeof parsed.isRegistrationOpen === "boolean" ? parsed.isRegistrationOpen : false,
          isSimulationEntryOpen: typeof parsed.isSimulationEntryOpen === "boolean" ? parsed.isSimulationEntryOpen : false,
          defaultStartingCapital: Number(parsed.defaultStartingCapital) || 100000,
          updatedAt: parsed.updatedAt || Date.now()
        };
      } catch {
        // fallback
      }
    }
    return defaultState;
  });

  // 7. Track Alerts and News
  const [trackEvents, setTrackEvents] = useState(() => {
    const saved = localStorage.getItem("imprenditore_events");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return [
      {
        id: "evt_1",
        title: "Paddock Warmup Initialized",
        description: "Grid is staged. Initial mock capital allocated for participating teams.",
        type: "GREEN_FLAG",
        affectedSectors: [],
        priceImpactPercent: 0,
        lap: 1,
        timestamp: Date.now() - 600000
      }
    ];
  });

  // 8. Admin Authentication (3-Hour Persistent Session)
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem("imprenditore_admin_auth");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.authenticated && parsed.expiresAt && Date.now() < parsed.expiresAt) {
          return true;
        }
      } catch {
        if (saved === "true") return true;
      }
    }
    return false;
  });

  // Broadcast Helper (PubSub without echo loops)
  const broadcastSync = useCallback((type, payload) => {
    if (channelRef.current) {
      try {
        channelRef.current.postMessage({
          type,
          payload,
          senderId: TAB_ID,
          timestamp: Date.now()
        });
      } catch {
        // channel closed or unsupported
      }
    }
  }, []);

  // Mobile Tab Resume Sentinel: Re-synchronize local state when returning from background apps
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        const savedTeam = localStorage.getItem("imprenditore_active_team");
        if (savedTeam) {
          try {
            const parsed = JSON.parse(savedTeam);
            if (parsed && parsed.teamCode) {
              setCurrentTeam((prev) => {
                if (!prev || prev.teamCode !== parsed.teamCode) return parsed;
                return prev;
              });
            }
          } catch {
            // fallback
          }
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Synchronize with Convex Cloud Live Grid (Real-time WebSockets)
  useEffect(() => {
    if (!convexLiveGrid) return;
    const { stocks: cloudStocks, raceState: cloudRaceState, latestEvent: cloudEvent } = convexLiveGrid;

    queueMicrotask(() => {
      if (cloudRaceState) {
        setRaceState((prev) => {
          const updated = {
            ...prev,
            ...cloudRaceState,
            isRegistrationOpen: Boolean(cloudRaceState.isRegistrationOpen),
            isSimulationEntryOpen: Boolean(cloudRaceState.isSimulationEntryOpen),
            targetEventDate: cloudRaceState.targetEventDate || prev.targetEventDate,
            scheduledStartTime: cloudRaceState.scheduledStartTime || prev.scheduledStartTime,
            defaultStartingCapital: Number(cloudRaceState.defaultStartingCapital) || prev.defaultStartingCapital || 100000,
            currentLap: Number(cloudRaceState.currentLap) || prev.currentLap || 1,
            status: cloudRaceState.status || prev.status || "GRID_WARMUP",
            lapDuration: Number(cloudRaceState.lapDuration) || prev.lapDuration || 900,
            lapTimeRemaining: typeof cloudRaceState.lapTimeRemaining === "number" ? cloudRaceState.lapTimeRemaining : prev.lapTimeRemaining,
            lapStartedAt: cloudRaceState.lapStartedAt !== undefined ? cloudRaceState.lapStartedAt : prev.lapStartedAt,
            activeNews: cloudRaceState.activeNews || prev.activeNews,
            updatedAt: cloudRaceState.updatedAt || Date.now()
          };
          localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
          return updated;
        });
      }

      if (Array.isArray(cloudStocks) && cloudStocks.length > 0) {
        setStocks(cloudStocks);
        localStorage.setItem("imprenditore_stocks", JSON.stringify(cloudStocks));
      }

      if (cloudEvent) {
        setTrackEvents((prev) => {
          if (prev.some((e) => e.title === cloudEvent.title && e.timestamp === cloudEvent.timestamp)) {
            return prev;
          }
          const updated = [cloudEvent, ...prev.filter((e) => e.title !== cloudEvent.title)].slice(0, 30);
          localStorage.setItem("imprenditore_events", JSON.stringify(updated));
          return updated;
        });
      }
    });
  }, [convexLiveGrid]);

  // Synchronize with Convex Cloud Teams
  useEffect(() => {
    if (!Array.isArray(convexTeams)) return;
    const mappedTeams = convexTeams.map((t) => ({
      ...t,
      id: t._id || t.id,
      teamId: t._id || t.id
    }));

    queueMicrotask(() => {
      setTeams(mappedTeams);
      localStorage.setItem("imprenditore_teams", JSON.stringify(mappedTeams));

      setCurrentTeam((prev) => {
        if (!prev) return null;
        const match = mappedTeams.find((t) => t.id === prev.id || t.teamCode === prev.teamCode);
        if (!match) return prev;
        const updated = { ...prev, ...match };
        localStorage.setItem("imprenditore_active_team", JSON.stringify(updated));
        return updated;
      });
    });
  }, [convexTeams]);

  // Synchronize with Convex Cloud Holdings
  useEffect(() => {
    if (!currentTeam || !Array.isArray(convexHoldings)) return;
    const teamKey = currentTeam._id || currentTeam.id;
    const altKey = currentTeam.id;
    if (!teamKey) return;

    queueMicrotask(() => {
      setAllHoldings((prev) => {
        const currentPrev = prev[teamKey] || prev[altKey] || [];
        if (
          currentPrev.length === convexHoldings.length &&
          currentPrev.every(
            (h, i) =>
              h.ticker === convexHoldings[i]?.ticker &&
              h.shares === convexHoldings[i]?.shares &&
              h.avgBuyPrice === convexHoldings[i]?.avgBuyPrice
          )
        ) {
          return prev;
        }
        const mapped = convexHoldings.map((h) => ({
          ...h,
          id: h._id || h.id,
          avgPrice: h.avgBuyPrice,
          avgBuyPrice: h.avgBuyPrice,
        }));
        const updated = {
          ...prev,
          [teamKey]: mapped,
          ...(altKey ? { [altKey]: mapped } : {})
        };
        localStorage.setItem("imprenditore_holdings", JSON.stringify(updated));
        return updated;
      });
    });
  }, [convexHoldings, currentTeam]);

  // Synchronize with Convex Cloud Orders
  useEffect(() => {
    if (!currentTeam || !Array.isArray(convexOrders)) return;
    const teamKey = currentTeam.id || currentTeam._id;
    if (!teamKey) return;

    queueMicrotask(() => {
      setOrders((prev) => {
        const otherOrders = prev.filter(
          (o) => o.teamId !== teamKey && o.teamId !== currentTeam.id && o.teamId !== currentTeam._id
        );
        const mappedConvex = convexOrders.map((o) => ({
          ...o,
          id: o._id || o.id,
        }));
        const currentTeamOrders = prev.filter(
          (o) => o.teamId === teamKey || o.teamId === currentTeam.id || o.teamId === currentTeam._id
        );
        if (
          currentTeamOrders.length === mappedConvex.length &&
          currentTeamOrders.every((o, i) => (o.id || o._id) === (mappedConvex[i]?.id || mappedConvex[i]?._id))
        ) {
          return prev;
        }
        const combined = [...mappedConvex, ...otherOrders];
        localStorage.setItem("imprenditore_orders", JSON.stringify(combined));
        return combined;
      });
    });
  }, [convexOrders, currentTeam]);

  // Setup Broadcast Channel & Storage Listeners with Monotonic Version Check
  useEffect(() => {
    let ch;
    try {
      ch = new BroadcastChannel("imprenditore_realtime_sync");
      channelRef.current = ch;

      ch.onmessage = (event) => {
        const { type, payload, senderId } = event.data || {};
        if (senderId === TAB_ID || !payload) return; // Prevent echo loop

        if (type === "RACE_STATE_SYNC") {
          setRaceState((prev) => {
            if (payload.updatedAt && prev.updatedAt && payload.updatedAt <= prev.updatedAt) {
              return prev; // Ignore older or equal state to break echo loops
            }
            isRemoteUpdateRef.current = true;
            return payload;
          });
        } else if (type === "STOCKS_SYNC") {
          isRemoteUpdateRef.current = true;
          setStocks(payload);
        } else if (type === "TEAMS_SYNC") {
          isRemoteUpdateRef.current = true;
          setTeams(payload);
        } else if (type === "EVENTS_SYNC") {
          isRemoteUpdateRef.current = true;
          setTrackEvents(payload);
        } else if (type === "HOLDINGS_SYNC") {
          isRemoteUpdateRef.current = true;
          setAllHoldings(payload);
        } else if (type === "ORDERS_SYNC") {
          isRemoteUpdateRef.current = true;
          setOrders(payload);
        } else if (type === "MARKET_NEWS_SYNC") {
          isRemoteUpdateRef.current = true;
          setMarketNews(payload);
        }
      };
    } catch {
      // Fallback handled by storage listener
    }

    const handleStorage = (e) => {
      if (!e.newValue) return;
      try {
        if (e.key === "imprenditore_race_state") {
          const parsed = JSON.parse(e.newValue);
          setRaceState((prev) => {
            if (parsed.updatedAt && prev.updatedAt && parsed.updatedAt <= prev.updatedAt) {
              return prev;
            }
            isRemoteUpdateRef.current = true;
            return parsed;
          });
        } else if (e.key === "imprenditore_stocks") {
          isRemoteUpdateRef.current = true;
          setStocks(JSON.parse(e.newValue));
        } else if (e.key === "imprenditore_teams") {
          isRemoteUpdateRef.current = true;
          setTeams(JSON.parse(e.newValue));
        } else if (e.key === "imprenditore_events") {
          isRemoteUpdateRef.current = true;
          setTrackEvents(JSON.parse(e.newValue));
        } else if (e.key === "imprenditore_holdings") {
          isRemoteUpdateRef.current = true;
          setAllHoldings(JSON.parse(e.newValue));
        } else if (e.key === "imprenditore_orders") {
          isRemoteUpdateRef.current = true;
          setOrders(JSON.parse(e.newValue));
        } else if (e.key === "imprenditore_market_news") {
          isRemoteUpdateRef.current = true;
          setMarketNews(JSON.parse(e.newValue));
        }
      } catch {
        // ignore parse error
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      if (ch) ch.close();
      channelRef.current = null;
    };
  }, []);

  // Sync to localStorage without echoing back remote updates
  useEffect(() => {
    localStorage.setItem("imprenditore_stocks", JSON.stringify(stocks));
    if (!isRemoteUpdateRef.current) {
      broadcastSync("STOCKS_SYNC", stocks);
    }
  }, [stocks, broadcastSync]);

  useEffect(() => {
    localStorage.setItem("imprenditore_teams", JSON.stringify(teams));
    if (!isRemoteUpdateRef.current) {
      broadcastSync("TEAMS_SYNC", teams);
    }
  }, [teams, broadcastSync]);

  useEffect(() => {
    if (currentTeam) {
      localStorage.setItem("imprenditore_active_team", JSON.stringify(currentTeam));
    } else {
      localStorage.removeItem("imprenditore_active_team");
    }
  }, [currentTeam]);

  useEffect(() => {
    localStorage.setItem("imprenditore_holdings", JSON.stringify(allHoldings));
    if (!isRemoteUpdateRef.current) {
      broadcastSync("HOLDINGS_SYNC", allHoldings);
    }
  }, [allHoldings, broadcastSync]);

  useEffect(() => {
    localStorage.setItem("imprenditore_orders", JSON.stringify(orders));
    if (!isRemoteUpdateRef.current) {
      broadcastSync("ORDERS_SYNC", orders);
    }
  }, [orders, broadcastSync]);

  useEffect(() => {
    localStorage.setItem("imprenditore_race_state", JSON.stringify(raceState));
    if (!isRemoteUpdateRef.current) {
      broadcastSync("RACE_STATE_SYNC", raceState);
    } else {
      isRemoteUpdateRef.current = false;
    }
  }, [raceState, broadcastSync]);

  useEffect(() => {
    localStorage.setItem("imprenditore_events", JSON.stringify(trackEvents));
    if (!isRemoteUpdateRef.current) {
      broadcastSync("EVENTS_SYNC", trackEvents);
    }
  }, [trackEvents, broadcastSync]);

  // Master Lap Clock: Driven by Deterministic Timestamps
  // Runs locally on each tab, checking elapsed real-world time without drift or tab-throttling issues
  useEffect(() => {
    if (raceState.status !== "GREEN_FLAG") return;

    const timer = setInterval(() => {
      setRaceState((prev) => {
        if (prev.status !== "GREEN_FLAG") return prev;

        const duration = prev.lapDuration || 900;
        let remaining = prev.lapTimeRemaining;

        if (prev.lapStartedAt) {
          const elapsedSecs = Math.floor((Date.now() - prev.lapStartedAt) / 1000);
          remaining = Math.max(0, duration - elapsedSecs);
        } else {
          remaining = Math.max(0, remaining - 1);
        }

        // When lap expires
        if (remaining <= 0) {
          if (prev.currentLap >= (prev.totalLaps || 7)) {
            // Lap 7 / Final Round Checkered Flag: Conclude Race
            const finishedState = {
              ...prev,
              lapStartedAt: null,
              lapTimeRemaining: 0,
              status: "CHECKERED_FLAG",
              activeNews: "Checkered Flag: Simulation concluded! Final podium rankings locked.",
              updatedAt: Date.now()
            };
            localStorage.setItem("imprenditore_race_state", JSON.stringify(finishedState));
            return finishedState;
          }

          // Lap completed -> Stage next lap in WARMUP (Strictly waits for Admin Flag-Off!)
          const completedLap = prev.currentLap;
          const nextLap = completedLap + 1;
          const stagedState = {
            ...prev,
            currentLap: nextLap,
            status: "GRID_WARMUP",
            lapStartedAt: null,
            lapTimeRemaining: prev.lapDuration,
            activeNews: `Lap ${completedLap} completed! Lap ${nextLap} is staged on the grid. The lap will start when the Race Director flags off.`,
            updatedAt: Date.now()
          };
          localStorage.setItem("imprenditore_race_state", JSON.stringify(stagedState));
          return stagedState;
        }

        if (remaining !== prev.lapTimeRemaining) {
          return {
            ...prev,
            lapTimeRemaining: remaining
          };
        }

        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [raceState.status]);

  // Organic Stock Price Ticker Jitter (every 25s, only during live Green Flag)
  useEffect(() => {
    if (raceState.status !== "GREEN_FLAG") return;

    const interval = setInterval(() => {
      setStocks((prevStocks) =>
        prevStocks.map((stock) => {
          const deltaPercent = (Math.random() * 2 - 1) * (stock.volatility || 1.0) * 0.5;
          const delta = (stock.currentPrice * deltaPercent) / 100;
          const newPrice = Math.max(10, Math.round((stock.currentPrice + delta) * 10) / 10);
          const changePercent = Math.round(((newPrice - stock.openingPrice) / stock.openingPrice) * 1000) / 10;
          const sparkline = [...stock.sparkline.slice(-10), newPrice];

          return {
            ...stock,
            currentPrice: newPrice,
            dayHigh: Math.max(stock.dayHigh, newPrice),
            dayLow: Math.min(stock.dayLow, newPrice),
            changePercent,
            sparkline,
            updatedAt: Date.now()
          };
        })
      );
    }, 25000);

    return () => clearInterval(interval);
  }, [raceState.status]);

  // Compute live holdings for currently logged in team
  const currentHoldings = useMemo(() => {
    if (!currentTeam) return [];
    const teamKey = currentTeam._id || currentTeam.id;
    const localRaw = allHoldings[teamKey] || allHoldings[currentTeam.id] || allHoldings[currentTeam._id] || [];

    if (Array.isArray(convexHoldings) && convexHoldings.length > 0) {
      return convexHoldings.map((h) => ({
        ...h,
        id: h._id || h.id,
        avgPrice: h.avgBuyPrice,
        avgBuyPrice: h.avgBuyPrice,
      }));
    }

    if (Array.isArray(convexHoldings) && convexHoldings.length === 0 && localRaw.length === 0) {
      return [];
    }

    if (localRaw.length > 0) {
      return localRaw.map((h) => ({
        ...h,
        avgPrice: h.avgPrice ?? h.avgBuyPrice ?? 0,
        avgBuyPrice: h.avgBuyPrice ?? h.avgPrice ?? 0,
      }));
    }

    return Array.isArray(convexHoldings) ? convexHoldings : [];
  }, [convexHoldings, allHoldings, currentTeam]);

  // Compute live orders for currently logged in team
  const teamOrders = useMemo(() => {
    if (!currentTeam) return [];
    const teamKey = currentTeam._id || currentTeam.id;
    const localTeamOrders = orders.filter(
      (o) => o.teamId === teamKey || o.teamId === currentTeam.id || o.teamId === currentTeam._id
    );

    if (Array.isArray(convexOrders) && convexOrders.length > 0) {
      return convexOrders.map((o) => ({
        ...o,
        id: o._id || o.id,
      }));
    }

    return localTeamOrders;
  }, [convexOrders, orders, currentTeam]);

  // Dynamic Leaderboard Engine (Scoring: 50% Portfolio Value, 30% Sector Diversity, 20% Execution Speed/Orders)
  const leaderboard = useMemo(() => {
    const stockPriceMap = new Map(stocks.map((s) => [s.ticker, s.currentPrice]));
    const stockSectorMap = new Map(stocks.map((s) => [s.ticker, s.sector]));

    return teams
      .map((team) => {
        const teamKey = team._id || team.id;
        const teamHoldings = allHoldings[teamKey] || allHoldings[team.id] || [];
        const teamOrdersList = orders.filter((o) => o.teamId === teamKey || o.teamId === team.id);

        let stockPortfolioValue = 0;
        const investedSectors = new Set();

        teamHoldings.forEach((h) => {
          const currentPrice = stockPriceMap.get(h.ticker) || h.avgPrice || h.avgBuyPrice || 0;
          stockPortfolioValue += h.shares * currentPrice;
          const sector = stockSectorMap.get(h.ticker) || h.sector;
          if (sector && h.shares > 0) {
            investedSectors.add(sector);
          }
        });

        const totalPortfolioValue = Math.round((team.cashBalance + stockPortfolioValue) * 100) / 100;
        const baseCapital = raceState.defaultStartingCapital || 100000;
        const returnPercent = Math.round(((totalPortfolioValue - baseCapital) / baseCapital) * 1000) / 10;

        // Metric 1: Portfolio Value Score (Max 50 pts)
        const portfolioScore = Math.min(50, Math.max(0, Math.round((totalPortfolioValue / baseCapital) * 25)));

        // Metric 2: Sector Diversification Score (Max 30 pts, 6 pts per distinct sector invested)
        const sectorCount = investedSectors.size;
        const strategyScore = Math.min(30, sectorCount * 6);

        // Metric 3: Execution Activity Score (Max 20 pts)
        const executionScore = Math.min(20, (team.tradeCount || teamOrdersList.length) * 2);

        const totalScore = team.status === "DISQUALIFIED" ? 0 : portfolioScore + strategyScore + executionScore;
        const netProfit = Math.round((totalPortfolioValue - baseCapital) * 100) / 100;

        return {
          ...team,
          teamId: team.id,
          stockPortfolioValue,
          totalPortfolioValue,
          netProfit,
          returnPercent,
          sectorCount,
          uniqueSectorCount: sectorCount,
          portfolioScore,
          strategyScore,
          executionScore,
          totalScore,
          tradesCount: teamOrdersList.length
        };
      })
      .sort((a, b) => {
        if (b.totalPortfolioValue !== a.totalPortfolioValue) {
          return b.totalPortfolioValue - a.totalPortfolioValue;
        }
        return b.returnPercent - a.returnPercent;
      })
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));
  }, [teams, allHoldings, orders, stocks, raceState.defaultStartingCapital]);

  // Auth: Create Team (Grid Registration - strictly 3 members)
  const createTeam = useCallback(
    async ({ teamName, teamPin, leaderName, member2, member3, memberNames = [] }) => {
      if (raceState.isRegistrationOpen === false) {
        throw new Error("Team Registration is currently locked by the Race Director. Registration will open on the official event day.");
      }

      if (!teamName || !teamName.trim()) {
        throw new Error("Team name is required.");
      }
      if (!teamPin || teamPin.trim().length !== 4) {
        throw new Error("4-digit Team PIN is required.");
      }
      if (!leaderName || !leaderName.trim()) {
        throw new Error("Team leader name is required.");
      }

      const cleanName = teamName.trim();
      const m2 = member2?.trim() || memberNames[0]?.trim() || "Strategist Lead";
      const m3 = member3?.trim() || memberNames[1]?.trim() || "Telemetry Lead";
      const filteredMembers = [leaderName.trim(), m2, m3];
      const sessionId = "sess_" + Math.random().toString(36).substring(2, 12);

      const cloudResult = await createTeamMutation({
        teamName: cleanName,
        teamPin: teamPin.trim(),
        leaderName: leaderName.trim(),
        member2: m2,
        member3: m3,
        memberNames: [m2, m3]
      });

      const newTeam = {
        id: cloudResult.teamId,
        _id: cloudResult.teamId,
        teamCode: cloudResult.teamCode,
        teamName: cloudResult.teamName,
        teamPin: teamPin.trim(),
        leaderName: cloudResult.leaderName,
        member2: m2,
        member3: m3,
        members: filteredMembers,
        cashBalance: cloudResult.cashBalance,
        status: "ACTIVE",
        userRole: "LEADER",
        currentMemberName: leaderName.trim(),
        sessionId,
        createdAt: Date.now()
      };

      setCurrentTeam(newTeam);
      localStorage.setItem("imprenditore_active_team", JSON.stringify(newTeam));
      return newTeam;
    },
    [raceState.isRegistrationOpen, createTeamMutation]
  );

  // Auth: Register Team Slot for Pre-Decided Grid Team (Strictly 3 members)
  const registerTeamSlot = useCallback(
    async ({ teamCode, teamPin, leaderName, member2, member3 }) => {
      if (raceState.isRegistrationOpen === false) {
        throw new Error("Team Registration is currently locked by the Race Director. Registration will open on the official event day.");
      }

      const sessionId = "sess_" + Math.random().toString(36).substring(2, 12);
      const result = await registerTeamSlotMutation({
        teamCode: teamCode.trim().toUpperCase(),
        teamPin: teamPin.trim(),
        leaderName: leaderName.trim(),
        member2: member2.trim(),
        member3: member3.trim()
      });

      const activeTeam = {
        id: result.teamId,
        _id: result.teamId,
        teamCode: result.teamCode,
        teamName: result.teamName,
        teamPin: teamPin.trim(),
        leaderName: result.leaderName,
        member2: result.member2,
        member3: result.member3,
        members: result.members,
        cashBalance: result.cashBalance,
        status: "ACTIVE",
        userRole: "LEADER",
        currentMemberName: leaderName.trim(),
        sessionId
      };

      setCurrentTeam(activeTeam);
      localStorage.setItem("imprenditore_active_team", JSON.stringify(activeTeam));
      return activeTeam;
    },
    [raceState.isRegistrationOpen, registerTeamSlotMutation]
  );

  // Auth: Join / Authenticate Team (Role: LEADER or MEMBER)
  const joinTeam = useCallback(
    async ({ teamIdentifier, teamPin, memberName, role = "LEADER" }) => {
      if (!teamIdentifier || !teamIdentifier.trim()) {
        throw new Error("Please select or enter your Team Code or Name.");
      }
      if (!teamPin || teamPin.trim().length !== 4) {
        throw new Error("4-digit Team PIN is required.");
      }
      if (!memberName || !memberName.trim()) {
        throw new Error("Member / Driver name is required.");
      }

      const allTeamsList = (Array.isArray(convexTeams) && convexTeams.length > 0)
        ? convexTeams
        : (Array.isArray(teams) && teams.length > 0 ? teams : []);

      const cleanId = teamIdentifier.trim().toLowerCase();
      const matched = (allTeamsList || []).find(
        (t) =>
          t.teamCode?.toLowerCase() === cleanId ||
          t.teamName?.toLowerCase() === cleanId ||
          String(t.teamNumber) === cleanId ||
          t._id === teamIdentifier.trim() ||
          t.id === teamIdentifier.trim()
      ) || allTeamsList[0];

      // Validate PIN against matched team
      const expectedPin = String(matched?.teamPin || matched?.defaultPin || "").trim();
      if (expectedPin && expectedPin !== teamPin.trim()) {
        throw new Error(`Invalid 4-digit PIN for ${matched?.teamName || "the selected team"}. Please enter the correct Team PIN.`);
      }

      const sessionId = "sess_" + Math.random().toString(36).substring(2, 12);
      let result;
      try {
        result = await joinTeamMutation({
          teamIdentifier: matched?.teamCode || teamIdentifier.trim(),
          teamPin: teamPin.trim(),
          memberName: memberName.trim(),
          role,
          sessionId
        });
      } catch (convexErr) {
        console.warn("Convex joinTeam mutation error, falling back to verified local session:", convexErr);
        if (!matched) throw convexErr;

        result = {
          teamId: matched._id || matched.id,
          teamCode: matched.teamCode,
          teamName: matched.teamName,
          leaderName: role === "LEADER" ? memberName.trim() : (matched.leaderName || memberName.trim()),
          member2: matched.member2 || "Member 2",
          member3: matched.member3 || "Member 3",
          cashBalance: matched.cashBalance || 100000,
          status: matched.status || "ACTIVE",
          members: matched.members || [memberName.trim()],
          userRole: role,
          sessionId
        };
      }

      const activeTeam = {
        id: result.teamId,
        _id: result.teamId,
        teamCode: result.teamCode,
        teamName: result.teamName,
        teamPin: teamPin.trim(),
        leaderName: result.leaderName,
        member2: result.member2,
        member3: result.member3,
        cashBalance: result.cashBalance,
        status: result.status,
        members: result.members || [result.leaderName, memberName.trim()],
        userRole: result.userRole || role,
        currentMemberName: memberName.trim(),
        sessionId: result.userRole === "LEADER" ? sessionId : undefined
      };

      setCurrentTeam(activeTeam);
      localStorage.setItem("imprenditore_active_team", JSON.stringify(activeTeam));
      return activeTeam;
    },
    [joinTeamMutation]
  );

  // Auth: Participant Account Login (Feature D & E)
  const loginParticipantAccount = useCallback(
    async ({ teamIdentifier, role, username, password }) => {
      const sessionId = "sess_" + Math.random().toString(36).substring(2, 12);

      // Try Convex mutation first
      try {
        const res = await loginParticipantMutation({
          teamIdentifier: String(teamIdentifier),
          role,
          username,
          password,
          sessionId,
        });

        const activeTeam = {
          id: res.teamId,
          _id: res.teamId,
          accountId: res.accountId,
          username: res.username,
          teamNumber: res.teamNumber,
          teamCode: res.teamCode,
          teamName: res.teamName,
          cashBalance: res.cashBalance,
          status: res.status,
          userRole: res.role,
          currentMemberName: res.username,
          leaderName: `${res.teamName} Leader`,
          sessionId,
        };

        setCurrentTeam(activeTeam);
        localStorage.setItem("imprenditore_active_team", JSON.stringify(activeTeam));
        return activeTeam;
      } catch {
        // Fallback: Validate credentials against canonical teams & local account state
        const identifier = String(teamIdentifier).trim().toLowerCase();
        const activeTeams = (Array.isArray(convexTeams) && convexTeams.length > 0) ? convexTeams : teams;
        const team = activeTeams.find(
          (t) =>
            t.teamCode?.toLowerCase() === identifier ||
            t.teamName?.toLowerCase() === identifier ||
            t.teamNumber?.toString() === identifier
        ) || activeTeams[0];

        if (!team) {
          throw new Error("Team not found on the competition grid.");
        }

        const teamPin = team.teamPin || `10${String(team.teamNumber || 1).padStart(2, "0")}`;
        const expectedPass = teamPin;

        const enteredUser = (username || "").trim().toLowerCase();
        const enteredPass = (password || "").trim();

        const customOverride = accountOverrides[enteredUser] || {};
        if (customOverride.status === "DISABLED") {
          throw new Error("This participant account has been disabled by Race Control.");
        }

        const validPass = customOverride.customPassword || expectedPass;
        const isPinMatch = enteredPass === team.teamPin;
        const isPassMatch = enteredPass === validPass || enteredPass.toLowerCase() === validPass.toLowerCase();

        if (!isPassMatch && !isPinMatch) {
          throw new Error("Invalid username or password credentials. Please verify your assigned team account.");
        }

        // Lock leader session on Convex cloud using joinTeamMutation
        try {
          await joinTeamMutation({
            teamIdentifier: team.teamCode,
            teamPin: team.teamPin,
            memberName: enteredUser,
            role,
            sessionId,
          });
        } catch {}

        const activeTeam = {
          id: team._id || team.id,
          _id: team._id || team.id,
          accountId: `acc_${enteredUser}`,
          username: enteredUser,
          teamNumber: team.teamNumber || 1,
          teamCode: team.teamCode,
          teamName: team.teamName,
          cashBalance: team.cashBalance || 100000,
          status: team.status || "ACTIVE",
          userRole: role,
          currentMemberName: enteredUser,
          leaderName: team.leaderName || `${team.teamName} Leader`,
          sessionId,
        };

        // Record in audit log
        setAuditLogs((prev) => [
          {
            _id: `log_${Date.now()}`,
            action: "PARTICIPANT_LOGIN",
            actor: enteredUser,
            target: team.teamName,
            details: `${role} authenticated successfully into ${team.teamName}.`,
            timestamp: Date.now(),
          },
          ...prev.slice(0, 49)
        ]);

        setCurrentTeam(activeTeam);
        localStorage.setItem("imprenditore_active_team", JSON.stringify(activeTeam));
        return activeTeam;
      }
    },
    [loginParticipantMutation, convexTeams, teams, accountOverrides, joinTeamMutation]
  );

  // Active Session Heartbeat (Presence Monitoring)
  useEffect(() => {
    if (!currentTeam?.accountId) return;
    const interval = setInterval(() => {
      heartbeatParticipantMutation({
        accountId: currentTeam.accountId,
        sessionId: currentTeam.sessionId,
      }).catch(() => {});
    }, 25000);
    return () => clearInterval(interval);
  }, [currentTeam?.accountId, currentTeam?.sessionId, heartbeatParticipantMutation]);

  // Auth: Logout (Releases session and sets presence offline)
  const logout = useCallback(async () => {
    if (currentTeam?.accountId) {
      try {
        await logoutParticipantMutation({
          accountId: currentTeam.accountId,
          sessionId: currentTeam.sessionId,
        });
      } catch (err) {
        console.warn("Participant logout error:", err);
      }
    } else if (currentTeam) {
      try {
        const teamConvexId = currentTeam._id || currentTeam.id;
        if (teamConvexId && currentTeam.sessionId) {
          await logoutTeamLeaderMutation({
            teamId: teamConvexId,
            sessionId: currentTeam.sessionId,
          });
        }
      } catch (err) {
        console.warn("Leader logout release notice:", err);
      }
    }
    setCurrentTeam(null);
    localStorage.removeItem("imprenditore_active_team");
  }, [currentTeam, logoutParticipantMutation, logoutTeamLeaderMutation]);

  // Admin Auth (3-Hour Persistent Session)
  const adminLogin = useCallback((passcode) => {
    const inputKey = (passcode || "").trim();
    const { envKey, defaultKey } = getCleanAdminKeys();

    const isMatch = Boolean(
      (envKey && inputKey === envKey) ||
      inputKey === defaultKey
    );

    if (isMatch) {
      const authData = {
        authenticated: true,
        expiresAt: Date.now() + 3 * 60 * 60 * 1000 // 3 hours consistent state
      };
      setIsAdmin(true);
      localStorage.setItem("imprenditore_admin_auth", JSON.stringify(authData));
      return true;
    }
    throw new Error("Invalid Admin Key.");
  }, []);

  const adminLogout = useCallback(() => {
    setIsAdmin(false);
    localStorage.removeItem("imprenditore_admin_auth");
  }, []);

  // Trading: Execute Pit Stop Order
  const executeTrade = useCallback(
    async ({ ticker, type, shares, executedBy }) => {
      const shareCount = Math.floor(shares);
      if (shareCount <= 0 || !Number.isFinite(shareCount)) {
        throw new Error("Share quantity must be a positive whole number.");
      }

      if (!currentTeam) {
        throw new Error("No active team session. Please log in first.");
      }

      // Role check: Only the designated Team Leader can place bids and execute trades
      if (currentTeam.userRole === "MEMBER") {
        throw new Error(
          `Spectator Mode: You are logged in as a Team Member (${currentTeam.currentMemberName || "Spectator"}). Only the Team Leader (${currentTeam.leaderName}) can execute trades.`
        );
      }

      if (raceState.status !== "GREEN_FLAG") {
        throw new Error("Market Orders Locked: The simulation is not currently running under Green Flag.");
      }
      if (raceState.isSimulationEntryOpen === false) {
        throw new Error("Cockpit access is currently locked by the Race Director.");
      }
      if (currentTeam.status === "DISQUALIFIED") {
        throw new Error("This team has been disqualified from placing trades.");
      }

      const stock = stocks.find((s) => s.ticker === ticker);
      if (!stock) {
        throw new Error("Target company not found on the grid.");
      }

      const tradePrice = stock.currentPrice;
      const totalAmount = Math.round(shareCount * tradePrice * 100) / 100;

      // Execute on Convex backend if active
      const teamConvexId = currentTeam._id || currentTeam.id;
      if (teamConvexId && typeof teamConvexId === "string" && teamConvexId.length > 10) {
        // Snapshot for atomic rollback if mutation fails
        const prevTeamSnapshot = currentTeam;

        // Optimistic pre-flight cash balance update for instantaneous mobile feedback
        const optimisticCash = type === "BUY"
          ? Math.max(0, Math.round((currentTeam.cashBalance - totalAmount) * 100) / 100)
          : Math.round((currentTeam.cashBalance + totalAmount) * 100) / 100;

        const optimisticTeam = { ...currentTeam, cashBalance: optimisticCash };
        setCurrentTeam(optimisticTeam);
        setTeams((prev) =>
          prev.map((t) => (t.id === currentTeam.id || t._id === currentTeam._id ? optimisticTeam : t))
        );

        let res;
        try {
          res = await executeTradeMutation({
            teamId: teamConvexId,
            ticker,
            type,
            shares: shareCount,
            executedBy: executedBy || currentTeam.currentMemberName || currentTeam.leaderName,
            sessionId: currentTeam.sessionId
          });
        } catch (mutationErr) {
          // Atomic rollback: restore exact pre-order team snapshot on rejection
          setCurrentTeam(prevTeamSnapshot);
          setTeams((prev) =>
            prev.map((t) => (t.id === prevTeamSnapshot.id || t._id === prevTeamSnapshot._id ? prevTeamSnapshot : t))
          );
          throw mutationErr;
        }

        if (res && typeof res.remainingCash === "number") {
          const updatedTeam = { ...currentTeam, cashBalance: res.remainingCash };
          setCurrentTeam(updatedTeam);
          setTeams((prev) =>
            prev.map((t) => (t.id === currentTeam.id || t._id === currentTeam._id ? updatedTeam : t))
          );
          localStorage.setItem("imprenditore_active_team", JSON.stringify(updatedTeam));
        }

        // Optimistically synchronize allHoldings for zero-latency UI update
        const teamKey = teamConvexId;
        const altKey = currentTeam.id;
        setAllHoldings((prev) => {
          const prevList = prev[teamKey] || prev[altKey] || [];
          const existing = prevList.find(
            (h) => h.ticker?.toUpperCase() === ticker.toUpperCase()
          );
          let updatedList;
          if (type === "BUY") {
            const newShares = (existing ? existing.shares : 0) + shareCount;
            const existingCost = existing ? (existing.totalInvested || existing.avgBuyPrice * existing.shares || existing.avgPrice * existing.shares) : 0;
            const tradeAmount = res?.totalAmount ?? totalAmount;
            const newTotalInvested = existingCost + tradeAmount;
            const newAvgPrice = Math.round((newTotalInvested / newShares) * 100) / 100;
            if (existing) {
              updatedList = prevList.map((h) =>
                h.ticker?.toUpperCase() === ticker.toUpperCase()
                  ? { ...h, shares: newShares, totalInvested: newTotalInvested, avgBuyPrice: newAvgPrice, avgPrice: newAvgPrice, updatedAt: Date.now() }
                  : h
              );
            } else {
              updatedList = [
                ...prevList,
                {
                  ticker,
                  shares: newShares,
                  avgBuyPrice: newAvgPrice,
                  avgPrice: newAvgPrice,
                  totalInvested: newTotalInvested,
                  sector: stock.sector,
                  updatedAt: Date.now()
                }
              ];
            }
          } else {
            // SELL
            const remainingShares = (existing ? existing.shares : 0) - shareCount;
            if (remainingShares <= 0) {
              updatedList = prevList.filter(
                (h) => h.ticker?.toUpperCase() !== ticker.toUpperCase()
              );
            } else {
              const remainingInvested = Math.round(remainingShares * (existing.avgBuyPrice || existing.avgPrice) * 100) / 100;
              updatedList = prevList.map((h) =>
                h.ticker?.toUpperCase() === ticker.toUpperCase()
                  ? { ...h, shares: remainingShares, totalInvested: remainingInvested, updatedAt: Date.now() }
                  : h
              );
            }
          }
          const nextState = {
            ...prev,
            [teamKey]: updatedList,
            ...(altKey ? { [altKey]: updatedList } : {})
          };
          localStorage.setItem("imprenditore_holdings", JSON.stringify(nextState));
          return nextState;
        });

        // Optimistically record executed order
        const optimisticOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          teamId: teamConvexId,
          teamName: currentTeam.teamName,
          ticker,
          type,
          shares: shareCount,
          price: tradePrice,
          totalAmount: res?.totalAmount ?? totalAmount,
          executedBy: executedBy || currentTeam.leaderName,
          lap: raceState.currentLap,
          timestamp: Date.now()
        };
        setOrders((prev) => {
          const nextOrders = [optimisticOrder, ...prev];
          localStorage.setItem("imprenditore_orders", JSON.stringify(nextOrders));
          return nextOrders;
        });

        return {
          ...res,
          totalAmount: res?.totalAmount ?? totalAmount,
          shares: res?.shares ?? shareCount,
          ticker: res?.ticker ?? ticker
        };
      }

      const teamHoldings = allHoldings[currentTeam.id] || [];
      const existingHolding = teamHoldings.find((h) => h.ticker === ticker);
      const currentOwnedShares = existingHolding ? existingHolding.shares : 0;

      if (type === "BUY") {
        if (currentTeam.cashBalance < totalAmount) {
          throw new Error(
            `Insufficient cash balance. Required: ₹${totalAmount.toLocaleString("en-IN")}, Available: ₹${currentTeam.cashBalance.toLocaleString("en-IN")}`
          );
        }

        const newCashBalance = Math.round((currentTeam.cashBalance - totalAmount) * 100) / 100;
        const newShares = currentOwnedShares + shareCount;
        const newTotalCost = (existingHolding ? existingHolding.avgPrice * existingHolding.shares : 0) + totalAmount;
        const newAvgPrice = Math.round((newTotalCost / newShares) * 100) / 100;

        let updatedTeamHoldings;
        if (existingHolding) {
          updatedTeamHoldings = teamHoldings.map((h) =>
            h.ticker === ticker ? { ...h, shares: newShares, avgPrice: newAvgPrice, avgBuyPrice: newAvgPrice } : h
          );
        } else {
          updatedTeamHoldings = [
            ...teamHoldings,
            { ticker, shares: newShares, avgPrice: newAvgPrice, avgBuyPrice: newAvgPrice, sector: stock.sector }
          ];
        }

        setAllHoldings((prev) => ({
          ...prev,
          [currentTeam.id]: updatedTeamHoldings
        }));

        const updatedTeam = { ...currentTeam, cashBalance: newCashBalance };
        setCurrentTeam(updatedTeam);
        setTeams((prev) => prev.map((t) => (t.id === currentTeam.id ? updatedTeam : t)));

        const newOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          teamId: currentTeam.id,
          teamName: currentTeam.teamName,
          ticker,
          type: "BUY",
          shares: shareCount,
          price: tradePrice,
          totalAmount,
          executedBy: executedBy || currentTeam.leaderName,
          lap: raceState.currentLap,
          timestamp: Date.now()
        };

        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
      }

      if (type === "SELL") {
        if (currentOwnedShares < shareCount) {
          throw new Error(
            `Insufficient stock holdings. Requested to sell ${shareCount} shares, but you currently own ${currentOwnedShares}.`
          );
        }

        const newCashBalance = Math.round((currentTeam.cashBalance + totalAmount) * 100) / 100;
        const newShares = currentOwnedShares - shareCount;

        let updatedTeamHoldings;
        if (newShares === 0) {
          updatedTeamHoldings = teamHoldings.filter((h) => h.ticker !== ticker);
        } else {
          updatedTeamHoldings = teamHoldings.map((h) =>
            h.ticker === ticker ? { ...h, shares: newShares } : h
          );
        }

        setAllHoldings((prev) => ({
          ...prev,
          [currentTeam.id]: updatedTeamHoldings
        }));

        const updatedTeam = { ...currentTeam, cashBalance: newCashBalance };
        setCurrentTeam(updatedTeam);
        setTeams((prev) => prev.map((t) => (t.id === currentTeam.id ? updatedTeam : t)));

        const newOrder = {
          id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          teamId: currentTeam.id,
          teamName: currentTeam.teamName,
          ticker,
          type: "SELL",
          shares: shareCount,
          price: tradePrice,
          totalAmount,
          executedBy: executedBy || currentTeam.leaderName,
          lap: raceState.currentLap,
          timestamp: Date.now()
        };

        setOrders((prev) => [newOrder, ...prev]);
        return newOrder;
      }

      throw new Error("Unsupported order type.");
    },
    [currentTeam, raceState, stocks, allHoldings, executeTradeMutation]
  );

  // Admin Actions: Flag-Off / Start Race or Current Lap (Waving Green Flag)
  const startRace = useCallback(
    async (customDurationSeconds = null) => {
      const duration = customDurationSeconds || (raceState.lapTimeRemaining > 0 ? raceState.lapTimeRemaining : (raceState.lapDuration || 900));
      const now = Date.now();
      const updated = {
        ...raceState,
        status: "GREEN_FLAG",
        isSimulationEntryOpen: true,
        lapStartedAt: now,
        lapTimeRemaining: duration,
        lapDuration: customDurationSeconds || raceState.lapDuration || 900,
        activeNews: `Lap ${raceState.currentLap} Green Flag: Market is LIVE. Trading floor is open!`,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      setTrackEvents((prev) => [
        {
          id: `evt_${now}`,
          title: `Green Flag: Lap ${raceState.currentLap} Live`,
          description: "Race Director has flagged off the grid. Order matching and trading is live.",
          type: "GREEN_FLAG",
          affectedSectors: [],
          priceImpactPercent: 0,
          lap: raceState.currentLap,
          timestamp: now
        },
        ...prev
      ]);

      try {
        await startRaceMutation({ lapDuration: duration });
      } catch (err) {
        console.error("Convex startRace error:", err);
      }
    },
    [raceState, broadcastSync, startRaceMutation]
  );

  // Admin Actions: Pause Race (Safety Car)
  const pauseRace = useCallback(
    async (reason = "Safety Car deployed by Race Control.") => {
      let remaining = raceState.lapTimeRemaining;
      if (raceState.lapStartedAt) {
        const elapsedSecs = Math.floor((Date.now() - raceState.lapStartedAt) / 1000);
        remaining = Math.max(0, (raceState.lapDuration || 900) - elapsedSecs);
      }

      const now = Date.now();
      const updated = {
        ...raceState,
        status: "SAFETY_CAR",
        lapStartedAt: null,
        lapTimeRemaining: remaining,
        activeNews: `Safety Car Deployed: ${reason}. Order matching and timers frozen.`,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      setTrackEvents((prev) => [
        {
          id: `evt_${now}`,
          title: "Safety Car Deployed",
          description: reason,
          type: "SAFETY_CAR",
          affectedSectors: [],
          priceImpactPercent: 0,
          lap: raceState.currentLap,
          timestamp: now
        },
        ...prev
      ]);

      try {
        await pauseRaceMutation({});
      } catch (err) {
        console.error("Convex pauseRace error:", err);
      }
    },
    [raceState, broadcastSync, pauseRaceMutation]
  );

  // Admin Actions: Conclude Race (Checkered Flag)
  const endRace = useCallback(async () => {
    const now = Date.now();
    const updated = {
      ...raceState,
      status: "CHECKERED_FLAG",
      lapStartedAt: null,
      lapTimeRemaining: 0,
      activeNews: "Checkered Flag: Simulation concluded! All trading closed and final podium standings locked.",
      updatedAt: now
    };
    setRaceState(updated);
    localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
    broadcastSync("RACE_STATE_SYNC", updated);

    setTrackEvents((prev) => [
      {
        id: `evt_${now}`,
        title: "Checkered Flag: Event Concluded",
        description: "Official flag-down. Final team scores and rankings locked.",
        type: "CHECKERED_FLAG",
        affectedSectors: [],
        priceImpactPercent: 0,
        lap: raceState.currentLap || 7,
        timestamp: now
      },
      ...prev
    ]);

    try {
      await endRaceMutation({});
    } catch (err) {
      console.error("Convex endRace error:", err);
    }
  }, [raceState, broadcastSync, endRaceMutation]);

  // Admin Actions: Set Custom Race Timer
  const setRaceTimer = useCallback(
    async (seconds) => {
      const duration = Math.max(60, Number(seconds));
      const now = Date.now();
      const updated = {
        ...raceState,
        lapStartedAt: raceState.status === "GREEN_FLAG" ? now : null,
        lapTimeRemaining: duration,
        lapDuration: duration,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      try {
        await setRaceTimerMutation({ durationSeconds: duration });
      } catch (err) {
        console.error("Convex setRaceTimer error:", err);
      }
    },
    [raceState, broadcastSync, setRaceTimerMutation]
  );

  // Admin Actions: Select & Stage Competition Lap (Never auto-runs; stays in Warmup until Start clicked)
  const stageLap = useCallback(
    async (lapNumber, durationSeconds = null, newsTitle = "") => {
      const duration = durationSeconds || raceState.lapDuration || 900;
      const news = newsTitle || (lapNumber === 1
        ? "The race will start upon Race Director Flag-Off. Paddock warmup in progress."
        : `Lap ${lapNumber - 1} completed. Lap ${lapNumber} is staged on the grid. The lap will start when the Race Director flags off.`);
      const now = Date.now();

      const updated = {
        ...raceState,
        currentLap: lapNumber,
        status: "GRID_WARMUP", // Strictly stays in Warmup without running
        lapStartedAt: null,
        lapTimeRemaining: duration,
        lapDuration: duration,
        activeNews: news,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      setTrackEvents((prev) => [
        {
          id: `evt_${now}`,
          title: `Lap ${lapNumber} Staged`,
          description: news,
          type: "GRID_WARMUP",
          affectedSectors: [],
          priceImpactPercent: 0,
          lap: lapNumber,
          timestamp: now
        },
        ...prev
      ]);

      try {
        await stageLapMutation({ lapNumber, lapDuration: duration });
      } catch (err) {
        console.error("Convex stageLap error:", err);
      }
    },
    [raceState, broadcastSync, stageLapMutation]
  );

  // Admin Actions: Advance Lap (Legacy helper mapping to stageLap)
  const advanceLap = useCallback(
    (lapNumber) => {
      stageLap(lapNumber);
    },
    [stageLap]
  );

  // Admin Actions: Broadcast Track Event / Sector News Shock
  const broadcastTrackEvent = useCallback(
    async ({ title, description, type, affectedSectors = [], priceImpactPercent = 0 }) => {
      const now = Date.now();
      const newEvent = {
        id: `evt_${now}`,
        title,
        description,
        type: type || "YELLOW_FLAG",
        affectedSectors,
        priceImpactPercent,
        lap: raceState.currentLap,
        timestamp: now
      };

      setTrackEvents((prev) => [newEvent, ...prev]);

      if (affectedSectors.length > 0 && priceImpactPercent !== 0) {
        setStocks((prevStocks) =>
          prevStocks.map((stock) => {
            if (affectedSectors.includes(stock.sector)) {
              const delta = (stock.currentPrice * priceImpactPercent) / 100;
              const newPrice = Math.max(10, Math.round((stock.currentPrice + delta) * 10) / 10);
              const changePercent = Math.round(((newPrice - stock.openingPrice) / stock.openingPrice) * 1000) / 10;
              const sparkline = [...stock.sparkline.slice(-10), newPrice];

              return {
                ...stock,
                currentPrice: newPrice,
                dayHigh: Math.max(stock.dayHigh, newPrice),
                dayLow: Math.min(stock.dayLow, newPrice),
                changePercent,
                sparkline,
                updatedAt: now
              };
            }
            return stock;
          })
        );
      }

      setRaceState((prev) => {
        const updated = {
          ...prev,
          activeNews: `${title}: ${description}`,
          updatedAt: now
        };
        localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
        return updated;
      });

      try {
        await broadcastTrackEventMutation({
          title,
          description,
          type: type || "NEWS_FLASH",
          affectedSectors,
          priceImpactPercent
        });
      } catch (err) {
        console.error("Convex broadcastTrackEvent error:", err);
      }
    },
    [raceState.currentLap, broadcastTrackEventMutation]
  );

  // Admin Actions: Sector Shock Trigger
  const triggerSectorShock = useCallback(
    (sector, percent, newsHeadline) => {
      broadcastTrackEvent({
        title: newsHeadline || `Sector Shock: ${sector}`,
        description: `Market fluctuations hit ${sector} by ${percent > 0 ? "+" : ""}${percent}%.`,
        type: percent < 0 ? "YELLOW_FLAG" : "GREEN_FLAG",
        affectedSectors: [sector],
        priceImpactPercent: percent
      });
    },
    [broadcastTrackEvent]
  );

  // Admin Actions: Update Team
  const adminUpdateTeam = useCallback(
    async (teamId, updates) => {
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId || t._id === teamId ? { ...t, ...updates } : t))
      );
      if (currentTeam && (currentTeam.id === teamId || currentTeam._id === teamId)) {
        setCurrentTeam((prev) => ({ ...prev, ...updates }));
      }

      if (teamId && typeof teamId === "string" && teamId.length > 10) {
        try {
          await adminUpdateTeamMutation({
            teamId,
            teamName: updates.teamName,
            status: updates.status,
            cashBalance: updates.cashBalance !== undefined ? Number(updates.cashBalance) : undefined
          });
        } catch (err) {
          console.error("Convex adminUpdateTeam error:", err);
        }
      }
    },
    [currentTeam, adminUpdateTeamMutation]
  );

  // Admin Actions: Update Team Cash Balance
  const adminUpdateTeamCash = useCallback(
    async (teamId, newBalance) => {
      const cash = Math.max(0, Math.round(Number(newBalance) * 100) / 100);
      setTeams((prev) =>
        prev.map((t) => (t.id === teamId || t._id === teamId ? { ...t, cashBalance: cash } : t))
      );
      if (currentTeam && (currentTeam.id === teamId || currentTeam._id === teamId)) {
        setCurrentTeam((prev) => ({ ...prev, cashBalance: cash }));
      }

      if (teamId && typeof teamId === "string" && teamId.length > 10) {
        try {
          await adminUpdateTeamMutation({
            teamId,
            cashBalance: cash
          });
        } catch (err) {
          console.error("Convex adminUpdateTeamCash error:", err);
        }
      }
    },
    [currentTeam, adminUpdateTeamMutation]
  );

  // Admin Actions: Delete Team
  const adminDeleteTeam = useCallback(
    async (teamId) => {
      setTeams((prev) => prev.filter((t) => t.id !== teamId && t._id !== teamId));
      setAllHoldings((prev) => {
        const copy = { ...prev };
        delete copy[teamId];
        return copy;
      });
      setOrders((prev) => prev.filter((o) => o.teamId !== teamId));
      if (currentTeam && (currentTeam.id === teamId || currentTeam._id === teamId)) {
        setCurrentTeam(null);
        localStorage.removeItem("imprenditore_active_team");
      }

      if (teamId && typeof teamId === "string" && teamId.length > 10) {
        try {
          await adminDeleteTeamMutation({ teamId });
        } catch (err) {
          console.error("Convex adminDeleteTeam error:", err);
        }
      }
    },
    [currentTeam, adminDeleteTeamMutation]
  );

  // Admin Actions: Toggle Registration Gate (Strict Boolean)
  const toggleRegistration = useCallback(
    async (forceValue = null) => {
      const nextState = typeof forceValue === "boolean" ? forceValue : !raceState.isRegistrationOpen;
      const now = Date.now();
      const updated = {
        ...raceState,
        isRegistrationOpen: nextState,
        activeNews: nextState
          ? "Paddock Notice: Team registration is now OPEN on the grid."
          : "Paddock Notice: Team registration is currently LOCKED by Race Control.",
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      try {
        await toggleRegistrationMutation({ isRegistrationOpen: nextState });
      } catch (err) {
        console.error("Convex toggleRegistration error:", err);
      }
    },
    [raceState, broadcastSync, toggleRegistrationMutation]
  );

  // Admin Actions: Toggle Simulation Cockpit Entry Gate (Strict Boolean)
  const toggleSimulationEntry = useCallback(
    async (forceValue = null) => {
      const nextState = typeof forceValue === "boolean" ? forceValue : !raceState.isSimulationEntryOpen;
      const now = Date.now();
      const updated = {
        ...raceState,
        isSimulationEntryOpen: nextState,
        activeNews: nextState
          ? "Paddock Notice: Driver cockpit access has been UNLOCKED."
          : "Paddock Notice: Driver cockpit access is currently LOCKED by Race Control.",
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      try {
        await toggleSimulationEntryMutation({ isSimulationEntryOpen: nextState });
      } catch (err) {
        console.error("Convex toggleSimulationEntry error:", err);
      }
    },
    [raceState, broadcastSync, toggleSimulationEntryMutation]
  );

  // Admin Actions: Set Target Event Date & Time (Countdown)
  const setTargetEventDate = useCallback(
    async (dateIsoString, summaryText = "") => {
      let formatted = "";
      if (dateIsoString) {
        const d = new Date(dateIsoString);
        if (!isNaN(d.getTime())) {
          formatted = d.toLocaleString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true
          });
        }
      }
      const rawSummary = (summaryText || "").trim();
      const isOutdatedDate =
        (rawSummary.includes("10:00 AM") && (!dateIsoString || !dateIsoString.includes("10:00:00"))) ||
        rawSummary.includes("September 16");
      const effectiveSummary = (isOutdatedDate ? "" : rawSummary) || formatted || raceState.scheduledStartTime || "October 29, 2026 at 3:00 PM";
      const now = Date.now();

      const updated = {
        ...raceState,
        targetEventDate: dateIsoString || null,
        scheduledStartTime: effectiveSummary,
        activeNews: `Flag-Off Scheduled: ${effectiveSummary}. Paddock warmup in progress.`,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      try {
        await setTargetEventDateMutation({
          dateIsoString: dateIsoString || null,
          summaryText: effectiveSummary
        });
      } catch (err) {
        console.error("Convex setTargetEventDate error:", err);
      }
    },
    [raceState, broadcastSync, setTargetEventDateMutation]
  );

  // Admin Actions: Set Default Starting Capital
  const adminSetDefaultStartingCapital = useCallback(
    async (amount) => {
      const capital = Math.max(1000, Math.round(Number(amount)));
      const now = Date.now();
      const updated = {
        ...raceState,
        defaultStartingCapital: capital,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      try {
        await adminSetDefaultStartingCapitalMutation({ amount: capital });
      } catch (err) {
        console.error("Convex adminSetDefaultStartingCapital error:", err);
      }
    },
    [raceState, broadcastSync, adminSetDefaultStartingCapitalMutation]
  );

  // Admin Actions: Set Scheduled Flag-Off / Start Time
  const adminSetScheduledStartTime = useCallback(
    async (timeString) => {
      const trimmed = timeString ? timeString.trim() : null;
      const now = Date.now();
      const updated = {
        ...raceState,
        scheduledStartTime: trimmed,
        activeNews: trimmed
          ? `Flag-Off Scheduled: Event begins at ${trimmed}. Paddock warmup active.`
          : raceState.activeNews,
        updatedAt: now
      };
      setRaceState(updated);
      localStorage.setItem("imprenditore_race_state", JSON.stringify(updated));
      broadcastSync("RACE_STATE_SYNC", updated);

      if (trimmed) {
        try {
          await setTargetEventDateMutation({
            dateIsoString: raceState.targetEventDate,
            summaryText: trimmed
          });
        } catch (err) {
          console.error("Convex adminSetScheduledStartTime error:", err);
        }
      }
    },
    [raceState, broadcastSync, setTargetEventDateMutation]
  );

  // Admin Actions: Reset all teams and restart grid for event (Full Reset)
  const resetGrid = useCallback(async () => {
    const preservedDate =
      raceState.targetEventDate && !raceState.targetEventDate.includes("2026-09")
        ? raceState.targetEventDate
        : "2026-10-29T15:00:00";
    const preservedSummary =
      raceState.scheduledStartTime && !raceState.scheduledStartTime.includes("September")
        ? raceState.scheduledStartTime
        : "October 29, 2026 at 3:00 PM";
    const preservedCapital = raceState.defaultStartingCapital || 100000;

    const freshRaceState = {
      ...raceState,
      currentLap: 1,
      status: "GRID_WARMUP",
      isRegistrationOpen: false, // Reset to locked
      isSimulationEntryOpen: false, // Reset to locked
      targetEventDate: preservedDate,
      scheduledStartTime: preservedSummary,
      defaultStartingCapital: preservedCapital,
      lapStartedAt: null,
      lapTimeRemaining: 900,
      lapDuration: 900,
      activeNews: "The race will start upon Race Director Flag-Off. Paddock warmup in progress.",
      updatedAt: Date.now()
    };

    const initialEvents = [
      {
        id: `evt_${Date.now()}`,
        title: "Paddock Warmup Initialized",
        description: "Grid reset. Initial mock capital allocated for participating teams.",
        type: "GREEN_FLAG",
        affectedSectors: [],
        priceImpactPercent: 0,
        lap: 1,
        timestamp: Date.now()
      }
    ];

    setTeams([]);
    setCurrentTeam(null);
    setAllHoldings({});
    setOrders([]);
    setStocks(INITIAL_STOCKS);
    setRaceState(freshRaceState);
    setTrackEvents(initialEvents);
    setMarketNews([]);

    // Hard Wipe in LocalStorage
    localStorage.setItem("imprenditore_teams", JSON.stringify([]));
    localStorage.setItem("imprenditore_holdings", JSON.stringify({}));
    localStorage.setItem("imprenditore_orders", JSON.stringify([]));
    localStorage.setItem("imprenditore_stocks", JSON.stringify(INITIAL_STOCKS));
    localStorage.setItem("imprenditore_race_state", JSON.stringify(freshRaceState));
    localStorage.setItem("imprenditore_events", JSON.stringify(initialEvents));
    localStorage.setItem("imprenditore_market_news", JSON.stringify([]));
    localStorage.removeItem("imprenditore_active_team");

    broadcastSync("RACE_STATE_SYNC", freshRaceState);
    broadcastSync("TEAMS_SYNC", []);
    broadcastSync("HOLDINGS_SYNC", {});
    broadcastSync("ORDERS_SYNC", []);
    broadcastSync("STOCKS_SYNC", INITIAL_STOCKS);
    broadcastSync("EVENTS_SYNC", initialEvents);
    broadcastSync("MARKET_NEWS_SYNC", []);

    try {
      await resetGridMutation({});
    } catch (err) {
      console.error("Convex resetGrid error:", err);
    }
  }, [raceState, broadcastSync, resetGridMutation]);

  // Admin Actions: Seed Canonical 15 Teams
  const seedCanonical15Teams = useCallback(
    async (overwrite = false) => {
      return await seedCanonical15TeamsMutation({ overwrite });
    },
    [seedCanonical15TeamsMutation]
  );

  // Admin Actions: Update Team Members Roster and Credentials
  const adminUpdateTeamMembers = useCallback(
    async (args) => {
      return await adminUpdateTeamMembersMutation(args);
    },
    [adminUpdateTeamMembersMutation]
  );

  // Admin Actions: Clear Leader Session Lock
  const adminClearLeaderSession = useCallback(
    async (teamId) => {
      return await adminClearLeaderSessionMutation({ teamId });
    },
    [adminClearLeaderSessionMutation]
  );

  // Admin Actions: Update Individual Stock
  const adminUpdateStock = useCallback(
    async (args) => {
      return await adminUpdateStockMutation(args);
    },
    [adminUpdateStockMutation]
  );

  // Admin Actions: Trigger Industry Sector Shock
  const adminTriggerSectorShock = useCallback(
    async (args) => {
      return await adminTriggerSectorShockMutation(args);
    },
    [adminTriggerSectorShockMutation]
  );

  // Derive 15 canonical teams & 30 participant accounts with live presence
  const adminTeamsAndAccounts = useMemo(() => {
    const activeTeams = (Array.isArray(convexTeams) && convexTeams.length > 0) ? convexTeams : teams;
    return activeTeams.map((team, idx) => {
      const teamNum = team.teamNumber || idx + 1;
      const slug = (team.teamCode || "").split("-")[0].toLowerCase() || `team${teamNum}`;
      const leaderUsername = `${slug}_leader`;
      const memberUsername = `${slug}_member`;

      const leaderOverride = accountOverrides[leaderUsername] || {};
      const memberOverride = accountOverrides[memberUsername] || {};

      const teamKey = team._id || team.id;
      const rawTeamHoldings = Array.isArray(allHoldings)
        ? allHoldings.filter((h) => h.teamId === teamKey)
        : (allHoldings && typeof allHoldings === "object" ? (allHoldings[teamKey] || allHoldings[team.id] || []) : []);
      const teamHoldings = Array.isArray(rawTeamHoldings) ? rawTeamHoldings : [];

      const holdingsValue = teamHoldings.reduce((sum, h) => {
        const stock = stocks.find((s) => s.ticker === h.ticker);
        const price = stock ? stock.currentPrice : (h.avgBuyPrice || 0);
        return sum + (h.shares || 0) * price;
      }, 0);
      const portfolioVal = (team.cashBalance || 100000) + holdingsValue;
      const teamOrders = Array.isArray(orders) ? orders.filter((o) => o.teamId === (team._id || team.id)) : [];

      const isLeaderOnline = Boolean(team.activeLeaderSessionId);

      return {
        _id: team._id || team.id || `team_${teamNum}`,
        id: team._id || team.id || `team_${teamNum}`,
        teamNumber: teamNum,
        teamCode: team.teamCode || `TEAM-${teamNum.toString().padStart(2, "0")}`,
        teamName: team.teamName,
        teamPin: team.teamPin || `10${teamNum.toString().padStart(2, "0")}`,
        cashBalance: team.cashBalance || 100000,
        portfolioValue: portfolioVal,
        totalTrades: teamOrders.length,
        status: team.status || "ACTIVE",
        activeLeaderSessionId: team.activeLeaderSessionId,
        accounts: [
          {
            _id: `acc_${slug}_leader`,
            accountId: `ACC-${team.teamCode || slug}-LEAD`,
            username: leaderUsername,
            password: leaderOverride.customPassword || team.teamPin || `10${teamNum.toString().padStart(2, "0")}`,
            role: "LEADER",
            status: leaderOverride.status || "ACTIVE",
            isOnline: isLeaderOnline,
            lastLoginAt: leaderOverride.lastLoginAt || team.lastLeaderLoginAt || null,
            lastHeartbeatAt: leaderOverride.lastHeartbeatAt || (isLeaderOnline ? Date.now() : null),
          },
          {
            _id: `acc_${slug}_member`,
            accountId: `ACC-${team.teamCode || slug}-MEM`,
            username: memberUsername,
            password: memberOverride.customPassword || team.teamPin || `10${teamNum.toString().padStart(2, "0")}`,
            role: "MEMBER",
            status: memberOverride.status || "ACTIVE",
            isOnline: Boolean(memberOverride.isOnline),
            lastLoginAt: memberOverride.lastLoginAt || null,
            lastHeartbeatAt: memberOverride.lastHeartbeatAt || null,
          }
        ]
      };
    });
  }, [convexTeams, teams, accountOverrides, allHoldings, stocks, orders]);

  // Derive initial credentials mapping
  const adminInitialCredentials = useMemo(() => {
    return (adminTeamsAndAccounts || []).map((t) => {
      const slug = (t.teamCode || "").split("-")[0].toLowerCase();
      const teamPin = t.teamPin || `10${String(t.teamNumber || 1).padStart(2, "0")}`;
      return {
        teamNumber: t.teamNumber,
        teamCode: t.teamCode,
        teamName: t.teamName,
        leaderUsername: `${slug}_leader`,
        leaderInitialPasswordPattern: teamPin,
        memberUsername: `${slug}_member`,
        memberInitialPasswordPattern: teamPin,
      };
    });
  }, [adminTeamsAndAccounts]);

  // Feature D, E, G: Account Management Callbacks
  const adminToggleAccountStatus = useCallback(
    async (accountId, status) => {
      let targetUsername = accountId;
      for (const t of adminTeamsAndAccounts) {
        const found = t.accounts?.find((a) => a._id === accountId || a.accountId === accountId);
        if (found) {
          targetUsername = found.username;
          break;
        }
      }

      setAccountOverrides((prev) => {
        const next = {
          ...prev,
          [targetUsername]: {
            ...(prev[targetUsername] || {}),
            status,
          }
        };
        localStorage.setItem("imprenditore_account_overrides", JSON.stringify(next));
        return next;
      });

      setAuditLogs((prev) => [
        {
          _id: `log_${Date.now()}`,
          action: "STATUS_CHANGE",
          actor: "ADMIN",
          target: targetUsername,
          details: `Account ${targetUsername} status changed to ${status}.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 49)
      ]);

      try {
        await adminToggleAccountStatusMutation({ accountId, status });
      } catch {}

      return { success: true, status };
    },
    [adminTeamsAndAccounts, adminToggleAccountStatusMutation]
  );

  const adminResetAccountPassword = useCallback(
    async (accountId, newPassword) => {
      let targetUsername = accountId;
      for (const t of adminTeamsAndAccounts) {
        const found = t.accounts?.find((a) => a._id === accountId || a.accountId === accountId);
        if (found) {
          targetUsername = found.username;
          break;
        }
      }

      setAccountOverrides((prev) => {
        const next = {
          ...prev,
          [targetUsername]: {
            ...(prev[targetUsername] || {}),
            customPassword: newPassword,
          }
        };
        localStorage.setItem("imprenditore_account_overrides", JSON.stringify(next));
        return next;
      });

      setAuditLogs((prev) => [
        {
          _id: `log_${Date.now()}`,
          action: "PASSWORD_RESET",
          actor: "ADMIN",
          target: targetUsername,
          details: `Password reset for user ${targetUsername}.`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 49)
      ]);

      try {
        await adminResetAccountPasswordMutation({ accountId, newPassword });
      } catch {}

      return { success: true, username: targetUsername };
    },
    [adminTeamsAndAccounts, adminResetAccountPasswordMutation]
  );

  // Feature B: Market News Callbacks
  const publishMarketNews = useCallback(
    async (article) => {
      const newArticle = {
        id: `news_${Date.now()}`,
        _id: `news_${Date.now()}`,
        title: article.title.trim(),
        summary: article.summary.trim(),
        source: article.source || "Race Director Operations",
        category: (article.category || "ANNOUNCEMENT").toUpperCase(),
        sentiment: article.sentiment || "NEUTRAL",
        isOfficialAnnouncement: Boolean(article.isOfficialAnnouncement),
        ticker: article.ticker ? article.ticker.trim().toUpperCase() : undefined,
        url: article.url,
        timestamp: Date.now(),
      };

      setMarketNews((prev) => {
        const next = [newArticle, ...prev];
        localStorage.setItem("imprenditore_market_news", JSON.stringify(next));
        broadcastSync("MARKET_NEWS_SYNC", next);
        return next;
      });

      setAuditLogs((prev) => [
        {
          _id: `log_${Date.now()}`,
          action: "PUBLISH_MARKET_NEWS",
          actor: "ADMIN",
          target: article.title,
          details: `Published news article in ${article.category}: "${article.title}"`,
          timestamp: Date.now(),
        },
        ...prev.slice(0, 49)
      ]);

      try {
        await publishMarketNewsMutation(article);
      } catch {}

      return newArticle;
    },
    [publishMarketNewsMutation, broadcastSync]
  );

  const seedInitialMarketNews = useCallback(
    async (overwrite = false) => {
      if (overwrite || marketNews.length === 0) {
        setMarketNews(INITIAL_MARKET_NEWS);
        localStorage.setItem("imprenditore_market_news", JSON.stringify(INITIAL_MARKET_NEWS));
        try {
          await seedInitialMarketNewsMutation({ overwrite });
        } catch {}
        return { seeded: true, count: INITIAL_MARKET_NEWS.length };
      }
      return { seeded: false, count: marketNews.length };
    },
    [marketNews.length, seedInitialMarketNewsMutation]
  );

  const adminClearAllNews = useCallback(async () => {
    setMarketNews([]);
    localStorage.setItem("imprenditore_market_news", JSON.stringify([]));
    broadcastSync("MARKET_NEWS_SYNC", []);
    try {
      await clearMarketNewsMutation({});
    } catch {}
    return { cleared: true };
  }, [clearMarketNewsMutation, broadcastSync]);

  const value = {
    isConnected,
    isWebSocketConnected: isConnected,
    connectionState,
    stocks,
    teams: (Array.isArray(convexTeams) && convexTeams.length > 0) ? convexTeams : teams,
    currentTeam,
    holdings: currentHoldings,
    currentHoldings,
    allHoldings,
    orders: teamOrders,
    allOrders: orders,
    raceState,
    trackEvents,
    leaderboard: (Array.isArray(convexLeaderboard) && convexLeaderboard.length > 0) ? convexLeaderboard : leaderboard,
    isAdmin,
    hasEnvAdminKey: Boolean(getCleanAdminKeys().hasEnvKey),
    createTeam,
    registerTeamSlot,
    joinTeam,
    loginParticipantAccount,
    logout,
    adminLogin,
    adminLogout,
    executeTrade,
    startRace,
    pauseRace,
    endRace,
    setRaceTimer,
    stageLap,
    advanceLap,
    toggleRegistration,
    toggleSimulationEntry,
    setTargetEventDate,
    adminSetDefaultStartingCapital,
    broadcastTrackEvent,
    triggerSectorShock,
    adminUpdateStock,
    adminTriggerSectorShock,
    seedCanonical15Teams,
    adminUpdateTeamMembers,
    adminClearLeaderSession,
    adminUpdateTeam,
    adminUpdateTeamCash,
    adminDeleteTeam,
    adminSetScheduledStartTime,
    resetGrid,
    // Feature D, E, G additions
    adminTeamsAndAccounts,
    adminToggleAccountStatus,
    adminResetAccountPassword,
    adminInitialCredentials,
    adminAuditLogs: auditLogs,
    // Feature B additions
    marketNews,
    publishMarketNews,
    seedInitialMarketNews,
    adminClearAllNews,
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

/* eslint-disable-next-line react-refresh/only-export-components */
export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error("useSimulation must be used within a SimulationProvider");
  }
  return context;
}
