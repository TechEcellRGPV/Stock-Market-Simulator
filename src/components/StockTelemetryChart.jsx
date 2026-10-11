import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

export default function StockTelemetryChart({
  stock,
  height = 320,
  showControls = true
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [hoverData, setHoverData] = useState(null);
  const [timeframe, setTimeframe] = useState("ALL"); // "1M" | "5M" | "15M" | "ALL"
  const [chartType, setChartType] = useState("area"); // "area" | "line"

  // Synthesize realistic telemetry ticks from sparkline and current/open/high/low prices
  const chartData = useMemo(() => {
    if (!stock) return [];

    const spark = stock.sparkline && stock.sparkline.length > 0
      ? stock.sparkline
      : [stock.openingPrice, stock.currentPrice];

    const count = 24;
    const baseTime = stock.lastUpdated || 1726479000000;
    const intervalMs = timeframe === "1M" ? 2500 : timeframe === "5M" ? 12000 : 30000;

    const data = [];
    const openPrice = stock.openingPrice || 100;
    const currPrice = stock.currentPrice || openPrice;

    for (let i = 0; i < count; i++) {
      const progress = i / (count - 1);
      const sparkIndex = Math.min(
        spark.length - 1,
        Math.floor(progress * (spark.length - 1))
      );
      const baseVal = spark[sparkIndex] || openPrice;
      const noise = Math.sin(i * 1.7) * (stock.volatility || 1.0) * 0.4;
      const price = i === count - 1
        ? currPrice
        : i === 0
        ? openPrice
        : Math.round((baseVal + noise) * 100) / 100;

      const time = new Date(baseTime - (count - 1 - i) * intervalMs);
      data.push({
        time,
        timeStr: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        price: Math.max(1, price)
      });
    }

    return data;
  }, [stock, timeframe]);

  // Draw High-Density Canvas Chart
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !chartData.length) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const h = rect.height;

    canvas.width = width * dpr;
    canvas.height = h * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, h);

    const padding = { top: 20, right: 65, bottom: 28, left: 16 };
    const chartW = width - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    if (chartW <= 0 || chartH <= 0) return;

    const prices = chartData.map((d) => d.price);
    const minPrice = Math.min(...prices) * 0.996;
    const maxPrice = Math.max(...prices) * 1.004;
    const priceRange = maxPrice - minPrice || 1;

    const getX = (idx) => padding.left + (idx / (chartData.length - 1)) * chartW;
    const getY = (val) => padding.top + chartH - ((val - minPrice) / priceRange) * chartH;

    const isUp = (stock.changePercent || 0) >= 0;
    const strokeColor = isUp ? "#10B981" : "#E10600";
    const gradientTop = isUp ? "rgba(16, 185, 129, 0.28)" : "rgba(225, 6, 0, 0.28)";
    const gradientBottom = isUp ? "rgba(16, 185, 129, 0.0)" : "rgba(225, 6, 0, 0.0)";

    // 1. Dotted Horizontal Grid Lines & Price Axis Labels
    const gridLinesCount = 4;
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#1A2230";
    ctx.setLineDash([3, 3]);

    for (let i = 0; i <= gridLinesCount; i++) {
      const gridPrice = minPrice + (i / gridLinesCount) * priceRange;
      const yPos = getY(gridPrice);

      ctx.beginPath();
      ctx.moveTo(padding.left, yPos);
      ctx.lineTo(padding.left + chartW, yPos);
      ctx.stroke();

      // Price Axis Text
      ctx.fillStyle = "#64748B";
      ctx.font = "10px monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(`₹${gridPrice.toFixed(1)}`, padding.left + chartW + 8, yPos);
    }

    ctx.setLineDash([]); // Reset line dash

    // 2. High & Low Watermark Dotted Guides
    if (stock.dayHigh && stock.dayLow) {
      const highY = getY(stock.dayHigh);
      const lowY = getY(stock.dayLow);

      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);

      // High Guide
      ctx.strokeStyle = "rgba(16, 185, 129, 0.35)";
      ctx.beginPath();
      ctx.moveTo(padding.left, highY);
      ctx.lineTo(padding.left + chartW, highY);
      ctx.stroke();

      // Low Guide
      ctx.strokeStyle = "rgba(225, 6, 0, 0.35)";
      ctx.beginPath();
      ctx.moveTo(padding.left, lowY);
      ctx.lineTo(padding.left + chartW, lowY);
      ctx.stroke();

      ctx.setLineDash([]);
    }

    // 3. Area Fill
    if (chartType === "area") {
      const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
      gradient.addColorStop(0, gradientTop);
      gradient.addColorStop(1, gradientBottom);

      ctx.beginPath();
      ctx.moveTo(getX(0), getY(chartData[0].price));

      for (let i = 1; i < chartData.length; i++) {
        const xc = (getX(i) + getX(i - 1)) / 2;
        const yc = (getY(chartData[i].price) + getY(chartData[i - 1].price)) / 2;
        ctx.quadraticCurveTo(getX(i - 1), getY(chartData[i - 1].price), xc, yc);
      }
      ctx.lineTo(getX(chartData.length - 1), getY(chartData[chartData.length - 1].price));
      ctx.lineTo(getX(chartData.length - 1), padding.top + chartH);
      ctx.lineTo(getX(0), padding.top + chartH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 4. Main Telemetry Line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.moveTo(getX(0), getY(chartData[0].price));
    for (let i = 1; i < chartData.length; i++) {
      const xc = (getX(i) + getX(i - 1)) / 2;
      const yc = (getY(chartData[i].price) + getY(chartData[i - 1].price)) / 2;
      ctx.quadraticCurveTo(getX(i - 1), getY(chartData[i - 1].price), xc, yc);
    }
    ctx.lineTo(getX(chartData.length - 1), getY(chartData[chartData.length - 1].price));
    ctx.stroke();

    // 5. Current Price Live Pulse Dot
    const lastX = getX(chartData.length - 1);
    const lastY = getY(chartData[chartData.length - 1].price);

    ctx.beginPath();
    ctx.arc(lastX, lastY, 4, 0, Math.PI * 2);
    ctx.fillStyle = strokeColor;
    ctx.fill();
    ctx.strokeStyle = "#0A0D12";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 6. Time Axis Labels
    ctx.fillStyle = "#64748B";
    ctx.font = "9px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    const labelInterval = Math.floor(chartData.length / 4);
    for (let i = 0; i < chartData.length; i += labelInterval) {
      const xPos = getX(i);
      ctx.fillText(chartData[i].timeStr, xPos, padding.top + chartH + 8);
    }

    // 7. Interactive Crosshair on Hover
    if (hoverData) {
      const hX = getX(hoverData.index);
      const hY = getY(hoverData.price);

      // Vertical crosshair line
      ctx.strokeStyle = "#94A3B8";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);

      ctx.beginPath();
      ctx.moveTo(hX, padding.top);
      ctx.lineTo(hX, padding.top + chartH);
      ctx.stroke();

      // Horizontal crosshair line
      ctx.beginPath();
      ctx.moveTo(padding.left, hY);
      ctx.lineTo(padding.left + chartW, hY);
      ctx.stroke();

      ctx.setLineDash([]);

      // Point circle
      ctx.beginPath();
      ctx.arc(hX, hY, 5, 0, Math.PI * 2);
      ctx.fillStyle = "#FFFFFF";
      ctx.fill();
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }, [chartData, stock, chartType, hoverData]);

  // Handle Resize and Redraw
  useEffect(() => {
    draw();

    const handleResize = () => {
      draw();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [draw]);

  // Mouse / Touch Tracking for Crosshair
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas || !chartData.length) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
    const x = clientX - rect.left;

    const padding = { left: 16, right: 65 };
    const chartW = rect.width - padding.left - padding.right;

    if (x < padding.left || x > padding.left + chartW) {
      setHoverData(null);
      return;
    }

    const relX = (x - padding.left) / chartW;
    const index = Math.min(chartData.length - 1, Math.max(0, Math.round(relX * (chartData.length - 1))));
    const item = chartData[index];

    if (item) {
      const openPrice = stock.openingPrice || item.price;
      const diff = item.price - openPrice;
      const diffPct = openPrice > 0 ? (diff / openPrice) * 100 : 0;

      setHoverData({
        index,
        price: item.price,
        timeStr: item.timeStr,
        diff,
        diffPct
      });
    }
  };

  const handlePointerLeave = () => {
    setHoverData(null);
  };

  const isUp = (stock?.changePercent || 0) >= 0;

  return (
    <div
      ref={containerRef}
      className="w-full bg-[#121720] border border-[#232B3B] rounded-xl p-4 flex flex-col justify-between select-none"
    >
      {/* Chart Top Telemetry Strip */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 border-b border-[#1E2638] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-[#1A202C] border border-[#232B3B] flex items-center justify-center font-mono font-bold text-xs text-[#06B6D4]">
            {stock.ticker.split("-")[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-wide">{stock.name}</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#0A0D12] text-slate-400 border border-[#232B3B]">
                {stock.ticker}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-medium">{stock.sector}</div>
          </div>
        </div>

        {/* Live Hover Telemetry vs Current Price */}
        <div className="flex items-center gap-3">
          {hoverData ? (
            <div className="text-right">
              <div className="text-base font-black font-mono text-white">
                ₹{hoverData.price.toFixed(2)}
              </div>
              <div
                className={`text-[10px] font-bold font-mono ${
                  hoverData.diff >= 0 ? "text-[#10B981]" : "text-[#E10600]"
                }`}
              >
                {hoverData.diff >= 0 ? "+" : ""}
                {hoverData.diff.toFixed(2)} ({hoverData.diffPct >= 0 ? "+" : ""}
                {hoverData.diffPct.toFixed(2)}%) • {hoverData.timeStr}
              </div>
            </div>
          ) : (
            <div className="text-right">
              <div className="text-base font-black font-mono text-white">
                ₹{stock.currentPrice.toFixed(2)}
              </div>
              <div
                className={`text-[10px] font-bold font-mono inline-flex items-center gap-0.5 ${
                  isUp ? "text-[#10B981]" : "text-[#E10600]"
                }`}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                <span>
                  {isUp ? "+" : ""}
                  {stock.changePercent}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canvas Element with Responsive Sizing */}
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

      {/* Chart Footer Controls & High/Low Telemetry */}
      {showControls && (
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-[#1E2638] mt-2 text-xs">
          {/* Day High / Low Stats */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="text-slate-400">
              HIGH: <strong className="text-[#10B981]">₹{(stock.dayHigh || stock.currentPrice).toFixed(2)}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              LOW: <strong className="text-[#E10600]">₹{(stock.dayLow || stock.currentPrice).toFixed(2)}</strong>
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400">
              OPEN: <strong className="text-white">₹{(stock.openingPrice || stock.currentPrice).toFixed(2)}</strong>
            </span>
          </div>

          {/* Timeframe & Display Buttons */}
          <div className="flex items-center gap-1.5">
            {["1M", "5M", "15M", "ALL"].map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                  timeframe === tf
                    ? "bg-[#E10600] text-white"
                    : "bg-[#0A0D12] text-slate-400 hover:text-white border border-[#232B3B]"
                }`}
              >
                {tf}
              </button>
            ))}

            <div className="w-[1px] h-4 bg-[#232B3B] mx-1" />

            <button
              type="button"
              onClick={() => setChartType((prev) => (prev === "area" ? "line" : "area"))}
              className="p-1 rounded bg-[#0A0D12] text-slate-400 hover:text-white border border-[#232B3B] transition-colors"
              title="Toggle Area/Line Mode"
            >
              <Activity className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
