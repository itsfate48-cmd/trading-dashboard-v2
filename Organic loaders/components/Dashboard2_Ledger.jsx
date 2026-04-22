
// Dashboard 2: Ledger — Finance/Trading (dark terminal, green/red)
const { useState, useEffect, useRef, useCallback } = React;

function generateCandle(prev, vol) {
  const change = (Math.random() - 0.48) * vol;
  const open = prev;
  const close = prev + change;
  const high = Math.max(open, close) + Math.random() * vol * 0.4;
  const low = Math.min(open, close) - Math.random() * vol * 0.4;
  return { open, close, high, low };
}

const initCandles = () => {
  const candles = [];
  let price = 182.4;
  for (let i = 0; i < 60; i++) {
    const c = generateCandle(price, 2.5);
    candles.push(c);
    price = c.close;
  }
  return candles;
};

function CandleChart({ candles, color = { up: '#22c55e', down: '#ef4444' }, height = 220 }) {
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
    const pad = { top: 10, right: 10, bottom: 20, left: 48 };
    const iw = w - pad.left - pad.right, ih = h - pad.top - pad.bottom;
    const allH = candles.map(c => c.high), allL = candles.map(c => c.low);
    const max = Math.max(...allH), min = Math.min(...allL);
    const range = max - min || 1;
    const yS = v => pad.top + ih - ((v - min) / range) * ih;
    const cw = Math.max(2, (iw / candles.length) * 0.6);
    const gap = iw / candles.length;

    // grid + y labels
    ctx.strokeStyle = '#ffffff08'; ctx.lineWidth = 1;
    ctx.fillStyle = '#4b5563'; ctx.font = '10px DM Mono, monospace'; ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
      const v = min + (range / 4) * i;
      const y = yS(v);
      ctx.beginPath(); ctx.moveTo(pad.left, y); ctx.lineTo(pad.left + iw, y); ctx.stroke();
      ctx.fillText('$' + v.toFixed(1), pad.left - 4, y + 3);
    }

    candles.forEach((c, i) => {
      const x = pad.left + i * gap + gap / 2;
      const isUp = c.close >= c.open;
      const clr = isUp ? color.up : color.down;
      ctx.strokeStyle = clr; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x, yS(c.high)); ctx.lineTo(x, yS(c.low)); ctx.stroke();
      const top = yS(Math.max(c.open, c.close));
      const bot = yS(Math.min(c.open, c.close));
      const bh = Math.max(1, bot - top);
      ctx.fillStyle = isUp ? clr + 'cc' : clr;
      ctx.fillRect(x - cw / 2, top, cw, bh);
    });
  }, [candles]);
  return <canvas ref={ref} style={{ width: '100%', height, display: 'block' }} />;
}

function LedgerDashboard() {
  const [candles, setCandles] = useState(initCandles);
  const [price, setPrice] = useState(candles[candles.length - 1].close);
  const [priceUp, setPriceUp] = useState(true);
  const [tab, setTab] = useState('AAPL');

  useEffect(() => {
    const id = setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1].close;
        const next = generateCandle(last, 1.8);
        setPriceUp(next.close >= last);
        setPrice(next.close);
        return [...prev.slice(1), next];
      });
    }, 1200);
    return () => clearInterval(id);
  }, []);

  const bg = '#0a0e14', card = '#111720', border = '#ffffff0d';
  const green = '#22c55e', red = '#ef4444', text = '#e2e8f0', muted = '#4b5563';

  const tickers = [
    { sym: 'AAPL', name: 'Apple Inc.', price: 182.4, chg: 1.24 },
    { sym: 'NVDA', name: 'NVIDIA Corp.', price: 876.2, chg: 3.87 },
    { sym: 'TSLA', name: 'Tesla Inc.', price: 248.7, chg: -2.14 },
    { sym: 'MSFT', name: 'Microsoft', price: 415.5, chg: 0.63 },
    { sym: 'AMZN', name: 'Amazon', price: 196.8, chg: -0.89 },
  ];

  const portfolio = [
    { sym: 'AAPL', qty: 150, avg: 164.2, cur: 182.4 },
    { sym: 'NVDA', qty: 30, avg: 620.0, cur: 876.2 },
    { sym: 'TSLA', qty: 80, avg: 270.0, cur: 248.7 },
    { sym: 'BTC', qty: 0.42, avg: 38000, cur: 67200 },
  ];

  const s = {
    root: { fontFamily: "'DM Mono', monospace", background: bg, color: text, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontSize: 12 },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: `1px solid ${border}`, flexShrink: 0 },
    body: { display: 'grid', gridTemplateColumns: '220px 1fr 200px', flex: 1, overflow: 'hidden' },
    col: { borderRight: `1px solid ${border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    section: { padding: '12px 14px', borderBottom: `1px solid ${border}` },
    label: { fontSize: 10, color: muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 },
    card: { background: card, border: `1px solid ${border}`, borderRadius: 8, padding: 12, margin: '0 12px 8px' },
  };

  return (
    <div style={s.root}>
      {/* Ticker tape */}
      <div style={{ ...s.topbar, gap: 20, overflow: 'hidden' }}>
        <span style={{ color: green, fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>LEDGER</span>
        <div style={{ display: 'flex', gap: 20, overflow: 'hidden', flex: 1 }}>
          {tickers.map(t => (
            <div key={t.sym} style={{ display: 'flex', gap: 8, flexShrink: 0, alignItems: 'center' }}>
              <span style={{ color: text, fontWeight: 700 }}>{t.sym}</span>
              <span>${t.price.toFixed(2)}</span>
              <span style={{ color: t.chg > 0 ? green : red }}>{t.chg > 0 ? '+' : ''}{t.chg}%</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <StatusDot status="ok" />
          <span style={{ color: green, fontSize: 10 }}>MARKET OPEN</span>
        </div>
      </div>

      <div style={s.body}>
        {/* Left: Watchlist */}
        <div style={s.col}>
          <div style={s.section}><div style={s.label}>Watchlist</div></div>
          {tickers.map(t => (
            <div key={t.sym} onClick={() => setTab(t.sym)}
              style={{ padding: '10px 14px', borderBottom: `1px solid ${border}`, cursor: 'pointer', background: tab === t.sym ? '#ffffff06' : 'transparent', borderLeft: `2px solid ${tab === t.sym ? green : 'transparent'}`, transition: 'all .1s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 700, color: text }}>{t.sym}</span>
                <span style={{ color: t.chg > 0 ? green : red }}>{t.chg > 0 ? '+' : ''}{t.chg}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2, color: muted, fontSize: 11 }}>
                <span>{t.name.slice(0, 12)}</span>
                <span style={{ color: text }}>${t.price.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center: Chart */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: 18, fontWeight: 700, color: text }}>{tab} </span>
              <span style={{ fontSize: 22, fontWeight: 700, color: priceUp ? green : red }}>${price.toFixed(2)}</span>
              <span style={{ fontSize: 11, color: priceUp ? green : red, marginLeft: 8 }}>{priceUp ? '▲' : '▼'} LIVE</span>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {['1D','5D','1M','6M','1Y'].map(p => (
                <button key={p} style={{ padding: '3px 8px', background: 'transparent', border: `1px solid ${border}`, color: muted, borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px 16px', overflow: 'hidden' }}>
            <CandleChart candles={candles} height={240} />
          </div>
          {/* Order Book */}
          <div style={{ borderTop: `1px solid ${border}`, padding: '10px 16px' }}>
            <div style={s.label}>Order Book</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                {[182.60, 182.58, 182.55, 182.52, 182.50].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                    <span style={{ color: red }}>{p.toFixed(2)}</span>
                    <span style={{ color: muted }}>{(Math.random() * 500 + 100).toFixed(0)}</span>
                    <div style={{ width: `${Math.random() * 60 + 10}%`, height: 3, background: red + '33', alignSelf: 'center', borderRadius: 1 }} />
                  </div>
                ))}
              </div>
              <div>
                {[182.48, 182.45, 182.42, 182.40, 182.38].map((p, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', fontSize: 11 }}>
                    <span style={{ color: green }}>{p.toFixed(2)}</span>
                    <span style={{ color: muted }}>{(Math.random() * 500 + 100).toFixed(0)}</span>
                    <div style={{ width: `${Math.random() * 60 + 10}%`, height: 3, background: green + '33', alignSelf: 'center', borderRadius: 1 }} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Portfolio + P&L */}
        <div style={{ ...s.col, borderRight: 'none', overflow: 'auto' }}>
          <div style={s.section}><div style={s.label}>Portfolio</div></div>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${border}` }}>
            <div style={{ color: muted, fontSize: 10, marginBottom: 4 }}>TOTAL VALUE</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: green }}>$142,381</div>
            <div style={{ color: green, fontSize: 11, marginTop: 2 }}>▲ +$8,240 today</div>
          </div>
          {portfolio.map(h => {
            const val = h.qty * h.cur;
            const pnl = h.qty * (h.cur - h.avg);
            const pct = ((h.cur - h.avg) / h.avg * 100);
            return (
              <div key={h.sym} style={{ padding: '10px 14px', borderBottom: `1px solid ${border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span style={{ fontWeight: 700 }}>{h.sym}</span>
                  <span style={{ color: pnl > 0 ? green : red }}>{pct > 0 ? '+' : ''}{pct.toFixed(1)}%</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: muted, fontSize: 11 }}>
                  <span>{h.qty} × ${h.cur.toFixed(0)}</span>
                  <span style={{ color: pnl > 0 ? green : red }}>{pnl > 0 ? '+' : ''}${Math.abs(pnl).toFixed(0)}</span>
                </div>
              </div>
            );
          })}
          <div style={s.section}>
            <div style={s.label}>Quick Trade</div>
            <input style={{ width: '100%', background: '#ffffff08', border: `1px solid ${border}`, color: text, padding: '6px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 6 }} placeholder="Symbol" />
            <input style={{ width: '100%', background: '#ffffff08', border: `1px solid ${border}`, color: text, padding: '6px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 8 }} placeholder="Qty" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <button style={{ padding: '7px 0', background: green + '22', border: `1px solid ${green}44`, color: green, borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>BUY</button>
              <button style={{ padding: '7px 0', background: red + '22', border: `1px solid ${red}44`, color: red, borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit', fontSize: 11 }}>SELL</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { LedgerDashboard });
