
// Dashboard 5: Merchant — E-commerce (clean white, coral accents)
const { useState, useEffect } = React;

const PRODUCTS = [
  { name: 'Arc Desk Lamp', sku: 'LMP-001', sold: 842, revenue: 75978, stock: 234, trend: 12.4, img: '💡' },
  { name: 'Linen Throw Pillow', sku: 'PIL-044', sold: 1240, revenue: 43400, stock: 89, trend: 8.1, img: '🛋' },
  { name: 'Walnut Side Table', sku: 'TBL-012', sold: 318, revenue: 95400, stock: 42, trend: -3.2, img: '🪑' },
  { name: 'Ceramic Planter', sku: 'PLT-008', sold: 2104, revenue: 58912, stock: 521, trend: 28.7, img: '🪴' },
  { name: 'Woven Storage Basket', sku: 'BSK-019', sold: 690, revenue: 20700, stock: 317, trend: 5.5, img: '🧺' },
];

const ORDERS = [
  { id: '#48291', customer: 'Mia Torres', items: 3, total: 284.50, status: 'Delivered', time: '2m ago' },
  { id: '#48290', customer: 'Luca Bianchi', items: 1, total: 119.00, status: 'Shipped', time: '18m ago' },
  { id: '#48289', customer: 'Sara Chen', items: 5, total: 512.80, status: 'Processing', time: '34m ago' },
  { id: '#48288', customer: 'James Park', items: 2, total: 198.00, status: 'Delivered', time: '1h ago' },
  { id: '#48287', customer: 'Nina Patel', items: 1, total: 89.00, status: 'Cancelled', time: '2h ago' },
  { id: '#48286', customer: 'Otto Fischer', items: 4, total: 376.20, status: 'Delivered', time: '3h ago' },
];

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const REV_DATA = [42000,51000,47000,58000,63000,71000,68000,76000,82000,89000,94000,104000];
const ORD_DATA = [310,380,350,420,460,510,490,540,590,640,670,750];

function MerchantDashboard() {
  const [sortBy, setSortBy] = useState('revenue');
  const [searchQ, setSearchQ] = useState('');
  const [view, setView] = useState('overview');

  const bg = '#f9f7f5', card = '#ffffff', border = '#eae6e1';
  const coral = '#f4623a', coralLight = '#fff1ee', teal = '#0d9488', violet = '#7c3aed';
  const text = '#1c1917', muted = '#9c9188', green = '#16a34a', red = '#dc2626';

  const statusColor = { Delivered: green, Shipped: teal, Processing: coral, Cancelled: red };
  const statusBg = { Delivered: '#dcfce7', Shipped: '#ccfbf1', Processing: coralLight, Cancelled: '#fee2e2' };

  const filteredProducts = PRODUCTS
    .filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()))
    .sort((a, b) => b[sortBy] - a[sortBy]);

  const totalRevenue = PRODUCTS.reduce((s, p) => s + p.revenue, 0);
  const totalOrders = 8472;

  const s = {
    root: { fontFamily: "'DM Sans', sans-serif", background: bg, color: text, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px', borderBottom: `1px solid ${border}`, background: card, flexShrink: 0 },
    body: { flex: 1, overflow: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16 },
    card: { background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
    label: { fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: muted, marginBottom: 12 },
    kpiCard: (accent) => ({ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.04)', borderBottom: `3px solid ${accent}` }),
    navBtn: (active) => ({ padding: '6px 16px', borderRadius: 20, border: `1px solid ${active ? coral : border}`, background: active ? coral : 'transparent', color: active ? '#fff' : muted, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500, transition: 'all .15s' }),
    badge: (status) => ({ display: 'inline-block', padding: '2px 9px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: statusBg[status], color: statusColor[status] }),
    input: { padding: '7px 12px', borderRadius: 8, border: `1px solid ${border}`, background: bg, fontSize: 12, fontFamily: "'DM Sans', sans-serif", color: text, outline: 'none' },
  };

  return (
    <div style={s.root}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: coral, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 13 }}>M</div>
          <span style={{ fontWeight: 700, fontSize: 15, letterSpacing: '-0.3px' }}>Merchant</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['Overview','Products','Orders','Customers','Analytics'].map(t => (
            <button key={t} style={s.navBtn(view === t.toLowerCase())} onClick={() => setView(t.toLowerCase())}>{t}</button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: green, background: '#dcfce7', padding: '4px 10px', borderRadius: 20, fontWeight: 600 }}>
            <StatusDot status="ok" /> Store Live
          </div>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: coral + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
        </div>
      </div>

      <div style={s.body}>
        {/* KPI row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {[
            { label: 'Total Revenue', value: '$' + (totalRevenue / 1000).toFixed(0) + 'k', sub: '+18.4% vs last month', color: coral, spark: REV_DATA.slice(-8) },
            { label: 'Orders Today', value: '127', sub: '+12 in last hour', color: teal, spark: ORD_DATA.slice(-8) },
            { label: 'Avg Order Value', value: '$' + (totalRevenue / totalOrders).toFixed(0), sub: '+$4.20 this week', color: violet, spark: [88,90,91,89,93,95,94,96] },
            { label: 'Conversion Rate', value: '3.8%', sub: '↑ from 3.2% last week', color: '#d97706', spark: [2.8,3.0,3.1,3.0,3.3,3.5,3.6,3.8] },
          ].map((k, i) => (
            <div key={i} style={s.kpiCard(k.color)}>
              <div style={s.label}>{k.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono', monospace", letterSpacing: '-1px', color: k.color }}>{k.value}</div>
              <div style={{ fontSize: 11, color: muted, marginTop: 4, marginBottom: 6 }}>{k.sub}</div>
              <Sparkline data={k.spark} color={k.color} height={32} fill={true} />
            </div>
          ))}
        </div>

        {/* Revenue chart + orders */}
        <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 14 }}>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <div style={s.label}>Revenue</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  ['Revenue', coral],
                  ['Orders', teal],
                ].map(([l, c]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: muted }}>
                    <div style={{ width: 10, height: 3, background: c, borderRadius: 1 }} />
                    {l}
                  </div>
                ))}
              </div>
            </div>
            <LineChart
              series={[
                { name: 'Revenue', color: coral, data: REV_DATA.map(v => v / 1000) },
                { name: 'Orders', color: teal, data: ORD_DATA },
              ]}
              labels={MONTHS}
              height={170}
            />
          </div>

          <div style={s.card}>
            <div style={s.label}>Recent Orders</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {ORDERS.slice(0, 5).map((o, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 8px', borderRadius: 8, background: bg }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{o.customer}</div>
                    <div style={{ fontSize: 10, color: muted }}>{o.id} · {o.time}</div>
                  </div>
                  <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 13 }}>${o.total.toFixed(0)}</div>
                  <div style={s.badge(o.status)}>{o.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Products table */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={s.label}>Top Products</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input style={s.input} placeholder="Search products..." value={searchQ} onChange={e => setSearchQ(e.target.value)} />
              <select style={{ ...s.input, cursor: 'pointer' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="revenue">Sort: Revenue</option>
                <option value="sold">Sort: Units Sold</option>
                <option value="stock">Sort: Stock</option>
              </select>
            </div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ color: muted, borderBottom: `1px solid ${border}` }}>
                {['Product','SKU','Units Sold','Revenue','Stock','Trend'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '6px 10px', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${border}`, transition: 'background .1s', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.background = bg}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '10px 10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: coralLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{p.img}</div>
                      <span style={{ fontWeight: 600 }}>{p.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px', color: muted, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{p.sku}</td>
                  <td style={{ padding: '10px', fontFamily: "'DM Mono', monospace" }}>{p.sold.toLocaleString()}</td>
                  <td style={{ padding: '10px', fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>${p.revenue.toLocaleString()}</td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontFamily: "'DM Mono', monospace" }}>{p.stock}</span>
                      {p.stock < 100 && <span style={{ fontSize: 10, color: coral, fontWeight: 600 }}>Low</span>}
                    </div>
                  </td>
                  <td style={{ padding: '10px', color: p.trend > 0 ? green : red, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>
                    {p.trend > 0 ? '▲' : '▼'} {Math.abs(p.trend)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MerchantDashboard });
