
// Shared chart + widget primitives — exported to window

const { useEffect, useRef, useState, useCallback } = React;

// ── Sparkline ──────────────────────────────────────────────────────────────
function Sparkline({ data, color = '#6366f1', height = 40, fill = true }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data), max = Math.max(...data);
    const range = max - min || 1;
    const pts = data.map((v, i) => [
      (i / (data.length - 1)) * w,
      h - ((v - min) / range) * (h - 4) - 2
    ]);
    ctx.beginPath();
    pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.stroke();
    if (fill) {
      ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
      const grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, color + '33');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fill();
    }
  }, [data, color, height, fill]);
  return <canvas ref={ref} width={200} height={height} style={{ width: '100%', height }} />;
}

// ── LineChart ──────────────────────────────────────────────────────────────
function LineChart({ series, labels, height = 200, grid = true }) {
  const ref = useRef();
  const [tooltip, setTooltip] = useState(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const pad = { top: 10, right: 10, bottom: 24, left: 36 };
    const allVals = series.flatMap(s => s.data);
    const min = 0, max = Math.max(...allVals) * 1.15;
    const iw = w - pad.left - pad.right, ih = h - pad.top - pad.bottom;
    const xScale = i => pad.left + (i / (labels.length - 1)) * iw;
    const yScale = v => pad.top + ih - ((v - min) / (max - min)) * ih;

    if (grid) {
      ctx.strokeStyle = '#ffffff0f';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = pad.top + (ih / 4) * i;
        ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iw, y); ctx.stroke();
      }
    }
    // x labels
    ctx.fillStyle = '#888';
    ctx.font = '10px DM Mono, monospace';
    ctx.textAlign = 'center';
    labels.forEach((l, i) => {
      if (i % Math.ceil(labels.length / 6) === 0)
        ctx.fillText(l, xScale(i), h - 6);
    });

    series.forEach(({ data, color, name }) => {
      const pts = data.map((v, i) => [xScale(i), yScale(v)]);
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      // fill
      ctx.save();
      ctx.beginPath();
      pts.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
      ctx.lineTo(xScale(data.length - 1), pad.top + ih);
      ctx.lineTo(xScale(0), pad.top + ih);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ih);
      grad.addColorStop(0, color + '2a');
      grad.addColorStop(1, color + '00');
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.restore();
    });
  }, [series, labels]);

  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

// ── BarChart ───────────────────────────────────────────────────────────────
function BarChart({ data, labels, color = '#6366f1', height = 160, horizontal = false }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const pad = { top: 8, right: 8, bottom: 24, left: horizontal ? 64 : 8 };
    const max = Math.max(...data) * 1.1;
    const iw = w - pad.left - pad.right, ih = h - pad.top - pad.bottom;

    if (horizontal) {
      const barH = ih / data.length * 0.6;
      const gap = ih / data.length;
      data.forEach((v, i) => {
        const barW = (v / max) * iw;
        const y = pad.top + i * gap + (gap - barH) / 2;
        const grad = ctx.createLinearGradient(pad.left, 0, pad.left + barW, 0);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '77');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(pad.left, y, barW, barH, 3);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = '10px DM Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(labels[i], pad.left - 6, y + barH / 2 + 3);
      });
    } else {
      const barW = iw / data.length * 0.6;
      const gap = iw / data.length;
      data.forEach((v, i) => {
        const barH = (v / max) * ih;
        const x = pad.left + i * gap + (gap - barW) / 2;
        const grad = ctx.createLinearGradient(0, pad.top + ih - barH, 0, pad.top + ih);
        grad.addColorStop(0, color);
        grad.addColorStop(1, color + '77');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, pad.top + ih - barH, barW, barH, [3, 3, 0, 0]);
        ctx.fill();
        ctx.fillStyle = '#888';
        ctx.font = '10px DM Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(labels[i], x + barW / 2, h - 6);
      });
    }
  }, [data, labels, color, height]);
  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

// ── DonutChart ─────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 120, thickness = 22 }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(null);
  const total = segments.reduce((s, x) => s + x.value, 0);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = size / 2 - 8;
    let angle = -Math.PI / 2;
    segments.forEach(({ value, color }, i) => {
      const sweep = (value / total) * Math.PI * 2;
      const isHov = hovered === i;
      ctx.beginPath();
      ctx.arc(cx, cy, r + (isHov ? 4 : 0), angle, angle + sweep);
      ctx.arc(cx, cy, r - thickness + (isHov ? 4 : 0), angle + sweep, angle, true);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      if (i < segments.length - 1) {
        ctx.strokeStyle = '#0002';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      angle += sweep;
    });
  }, [segments, hovered, size, thickness]);

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <canvas ref={ref} style={{ width: size, height: size }} />
    </div>
  );
}

// ── Ring ───────────────────────────────────────────────────────────────────
function Ring({ pct, size = 80, color, bg = '#ffffff18', label, sublabel, thickness = 8 }) {
  const ref = useRef();
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    let frame;
    let start = null;
    const duration = 900;
    const animate = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(pct * ease));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [pct]);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = size * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, size, size);
    const cx = size / 2, cy = size / 2, r = size / 2 - thickness / 2 - 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = bg;
    ctx.lineWidth = thickness;
    ctx.stroke();
    const sweep = (displayed / 100) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + sweep);
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [displayed, size, color, bg, thickness]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ position: 'relative' }}>
        <canvas ref={ref} style={{ width: size, height: size }} />
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size * 0.2, fontWeight: 700, lineHeight: 1 }}>{displayed}%</span>
        </div>
      </div>
      {label && <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>{label}</span>}
      {sublabel && <span style={{ fontSize: 10, opacity: 0.5 }}>{sublabel}</span>}
    </div>
  );
}

// ── AnimatedNumber ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, duration = 1000 }) {
  const [displayed, setDisplayed] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = to;
    let start = null;
    const animate = (ts) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplayed(from + (to - from) * ease);
      if (t < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);
  const fmt = decimals > 0 ? displayed.toFixed(decimals) : Math.round(displayed).toLocaleString();
  return <span>{prefix}{fmt}{suffix}</span>;
}

// ── StatusDot ──────────────────────────────────────────────────────────────
function StatusDot({ status }) {
  const colors = { ok: '#22c55e', warn: '#f59e0b', error: '#ef4444', idle: '#6b7280' };
  return (
    <span style={{
      display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
      background: colors[status] || '#6b7280',
      boxShadow: `0 0 6px ${colors[status] || '#6b7280'}99`
    }} />
  );
}

// ── Gauge ──────────────────────────────────────────────────────────────────
function Gauge({ value, max = 100, color = '#6366f1', size = 100, label }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr; canvas.height = (size * 0.6) * dpr;
    ctx.scale(dpr, dpr);
    const w = size, h = size * 0.6;
    ctx.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h - 4, r = w / 2 - 10;
    const startA = Math.PI, endA = 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, endA);
    ctx.strokeStyle = '#ffffff18';
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
    const sweep = startA + (value / max) * Math.PI;
    ctx.beginPath();
    ctx.arc(cx, cy, r, startA, sweep);
    ctx.strokeStyle = color;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.stroke();
  }, [value, max, color, size]);
  return (
    <div style={{ textAlign: 'center' }}>
      <canvas ref={ref} style={{ width: size, height: size * 0.6 }} />
      {label && <div style={{ fontSize: 11, opacity: 0.6, marginTop: -4 }}>{label}</div>}
    </div>
  );
}

// ── Heatmap ────────────────────────────────────────────────────────────────
function Heatmap({ data, color = '#6366f1', rows = 7, cols = 24 }) {
  const max = Math.max(...data.flat());
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 2 }}>
      {data.flat().map((v, i) => (
        <div key={i} title={`${v}`} style={{
          aspectRatio: '1', borderRadius: 2,
          background: v === 0 ? '#ffffff0a' : color,
          opacity: v === 0 ? 1 : 0.15 + (v / max) * 0.85,
          transition: 'opacity 0.2s',
          cursor: 'default'
        }} />
      ))}
    </div>
  );
}

Object.assign(window, {
  Sparkline, LineChart, BarChart, DonutChart, Ring,
  AnimatedNumber, StatusDot, Gauge, Heatmap
});
