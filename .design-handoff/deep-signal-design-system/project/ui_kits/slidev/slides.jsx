// Slidev deck UI kit — 16:9 (1920x1080)
// Design principle: visible ambient gradients, but ALWAYS kept away from text.
// - Dark base with a soft ambient gradient baked in (visible but soft)
// - Medium accent orbs at 0.30–0.45 opacity in corners
// - Noise overlay at 0.55 unifies and breaks banding
// - Text sits on solid panels OR in a scrim-protected zone
// - Slides are FULL — no oceanic empty space; content fills top-to-bottom
const { useState, useEffect } = React;

const T = {
  bg: '#0B1220',
  bgAlt: '#0F172A',
  surface: '#1E293B',
  panel: 'rgba(15,23,42,0.72)',
  codeBg: '#0D1117',
  text: '#E2E8F0',
  textDim: '#CBD5E1',
  mute: '#94A3B8',
  muted: '#94A3B8',
  teal: '#14B8A6',
  tealLight: '#2DD4BF',   // AA on dark — use for all small/medium teal text
  tealDeep: '#0D9488',
  amber: '#F59E0B',
  amberLight: '#FBBF24',  // AAA on dark
  red: '#F87171',
  border: '#334155',
  borderSoft: 'rgba(148,163,184,0.14)',
  fd: "'Space Grotesk', sans-serif",
  fb: "'Inter', sans-serif",
  fm: "'JetBrains Mono', monospace",
};

// ---------- Noise + texture primitives ----------
const NOISE_URL = "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.55 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";
const NoiseOverlay = ({ opacity = 0.55, blend = 'overlay' }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: NOISE_URL, backgroundSize: '240px 240px',
    mixBlendMode: blend, opacity }}/>
);

// Soft blurred accent — visible ambient color. Medium opacity, generous size,
// pushed to corners/margins so text zones stay calm.
const Accent = ({ color, size = 800, x, y, opacity = 0.35, blur = 140 }) => (
  <div style={{ position: 'absolute', left: x, top: y, width: size, height: size,
    background: color, borderRadius: '50%', filter: `blur(${blur}px)`, opacity,
    pointerEvents: 'none' }}/>
);

// Ambient base gradient — a soft two-stop mesh baked into the slide background.
// Creates a visible atmosphere without hard edges.
const AMBIENT = {
  teal: `radial-gradient(ellipse 110% 90% at 15% 10%, rgba(20,184,166,0.22), transparent 70%),
         radial-gradient(ellipse 100% 90% at 85% 95%, rgba(13,148,136,0.28), transparent 75%),
         linear-gradient(160deg, #0B1220 0%, #0F1E2C 100%)`,
  tealAmber: `radial-gradient(ellipse 100% 80% at 10% 10%, rgba(20,184,166,0.28), transparent 70%),
              radial-gradient(ellipse 90% 80% at 90% 90%, rgba(245,158,11,0.16), transparent 70%),
              linear-gradient(160deg, #0B1220 0%, #0F1E2C 100%)`,
  amber: `radial-gradient(ellipse 100% 80% at 85% 15%, rgba(245,158,11,0.24), transparent 70%),
          radial-gradient(ellipse 100% 80% at 15% 90%, rgba(217,119,6,0.18), transparent 70%),
          linear-gradient(160deg, #1A1208 0%, #0B1220 100%)`,
  deep: `radial-gradient(ellipse 120% 100% at 50% 0%, rgba(20,184,166,0.18), transparent 70%),
         linear-gradient(180deg, #0B1220 0%, #0D1A2A 100%)`,
};

// Panel — frosted dark container for text content. Ensures readability over any ambient.
const Panel = ({ children, style, accent }) => (
  <div style={{ background: 'rgba(11,18,32,0.72)', backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${accent ? T.tealDeep : T.borderSoft}`, borderRadius: 20,
    padding: 48, ...style }}>
    {children}
  </div>
);

// Subtle grid — only renders where mask allows. Used sparingly.
const Grid = ({ opacity = 0.04, size = 80 }) => (
  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `linear-gradient(rgba(148,163,184,${opacity}) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(148,163,184,${opacity}) 1px, transparent 1px)`,
    backgroundSize: `${size}px ${size}px`,
    maskImage: 'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)',
    WebkitMaskImage: 'linear-gradient(180deg, transparent 0%, black 20%, black 80%, transparent 100%)' }}/>
);

// ---------- 16:9 Stage ----------
const Stage = ({ children }) => {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const r = () => setScale(Math.min(window.innerWidth / 1920, window.innerHeight / 1080));
    r(); window.addEventListener('resize', r); return () => window.removeEventListener('resize', r);
  }, []);
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`,
        transformOrigin: 'center', position: 'relative', aspectRatio: '16 / 9' }}>
        {children}
      </div>
    </div>
  );
};

// Shell — always solid dark base. Accents live in the accents slot.
const Shell = ({ children, num, total, accents, grid, noise = true, bg = T.bg }) => (
  <div style={{ position: 'absolute', inset: 0, background: bg, overflow: 'hidden',
    display: 'flex', flexDirection: 'column', padding: 96 }}>
    {accents}
    {grid && <Grid/>}
    {noise && <NoiseOverlay/>}
    <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column',
      flex: 1, minHeight: 0 }}>
      {children}
    </div>
    <div style={{ position: 'absolute', bottom: 40, left: 96, display: 'flex',
      alignItems: 'center', gap: 12, fontFamily: T.fm, fontSize: 16, color: T.muted, zIndex: 3 }}>
      <img src="../../assets/vv-logo-hero.png" style={{ width: 28, height: 28, borderRadius: 6 }}/>
      vedmich.dev
    </div>
    <div style={{ position: 'absolute', bottom: 40, right: 96,
      fontFamily: T.fm, fontSize: 16, color: T.muted, zIndex: 3 }}>
      {num} / {total}
    </div>
  </div>
);

// Reusable eyebrow
const Eyebrow = ({ children, color = T.tealLight }) => (
  <div style={{ fontFamily: T.fb, fontSize: 20, fontWeight: 600, color,
    letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 20 }}>
    {children}
  </div>
);

// ---------- 01. Title ----------
const TitleSlide = ({ num, total }) => (
  <Shell num={num} total={total} bg={AMBIENT.teal} grid
    accents={<>
      <Accent color="#14B8A6" size={1000} x={-300} y={-300} opacity={0.42} blur={140}/>
      <Accent color="#0D9488" size={800} x={1300} y={600} opacity={0.38} blur={140}/>
      <Accent color="#F59E0B" size={500} x={1500} y={-100} opacity={0.16} blur={120}/>
    </>}>
    <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'auto 1fr auto', gap: 32 }}>
      {/* top meta */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <img src="../../assets/vv-logo-hero.png" style={{ width: 112, height: 112, borderRadius: 22,
          boxShadow: '0 20px 60px rgba(20,184,166,0.45)' }}/>
        <div style={{ textAlign: 'right', fontFamily: T.fm, fontSize: 18, color: T.tealLight,
          lineHeight: 1.6 }}>
          <div>AWS Community Day</div>
          <div>Bratislava · Slovakia</div>
          <div style={{ color: T.amberLight }}>April 19, 2026</div>
        </div>
      </div>
      {/* title block */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: T.fm, fontSize: 22, color: T.tealLight, marginBottom: 20,
          letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Talk 04 · Track: Platform
        </div>
        <h1 style={{ fontFamily: T.fd, fontSize: 144, fontWeight: 700, lineHeight: 0.96,
          letterSpacing: '-0.03em', color: T.text, margin: 0 }}>
          Karpenter<br/>in <span style={{ color: T.tealLight }}>production</span>.
        </h1>
        <div style={{ fontFamily: T.fd, fontSize: 40, fontWeight: 500, color: T.amberLight,
          marginTop: 24, letterSpacing: '-0.01em', maxWidth: 1400 }}>
          Architecting cost-efficient K8s clusters at scale —
          with lessons from 12 production deployments.
        </div>
      </div>
      {/* bottom: speaker + credentials */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 32,
        alignItems: 'center', paddingTop: 24, borderTop: `1px solid ${T.borderSoft}` }}>
        <div style={{ width: 56, height: 56, borderRadius: 50, background: T.tealDeep,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: T.fd, fontSize: 22, fontWeight: 700, color: T.text }}>VV</div>
        <div>
          <div style={{ fontFamily: T.fd, fontSize: 26, fontWeight: 600, color: T.text }}>
            Viktor Vedmich
          </div>
          <div style={{ fontFamily: T.fb, fontSize: 18, color: T.mute }}>
            Senior Solutions Architect @ AWS · 8 years in cloud infrastructure
          </div>
        </div>
        <div style={{ fontFamily: T.fm, fontSize: 16, color: T.muted, textAlign: 'right' }}>
          s.vedmich.dev/karpenter-prod
        </div>
      </div>
    </div>
  </Shell>
);

// ---------- 02. Agenda ----------
const AgendaSlide = ({ num, total }) => {
  const items = [
    ['01', 'The autoscaling problem', 'Why fixed node groups fail modern workloads'],
    ['02', 'How Karpenter thinks', 'Provisioning loops, consolidation, disruption'],
    ['03', 'NodePool patterns', 'Spot, on-demand, instance diversity'],
    ['04', 'Production lessons', 'What we learned at scale'],
    ['05', 'Cost & reliability metrics', 'Real numbers from real clusters'],
  ];
  return (
    <Shell num={num} total={total} bg={AMBIENT.tealAmber}
      accents={<>
        <Accent color="#14B8A6" size={700} x={1400} y={-200} opacity={0.32} blur={120}/>
        <Accent color="#F59E0B" size={500} x={-200} y={700} opacity={0.22} blur={140}/>
      </>}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 80, flex: 1,
        minHeight: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <Eyebrow>Agenda · 05 parts</Eyebrow>
            <h2 style={{ fontFamily: T.fd, fontSize: 84, fontWeight: 600, color: T.text, margin: 0,
              letterSpacing: '-0.02em', lineHeight: 0.98 }}>
              What we'll<br/>cover.
            </h2>
            <div style={{ fontFamily: T.fb, fontSize: 20, color: T.textDim, lineHeight: 1.5,
              marginTop: 32, maxWidth: 420 }}>
              A 45-minute walk from the autoscaling problem you probably have,
              to the production patterns that solved it for us.
            </div>
          </div>
          <div style={{ fontFamily: T.fm, fontSize: 14, color: T.muted,
            padding: '20px 0', borderTop: `1px solid ${T.borderSoft}` }}>
            Slides → s.vedmich.dev/karpenter-prod
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {items.map(([n, t, d], i) => (
            <div key={n} style={{ display: 'grid', gridTemplateColumns: '110px 1fr',
              alignItems: 'baseline', padding: '22px 0',
              borderTop: `1px solid ${T.borderSoft}`,
              borderBottom: i === items.length - 1 ? `1px solid ${T.borderSoft}` : 'none' }}>
              <span style={{ fontFamily: T.fm, fontSize: 20, color: T.tealLight }}>{n}</span>
              <div>
                <div style={{ fontFamily: T.fd, fontSize: 32, fontWeight: 600, color: T.text,
                  letterSpacing: '-0.01em' }}>{t}</div>
                <div style={{ fontFamily: T.fb, fontSize: 20, color: T.muted, marginTop: 4 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
};

// ---------- 03. Section divider ----------
const SectionSlide = ({ num, total }) => (
  <Shell num={num} total={total} bg={AMBIENT.teal}
    accents={<>
      <Accent color="#14B8A6" size={1100} x={-300} y={200} opacity={0.40} blur={140}/>
      <Accent color="#0D9488" size={800} x={1200} y={-200} opacity={0.32} blur={140}/>
      <Accent color="#F59E0B" size={400} x={1500} y={700} opacity={0.18} blur={120}/>
    </>}>
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', flex: 1, gap: 40 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow>Part 01 of 05</Eyebrow>
        <div style={{ fontFamily: T.fm, fontSize: 16, color: T.muted }}>
          — The autoscaling problem
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2 style={{ fontFamily: T.fd, fontSize: 168, fontWeight: 700, lineHeight: 0.94,
          letterSpacing: '-0.04em', color: T.text, margin: 0 }}>
          Why your nodes<br/>
          <span style={{ color: T.tealLight }}>are the wrong size</span>.
        </h2>
        <div style={{ fontFamily: T.fd, fontSize: 36, fontWeight: 500, color: T.textDim,
          marginTop: 40, maxWidth: 1400, lineHeight: 1.3 }}>
          Fixed node groups were designed for workloads that don't exist anymore.
          Here's why it matters — and what we can do about it.
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ width: 120, height: 4, background: T.tealLight }}/>
        <div style={{ fontFamily: T.fm, fontSize: 14, color: T.muted, letterSpacing: '0.12em',
          textTransform: 'uppercase' }}>
          ~8 min reading · 3 core ideas
        </div>
      </div>
    </div>
  </Shell>
);

// ---------- 04. Compare (two columns) ----------
const CompareSlide = ({ num, total }) => (
  <Shell num={num} total={total}
    accents={<Accent color="#14B8A6" size={500} x={1550} y={600} opacity={0.10}/>}>
    <Eyebrow>The problem</Eyebrow>
    <h2 style={{ fontFamily: T.fd, fontSize: 68, fontWeight: 600, lineHeight: 1.08,
      letterSpacing: '-0.02em', color: T.text, margin: 0, maxWidth: 1400 }}>
      Cluster Autoscaler picks from a menu.
      <br/><span style={{ color: T.tealLight }}>Karpenter designs the meal.</span>
    </h2>
    <div style={{ marginTop: 64, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
      <div style={{ background: T.panel, border: `1px solid ${T.borderSoft}`, borderRadius: 16,
        padding: 40 }}>
        <div style={{ fontFamily: T.fm, fontSize: 16, color: T.muted, marginBottom: 18,
          letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Cluster Autoscaler
        </div>
        {['Fixed node groups, fixed instance types',
          'Scale up only when pods pending',
          'Can\'t consolidate across groups',
          'Minute-scale reactions'].map(t => (
          <div key={t} style={{ fontFamily: T.fb, fontSize: 24, color: T.textDim, lineHeight: 1.45,
            marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ color: T.muted, fontFamily: T.fm }}>—</span>{t}
          </div>
        ))}
      </div>
      <div style={{ background: T.panel, border: `1px solid ${T.tealDeep}`, borderRadius: 16,
        padding: 40, position: 'relative' }}>
        <div style={{ position: 'absolute', top: 20, right: 20, fontFamily: T.fm, fontSize: 14,
          color: T.tealLight, padding: '4px 10px', border: `1px solid ${T.tealDeep}`,
          borderRadius: 999 }}>recommended</div>
        <div style={{ fontFamily: T.fm, fontSize: 16, color: T.tealLight, marginBottom: 18,
          letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Karpenter
        </div>
        {['Picks instance types to fit pending pods',
          'Provisions in ~30s, not minutes',
          'Consolidates to cheaper nodes continuously',
          'Native spot + on-demand diversity'].map(t => (
          <div key={t} style={{ fontFamily: T.fb, fontSize: 24, color: T.text, lineHeight: 1.45,
            marginBottom: 14, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <span style={{ color: T.tealLight, fontFamily: T.fm }}>→</span>{t}
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

// ---------- 05. Bullet slide ----------
const BulletSlide = ({ num, total }) => {
  const points = [
    ['Provisioner watches pending pods', 'Every 10 seconds, Karpenter scans for unschedulable pods and evaluates the cheapest instance shape that would fit them.'],
    ['Launches nodes directly via EC2 Fleet', 'No Auto Scaling Group indirection — instances boot in ~30 seconds with a pre-configured AMI.'],
    ['Consolidation loop runs continuously', 'Workloads get bin-packed onto fewer, cheaper nodes whenever possible. Emptier nodes get drained.'],
    ['Disruption controls protect workloads', 'Budgets, do-not-disrupt annotations, and TTLs let you tune how aggressive Karpenter gets.'],
  ];
  return (
    <Shell num={num} total={total}
      accents={<Accent color="#14B8A6" size={600} x={1500} y={-100} opacity={0.10}/>}>
      <Eyebrow>How it works</Eyebrow>
      <h2 style={{ fontFamily: T.fd, fontSize: 68, fontWeight: 600, color: T.text, margin: 0,
        letterSpacing: '-0.02em', marginBottom: 56 }}>
        Four loops, one controller
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px 56px' }}>
        {points.map(([t, d], i) => (
          <div key={t} style={{ display: 'grid', gridTemplateColumns: '56px 1fr', gap: 20,
            alignItems: 'flex-start' }}>
            <div style={{ fontFamily: T.fm, fontSize: 18, color: T.tealLight,
              border: `1px solid ${T.tealDeep}`, borderRadius: 10, width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div style={{ fontFamily: T.fd, fontSize: 30, fontWeight: 600, color: T.text,
                letterSpacing: '-0.01em', marginBottom: 8 }}>{t}</div>
              <div style={{ fontFamily: T.fb, fontSize: 20, color: T.textDim, lineHeight: 1.5 }}>
                {d}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ---------- 06. Diagram ----------
const DiagramSlide = ({ num, total }) => {
  const node = (x, y, w, h, label, sub, fill, stroke) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={12} fill={fill} stroke={stroke} strokeWidth={2}/>
      <text x={x + w/2} y={y + h/2 - 6} textAnchor="middle" fontFamily={T.fb} fontSize={22}
        fontWeight={600} fill={T.text}>{label}</text>
      {sub && <text x={x + w/2} y={y + h/2 + 22} textAnchor="middle" fontFamily={T.fm}
        fontSize={14} fill={T.muted}>{sub}</text>}
    </g>
  );
  const arrow = (x1, y1, x2, y2, label) => (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.tealLight} strokeWidth={2}
        markerEnd="url(#arr)"/>
      {label && <text x={(x1+x2)/2} y={(y1+y2)/2 - 10} textAnchor="middle"
        fontFamily={T.fm} fontSize={14} fill={T.tealLight}>{label}</text>}
    </g>
  );
  return (
    <Shell num={num} total={total}
      accents={<Accent color="#14B8A6" size={500} x={-200} y={500} opacity={0.08}/>}>
      <Eyebrow>Provisioning loop</Eyebrow>
      <h2 style={{ fontFamily: T.fd, fontSize: 56, fontWeight: 600, color: T.text, margin: 0,
        letterSpacing: '-0.01em', marginBottom: 40 }}>
        From pending pod to running node in ~30s
      </h2>
      <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.borderSoft}`,
        borderRadius: 20, padding: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 1560 520" style={{ width: '100%', height: '100%' }}>
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="8" markerHeight="8"
              orient="auto"><path d="M0,0 L10,5 L0,10 z" fill={T.tealLight}/></marker>
          </defs>
          {/* Row 1 */}
          {node(40, 200, 220, 120, 'Pending Pod', 'kube-scheduler', T.bgAlt, T.border)}
          {arrow(260, 260, 380, 260, 'watch')}
          {node(380, 200, 260, 120, 'Karpenter', 'controller', T.bgAlt, T.tealDeep)}
          {arrow(640, 260, 760, 260, 'fleet API')}
          {node(760, 200, 240, 120, 'EC2 Fleet', 'multi-AZ', T.bgAlt, T.border)}
          {arrow(1000, 260, 1120, 260, 'launch')}
          {node(1120, 200, 240, 120, 'EC2 Instance', 'boot + join', T.bgAlt, T.border)}
          {arrow(1360, 260, 1480, 260, 'ready')}
          {node(1480, 200, 60, 120, '✓', '', T.tealDeep, T.tealLight)}
          {/* Consolidation feedback */}
          <path d={`M 510,320 Q 510,460 260,460 Q 100,460 100,360`} fill="none"
            stroke={T.amberLight} strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#arr)"/>
          <text x={305} y={490} textAnchor="middle" fontFamily={T.fm} fontSize={14}
            fill={T.amberLight}>consolidation loop (every 10s)</text>
          {/* Labels top */}
          <text x={150} y={180} textAnchor="middle" fontFamily={T.fm} fontSize={13}
            fill={T.muted}>01 observe</text>
          <text x={510} y={180} textAnchor="middle" fontFamily={T.fm} fontSize={13}
            fill={T.muted}>02 decide</text>
          <text x={880} y={180} textAnchor="middle" fontFamily={T.fm} fontSize={13}
            fill={T.muted}>03 request</text>
          <text x={1240} y={180} textAnchor="middle" fontFamily={T.fm} fontSize={13}
            fill={T.muted}>04 provision</text>
        </svg>
      </div>
    </Shell>
  );
};

// ---------- 07. Code ----------
const CodeSlide = ({ num, total }) => (
  <Shell num={num} total={total}
    accents={<Accent color="#14B8A6" size={500} x={1500} y={-200} opacity={0.10}/>}>
    <Eyebrow>NodePool manifest</Eyebrow>
    <h2 style={{ fontFamily: T.fd, fontSize: 56, fontWeight: 600, color: T.text, margin: 0,
      marginBottom: 32, letterSpacing: '-0.01em' }}>
      One file. Many instance shapes.
    </h2>
    <div style={{ background: T.codeBg, borderRadius: 16, border: `1px solid ${T.border}`,
      overflow: 'hidden', flex: 1 }}>
      <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ width: 12, height: 12, borderRadius: 50, background: '#EF4444' }}/>
        <span style={{ width: 12, height: 12, borderRadius: 50, background: '#F59E0B' }}/>
        <span style={{ width: 12, height: 12, borderRadius: 50, background: '#22C55E' }}/>
        <span style={{ fontFamily: T.fm, fontSize: 14, color: T.muted, marginLeft: 14 }}>nodepool.yaml</span>
      </div>
      <pre style={{ fontFamily: T.fm, fontSize: 26, lineHeight: 1.5, color: T.text, margin: 0,
        padding: 36 }}>
<span style={{color:T.amberLight}}>apiVersion</span>: karpenter.sh/v1{'\n'}
<span style={{color:T.amberLight}}>kind</span>: NodePool{'\n'}
<span style={{color:T.amberLight}}>spec</span>:{'\n'}
{'  '}<span style={{color:T.amberLight}}>template</span>:{'\n'}
{'    '}<span style={{color:T.amberLight}}>spec</span>:{'\n'}
{'      '}<span style={{color:T.amberLight}}>requirements</span>:{'\n'}
{'      '}- <span style={{color:T.tealLight}}>key</span>: <span style={{color:T.amberLight}}>"karpenter.k8s.aws/instance-category"</span>{'\n'}
{'        '}<span style={{color:T.tealLight}}>operator</span>: In{'\n'}
{'        '}<span style={{color:T.tealLight}}>values</span>: [<span style={{color:T.amberLight}}>"c"</span>, <span style={{color:T.amberLight}}>"m"</span>, <span style={{color:T.amberLight}}>"r"</span>]{'\n'}
{'      '}- <span style={{color:T.tealLight}}>key</span>: <span style={{color:T.amberLight}}>"karpenter.sh/capacity-type"</span>{'\n'}
{'        '}<span style={{color:T.tealLight}}>operator</span>: In{'\n'}
{'        '}<span style={{color:T.tealLight}}>values</span>: [<span style={{color:T.amberLight}}>"spot"</span>, <span style={{color:T.amberLight}}>"on-demand"</span>]</pre>
    </div>
  </Shell>
);

// ---------- 08. Metrics (big numbers) ----------
const MetricsSlide = ({ num, total }) => {
  const metrics = [
    ['42%', 'reduction in EC2 spend', 'across 12 production clusters over 3 months'],
    ['~30s', 'median node provisioning time', 'vs. 4–6 minutes with ASG-backed CA'],
    ['6x', 'more instance-type diversity', '14 shapes per NodePool on average'],
    ['99.95%', 'workload availability maintained', 'during consolidation events'],
  ];
  return (
    <Shell num={num} total={total}
      accents={<>
        <Accent color="#14B8A6" size={600} x={-150} y={-100} opacity={0.12}/>
        <Accent color="#F59E0B" size={500} x={1500} y={700} opacity={0.10}/>
      </>}>
      <Eyebrow color={T.amberLight}>By the numbers</Eyebrow>
      <h2 style={{ fontFamily: T.fd, fontSize: 68, fontWeight: 600, color: T.text, margin: 0,
        letterSpacing: '-0.02em', marginBottom: 56 }}>
        What we measured after switching
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, flex: 1 }}>
        {metrics.map(([n, label, sub], i) => (
          <div key={n} style={{ background: T.panel, border: `1px solid ${T.borderSoft}`,
            borderRadius: 16, padding: 40, display: 'flex', flexDirection: 'column',
            justifyContent: 'center' }}>
            <div style={{ fontFamily: T.fd, fontSize: 112, fontWeight: 700,
              color: i % 2 === 0 ? T.tealLight : T.amberLight, lineHeight: 0.9,
              letterSpacing: '-0.03em', marginBottom: 20 }}>
              {n}
            </div>
            <div style={{ fontFamily: T.fd, fontSize: 26, fontWeight: 600, color: T.text,
              marginBottom: 6 }}>{label}</div>
            <div style={{ fontFamily: T.fb, fontSize: 18, color: T.muted }}>{sub}</div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ---------- 09. Image + text ----------
const ImageSlide = ({ num, total }) => (
  <Shell num={num} total={total}
    accents={<Accent color="#14B8A6" size={500} x={-150} y={600} opacity={0.10}/>}>
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72,
      alignItems: 'center' }}>
      <div>
        <Eyebrow>Case study</Eyebrow>
        <h2 style={{ fontFamily: T.fd, fontSize: 64, fontWeight: 600, color: T.text, margin: 0,
          letterSpacing: '-0.02em', lineHeight: 1.08, marginBottom: 32 }}>
          A SaaS platform with very spiky traffic
        </h2>
        <div style={{ fontFamily: T.fb, fontSize: 22, color: T.textDim, lineHeight: 1.55,
          marginBottom: 24 }}>
          800-node cluster, workloads that 10x in five minutes and back down in twenty.
          With fixed node groups, they over-provisioned by 60% just to handle bursts.
        </div>
        <div style={{ fontFamily: T.fb, fontSize: 22, color: T.textDim, lineHeight: 1.55 }}>
          We moved to three Karpenter NodePools — system, burst, batch — and let
          consolidation run continuously. Bill dropped <span style={{ color: T.tealLight,
          fontWeight: 600 }}>42%</span> in the first month.
        </div>
      </div>
      <div style={{ aspectRatio: '4/3', background: T.panel,
        border: `1px solid ${T.borderSoft}`, borderRadius: 20, overflow: 'hidden',
        display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {/* Placeholder illustration — replace with real screenshot or photo */}
        <svg viewBox="0 0 400 300" style={{ width: '86%', height: '86%' }}>
          <defs>
            <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={T.tealLight} stopOpacity="0.7"/>
              <stop offset="1" stopColor={T.tealLight} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <g stroke={T.borderSoft} strokeWidth="1">
            {[0,1,2,3,4].map(i => <line key={i} x1="20" x2="380" y1={40+i*50} y2={40+i*50}/>)}
          </g>
          {/* Pre-Karpenter flat line */}
          <path d="M 20,80 L 380,80" stroke={T.muted} strokeWidth="2" strokeDasharray="4 4" fill="none"/>
          <text x="30" y="72" fontFamily={T.fm} fontSize="10" fill={T.muted}>fixed capacity (pre)</text>
          {/* Karpenter — follows demand */}
          <path d="M 20,220 L 60,220 L 80,210 L 120,180 L 140,110 L 160,90 L 180,100 L 220,160 L 260,200 L 300,215 L 340,218 L 380,220"
            stroke={T.tealLight} strokeWidth="3" fill="none"/>
          <path d="M 20,220 L 60,220 L 80,210 L 120,180 L 140,110 L 160,90 L 180,100 L 220,160 L 260,200 L 300,215 L 340,218 L 380,220 L 380,260 L 20,260 Z"
            fill="url(#g1)"/>
          <text x="30" y="250" fontFamily={T.fm} fontSize="10" fill={T.tealLight}>karpenter: capacity = demand</text>
        </svg>
        <div style={{ position: 'absolute', bottom: 16, right: 20, fontFamily: T.fm, fontSize: 12,
          color: T.muted }}>fig. node count over 24h</div>
      </div>
    </div>
  </Shell>
);

// ---------- 10. Quote ----------
const QuoteSlide = ({ num, total }) => (
  <Shell num={num} total={total} bg={AMBIENT.teal}
    accents={<>
      <Accent color="#14B8A6" size={900} x={-250} y={-200} opacity={0.35} blur={140}/>
      <Accent color="#F59E0B" size={600} x={1400} y={700} opacity={0.22} blur={140}/>
    </>}>
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', flex: 1, gap: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Eyebrow>Principle</Eyebrow>
        <div style={{ fontFamily: T.fm, fontSize: 14, color: T.muted, letterSpacing: '0.12em',
          textTransform: 'uppercase' }}>
          Core idea · remember this one
        </div>
      </div>
      <Panel style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: 80 }}>
        <div style={{ fontFamily: T.fd, fontSize: 180, color: T.tealLight, lineHeight: 0.5,
          marginBottom: 40, opacity: 0.85 }}>“</div>
        <blockquote style={{ fontFamily: T.fd, fontSize: 84, fontWeight: 500, lineHeight: 1.14,
          letterSpacing: '-0.02em', color: T.text, margin: 0, maxWidth: 1500 }}>
          The cheapest node is <span style={{ color: T.tealLight }}>the one you don't run</span>.
          The second cheapest is <span style={{ color: T.amberLight }}>the one sized exactly right</span>.
        </blockquote>
        <div style={{ marginTop: 48, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 48, height: 2, background: T.tealLight }}/>
          <div style={{ fontFamily: T.fb, fontSize: 22, color: T.textDim }}>
            Something I keep telling clients on every cluster review
          </div>
        </div>
      </Panel>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24 }}>
        {[
          ['Don\'t run', 'Scale to zero where possible — batch, dev, preview envs'],
          ['Right size', 'Let Karpenter pick shape from requests, not your guesswork'],
          ['Consolidate', 'Let the loop repack continuously; that\'s the whole game'],
        ].map(([t, d]) => (
          <div key={t} style={{ padding: '20px 0', borderTop: `1px solid ${T.borderSoft}` }}>
            <div style={{ fontFamily: T.fd, fontSize: 22, fontWeight: 600, color: T.tealLight,
              marginBottom: 6 }}>{t}</div>
            <div style={{ fontFamily: T.fb, fontSize: 16, color: T.muted, lineHeight: 1.5 }}>{d}</div>
          </div>
        ))}
      </div>
    </div>
  </Shell>
);

// ---------- 11. Takeaways ----------
const TakeawaysSlide = ({ num, total }) => {
  const items = [
    ['Start with one NodePool', 'Resist premature segmentation. Diversify instance types before you split pools.'],
    ['Let consolidation run', 'The default every-10s loop is fine. Tune with budgets, not by disabling it.'],
    ['Measure before / after', 'Cost, provisioning time, and disruption frequency — all three matter.'],
  ];
  return (
    <Shell num={num} total={total}
      accents={<Accent color="#14B8A6" size={500} x={1500} y={-100} opacity={0.10}/>}>
      <Eyebrow>Takeaways</Eyebrow>
      <h2 style={{ fontFamily: T.fd, fontSize: 72, fontWeight: 600, color: T.text, margin: 0,
        letterSpacing: '-0.02em', marginBottom: 56 }}>
        If you remember three things
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map(([t, d], i) => (
          <div key={t} style={{ display: 'grid', gridTemplateColumns: '80px 1fr',
            padding: '32px 0', borderTop: `1px solid ${T.borderSoft}`,
            borderBottom: i === items.length - 1 ? `1px solid ${T.borderSoft}` : 'none' }}>
            <div style={{ fontFamily: T.fd, fontSize: 52, fontWeight: 700, color: T.tealLight,
              lineHeight: 1 }}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div>
              <div style={{ fontFamily: T.fd, fontSize: 36, fontWeight: 600, color: T.text,
                letterSpacing: '-0.01em', marginBottom: 8 }}>{t}</div>
              <div style={{ fontFamily: T.fb, fontSize: 22, color: T.textDim, lineHeight: 1.5,
                maxWidth: 1200 }}>{d}</div>
            </div>
          </div>
        ))}
      </div>
    </Shell>
  );
};

// ---------- 12. Thanks ----------
const ThanksSlide = ({ num, total }) => (
  <Shell num={num} total={total} bg={AMBIENT.teal}
    accents={<>
      <Accent color="#14B8A6" size={1000} x={-300} y={500} opacity={0.38} blur={140}/>
      <Accent color="#0D9488" size={700} x={1300} y={-200} opacity={0.30} blur={140}/>
      <Accent color="#F59E0B" size={500} x={1400} y={600} opacity={0.18} blur={140}/>
    </>}>
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 64, flex: 1,
      alignItems: 'stretch' }}>
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <Eyebrow>End of talk · 12 of 12</Eyebrow>
          <h1 style={{ fontFamily: T.fd, fontSize: 240, fontWeight: 700, lineHeight: 0.9,
            letterSpacing: '-0.04em', color: T.text, margin: 0 }}>
            Thanks<span style={{ color: T.tealLight }}>.</span>
          </h1>
          <div style={{ fontFamily: T.fb, fontSize: 32, color: T.textDim, marginTop: 36,
            maxWidth: 700, lineHeight: 1.3 }}>
            Questions? Find me after — or any of the places on the right.
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            ['Talk recording', 'youtube.com/@vedmich'],
            ['Slide deck', 's.vedmich.dev/karpenter-prod'],
            ['Code samples', 'github.com/vedmichv/karpenter-prod'],
            ['Office hours', 'cal.com/vedmich'],
          ].map(([k, v]) => (
            <div key={k} style={{ padding: '16px 0', borderTop: `1px solid ${T.borderSoft}` }}>
              <div style={{ fontFamily: T.fd, fontSize: 18, fontWeight: 600, color: T.tealLight,
                marginBottom: 4 }}>{k}</div>
              <div style={{ fontFamily: T.fm, fontSize: 15, color: T.textDim }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
      <Panel style={{ padding: 48, display: 'flex', flexDirection: 'column',
        justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
            <img src="../../assets/vv-logo-hero.png"
              style={{ width: 72, height: 72, borderRadius: 16 }}/>
            <div>
              <div style={{ fontFamily: T.fd, fontSize: 24, fontWeight: 700, color: T.text }}>
                Viktor Vedmich
              </div>
              <div style={{ fontFamily: T.fb, fontSize: 16, color: T.muted }}>
                Sr. Solutions Architect @ AWS
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              ['Site', 'vedmich.dev'],
              ['LinkedIn', 'linkedin.com/in/vedmich'],
              ['GitHub', 'github.com/vedmichv'],
              ['X', 'x.com/vedmich'],
              ['Email', 'hi@vedmich.dev'],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'grid', gridTemplateColumns: '120px 1fr',
                alignItems: 'baseline', fontFamily: T.fm, fontSize: 18 }}>
                <span style={{ color: T.tealLight }}>{k} →</span>
                <span style={{ color: T.text }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ paddingTop: 20, borderTop: `1px solid ${T.borderSoft}`,
          fontFamily: T.fb, fontSize: 14, color: T.muted, lineHeight: 1.5 }}>
          Slides released under CC BY 4.0 · Code samples MIT-licensed.
          Feedback welcome at <span style={{ color: T.tealLight }}>feedback@vedmich.dev</span>.
        </div>
      </Panel>
    </div>
  </Shell>
);

// ---------- Deck ----------
const slides = [
  TitleSlide, AgendaSlide, SectionSlide, CompareSlide, BulletSlide,
  DiagramSlide, CodeSlide, MetricsSlide, ImageSlide, QuoteSlide,
  TakeawaysSlide, ThanksSlide,
];

const Deck = () => {
  const [i, setI] = useState(() => {
    const s = parseInt(localStorage.getItem('vv_slidev_idx') || '0', 10);
    return isNaN(s) ? 0 : Math.min(Math.max(s, 0), slides.length - 1);
  });
  useEffect(() => { localStorage.setItem('vv_slidev_idx', String(i)); }, [i]);
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') setI(x => Math.min(x + 1, slides.length - 1));
      if (e.key === 'ArrowLeft') setI(x => Math.max(x - 1, 0));
    };
    window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h);
  }, []);
  const Slide = slides[i];
  return (
    <>
      <Stage><Slide num={i + 1} total={slides.length}/></Stage>
      <div style={{ position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 6, background: 'rgba(15,23,42,.82)', backdropFilter: 'blur(12px)',
        border: `1px solid ${T.border}`, borderRadius: 9999, padding: '8px 14px', zIndex: 100,
        alignItems: 'center' }}>
        <button onClick={() => setI(x => Math.max(x - 1, 0))} style={navBtn}>←</button>
        {slides.map((_, idx) => (
          <button key={idx} onClick={() => setI(idx)} aria-label={`Slide ${idx+1}`}
            style={{ ...dotBtn, background: idx === i ? T.teal : T.border }}/>
        ))}
        <button onClick={() => setI(x => Math.min(x + 1, slides.length - 1))} style={navBtn}>→</button>
      </div>
    </>
  );
};
const navBtn = { fontFamily: 'monospace', fontSize: 14, color: T.text, background: 'transparent',
  border: 'none', cursor: 'pointer', padding: '4px 10px' };
const dotBtn = { width: 8, height: 8, borderRadius: 50, border: 'none', cursor: 'pointer',
  transition: 'background 150ms', padding: 0, margin: '0 2px' };

ReactDOM.createRoot(document.getElementById('root')).render(<Deck/>);
