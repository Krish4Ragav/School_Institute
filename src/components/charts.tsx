import React, { useEffect, useState } from "react";

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
}

const palette = ["#2563eb", "#22c55e", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4", "#ea580c", "#14b8a6"];

function useAnimated(active: boolean, duration = 700) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (active) {
      const t = window.setTimeout(() => setProgress(1), 60);
      return () => window.clearTimeout(t);
    }
    setProgress(0);
  }, [active, duration]);
  return progress;
}

/* ================= DONUT ================= */
export function Donut({
  data,
  size = 180,
  thickness = 22,
  center,
  centerSub,
}: {
  data: ChartDatum[];
  size?: number;
  thickness?: number;
  center?: React.ReactNode;
  centerSub?: React.ReactNode;
}) {
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const progress = useAnimated(true);
  let offset = 0;
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setLoaded(true), 50);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Donut chart">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness} />
        {data.map((d, i) => {
          const frac = Math.max(0, d.value) / total;
          const dash = frac * C;
          const segment = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={d.color ?? palette[i % palette.length]}
              strokeWidth={thickness}
              strokeDasharray={`${dash * progress} ${C}`}
              strokeDashoffset={-offset * progress}
              strokeLinecap="butt"
              style={{ transform: `rotate(-90deg)`, transformOrigin: "center", transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1), stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
            />
          );
          offset += dash;
          return segment;
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        {loaded && (
          <>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "1.7rem", fontWeight: 800, lineHeight: 1 }}>{center}</div>
            {centerSub && <div style={{ fontSize: "0.72rem", color: "var(--text-3)", fontWeight: 600 }}>{centerSub}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export function DonutLegend({ data }: { data: ChartDatum[] }) {
  return (
    <div className="legend">
      {data.map((d, i) => (
        <span key={i} className="li">
          <span className="swatch" style={{ background: d.color ?? palette[i % palette.length] }} />
          {d.label} · <b>{d.value}</b>
        </span>
      ))}
    </div>
  );
}

/* ================= BARS ================= */
export function Bars({
  data,
  height = 210,
  format,
  highlightLast,
}: {
  data: ChartDatum[];
  height?: number;
  format?: (v: number) => string;
  highlightLast?: boolean;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div>
      <div role="img" aria-label="Bar chart" style={{ display: "flex", alignItems: "flex-end", gap: 14, height, padding: "12px 8px 0" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, height: "100%", justifyContent: "flex-end" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-2)", fontVariantNumeric: "tabular-nums" }}>
              {format ? format(d.value) : d.value}
            </div>
            <div
              className="bbar"
              style={{
                width: "100%",
                maxWidth: 44,
                background: (highlightLast && i === data.length - 1 ? "var(--brand-700)" : (d.color ?? palette[i % palette.length])),
                borderRadius: "8px 8px 4px 4px",
                height: `${Math.max(3, (d.value / max) * (height - 42))}px`,
                animation: `barGrow 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s both`,
                transformOrigin: "bottom",
              }}
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 14, padding: "0 8px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontSize: 11, color: "var(--text-3)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* Add keyframes via a style tag — once. */
if (!document.getElementById("chart-keyframes")) {
  const style = document.createElement("style");
  style.id = "chart-keyframes";
  style.textContent = `
    @keyframes barGrow {
      from { transform: scaleY(0); opacity: 0.2; }
      to { transform: scaleY(1); opacity: 1; }
    }
    @keyframes lineDraw {
      to { stroke-dashoffset: 0; }
    }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: none; }
    }
  `;
  document.head.appendChild(style);
}

/* ================= LINE ================= */
export function Line({
  data,
  height = 220,
  color = "var(--brand-600)",
  format,
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
  format?: (v: number) => string;
}) {
  const W = 560;
  const H = 220;
  const padX = 26;
  const padY = 18;
  const max = Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;
  const pts = data.map((d, i) => {
    const x = padX + (i * (W - padX * 2)) / Math.max(1, data.length - 1);
    const y = padY + (1 - (d.value - min) / range) * (H - padY * 2);
    return { x, y };
  });
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1]?.x} ${H - padY} L ${pts[0]?.x} ${H - padY} Z`;
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setDrawn(true), 80);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={height} role="img" aria-label="Line chart" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={padX}
            y1={padY + f * (H - padY * 2)}
            x2={W - padX}
            y2={padY + f * (H - padY * 2)}
            stroke="var(--border)"
            strokeDasharray="4 4"
            strokeWidth={1}
          />
        ))}
        <path d={areaPath} fill="url(#lineFill)" opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.6s 0.2s" }} />
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray="1"
          strokeDashoffset={drawn ? 0 : 1}
          style={{ animation: "lineDraw 0.9s var(--ease-out) both", transition: "opacity 0.4s" }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4.5} fill="var(--surface)" stroke={color} strokeWidth={2.5} opacity={drawn ? 1 : 0} style={{ transition: "opacity 0.3s" }} />
            <title>{`${data[i].label}: ${format ? format(data[i].value) : data[i].value}`}</title>
          </g>
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 6px 0" }}>
        {data.map((d, i) => (
          <div key={i} style={{ fontSize: 11, color: "var(--text-3)", fontWeight: 600, textAlign: "center" }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= RADIAL ================= */
export function Radial({ pct, size = 120, color, label }: { pct: number; size?: number; color?: string; label?: string }) {
  const thickness = 10;
  const r = (size - thickness) / 2;
  const C = 2 * Math.PI * r;
  const [prog, setProg] = useState(0);
  useEffect(() => {
    const t = window.setTimeout(() => setProg(Math.min(100, pct)), 80);
    return () => window.clearTimeout(t);
  }, [pct]);
  const c = color ?? "var(--brand-600)";
  return (
    <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--surface-3)" strokeWidth={thickness} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={c}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C - (C * prog) / 100}
          style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.9s cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 800 }}>{Math.round(prog)}%</span>
        {label && <span style={{ fontSize: 10, color: "var(--text-3)", fontWeight: 600 }}>{label}</span>}
      </div>
    </div>
  );
}