
// App.jsx — Gallery + Router
const { useState, useEffect } = React;

const DASHBOARDS = [
  {
    id: 'pulse',
    name: 'Pulse',
    tagline: 'SaaS Analytics',
    desc: 'Real-time MRR, user growth, funnel metrics, traffic sources.',
    palette: ['#818cf8', '#f472b6'],
    bg: '#0f0f17',
    component: 'PulseDashboard',
    tags: ['Dark', 'SaaS', 'Charts'],
  },
  {
    id: 'ledger',
    name: 'Ledger',
    tagline: 'Finance & Trading',
    desc: 'Live candlestick charts, order book, portfolio P&L.',
    palette: ['#22c55e', '#ef4444'],
    bg: '#0a0e14',
    component: 'LedgerDashboard',
    tags: ['Dark', 'Finance', 'Live'],
  },
  {
    id: 'vital',
    name: 'Vital',
    tagline: 'Health & Fitness',
    desc: 'Activity rings, live heart rate, sleep stages, workouts.',
    palette: ['#f43f5e', '#f97316'],
    bg: '#faf8f5',
    component: 'VitalDashboard',
    tags: ['Light', 'Health', 'Rings'],
  },
  {
    id: 'forge',
    name: 'Forge',
    tagline: 'DevOps Monitor',
    desc: 'Service health, live logs, response percentiles, uptime.',
    palette: ['#f59e0b', '#38bdf8'],
    bg: '#080d14',
    component: 'ForgeDashboard',
    tags: ['Dark', 'DevOps', 'Live'],
  },
  {
    id: 'merchant',
    name: 'Merchant',
    tagline: 'E-commerce',
    desc: 'Revenue trends, order pipeline, top products, inventory.',
    palette: ['#f4623a', '#0d9488'],
    bg: '#f9f7f5',
    component: 'MerchantDashboard',
    tags: ['Light', 'E-comm', 'Tables'],
  },
  {
    id: 'stockpot',
    name: 'Stockpot',
    tagline: 'Trading Dashboard',
    desc: 'Stocks & crypto side-by-side, live charts, DCA tracker, watchlist.',
    palette: ['#1e88ff', '#f7931a'],
    bg: '#0a0e27',
    component: 'StockpotDashboard',
    tags: ['Dark', 'Trading', 'Dual-Col'],
  },
];

function DashCard({ dash, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: dash.bg,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        border: `1px solid ${hovered ? dash.palette[0] + '88' : '#ffffff18'}`,
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered ? `0 20px 40px rgba(0,0,0,0.3), 0 0 0 1px ${dash.palette[0]}44` : '0 4px 12px rgba(0,0,0,0.2)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Preview strip */}
      <div style={{
        height: 120,
        background: `linear-gradient(135deg, ${dash.palette[0]}22, ${dash.palette[1]}11)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative chart lines */}
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.5 }}>
          <polyline points="0,80 40,55 80,65 120,40 160,50 200,30 240,45 280,25 320,35 360,20"
            fill="none" stroke={dash.palette[0]} strokeWidth="2" />
          <polyline points="0,90 40,75 80,85 120,60 160,70 200,55 240,65 280,45 320,55 360,40"
            fill="none" stroke={dash.palette[1]} strokeWidth="1.5" strokeDasharray="4 2" />
          {[0,1,2,3,4].map(i => (
            <rect key={i} x={20 + i * 60} y={100 - (30 + i * 10 + Math.sin(i) * 10)} width={20} height={30 + i * 10 + Math.sin(i) * 10}
              fill={dash.palette[0] + '33'} rx="3" />
          ))}
        </svg>
        <div style={{
          background: `linear-gradient(135deg, ${dash.palette[0]}, ${dash.palette[1]})`,
          borderRadius: 10,
          padding: '8px 14px',
          fontSize: 22,
          fontWeight: 800,
          color: '#fff',
          letterSpacing: '-0.5px',
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: `0 4px 16px ${dash.palette[0]}66`,
          position: 'relative',
          zIndex: 1,
        }}>{dash.name}</div>
      </div>

      {/* Info */}
      <div style={{ padding: '14px 16px', flex: 1 }}>
        <div style={{ fontSize: 12, color: dash.palette[0], fontWeight: 700, marginBottom: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{dash.tagline}</div>
        <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{dash.desc}</div>
        <div style={{ display: 'flex', gap: 5, marginTop: 12, flexWrap: 'wrap' }}>
          {dash.tags.map(t => (
            <span key={t} style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: '#ffffff0f', color: '#64748b' }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Open button */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #ffffff0a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: 12, color: hovered ? dash.palette[0] : '#4b5563',
        transition: 'color 0.2s',
      }}>
        <span>Open dashboard</span>
        <span style={{ fontSize: 16 }}>→</span>
      </div>
    </div>
  );
}

function App() {
  const [active, setActive] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  // Persist last open dashboard
  useEffect(() => {
    const saved = localStorage.getItem('organic-loaders-dash');
    if (saved) setActive(saved);
  }, []);

  const openDash = (id) => {
    setTransitioning(true);
    setTimeout(() => {
      setActive(id);
      localStorage.setItem('organic-loaders-dash', id);
      setTransitioning(false);
    }, 180);
  };

  const closeDash = () => {
    setTransitioning(true);
    setTimeout(() => {
      setActive(null);
      localStorage.removeItem('organic-loaders-dash');
      setTransitioning(false);
    }, 180);
  };

  const activeDash = DASHBOARDS.find(d => d.id === active);
  const DashComp = activeDash ? window[activeDash.component] : null;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#080b10',
      fontFamily: "'DM Sans', sans-serif",
      color: '#e2e8f0',
    }}>
      {/* Dashboard overlay */}
      {active && DashComp && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          opacity: transitioning ? 0 : 1,
          transition: 'opacity 0.18s ease',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Back bar */}
          <div style={{
            background: '#000000cc',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #ffffff12',
            padding: '8px 16px',
            display: 'flex', alignItems: 'center', gap: 12,
            zIndex: 101, flexShrink: 0,
          }}>
            <button onClick={closeDash} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#ffffff12', border: '1px solid #ffffff1a', color: '#e2e8f0',
              borderRadius: 6, padding: '5px 12px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
            }}>← Back</button>
            <div style={{ display: 'flex', gap: 8 }}>
              {DASHBOARDS.map(d => (
                <button key={d.id} onClick={() => openDash(d.id)} style={{
                  padding: '4px 12px', borderRadius: 5,
                  border: `1px solid ${active === d.id ? d.palette[0] + '88' : '#ffffff1a'}`,
                  background: active === d.id ? d.palette[0] + '22' : 'transparent',
                  color: active === d.id ? d.palette[0] : '#64748b',
                  fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'all .15s',
                }}>{d.name}</button>
              ))}
            </div>
          </div>
          {/* Dashboard fills rest */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <DashComp />
          </div>
        </div>
      )}

      {/* Gallery */}
      <div style={{
        opacity: transitioning ? 0 : (active ? 0 : 1),
        pointerEvents: active ? 'none' : 'auto',
        transition: 'opacity 0.18s ease',
      }}>
        {/* Hero */}
        <div style={{ padding: '64px 48px 40px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-block', fontSize: 11, fontWeight: 700, letterSpacing: '0.14em',
            textTransform: 'uppercase', color: '#6366f1', background: '#6366f122',
            padding: '4px 14px', borderRadius: 20, marginBottom: 20,
          }}>5 Dashboard Prototypes</div>
          <h1 style={{
            fontSize: 52, fontWeight: 800, letterSpacing: '-2px', margin: '0 0 16px',
            background: 'linear-gradient(135deg, #e2e8f0 40%, #6366f1)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            lineHeight: 1.1,
          }}>Modern Dashboards</h1>
          <p style={{ fontSize: 16, color: '#64748b', maxWidth: 480, margin: '0 auto' }}>
            Five fully interactive prototypes. Each is clickable, live-updating, and production-quality.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 20, padding: '0 48px 64px', maxWidth: 1600, margin: '0 auto',
        }}>
          {DASHBOARDS.map(d => (
            <DashCard key={d.id} dash={d} onClick={() => openDash(d.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { App });
