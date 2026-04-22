
// Dashboard 3: Vital — Health & Fitness (warm light, rings)
const { useState, useEffect, useRef } = React;

function HeartRateChart({ data, color = '#f43f5e', height = 80 }) {
  const ref = useRef();
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr; canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.clearRect(0, 0, w, h);
    const min = Math.min(...data) - 5, max = Math.max(...data) + 5;
    const xS = i => (i / (data.length - 1)) * w;
    const yS = v => h - ((v - min) / (max - min)) * (h - 4) - 2;
    ctx.beginPath();
    data.forEach((v, i) => i === 0 ? ctx.moveTo(xS(i), yS(v)) : ctx.lineTo(xS(i), yS(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, color + '44'); grad.addColorStop(1, color + '00');
    ctx.lineTo(w, h); ctx.lineTo(0, h); ctx.closePath();
    ctx.fillStyle = grad; ctx.fill();
    // Latest dot
    const lx = xS(data.length - 1), ly = yS(data[data.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 7, 0, Math.PI * 2);
    ctx.strokeStyle = color + '55'; ctx.lineWidth = 2; ctx.stroke();
  }, [data, color]);
  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

const hrData = Array.from({ length: 48 }, (_, i) => 62 + Math.sin(i / 3) * 12 + Math.random() * 8);
const sleepData = [
  { label: 'Deep', hours: 1.8, color: '#6366f1' },
  { label: 'REM', hours: 2.1, color: '#8b5cf6' },
  { label: 'Light', hours: 3.4, color: '#a78bfa' },
  { label: 'Awake', hours: 0.7, color: '#e2e8f0' },
];

function VitalDashboard() {
  const [hrLive, setHrLive] = useState(72);
  const [hrHistory, setHrHistory] = useState(hrData.slice(-24));
  const [activeMetric, setActiveMetric] = useState('overview');
  const [bpm, setBpm] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const next = Math.round(65 + Math.random() * 20);
      setHrLive(next);
      setHrHistory(prev => [...prev.slice(1), next]);
      setBpm(b => !b);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const bg = '#faf8f5', card = '#ffffff', border = '#e8e2db';
  const rose = '#f43f5e', orange = '#f97316', violet = '#7c3aed', teal = '#0d9488';
  const text = '#1c1917', muted = '#9c9188';

  const metrics = [
    { label: 'Heart Rate', value: hrLive, unit: 'bpm', color: rose, icon: '♥', trend: '+2 vs yesterday' },
    { label: 'Steps', value: 8240, unit: 'steps', color: orange, icon: '◈', trend: '82% of goal' },
    { label: 'Active Cal', value: 487, unit: 'kcal', color: violet, icon: '◉', trend: '+64 vs avg' },
    { label: 'Sleep', value: 7.9, unit: 'hrs', color: teal, icon: '◑', trend: 'Good quality' },
  ];

  const workouts = [
    { name: 'Morning Run', dist: '5.2km', dur: '28min', cal: 312, date: 'Today 7:14am', color: orange },
    { name: 'Strength', dist: '—', dur: '45min', cal: 280, date: 'Yesterday 6:30pm', color: violet },
    { name: 'Cycling', dist: '18km', dur: '52min', cal: 410, date: 'Mon 7:00am', color: teal },
  ];

  const weekSteps = [6200, 9100, 7800, 5400, 8240, 0, 0];
  const weekLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const s = {
    root: { fontFamily: "'DM Sans', sans-serif", background: bg, color: text, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${border}`, background: card, flexShrink: 0 },
    body: { flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', gap: 16 },
    leftCol: { width: 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 12 },
    mainCol: { flex: 1, display: 'flex', flexDirection: 'column', gap: 12 },
    card: { background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
    cardTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: muted, marginBottom: 12 },
    metricCard: (color) => ({ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: 16, borderTop: `3px solid ${color}`, boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }),
  };

  return (
    <div style={s.root}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${rose}, ${orange})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14 }}>V</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>Vital Health</div>
            <div style={{ fontSize: 11, color: muted }}>Tuesday, April 22</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Overview','Activity','Sleep','Nutrition'].map(t => (
            <button key={t} onClick={() => setActiveMetric(t.toLowerCase())}
              style={{ padding: '6px 14px', borderRadius: 20, border: `1px solid ${activeMetric === t.toLowerCase() ? rose : border}`, background: activeMetric === t.toLowerCase() ? rose + '11' : 'transparent', color: activeMetric === t.toLowerCase() ? rose : muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all .15s' }}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: '#e8e2db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Alex K.</div>
            <div style={{ fontSize: 10, color: muted }}>28 · ♂</div>
          </div>
        </div>
      </div>

      <div style={s.body}>
        {/* Left: rings + hr live */}
        <div style={s.leftCol}>
          <div style={s.card}>
            <div style={s.cardTitle}>Daily Rings</div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
              <Ring pct={82} size={80} color={rose} bg="#fee2e822" label="Move" sublabel="487 kcal" thickness={8} />
              <Ring pct={67} size={80} color={orange} bg="#ffedd522" label="Exercise" sublabel="34 min" thickness={8} />
              <Ring pct={91} size={80} color={teal} bg="#ccfbf122" label="Stand" sublabel="11 hrs" thickness={8} />
            </div>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={s.cardTitle}>Heart Rate</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: rose }}>{hrLive}</span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: 10, color: muted }}>bpm</span>
                  <span style={{ fontSize: 9, color: rose, transition: 'opacity 0.3s', opacity: bpm ? 1 : 0.3 }}>●</span>
                </div>
              </div>
            </div>
            <HeartRateChart data={hrHistory} color={rose} height={72} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: muted }}>
              <span>Min: <strong style={{ color: text }}>58</strong></span>
              <span>Avg: <strong style={{ color: text }}>72</strong></span>
              <span>Max: <strong style={{ color: text }}>148</strong></span>
            </div>
          </div>

          <div style={s.card}>
            <div style={s.cardTitle}>Sleep Last Night</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <DonutChart size={80} thickness={14} segments={sleepData.map(s => ({ value: s.hours, color: s.color }))} />
              <div style={{ flex: 1 }}>
                {sleepData.map(s => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <div style={{ width: 7, height: 7, borderRadius: 2, background: s.color }} />
                      <span style={{ color: muted }}>{s.label}</span>
                    </div>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{s.hours}h</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: 10, padding: '8px 10px', background: teal + '11', borderRadius: 8, fontSize: 12, color: teal, textAlign: 'center' }}>
              7h 54m total · <strong>Good</strong>
            </div>
          </div>
        </div>

        {/* Main */}
        <div style={s.mainCol}>
          {/* Metrics row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {metrics.map((m, i) => (
              <div key={i} style={s.metricCard(m.color)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: muted, fontWeight: 600 }}>{m.label}</span>
                  <span style={{ color: m.color, fontSize: 16 }}>{m.icon}</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '-1px', color: m.color }}>
                  {typeof m.value === 'number' && m.value > 100 ? m.value.toLocaleString() : m.value}
                </div>
                <div style={{ fontSize: 10, color: muted, marginTop: 2 }}>{m.unit}</div>
                <div style={{ fontSize: 11, color: m.color, marginTop: 6, fontWeight: 500 }}>{m.trend}</div>
              </div>
            ))}
          </div>

          {/* Steps chart */}
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={s.cardTitle}>Weekly Steps</div>
              <span style={{ fontSize: 13, color: orange, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                Goal: <strong>10,000</strong>
              </span>
            </div>
            <BarChart data={weekSteps} labels={weekLabels} color={orange} height={130} />
          </div>

          {/* Recent Workouts */}
          <div style={s.card}>
            <div style={s.cardTitle}>Recent Workouts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {workouts.map((w, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', background: bg, borderRadius: 10, gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: w.color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', color: w.color, fontSize: 16, flexShrink: 0 }}>◈</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{w.name}</div>
                    <div style={{ fontSize: 11, color: muted, marginTop: 2 }}>{w.date}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {[['Dist', w.dist], ['Time', w.dur], ['Cal', w.cal + ' kcal']].map(([k, v]) => (
                      <div key={k} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{v}</div>
                        <div style={{ fontSize: 10, color: muted }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VitalDashboard });
