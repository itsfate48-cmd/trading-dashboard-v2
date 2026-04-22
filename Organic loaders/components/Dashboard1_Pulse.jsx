
// Dashboard 1: Pulse — SaaS Analytics (dark, indigo)
const { useState, useEffect, useRef } = React;

const PULSE_DATA = {
  kpis: [
    { label: 'Monthly Revenue', value: 284750, prev: 261200, prefix: '$', suffix: '', fmt: 'k' },
    { label: 'Active Users', value: 48291, prev: 43100, prefix: '', suffix: '', fmt: 'k' },
    { label: 'Conversion Rate', value: 4.7, prev: 4.1, prefix: '', suffix: '%', fmt: 'pct' },
    { label: 'Churn Rate', value: 1.2, prev: 1.8, prefix: '', suffix: '%', fmt: 'pct', inverse: true },
  ],
  revenueLabels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
  revenueSeries: [
    { name: 'MRR', color: '#818cf8', data: [180,195,210,198,225,240,258,245,261,271,284,284] },
    { name: 'ARR Target', color: '#f472b6', data: [200,210,220,230,240,250,260,270,280,290,300,310] },
  ],
  topPages: [
    { name: '/dashboard', views: 18420, pct: 94 },
    { name: '/reports', views: 12310, pct: 63 },
    { name: '/settings', views: 8901, pct: 45 },
    { name: '/billing', views: 5230, pct: 27 },
    { name: '/integrations', views: 3180, pct: 16 },
  ],
  events: [
    { time: '2m ago', text: 'New Enterprise signup — Acme Corp', type: 'ok' },
    { time: '14m ago', text: 'Payment failed — retry scheduled', type: 'warn' },
    { time: '31m ago', text: 'API rate limit hit — Plan upgraded', type: 'ok' },
    { time: '1h ago', text: 'Webhook timeout — Slack integration', type: 'error' },
    { time: '2h ago', text: 'New workspace — Globex Inc', type: 'ok' },
  ],
  sparklines: [
    [120,135,128,144,138,160,155,172,168,184],
    [40200,42100,41800,43900,45100,46200,47000,48291],
    [3.8,4.0,3.9,4.1,4.3,4.5,4.6,4.7],
    [2.1,1.9,1.8,1.7,1.6,1.5,1.4,1.2],
  ]
};

function PulseDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [period, setPeriod] = useState('12M');
  const bg = '#0f0f17';
  const card = '#16161f';
  const border = '#ffffff10';
  const accent = '#818cf8';
  const pink = '#f472b6';
  const text = '#e2e8f0';
  const muted = '#64748b';

  const kpiFormatted = PULSE_DATA.kpis.map((k, i) => {
    const change = ((k.value - k.prev) / k.prev * 100);
    const good = k.inverse ? change < 0 : change > 0;
    let display;
    if (k.fmt === 'k') display = k.value >= 1000 ? `${k.prefix}${(k.value/1000).toFixed(1)}k` : `${k.prefix}${k.value}`;
    else display = `${k.prefix}${k.value}${k.suffix}`;
    return { ...k, change, good, display };
  });

  const s = {
    root: { fontFamily: "'DM Sans', sans-serif", background: bg, color: text, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: `1px solid ${border}`, flexShrink: 0 },
    logo: { display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' },
    dot: { width: 22, height: 22, borderRadius: 6, background: `linear-gradient(135deg, ${accent}, ${pink})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 },
    nav: { display: 'flex', gap: 2 },
    navBtn: (active) => ({ padding: '6px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: active ? '#ffffff14' : 'transparent', color: active ? text : muted, transition: 'all .15s', fontFamily: 'inherit' }),
    body: { display: 'flex', flex: 1, overflow: 'hidden' },
    sidebar: { width: 200, borderRight: `1px solid ${border}`, padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 },
    sideItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 18px', cursor: 'pointer', fontSize: 13, color: active ? text : muted, background: active ? '#ffffff0a' : 'transparent', borderLeft: `2px solid ${active ? accent : 'transparent'}`, transition: 'all .15s' }),
    main: { flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
    row: { display: 'grid', gap: 12 },
    card: { background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16 },
    cardTitle: { fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: muted, marginBottom: 12 },
    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 },
    kpiVal: { fontSize: 28, fontWeight: 700, letterSpacing: '-1px', fontFamily: "'DM Mono', monospace" },
    kpiChange: (good) => ({ fontSize: 12, color: good ? '#4ade80' : '#f87171', fontWeight: 600, fontFamily: "'DM Mono', monospace" }),
    badge: (color) => ({ display: 'inline-block', padding: '1px 7px', borderRadius: 4, fontSize: 10, fontWeight: 700, background: color + '22', color }),
    periodBtn: (active) => ({ padding: '4px 10px', borderRadius: 5, border: `1px solid ${active ? accent : border}`, background: active ? accent + '22' : 'transparent', color: active ? accent : muted, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }),
  };

  const [sideActive, setSideActive] = useState('Overview');
  const sideItems = ['Overview','Revenue','Users','Funnels','Retention','Settings'];

  return (
    <div style={s.root}>
      {/* topbar */}
      <div style={s.topbar}>
        <div style={s.logo}>
          <div style={s.dot} />
          Pulse Analytics
        </div>
        <div style={s.nav}>
          {['Overview','Reports','Alerts'].map(t => (
            <button key={t} style={s.navBtn(activeTab === t.toLowerCase())} onClick={() => setActiveTab(t.toLowerCase())}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusDot status="ok" />
          <span style={{ fontSize: 12, color: muted }}>All systems operational</span>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, ${accent}, ${pink})`, marginLeft: 8 }} />
        </div>
      </div>

      <div style={s.body}>
        {/* sidebar */}
        <div style={s.sidebar}>
          {sideItems.map(item => (
            <div key={item} style={s.sideItem(sideActive === item)} onClick={() => setSideActive(item)}>{item}</div>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ ...s.sideItem(false), marginTop: 'auto' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: accent + '33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>JS</div>
            Jake S.
          </div>
        </div>

        {/* main */}
        <div style={s.main}>
          {/* header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>Good morning, Jake</div>
              <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>Here's what's happening with your product today.</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['7D','30D','3M','12M'].map(p => <button key={p} style={s.periodBtn(period === p)} onClick={() => setPeriod(p)}>{p}</button>)}
            </div>
          </div>

          {/* KPI cards */}
          <div style={s.kpiGrid}>
            {kpiFormatted.map((k, i) => (
              <div key={i} style={{ ...s.card, position: 'relative', overflow: 'hidden' }}>
                <div style={s.cardTitle}>{k.label}</div>
                <div style={s.kpiVal}>{k.display}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  <span style={s.kpiChange(k.good)}>{k.good ? '▲' : '▼'} {Math.abs(k.change).toFixed(1)}%</span>
                  <span style={{ fontSize: 11, color: muted }}>vs last period</span>
                </div>
                <div style={{ position: 'absolute', bottom: 0, right: 0, width: '60%', opacity: 0.6 }}>
                  <Sparkline data={PULSE_DATA.sparklines[i]} color={i === 3 ? '#f87171' : accent} height={40} />
                </div>
              </div>
            ))}
          </div>

          {/* Chart + events row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div style={s.cardTitle}>Revenue Trend</div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {PULSE_DATA.revenueSeries.map(s2 => (
                    <div key={s2.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: muted }}>
                      <div style={{ width: 12, height: 2, background: s2.color, borderRadius: 1 }} />
                      {s2.name}
                    </div>
                  ))}
                </div>
              </div>
              <LineChart series={PULSE_DATA.revenueSeries} labels={PULSE_DATA.revenueLabels} height={160} />
            </div>

            <div style={s.card}>
              <div style={s.cardTitle}>Recent Events</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PULSE_DATA.events.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                    <StatusDot status={e.type} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, lineHeight: 1.4 }}>{e.text}</div>
                      <div style={{ fontSize: 10, color: muted, marginTop: 1 }}>{e.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top pages + donut row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12 }}>
            <div style={s.card}>
              <div style={s.cardTitle}>Top Pages</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PULSE_DATA.topPages.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: muted, width: 22 }}>#{i+1}</span>
                    <span style={{ fontSize: 12, flex: 1, fontFamily: "'DM Mono', monospace" }}>{p.name}</span>
                    <div style={{ flex: 2, height: 4, background: '#ffffff0a', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${p.pct}%`, height: '100%', background: accent, borderRadius: 2, transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize: 11, color: muted, width: 50, textAlign: 'right', fontFamily: "'DM Mono', monospace" }}>{p.views.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <div style={s.cardTitle}>Traffic Sources</div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <DonutChart size={120} thickness={20} segments={[
                  { label: 'Organic', value: 42, color: accent },
                  { label: 'Direct', value: 28, color: pink },
                  { label: 'Referral', value: 18, color: '#34d399' },
                  { label: 'Social', value: 12, color: '#fbbf24' },
                ]} />
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {[['Organic', 42, accent],['Direct', 28, pink],['Referral', 18, '#34d399'],['Social', 12, '#fbbf24']].map(([label, val, color]) => (
                    <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: color, flexShrink: 0 }} />
                      <span style={{ flex: 1, color: muted }}>{label}</span>
                      <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{val}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { PulseDashboard });
