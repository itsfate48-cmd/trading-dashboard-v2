
// Dashboard 4: Forge — DevOps Monitoring (slate dark, amber alerts)
const { useState, useEffect, useRef } = React;

function generateMetricHistory(base, variance, len = 60) {
  const arr = [];
  let v = base;
  for (let i = 0; i < len; i++) {
    v = Math.max(0, Math.min(100, v + (Math.random() - 0.5) * variance));
    arr.push(parseFloat(v.toFixed(1)));
  }
  return arr;
}

function MiniMetric({ label, value, unit, history, color, status, width = 160 }) {
  const bg = '#0f1923', border = '#ffffff0d', muted = '#64748b';
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 14px', width }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</span>
        <StatusDot status={status} />
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "'DM Mono', monospace", color }}>
        {value}<span style={{ fontSize: 12, color: muted, marginLeft: 2 }}>{unit}</span>
      </div>
      <Sparkline data={history} color={color} height={28} fill={true} />
    </div>
  );
}

function LogLine({ time, level, service, msg }) {
  const colors = { ERROR: '#ef4444', WARN: '#f59e0b', INFO: '#38bdf8', DEBUG: '#64748b' };
  return (
    <div style={{ display: 'flex', gap: 10, padding: '3px 0', fontFamily: "'DM Mono', monospace", fontSize: 11, borderBottom: '1px solid #ffffff05' }}>
      <span style={{ color: '#4b5563', width: 56, flexShrink: 0 }}>{time}</span>
      <span style={{ color: colors[level] || '#64748b', width: 38, flexShrink: 0, fontWeight: 700 }}>{level}</span>
      <span style={{ color: '#7c3aed', width: 80, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{service}</span>
      <span style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{msg}</span>
    </div>
  );
}

const SERVICES = [
  { name: 'api-gateway', replicas: 4, cpu: 34, mem: 62, req: '2.4k/s', status: 'ok' },
  { name: 'auth-service', replicas: 2, cpu: 18, mem: 45, req: '840/s', status: 'ok' },
  { name: 'data-pipeline', replicas: 6, cpu: 78, mem: 81, req: '12k/s', status: 'warn' },
  { name: 'notification-svc', replicas: 2, cpu: 12, mem: 38, req: '320/s', status: 'ok' },
  { name: 'search-index', replicas: 3, cpu: 91, mem: 89, req: '560/s', status: 'error' },
  { name: 'billing-worker', replicas: 1, cpu: 22, mem: 44, req: '40/s', status: 'ok' },
];

const LOG_ENTRIES = [
  { time: '14:32:01', level: 'ERROR', service: 'search-index', msg: 'Connection pool exhausted after 30s timeout' },
  { time: '14:31:58', level: 'WARN', service: 'data-pipeline', msg: 'Memory usage at 81% — scaling triggered' },
  { time: '14:31:52', level: 'INFO', service: 'api-gateway', msg: 'Deployed v2.14.1 — 0 downtime' },
  { time: '14:31:40', level: 'WARN', service: 'search-index', msg: 'Slow query detected: 4200ms (threshold: 500ms)' },
  { time: '14:31:30', level: 'INFO', service: 'auth-service', msg: 'Token rotation completed for 24,810 sessions' },
  { time: '14:31:12', level: 'ERROR', service: 'search-index', msg: 'Elasticsearch shard allocation failed on node-3' },
  { time: '14:30:55', level: 'INFO', service: 'billing-worker', msg: 'Processed 1,240 invoices in batch run' },
  { time: '14:30:44', level: 'DEBUG', service: 'notification-svc', msg: 'Queue depth: 182 | Workers: 4 | Lag: 0.2s' },
];

function ForgeDashboard() {
  const [cpuHistory] = useState(() => generateMetricHistory(45, 12));
  const [memHistory] = useState(() => generateMetricHistory(62, 8));
  const [netHistory] = useState(() => generateMetricHistory(38, 18));
  const [errHistory] = useState(() => generateMetricHistory(2, 3));
  const [liveCpu, setLiveCpu] = useState(cpuHistory[cpuHistory.length - 1]);
  const [liveMem, setLiveMem] = useState(memHistory[memHistory.length - 1]);
  const [expandedSvc, setExpandedSvc] = useState(null);
  const [alertDismissed, setAlertDismissed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setLiveCpu(v => parseFloat(Math.max(10, Math.min(95, v + (Math.random() - 0.5) * 6)).toFixed(1)));
      setLiveMem(v => parseFloat(Math.max(30, Math.min(95, v + (Math.random() - 0.5) * 3)).toFixed(1)));
    }, 1500);
    return () => clearInterval(id);
  }, []);

  const bg = '#080d14', card = '#0f1923', border = '#ffffff0d';
  const amber = '#f59e0b', red = '#ef4444', green = '#22c55e', blue = '#38bdf8';
  const text = '#e2e8f0', muted = '#4b5563';

  const s = {
    root: { fontFamily: "'DM Sans', sans-serif", background: bg, color: text, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
    topbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', borderBottom: `1px solid ${border}`, flexShrink: 0 },
    body: { flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 14 },
    card: { background: card, border: `1px solid ${border}`, borderRadius: 10, padding: 14 },
    label: { fontSize: 10, color: muted, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10, fontWeight: 600 },
    alert: { background: red + '18', border: `1px solid ${red}33`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12 },
  };

  return (
    <div style={s.root}>
      {/* Topbar */}
      <div style={s.topbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: amber + '22', border: `1px solid ${amber}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>⚙</div>
          <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: '-0.3px' }}>Forge Monitor</span>
          <span style={{ fontSize: 11, color: muted }}>production-us-east-1</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', fontSize: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatusDot status="error" />
            <span style={{ color: red }}>1 Critical</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatusDot status="warn" />
            <span style={{ color: amber }}>2 Warnings</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <StatusDot status="ok" />
            <span style={{ color: green }}>4 Healthy</span>
          </div>
        </div>
        <div style={{ fontFamily: "'DM Mono', monospace", fontSize: 11, color: muted }}>14:32:01 UTC</div>
      </div>

      <div style={s.body}>
        {/* Alert banner */}
        {!alertDismissed && (
          <div style={s.alert}>
            <StatusDot status="error" />
            <span style={{ color: red, fontWeight: 700 }}>CRITICAL</span>
            <span style={{ color: text, flex: 1 }}>search-index: Elasticsearch shard allocation failure on node-3 — auto-recovery in progress</span>
            <button onClick={() => setAlertDismissed(true)}
              style={{ background: 'transparent', border: 'none', color: muted, cursor: 'pointer', fontSize: 14, padding: '0 4px' }}>✕</button>
          </div>
        )}

        {/* System metrics row */}
        <div>
          <div style={s.label}>System Metrics — Live</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            <MiniMetric label="CPU" value={liveCpu} unit="%" history={cpuHistory} color={liveCpu > 80 ? red : liveCpu > 60 ? amber : green} status={liveCpu > 80 ? 'error' : liveCpu > 60 ? 'warn' : 'ok'} width="100%" />
            <MiniMetric label="Memory" value={liveMem} unit="%" history={memHistory} color={liveMem > 80 ? red : liveMem > 60 ? amber : green} status={liveMem > 80 ? 'error' : liveMem > 60 ? 'warn' : 'ok'} width="100%" />
            <MiniMetric label="Network I/O" value="2.4" unit="GB/s" history={netHistory} color={blue} status="ok" width="100%" />
            <MiniMetric label="Error Rate" value="0.8" unit="%" history={errHistory} color={amber} status="warn" width="100%" />
          </div>
        </div>

        {/* Services + Logs row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div style={s.card}>
            <div style={s.label}>Services</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ color: muted, textAlign: 'left' }}>
                  {['Service', 'Pods', 'CPU', 'Mem', 'RPS', 'State'].map(h => (
                    <th key={h} style={{ padding: '4px 6px', fontWeight: 600, fontSize: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SERVICES.map(svc => (
                  <tr key={svc.name} onClick={() => setExpandedSvc(expandedSvc === svc.name ? null : svc.name)}
                    style={{ cursor: 'pointer', background: expandedSvc === svc.name ? '#ffffff06' : 'transparent', transition: 'background .1s' }}>
                    <td style={{ padding: '7px 6px', fontFamily: "'DM Mono', monospace", color: text }}>{svc.name}</td>
                    <td style={{ padding: '7px 6px', color: muted }}>{svc.replicas}</td>
                    <td style={{ padding: '7px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 36, height: 4, background: '#ffffff0a', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${svc.cpu}%`, height: '100%', background: svc.cpu > 80 ? red : svc.cpu > 60 ? amber : green, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 10, color: muted, fontFamily: "'DM Mono', monospace" }}>{svc.cpu}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '7px 6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 36, height: 4, background: '#ffffff0a', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${svc.mem}%`, height: '100%', background: svc.mem > 80 ? red : svc.mem > 60 ? amber : blue, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 10, color: muted, fontFamily: "'DM Mono', monospace" }}>{svc.mem}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '7px 6px', fontFamily: "'DM Mono', monospace", color: muted, fontSize: 11 }}>{svc.req}</td>
                    <td style={{ padding: '7px 6px' }}><StatusDot status={svc.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={s.label}>Live Logs</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['ALL','ERROR','WARN','INFO'].map(f => (
                  <button key={f} style={{ padding: '2px 7px', borderRadius: 3, border: `1px solid ${border}`, background: 'transparent', color: muted, fontSize: 10, cursor: 'pointer', fontFamily: "'DM Mono', monospace" }}>{f}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {LOG_ENTRIES.map((l, i) => <LogLine key={i} {...l} />)}
            </div>
          </div>
        </div>

        {/* Response time chart + uptime */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
          <div style={s.card}>
            <div style={s.label}>Response Time — p50 / p95 / p99</div>
            <LineChart
              series={[
                { name: 'p50', color: green, data: [48,52,49,55,51,60,58,62,55,50,48,52,54,58,60] },
                { name: 'p95', color: amber, data: [120,130,118,140,135,155,160,180,145,130,125,140,150,160,155] },
                { name: 'p99', color: red, data: [280,310,290,350,340,420,390,460,380,320,300,350,380,400,410] },
              ]}
              labels={['12:00','12:05','12:10','12:15','12:20','12:25','12:30','12:35','12:40','12:45','12:50','12:55','13:00','13:05','13:10']}
              height={140}
            />
          </div>
          <div style={s.card}>
            <div style={s.label}>30-Day Uptime</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[['api-gateway', 99.98, green], ['auth-service', 99.94, green], ['data-pipeline', 99.71, amber], ['search-index', 97.40, red]].map(([name, pct, color]) => (
                <div key={name}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3, fontSize: 11 }}>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: text }}>{name}</span>
                    <span style={{ fontFamily: "'DM Mono', monospace", color }}>{pct}%</span>
                  </div>
                  <div style={{ height: 4, background: '#ffffff0a', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s ease' }} />
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

Object.assign(window, { ForgeDashboard });
