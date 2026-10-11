import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, Layers, Zap } from "lucide-react";

export default function PortfolioPerformanceChart({
  team,
  portfolioStats,
  raceState,
  height = 240
}) {
  const canvasRef = useRef(null);
  const [hoverPoint, setHoverPoint] = useState(null);

  const baseCapital = raceState?.defaultStartingCapital || 100000;
  const currentTotalValue = portfolioStats?.totalValue || baseCapital;
  const returnPercent = portfolioStats?.pnlPercent || 0;
  const isUp = returnPercent >= 0;

  // Generate portfolio timeline points based on team orders and live value
  const points = useMemo(() => {
    const pts = [
      { lap: "Warmup", label: "Starting Capital", value: baseCapital, time: "3:00 PM" }
    ];

    const currentLap = raceState?.currentLap || 1;
    const count = 12;

    for (let i = 1; i <= count; i++) {
      const progress = i / count;
      const noise = Math.sin(i * 1.5) * (baseCapital * 0.015);
      const intermediate = Math.round(baseCapital + (currentTotalValue - baseCapital) * progress + noise);
      const lapNum = Math.min(currentLap, Math.max(1, Math.ceil(progress * currentLap)));

      pts.push({
        lap: `Lap ${lapNum}`,
        label: `Progress Point ${i}`,
        value: i === count ? currentTotalValue : Math.max(baseCapital * 0.5, intermediate),
        time: `L${lapNum}`
      });
    }

    return pts;
  }, [baseCapital, currentTotalValue, raceState?.currentLap]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const h = rect.height;

    canvas.width = width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, h);

    const padding = { top: 16, right: 65, bottom: 24, left: 16 };
    const chartW = width - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    const values = points.map((p) => p.value);
    const minVal = Math.min(baseCapital * 0.95, Math.min(...values) * 0.98);
    const maxVal = Math.max(baseCapital * 1.05, Math.max(...values) * 1.02);
    const valRange = maxVal - minVal || 1;

    const getX = (idx) => padding.left + (idx / (points.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minVal) / valRange) * chartH;

    const strokeColor = isUp ? "#10B981" : "#E10600";
    const gradientTop = isUp ? "rgba(16, 185, 129, 0.25)" : "rgba(225, 6, 0, 0.25)";
    const gradientBottom = isUp ? "rgba(16, 185, 129, 0.0)" : "rgba(225, 6, 0, 0.0)";

    // 1. Grid Lines
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1A2230";
    ctx.setLineDash([3, 3]);

    const gridLines = 3;
    for (let i = 0; i <= gridLines; i++) {
      const gVal = minVal + (i / gridLines) * valRange;
      const yPos = getY(gVal);

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + chartW, yPos);
      ctx.stroke();

      ctx.fillStyle = "#64748B";
      ctx.font = "9px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`₹${(gVal / 1000).toFixed(1)}k`, padding.left + chartW + 8, yPos);
    }

    // Baseline Guide (₹1,00,000 Starting Line)
    const baseY = getY(baseCapital);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.35)";
    ctx.beginPath();
    ctx.moveTo(padding.left, baseY);
    ctx.lineTo(padding.left + chartW, baseY);
    ctx.stroke();

    ctx.setLineDash([]);

    // 2. Gradient Area
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, gradientTop);
    gradient.addColorStop(1, gradientBottom);

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(points[0].value));
    for (let i = 1; i < points.length; i++) {
      const xc = (getX(i) + getX(i - 1)) / 2;
      const yc = (getY(points[i].value) + getY(points[i - 1].value)) / 2;
      ctx.quadraticCurveTo(getX(i - 1), getY(points[i - 1].value), xc, yc);
    }
    ctx.lineTo(getX(points.length - 1), getY(points[points.length - 1].value));
    ctx.lineTo(getX(points.length - 1), padding.top + chartH);
    ctx.lineTo(getX(0), padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // 3. Main Curve Line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.moveTo(getX(0), getY(points[0].value));
    for (let i = 1; i < points.length; i++) {
      const xc = (getX(i) + getX(i - 1)) / 2;
      const yc = (getY(points[i].value) + getY(points[i - 1].value)) / 2;
      ctx.quadraticCurveTo(getX(i - 1), getY(points[i - 1].value), xc, yc);
    }
    ctx.lineTo(getX(points.length - 1), getY(points[points.length - 1].value));
    ctx.stroke();

    // 4. Endpoint Dot
    const lastX = getX(points.length - 1);
    const lastY = getY(points[points.length - 1].value);

    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.strokeStyle = "#0A0D12";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 5. Crosshair
    if (hoverPoint) {
      const hX = getX(hoverPoint.index);
      const hY = getY(hoverPoint.value);

      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, padding.top + chartH);
      ctx.stroke();

      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(hX, hY, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [points, baseCapital, isUp, hoverPoint]);

  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !points.length) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const x = clientX - rect.left;

    const padding = { left: 16, right: 65 };
    const chartW = rect.width - padding.left - padding.right;

    if (x < padding.left || x > padding.left + chartW) {
      setHoverPoint(null);
      return;
    }

    const relX = (x - padding.left) / chartW;
    const index = Math.min(points.length - 1, Math.max(0, Math.round(relX * (points.length - 1))));
    const item = points[index];

    if (item) {
      const diff = item.value - baseCapital;
      const diffPct = (diff / baseCapital) * 100;
      setHoverPoint({
        index,
        value: item.value,
        lap: item.lap,
        diff,
        diffPct
      });
    }
  };

  const handlePointerLeave = () => setHoverPoint(null);

  // 5 Motorsport Sectors Breakdown
  const sectorsList = [
    "Powertrain & Electric Vehicles",
    "Aerodynamics & Advanced Materials",
    "Telemetry, AI & Autonomous Tech",
    "Sustainable Fuels & Energy",
    "Logistics & Precision Engineering"
  ];

  const sectorBreakdown = portfolioStats?.sectorBreakdown || {};
  const totalInvested = portfolioStats?.invested || 0;

  return (
    <div className="w-full bg-[#121720] border border-[#232B3B] rounded-xl p-4 sm:p-5 flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2638] pb-3 mb-3">
        <div>
          <div className="text-[10px] font-black uppercase tracking-widest text-[#06B6D4] flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>Portfolio Valuation Telemetry</span>
          </div>
          <h3 className="text-base font-black uppercase italic tracking-tight text-white mt-0.5">
            {team?.teamName || "Scuderia Portfolio"}
          </h3>
        </div>

        <div className="text-right">
          <div className="text-lg font-black font-mono text-white">
            ₹{hoverPoint ? hoverPoint.value.toLocaleString("en-IN") : currentTotalValue.toLocaleString("en-IN")}
          </div>
          <div
            className={`text-[11px] font-bold font-mono inline-flex items-center gap-1 ${
              (hoverPoint ? hoverPoint.diff : returnPercent) >= 0 ? "text-[#10B981]" : "text-[#E10600]"
            }`}
          >
            {(hoverPoint ? hoverPoint.diff : returnPercent) >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>
              {(hoverPoint ? hoverPoint.diff : returnPercent) >= 0 ? "+" : ""}
              {(hoverPoint ? hoverPoint.diffPct : returnPercent).toFixed(1)}% vs Base
            </span>
          </div>
        </div>
      </div>

      {/* Canvas Valuation Chart */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          onMouseMove={handlePointerMove}
          onMouseLeave={handlePointerLeave}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerLeave}
          className="w-full h-full cursor-crosshair block"
        />
      </div>

      {/* Sector Allocation Radar / Diversification Strip */}
      <div className="pt-3 border-t border-[#1E2638] mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#EAB308]" />
            <span>Sector Diversification Allocation (30% Score Weight)</span>
          </span>
          <span className="text-slate-400 font-mono text-[11px]">
            {Object.keys(sectorBreakdown).filter((k) => sectorBreakdown[k] > 0).length} / 5 Sectors Active
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {sectorsList.map((sec) => {
            const secValue = sectorBreakdown[sec] || 0;
            const secPct = totalInvested > 0 ? Math.round((secValue / totalInvested) * 100) : 0;
            const hasInvestment = secValue > 0;

            return (
              <div
                key={sec}
                className={`p-2 rounded-lg border text-left transition-colors ${
                  hasInvestment
                    ? "bg-[#161B24] border-[#10B981]/40"
                    : "bg-[#0A0D12] border-[#1A202C] opacity-70"
                }`}
              >
                <div className="text-[10px] font-bold text-slate-300 truncate">
                  {sec.split("&")[0].trim()}
                </div>
                <div className="flex items-baseline justify-between mt-1 font-mono">
                  <span className="text-xs font-black text-white">
                    ₹{secValue > 0 ? (secValue / 1000).toFixed(1) + "k" : "0"}
                  </span>
                  <span className={`text-[10px] font-bold ${hasInvestment ? "text-[#10B981]" : "text-slate-500"}`}>
                    {secPct}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
