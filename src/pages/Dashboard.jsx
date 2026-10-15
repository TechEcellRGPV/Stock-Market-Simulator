import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Layers,
  Trophy,
  Plus,
  BarChart2,
  Receipt,
  Wallet
} from "lucide-react";
import Navbar from "../components/Navbar";
import CirculatingBanner from "../components/CirculatingBanner";
import PortfolioPerformanceChart from "../components/PortfolioPerformanceChart";
import PaddockWaitingLounge from "../components/PaddockWaitingLounge";
import { useSimulation } from "../context/SimulationContext";
import { useSEO } from "../hooks/useSEO";
import { useScreenWakeLock } from "../hooks/useScreenWakeLock";

export default function Dashboard() {
  useSEO({
    title: "Team Trading Dashboard",
    description: "Team Trading Dashboard for Imprenditore 5.0. Monitor real-time net worth, cash balance, sector allocation meters, and order ledgers."
  });

  const {
    currentTeam,
    currentHoldings,
    orders,
    stocks,
    raceState,
    leaderboard,
    logout
  } = useSimulation();

  useScreenWakeLock(raceState?.status === "GREEN_FLAG");

  const [activeTab, setActiveTab] = useState("holdings"); // "holdings" | "chart" | "orders"

  const stockPriceMap = useMemo(() => new Map(stocks.map((s) => [s.ticker, s])), [stocks]);

  // Compute live portfolio statistics
  const portfolioStats = useMemo(() => {
    if (!currentTeam) {
      return {
        cash: 100000,
        invested: 0,
        totalValue: 100000,
        totalPnL: 0,
        pnlPercent: 0,
        sectorBreakdown: {},
        holdingRows: []
      };
    }

    let invested = 0;
    const sectorTotals = {};
    const holdingRows = [];

    for (const h of currentHoldings) {
      const stock = stockPriceMap.get(h.ticker);
      const currentPrice = stock ? stock.currentPrice : h.avgBuyPrice;
      const currentValue = Math.round(h.shares * currentPrice * 100) / 100;
      const costBasis = Math.round(h.shares * h.avgBuyPrice * 100) / 100;
      const pnl = Math.round((currentValue - costBasis) * 100) / 100;
      const pnlPct = costBasis > 0 ? Math.round((pnl / costBasis) * 1000) / 10 : 0;

      invested += currentValue;

      const sectorName = stock ? stock.sector : "Other";
      sectorTotals[sectorName] = (sectorTotals[sectorName] || 0) + currentValue;

      holdingRows.push({
        ...h,
        stockName: stock ? stock.name : h.ticker,
        sector: sectorName,
        currentPrice,
        currentValue,
        costBasis,
        pnl,
        pnlPct
      });
    }

    const totalValue = Math.round((currentTeam.cashBalance + invested) * 100) / 100;
    const totalPnL = Math.round((totalValue - (raceState.defaultStartingCapital || 100000)) * 100) / 100;
    const pnlPercent = Math.round((totalPnL / (raceState.defaultStartingCapital || 100000)) * 1000) / 10;

    return {
      cash: currentTeam.cashBalance,
      invested,
      totalValue,
      totalPnL,
      pnlPercent,
      sectorBreakdown: sectorTotals,
      holdingRows
    };
  }, [currentTeam, currentHoldings, stockPriceMap, raceState]);

  // Rank in leaderboard
  const currentRank = useMemo(() => {
    if (!currentTeam || !leaderboard) return "-";
    const found = leaderboard.find(
      (entry) =>
        entry.teamId === currentTeam.id ||
        entry.teamId === currentTeam._id ||
        entry.teamCode === currentTeam.teamCode
    );
    return found ? `#${found.rank}` : "-";
  }, [currentTeam, leaderboard]);

  // Sectors list for distribution bar
  const sectorColors = {
    "Powertrain & Electric Vehicles": "#10B981",
    "Aerodynamics & Advanced Materials": "#06B6D4",
    "Telemetry, AI & Autonomous Tech": "#3B82F6",
    "Sustainable Fuels & Energy": "#EAB308",
    "Logistics & Precision Engineering": "#A855F7"
  };

  const sectorSegments = useMemo(() => {
    return Object.entries(sectorColors).map(([name, color]) => {
      const val = portfolioStats.sectorBreakdown[name] || 0;
      const pct = portfolioStats.totalValue > 0 ? (val / portfolioStats.totalValue) * 100 : 0;
      return { name: name.split("&")[0].trim(), fullName: name, value: val, pct, color };
    });
  }, [portfolioStats]);

  const activeSectorCount = sectorSegments.filter((s) => s.value > 0).length;

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-[#090D14] text-white flex flex-col justify-between">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0D121D] p-6 sm:p-8 rounded-xl border border-[#1A2336] text-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">No Active Session</h2>
              <p className="text-xs text-slate-400 mt-1">Please log in to your team to access the cockpit</p>
            </div>
            <Link
              to="/login"
              className="block w-full py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Go to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Pre-race lounge if entry closed
  if (!raceState.isSimulationEntryOpen) {
    return (
      <PaddockWaitingLounge
        currentTeam={currentTeam}
        raceState={raceState}
        stocks={stocks}
        onLogout={logout}
      />
    );
  }

  const isUp = portfolioStats.totalPnL >= 0;

  return (
    <div className="min-h-screen bg-[#090D14] text-white font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      <Navbar />
      <CirculatingBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Team Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1A2336]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-white tracking-tight">
                {currentTeam.teamName}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#141B29] text-slate-300 border border-[#20293D]">
                {currentTeam.teamCode}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              Leader: <strong className="text-slate-200">{currentTeam.leaderName}</strong> • {currentTeam.userRole === "MEMBER" ? "Member (View Only)" : "Leader (Trading Active)"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/trade"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Place Trade</span>
            </Link>
          </div>
        </div>

        {/* 4 Minimal Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Portfolio */}
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Portfolio Value
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              ₹{portfolioStats.totalValue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="flex items-center gap-1.5 mt-2 font-mono text-xs">
              <span className={`inline-flex items-center gap-0.5 font-semibold ${isUp ? "text-emerald-400" : "text-rose-400"}`}>
                {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                <span>{isUp ? "+" : ""}{portfolioStats.pnlPercent}%</span>
              </span>
              <span className="text-slate-400">
                ({isUp ? "+" : ""}₹{portfolioStats.totalPnL.toLocaleString("en-IN")})
              </span>
            </div>
          </div>

          {/* 2. Available Cash */}
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Available Cash
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              ₹{portfolioStats.cash.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Ready for immediate deployment
            </div>
          </div>

          {/* 3. Invested Stock Value */}
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Stock Holdings
            </div>
            <div className="text-2xl font-mono font-bold text-white">
              ₹{portfolioStats.invested.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Across {currentHoldings.length} scrips
            </div>
          </div>

          {/* 4. Competition Rank */}
          <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Current Rank
            </div>
            <div className="text-2xl font-mono font-bold text-amber-400">
              {currentRank}
            </div>
            <div className="text-[11px] text-slate-400 mt-2">
              Ranked by net profit on grid
            </div>
          </div>
        </div>

        {/* Minimal Sector Allocation Bar */}
        <div className="p-4 rounded-xl bg-[#0D121D] border border-[#1A2336] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300">Sector Diversification</span>
            <span className="font-mono text-slate-400">{activeSectorCount} of 5 sectors held</span>
          </div>

          {/* Multi-segment horizontal bar */}
          <div className="h-2 rounded-full bg-[#161F30] overflow-hidden flex">
            {sectorSegments.map((sec) => (
              sec.pct > 0 ? (
                <div
                  key={sec.name}
                  style={{ width: `${sec.pct}%`, backgroundColor: sec.color }}
                  className="h-full transition-all duration-300"
                  title={`${sec.fullName}: ${sec.pct.toFixed(1)}%`}
                />
              ) : null
            ))}
          </div>

          {/* Sector Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] pt-1">
            {sectorSegments.map((sec) => (
              <div key={sec.name} className="flex items-center gap-1.5 text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sec.color }} />
                <span>{sec.name}</span>
                <span className="font-mono text-slate-300 font-semibold">{sec.pct.toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tabbed Workspace */}
        <div className="rounded-xl bg-[#0D121D] border border-[#1A2336] overflow-hidden">
          {/* Tab Header */}
          <div className="flex items-center gap-6 px-4 sm:px-6 pt-3 border-b border-[#1A2336] bg-[#0A0E17]">
            <button
              type="button"
              onClick={() => setActiveTab("holdings")}
              className={`pb-3 text-xs font-semibold relative transition-colors ${
                activeTab === "holdings" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Holdings ({currentHoldings.length})</span>
              {activeTab === "holdings" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chart")}
              className={`pb-3 text-xs font-semibold relative transition-colors ${
                activeTab === "chart" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Valuation Chart</span>
              {activeTab === "chart" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("orders")}
              className={`pb-3 text-xs font-semibold relative transition-colors ${
                activeTab === "orders" ? "text-white" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Order Ledger ({orders.length})</span>
              {activeTab === "orders" && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-400 rounded-full" />
              )}
            </button>
          </div>

          {/* Tab Content: Holdings */}
          {activeTab === "holdings" && (
            <div className="p-4 sm:p-5">
              {portfolioStats.holdingRows.length === 0 ? (
                <div className="py-10 text-center space-y-3">
                  <p className="text-xs font-semibold text-slate-300">No stocks in your portfolio yet</p>
                  <p className="text-xs text-slate-400">Deploy your ₹1,00,000 cash balance into equities across the market</p>
                  <Link
                    to="/companies"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-colors"
                  >
                    <span>Browse Equities</span>
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#1A2336] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5">Scrip</th>
                        <th className="py-2.5">Sector</th>
                        <th className="py-2.5 text-right">Shares</th>
                        <th className="py-2.5 text-right">Avg Cost</th>
                        <th className="py-2.5 text-right">Current Price</th>
                        <th className="py-2.5 text-right">Market Value</th>
                        <th className="py-2.5 text-right">P&L</th>
                        <th className="py-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141B28]">
                      {portfolioStats.holdingRows.map((row) => (
                        <tr key={row.ticker} className="hover:bg-[#121824] transition-colors">
                          <td className="py-3">
                            <div className="font-bold text-white">{row.ticker}</div>
                            <div className="text-[11px] text-slate-400">{row.stockName}</div>
                          </td>
                          <td className="py-3 text-slate-400">{row.sector.split("&")[0].trim()}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">{row.shares}</td>
                          <td className="py-3 text-right font-mono text-slate-300">₹{(row.avgBuyPrice || row.avgPrice || 0).toFixed(2)}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">₹{row.currentPrice.toFixed(2)}</td>
                          <td className="py-3 text-right font-mono font-bold text-white">₹{row.currentValue.toLocaleString("en-IN")}</td>
                          <td className="py-3 text-right font-mono font-semibold">
                            <span className={row.pnl >= 0 ? "text-emerald-400" : "text-rose-400"}>
                              {row.pnl >= 0 ? "+" : ""}₹{row.pnl.toLocaleString("en-IN")} ({row.pnlPct}%)
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <Link
                              to={`/trade?ticker=${row.ticker}`}
                              className="px-2.5 py-1 rounded bg-[#161F30] hover:bg-emerald-500 hover:text-slate-950 text-slate-200 text-[11px] font-semibold transition-colors"
                            >
                              Trade
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Tab Content: Valuation Chart */}
          {activeTab === "chart" && (
            <div className="p-4 sm:p-5">
              <PortfolioPerformanceChart
                team={currentTeam}
                portfolioStats={portfolioStats}
                raceState={raceState}
                height={280}
              />
            </div>
          )}

          {/* Tab Content: Orders */}
          {activeTab === "orders" && (
            <div className="p-4 sm:p-5">
              {orders.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-400">
                  No orders executed in this session yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-sans">
                    <thead>
                      <tr className="border-b border-[#1A2336] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-2.5">Side</th>
                        <th className="py-2.5">Scrip</th>
                        <th className="py-2.5 text-right">Shares</th>
                        <th className="py-2.5 text-right">Price</th>
                        <th className="py-2.5 text-right">Total</th>
                        <th className="py-2.5">Trader</th>
                        <th className="py-2.5 text-right">Round</th>
                        <th className="py-2.5 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#141B28]">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-[#121824] transition-colors">
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              o.type === "BUY"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                            }`}>
                              {o.type}
                            </span>
                          </td>
                          <td className="py-2.5 font-bold text-white">{o.ticker}</td>
                          <td className="py-2.5 text-right font-mono text-white">{o.shares}</td>
                          <td className="py-2.5 text-right font-mono text-slate-300">₹{o.price.toFixed(2)}</td>
                          <td className="py-2.5 text-right font-mono font-bold text-white">
                            ₹{o.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2.5 text-slate-400 text-[11px]">{o.executedBy}</td>
                          <td className="py-2.5 text-right font-mono text-amber-400">Lap {o.lap}</td>
                          <td className="py-2.5 text-right text-slate-400 font-mono text-[10px]">
                            {new Date(o.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
