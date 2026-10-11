import { useRef, useEffect } from "react";

export default function MiniSparklineCanvas({ sparkline, isPositive, width = 90, height = 32 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !sparkline || sparkline.length < 2) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...sparkline);
    const max = Math.max(...sparkline);
    const range = max - min || 1;

    const getX = (i) => (i / (sparkline.length - 1)) * (width - 4) + 2;
    const getY = (val) => height - 3 - ((val - min) / range) * (height - 6);

    const strokeColor = isPositive ? "#10B981" : "#E10600";
    const gradientTop = isPositive ? "rgba(16, 185, 129, 0.25)" : "rgba(225, 6, 0, 0.25)";
    const gradientBottom = isPositive ? "rgba(16, 185, 129, 0.0)" : "rgba(225, 6, 0, 0.0)";

    // Gradient fill
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, gradientTop);
    gradient.addColorStop(1, gradientBottom);

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(sparkline[0]));
    for (let i = 1; i < sparkline.length; i++) {
      ctx.lineTo(getX(i), getY(sparkline[i]));
    }
    ctx.lineTo(getX(sparkline.length - 1), height);
    ctx.lineTo(getX(0), height);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Line
    ctx.beginPath();
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = 1.5;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    ctx.moveTo(getX(0), getY(sparkline[0]));
    for (let i = 1; i < sparkline.length; i++) {
      ctx.lineTo(getX(i), getY(sparkline[i]));
    }
    ctx.stroke();
  }, [sparkline, isPositive, width, height]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px` }}
      className="shrink-0 block"
    />
  );
}
