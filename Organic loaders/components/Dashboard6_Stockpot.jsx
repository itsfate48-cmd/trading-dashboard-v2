
// Dashboard 6: Stockpot — Trading Dashboard (dark navy, blue accents)
const { useState, useEffect, useRef, useCallback } = React;

// ── Data ──────────────────────────────────────────────────────────────────
function genPriceSeries(start, end, days) {
  const arr = [start];
  for (let i = 1; i < days; i++) {
    const trend = (end - start) / days;
    const noise = (Math.random() - 0.48) * (start * 0.015);
    arr.push(Math.max(0, arr[arr.length - 1] + trend + noise));
  }
  arr[arr.length - 1] = end;
  return arr;
}

const TIMEFRAMES = { '1M': 30, '3M': 90, '6M': 180, '1Y': 365, 'All': 730 };

const STOCKS = [
  { sym: 'AAPL', name: 'Apple', price: 150.25, chg: 5.2, weekChg: 3.4, mcap: '$2.5T', vol: '52.3M', color: '#aaaaaa', qty: 50, avgCost: 138.20 },
  { sym: 'TSLA', name: 'Tesla', price: 245.80, chg: -2.1, weekChg: -1.8, mcap: '$780B', vol: '125M', color: '#cc0000', qty: 15, avgCost: 260.00 },
  { sym: 'GOOGL', name: 'Alphabet', price: 140.50, chg: 1.8, weekChg: 2.1, mcap: '$1.4T', vol: '28.5M', color: '#4285f4', qty: 30, avgCost: 128.50 },
  { sym: 'MSFT', name: 'Microsoft', price: 380.15, chg: 4.2, weekChg: 5.5, mcap: '$2.8T', vol: '22.1M', color: '#00a4ef', qty: 10, avgCost: 340.00 },
];

const CRYPTO = [
  { sym: 'BTC', name: 'Bitcoin', price: 42500, chg: 12.3, weekChg: 5.6, mcap: '$835B', vol: '$28B', color: '#f7931a' },
  { sym: 'ETH', name: 'Ethereum', price: 2250, chg: 8.5, weekChg: 3.2, mcap: '$270B', vol: '$15B', color: '#627eea' },
  { sym: 'SOL', name: 'Solana', price: 98.50, chg: 15.2, weekChg: 8.9, mcap: '$32B', vol: '$2.5B', color: '#9945ff' },
  { sym: 'XRP', name: 'Ripple', price: 2.45, chg: -3.1, weekChg: -2.4, mcap: '$130B', vol: '$1.8B', color: '#00aae4' },
];

const SIDE_MENU = [
  { label: 'Market', icon: '◈', sub: ['Stocks', 'Crypto'] },
  { label: 'Wallet', icon: '◉' },
  { label: 'Tools', icon: '◧' },
  { label: 'Community', icon: '◎' },
  { label: 'Settings', icon: '⊙' },
];

// ── PerformanceChart ───────────────────────────────────────────────────────
function PerformanceChart({ series, color = '#1e88ff', height = 200 }) {
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
    const pad = { top: 12, right: 12, bottom: 28, left: 60 };
    const iw = w - pad.left - pad.right, ih = h - pad.top - pad.bottom;
    const min = Math.min(...series) * 0.995, max = Math.max(...series) * 1.005;
    const xS = i => pad.left + (i / (series.length - 1)) * iw;
    const yS = v => pad.top + ih - ((v - min) / (max - min)) * ih;

    // Grid
    ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ih / 4) * i;
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iw, y); ctx.stroke();
      const val = max - ((max - min) / 4) * i;
      ctx.fillStyle = '#5a6a8a'; ctx.font = '10px DM Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText('$' + (val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(0)), pad.left - 5, y + 3);
    }

    // X labels
    ctx.fillStyle = '#5a6a8a'; ctx.font = '10px DM Mono, monospace'; ctx.textAlign = 'center';
    const step = Math.ceil(series.length / 5);
    series.forEach((_, i) => { if (i % step === 0) ctx.fillText(`D${i+1}`, xS(i), h - 6); });

    // Area fill
    const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + ih);
    grad.addColorStop(0, color + '44'); grad.addColorStop(1, color + '00');
    ctx.beginPath();
    series.forEach((v, i) => i === 0 ? ctx.moveTo(xS(i), yS(v)) : ctx.lineTo(xS(i), yS(v)));
    ctx.lineTo(xS(series.length - 1), pad.top + ih);
    ctx.lineTo(xS(0), pad.top + ih);
    ctx.closePath(); ctx.fillStyle = grad; ctx.fill();

    // Line
    ctx.beginPath();
    series.forEach((v, i) => i === 0 ? ctx.moveTo(xS(i), yS(v)) : ctx.lineTo(xS(i), yS(v)));
    ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();

    // End dot
    const lx = xS(series.length - 1), ly = yS(series[series.length - 1]);
    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2);
    ctx.fillStyle = color; ctx.fill();
    ctx.beginPath(); ctx.arc(lx, ly, 8, 0, Math.PI * 2);
    ctx.strokeStyle = color + '55'; ctx.lineWidth = 2; ctx.stroke();
  }, [series, color]);
  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

// ── HoldingsCard ───────────────────────────────────────────────────────────
function HoldingsCard({ title, total, pct, isUp, tfSeries, color }) {
  const [tf, setTf] = useState('1M');
  const bg = '#0f1535', border = '#1e3a6e', blue = '#1e88ff';
  const days = TIMEFRAMES[tf];
  const series = genPriceSeries(total * 0.88, total, Math.min(days, tfSeries.length));

  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: 20, boxShadow: `0 0 30px ${blue}11` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 11, color: '#5a6a8a', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>{title}</div>
          <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: '-1.5px', color: '#ffffff' }}>
            ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: isUp ? '#4caf50' : '#f44336', fontFamily: "'DM Mono', monospace" }}>
            {isUp ? '↑' : '↓'} {pct}%
          </div>
          <div style={{ fontSize: 11, color: '#5a6a8a', marginTop: 2 }}>All time</div>
        </div>
      </div>
      {/* Timeframe buttons */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
        {Object.keys(TIMEFRAMES).map(t => (
          <button key={t} onClick={() => setTf(t)} style={{
            padding: '4px 10px', borderRadius: 6,
            border: `1px solid ${tf === t ? blue : '#1e3a6e'}`,
            background: tf === t ? blue : 'transparent',
            color: tf === t ? '#fff' : '#5a6a8a',
            fontSize: 11, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600,
            transition: 'all .15s',
          }}>{t}</button>
        ))}
      </div>
      <PerformanceChart series={series} color={color} height={180} />
    </div>
  );
}

// ── HoldingsTable ──────────────────────────────────────────────────────────
function HoldingsTable({ data, isCrypto }) {
  const [hovered, setHovered] = useState(null);
  const bg = '#0f1535', border = '#1e3a6e', blue = '#1e88ff';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
      <div style={{ padding: '14px 16px 10px', borderBottom: `1px solid ${border}` }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Holdings</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#080d2288' }}>
            {['Asset', 'Price', '24h', 'Mkt Cap', 'Volume', '7D'].map(h => (
              <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Asset' ? 'left' : 'right', color: '#5a6a8a', fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, i) => (
            <tr key={item.sym}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ background: hovered === i ? '#1e88ff11' : i % 2 === 0 ? 'transparent' : '#ffffff04', borderBottom: `1px solid ${border}22`, cursor: 'pointer', transition: 'background .1s' }}>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: item.color + '33', border: `1px solid ${item.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: item.color, flexShrink: 0 }}>{item.sym[0]}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{item.sym}</div>
                    <div style={{ fontSize: 10, color: '#5a6a8a' }}>{item.name}</div>
                  </div>
                </div>
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'DM Mono', monospace", fontWeight: 600, color: '#fff' }}>
                {isCrypto && item.price >= 1000 ? '$' + item.price.toLocaleString() : '$' + item.price.toFixed(2)}
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'DM Mono', monospace", fontWeight: 700, color: item.chg >= 0 ? '#4caf50' : '#f44336' }}>
                {item.chg >= 0 ? '+' : ''}{item.chg}%
              </td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#b0b0b0', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{item.mcap}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', color: '#b0b0b0', fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{item.vol}</td>
              <td style={{ padding: '10px 12px', textAlign: 'right', fontFamily: "'DM Mono', monospace", fontWeight: 700, color: item.weekChg >= 0 ? '#4caf50' : '#f44336' }}>
                {item.weekChg >= 0 ? '+' : ''}{item.weekChg}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TOP_GAINERS = [
  { sym: 'NVDA', name: 'NVIDIA', weekChg: 18.4, price: 876.20, color: '#76b900' },
  { sym: 'META', name: 'Meta', weekChg: 14.1, price: 512.30, color: '#0082fb' },
  { sym: 'MSFT', name: 'Microsoft', weekChg: 5.5, price: 380.15, color: '#00a4ef' },
  { sym: 'AAPL', name: 'Apple', weekChg: 3.4, price: 150.25, color: '#aaaaaa' },
  { sym: 'GOOGL', name: 'Alphabet', weekChg: 2.1, price: 140.50, color: '#4285f4' },
];

function AIBlock({ prompt, title, icon, color }) {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const cardBg = '#0f1535', border = '#1e3a6e';
  useEffect(() => {
    let cancelled = false;
    setLoading(true); setText('');
    window.claude.complete(prompt).then(res => {
      if (!cancelled) { setText(res); setLoading(false); }
    }).catch(() => {
      if (!cancelled) { setText('Unable to load analysis.'); setLoading(false); }
    });
    return () => { cancelled = true; };
  }, [prompt]);
  return (
    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color }}>{title}</span>
      </div>
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <style>{`@keyframes shimmer{0%,100%{opacity:.3}50%{opacity:.8}}`}</style>
          {[90,75,85,60,80].map((w,i) => (
            <div key={i} style={{ height: 11, width: `${w}%`, background: '#ffffff0d', borderRadius: 6, animation: `shimmer 1.4s ease-in-out ${i*0.1}s infinite` }} />
          ))}
        </div>
      ) : (
        <div style={{ fontSize: 13, color: '#b0c4de', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{text}</div>
      )}
    </div>
  );
}

function StocksTab({ blue, border, muted, subtle, stockSeries }) {
  const green = '#4caf50', red = '#f44336', cardBg = '#0f1535';
  const totalValue = STOCKS.reduce((s, h) => s + h.price * h.qty, 0);
  const totalCost  = STOCKS.reduce((s, h) => s + h.avgCost * h.qty, 0);
  const totalPnL   = totalValue - totalCost;
  const totalPct   = (totalPnL / totalCost * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Header strip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: blue }} />
        <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: blue }}>Stocks Dashboard</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
          {[
            ['Portfolio Value', '$'+totalValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})],
            ['Total P&L', (totalPnL>=0?'+':'-')+'$'+Math.abs(totalPnL).toFixed(2)],
            ['Return', (totalPct>=0?'+':'')+totalPct.toFixed(2)+'%'],
          ].map(([label, val], i) => (
            <div key={i} style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: subtle, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily:"'DM Mono',monospace", color: i===0?'#fff':totalPnL>=0?green:red }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Top row: Holdings card + Gainers */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14, alignItems: 'start' }}>
        <HoldingsCard title="Total Holdings — Stocks" total={12304.11} pct="2.35" isUp={true} tfSeries={stockSeries} color={blue} />

        {/* Top 5 Gainers */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding:'13px 16px 10px', borderBottom:`1px solid ${border}` }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#b0b0b0', textTransform:'uppercase', letterSpacing:'0.08em' }}>Top Gainers 7D</span>
          </div>
          {TOP_GAINERS.map((g, i) => (
            <div key={g.sym} style={{ padding:'13px 16px', borderBottom:i<4?`1px solid ${border}22`:'none', display:'flex', alignItems:'center', gap:10, cursor:'pointer', transition:'background .1s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#4caf5011'}
              onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
              <span style={{ fontSize:13, fontWeight:800, color:subtle, width:18, flexShrink:0 }}>#{i+1}</span>
              <div style={{ width:28, height:28, borderRadius:7, background:g.color+'33', border:`1px solid ${g.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:g.color, flexShrink:0 }}>{g.sym[0]}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontWeight:700, fontSize:12, color:'#fff' }}>{g.sym}</div>
                <div style={{ fontSize:10, color:subtle }}>{g.name}</div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontFamily:"'DM Mono',monospace", fontWeight:700, color:green, fontSize:13 }}>+{g.weekChg}%</div>
                <div style={{ fontSize:10, color:subtle, fontFamily:"'DM Mono',monospace" }}>${g.price.toFixed(2)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Holdings + PnL table — full width */}
      <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
          <div style={{ padding: '13px 16px 10px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#b0b0b0', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Holdings & P&L</span>
            <span style={{ fontSize: 11, color: subtle }}>4 positions</span>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#080d2288' }}>
                {['Asset','Qty','Avg Cost','Price','Mkt Value','P&L ($)','P&L (%)','24h','7D'].map(h => (
                  <th key={h} style={{ padding:'8px 12px', textAlign:h==='Asset'?'left':'right', color:subtle, fontWeight:600, fontSize:10, textTransform:'uppercase', letterSpacing:'0.07em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STOCKS.map((s) => {
                const val = s.price * s.qty, cost = s.avgCost * s.qty;
                const pnl = val - cost, pnlPct = (pnl/cost*100);
                return (
                  <tr key={s.sym} style={{ borderBottom:`1px solid ${border}22`, transition:'background .1s', cursor:'pointer' }}
                    onMouseEnter={e=>e.currentTarget.style.background='#1e88ff0a'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                    <td style={{ padding:'11px 12px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <div style={{ width:28, height:28, borderRadius:7, background:s.color+'33', border:`1px solid ${s.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:s.color, flexShrink:0 }}>{s.sym[0]}</div>
                        <div>
                          <div style={{ fontWeight:700, color:'#fff' }}>{s.sym}</div>
                          <div style={{ fontSize:10, color:subtle }}>{s.name}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", color:'#fff' }}>{s.qty}</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", color:muted }}>${s.avgCost.toFixed(2)}</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", fontWeight:700, color:'#fff' }}>${s.price.toFixed(2)}</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", color:'#fff' }}>${val.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", fontWeight:700, color:pnl>=0?green:red }}>{pnl>=0?'+':'-'}${Math.abs(pnl).toFixed(2)}</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", fontWeight:700, color:pnlPct>=0?green:red }}>{pnlPct>=0?'+':''}{pnlPct.toFixed(2)}%</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", color:s.chg>=0?green:red }}>{s.chg>=0?'+':''}{s.chg}%</td>
                    <td style={{ padding:'11px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", color:s.weekChg>=0?green:red }}>{s.weekChg>=0?'+':''}{s.weekChg}%</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ background:'#1e88ff08', borderTop:`1px solid ${border}` }}>
                <td colSpan={4} style={{ padding:'10px 12px', fontSize:11, fontWeight:700, color:subtle, textTransform:'uppercase', letterSpacing:'0.07em' }}>Total Portfolio</td>
                <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", fontWeight:700, color:'#fff' }}>${totalValue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2})}</td>
                <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", fontWeight:700, color:totalPnL>=0?green:red }}>{totalPnL>=0?'+':'-'}${Math.abs(totalPnL).toFixed(2)}</td>
                <td style={{ padding:'10px 12px', textAlign:'right', fontFamily:"'DM Mono',monospace", fontWeight:700, color:totalPct>=0?green:red }}>{totalPct>=0?'+':''}{totalPct.toFixed(2)}%</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>

      {/* Weekly Market Overview */}
      <AIBlock icon="📊" title="Weekly Market Overview" color={blue}
        prompt="Give a concise weekly US stock market overview for the week of April 22 2026. Cover major index performance (S&P 500, Nasdaq, Dow), key macro themes (Fed policy, inflation, earnings season), sector rotation, and 2-3 key risks to watch. Plain text only, no markdown symbols or bullet dashes. Short paragraphs. Max 180 words." />

      {/* Holdings Deep Analysis */}
      <AIBlock icon="🔍" title="Holdings Deep Analysis & News" color="#a78bfa"
        prompt="Write a concise deep analysis and news update for these stock holdings: AAPL (50 shares), TSLA (15 shares), GOOGL (30 shares), MSFT (10 shares). For each stock give: latest relevant news in one sentence, a brief fundamental note (positive or negative), and a short-term outlook labeled bullish, neutral, or bearish with one reason. Label each stock clearly. Plain text only, no dashes or markdown. Max 250 words." />

      {/* AI 5 Picks */}
      <AIBlock icon="⭐" title="AI Top 5 Picks This Week" color="#f7931a"
        prompt="Give your top 5 US stock picks for the week of April 22 2026. For each pick provide: the number, ticker, company name, approximate current price, the main reason to buy this week such as a catalyst or technical setup, and one risk factor. Plain text only, no markdown symbols. Be specific and concise. Max 300 words." />

    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
function StockpotDashboard() {
  const [activeTab, setActiveTab] = useState('Stocks');
  const [sideOpen, setSideOpen] = useState(false);
  const [marketExpanded, setMarketExpanded] = useState(false);
  const [activeSide, setActiveSide] = useState('Market');

  const bg = '#0a0e27', nav = '#080b1e', blue = '#1e88ff';
  const border = '#1e3a6e', text = '#ffffff', muted = '#b0b0b0', subtle = '#5a6a8a';

  const TABS = ['DCA Info', 'Stocks', 'Crypto', 'Watchlist'];

  const stockSeries = genPriceSeries(11800, 12304.11, 365);
  const cryptoSeries = genPriceSeries(8050, 8750.50, 365);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: bg, color: text, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* ── Top Navigation ── */}
      <nav style={{ background: nav, borderBottom: `1px solid ${border}`, height: 60, display: 'flex', alignItems: 'center', padding: '0 24px', flexShrink: 0, zIndex: 50, position: 'relative' }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 32, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>S</div>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '-0.5px' }}>Stockpot</span>
        </div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'center' }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setActiveTab(t)} style={{
              padding: '8px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
              color: activeTab === t ? text : subtle, fontFamily: 'inherit', fontWeight: 600, fontSize: 13,
              borderBottom: `2px solid ${activeTab === t ? blue : 'transparent'}`,
              transition: 'all .15s', position: 'relative', top: 1,
            }}>{t}</button>
          ))}
        </div>
        {/* Right: avatar + menu toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, ${blue}, #6c63ff)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>JD</div>
          <button onClick={() => setSideOpen(o => !o)} style={{ background: sideOpen ? blue + '33' : '#1e3a6e44', border: `1px solid ${sideOpen ? blue : border}`, color: sideOpen ? blue : muted, borderRadius: 7, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, transition: 'all .15s' }}>
            ☰ Menu
          </button>
        </div>
      </nav>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Main content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {activeTab === 'Stocks' && (
            <StocksTab blue={blue} border={border} muted={muted} subtle={subtle} stockSeries={stockSeries} />
          )}

          {activeTab === 'Crypto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 860, margin: '0 auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#f7931a' }} />
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#f7931a' }}>Crypto Dashboard</span>
              </div>
              <HoldingsCard title="Total Holdings — Crypto" total={8750.50} pct="8.92" isUp={true} tfSeries={cryptoSeries} color="#f7931a" />
              <HoldingsTable data={CRYPTO} isCrypto={true} />
            </div>
          )}

          {activeTab === 'DCA Info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px' }}>DCA Info</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Total Invested', value: '$18,400', sub: 'Since Jan 2022' },
                  { label: 'Current Value', value: '$21,054', sub: '+$2,654 gain' },
                  { label: 'Avg. Return', value: '+14.4%', sub: 'Annualized' },
                ].map((k, i) => (
                  <div key={i} style={{ background: '#0f1535', border: `1px solid ${border}`, borderRadius: 12, padding: 18 }}>
                    <div style={{ fontSize: 11, color: subtle, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{k.label}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, fontFamily: "'DM Mono', monospace", color: text }}>{k.value}</div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 4 }}>{k.sub}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0f1535', border: `1px solid ${border}`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: 12, color: subtle, marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.07em' }}>DCA Schedule</div>
                {[['Weekly','$200','Stocks','Active'],['Bi-weekly','$150','BTC','Active'],['Monthly','$100','ETH','Paused']].map(([freq, amt, asset, status], i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? `1px solid ${border}44` : 'none', fontSize: 13 }}>
                    <span style={{ color: muted }}>{freq}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{amt}</span>
                    <span style={{ color: blue }}>{asset}</span>
                    <span style={{ color: status === 'Active' ? '#4caf50' : '#f59e0b', fontSize: 11, fontWeight: 600 }}>{status}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Watchlist' && (
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.5px', marginBottom: 16 }}>Watchlist</div>
              <div style={{ background: '#0f1535', border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                {[...STOCKS, ...CRYPTO].map((item, i) => (
                  <div key={item.sym} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: i < 7 ? `1px solid ${border}33` : 'none', transition: 'background .1s', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#1e88ff0a'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: item.color + '33', border: `1px solid ${item.color}66`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: item.color }}>{item.sym[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{item.sym} <span style={{ fontSize: 11, color: subtle, fontWeight: 400 }}>{item.name}</span></div>
                    </div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, fontSize: 14 }}>${item.price >= 1000 ? item.price.toLocaleString() : item.price.toFixed(2)}</div>
                    <div style={{ fontFamily: "'DM Mono', monospace", fontWeight: 700, color: item.chg >= 0 ? '#4caf50' : '#f44336', width: 60, textAlign: 'right' }}>{item.chg >= 0 ? '+' : ''}{item.chg}%</div>
                    <Sparkline data={Array.from({ length: 12 }, (_, j) => item.price * (0.97 + j * 0.003 + (Math.random() - 0.5) * 0.01))} color={item.chg >= 0 ? '#4caf50' : '#f44336'} height={32} fill={false} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Side Menu ── */}
        <div style={{
          width: sideOpen ? 200 : 0, overflow: 'hidden',
          transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
          background: nav, borderLeft: sideOpen ? `1px solid ${border}` : 'none',
          display: 'flex', flexDirection: 'column', flexShrink: 0,
        }}>
          <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
            <div style={{ padding: '8px 16px 4px', fontSize: 10, color: subtle, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>Navigation</div>
            {SIDE_MENU.map(item => (
              <div key={item.label}>
                <div onClick={() => {
                  setActiveSide(item.label);
                  if (item.sub) setMarketExpanded(e => !e);
                }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '9px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
                    color: activeSide === item.label ? text : muted,
                    background: activeSide === item.label ? blue + '22' : 'transparent',
                    borderLeft: `2px solid ${activeSide === item.label ? blue : 'transparent'}`,
                    transition: 'all .1s',
                  }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: activeSide === item.label ? blue : subtle }}>{item.icon}</span>
                    {item.label}
                  </div>
                  {item.sub && <span style={{ fontSize: 9, color: subtle }}>{marketExpanded ? '▲' : '▼'}</span>}
                </div>
                {item.sub && marketExpanded && activeSide === item.label && (
                  <div style={{ paddingLeft: 36 }}>
                    {item.sub.map(s => (
                      <div key={s} style={{ padding: '7px 16px', fontSize: 12, color: muted, cursor: 'pointer', transition: 'color .1s' }}
                        onMouseEnter={e => e.currentTarget.style.color = blue}
                        onMouseLeave={e => e.currentTarget.style.color = muted}>
                        {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { StockpotDashboard });
