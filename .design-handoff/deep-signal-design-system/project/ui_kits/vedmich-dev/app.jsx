// vedmich.dev portfolio — UI kit recreation
// Copy of visual language from vedmichv/vedmich.dev (Astro + Tailwind 4)

const { useState, useEffect } = React;

// ---------- Design tokens (mirror colors_and_type.css) ----------
const VV = {
  bg: '#0F172A',
  surface: '#1E293B',
  elevated: '#334155',
  border: '#334155',
  text: '#E2E8F0',
  mute: '#94A3B8',
  muted: '#78909C',
  teal: '#14B8A6',
  tealHover: '#2DD4BF',
  tealDeep: '#0D9488',
  amber: '#F59E0B',
  amberHover: '#FBBF24',
  codeBg: '#0D1117',
  fontDisplay: "'Space Grotesk', sans-serif",
  fontBody: "'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

// ---------- Data (from src/data/social.ts) ----------
const skills = [
  'AI Engineering','Distributed Systems','Kubernetes','AWS Cloud','Platform Engineering',
  'API Design','Observability','GenAI / LLM','Terraform','Python','Cost Optimization'
];
const certs = [
  { name: 'CNCF Kubernaut', hl: true },
  { name: 'CKA' },{ name: 'CKS' },{ name: 'CKAD' },{ name: 'KCNA' },{ name: 'KCSA' },
];
const socialLinks = [
  { name: 'LinkedIn', url: 'https://de.linkedin.com/in/vedmich' },
  { name: 'GitHub',   url: 'https://github.com/vedmichv' },
  { name: 'YouTube',  url: 'https://www.youtube.com/c/DevOpsKitchenTalks' },
  { name: 'X',        url: 'https://x.com/vedmichv' },
  { name: 'Telegram', url: 'https://t.me/ViktorVedmich' },
];
const speakingEvents = [
  { year: '2026', events: [
    { name: 'Code Europe', location: 'Krakow', talks: [
      'Mastering Kubernetes Scalability with Karpenter',
      'Building Production GenAI: MCP and Multi-Agent Systems in Action']},
    { name: 'AWS Community Day Slovakia', location: 'Bratislava', talks: [
      'Karpenter in Production: Architecting Cost-Efficient K8s Clusters']},
  ]},
  { year: '2024', events: [
    { name: 'AWS Summit Amsterdam', location: 'Amsterdam', talks: [
      'New Era of IaC: Effective Kubernetes Management with cdk8s',
      'Build Verifiable and Effective Application Authorization in 40 Minutes']},
    { name: 'AWS Community Day Armenia', location: 'Yerevan', talks: ['Kubernetes Security']},
  ]},
  { year: '2023', events: [
    { name: 'AWS re:Invent', location: 'Las Vegas', talks: [
      'New Era of IaC: Effective Kubernetes Management with CDK8S (BOA310)'],
      highlight: 'Speaker rating: 4.7 / 5.0'},
  ]},
];
const presentations = [
  { title: 'Karpenter in production: right-sizing at scale', slug: 'karpenter-prod',
    date: '2026-04-19', event: 'AWS Community Day · Bratislava',
    excerpt: 'Architecting cost-efficient K8s clusters. Lessons from 12 production deployments — what worked, what didn\'t, and the numbers.',
    tags: ['Kubernetes','AWS','Karpenter']},
  { title: 'MCP servers for platform teams', slug: 'mcp-platform',
    date: '2026-03-08', event: 'Code Europe · Krakow',
    excerpt: 'What the Model Context Protocol actually solves for infrastructure tooling — with three live demos and a reference implementation.',
    tags: ['AI','MCP','Agents']},
  { title: 'Prompt Engineering for DevOps', slug: 'slurm-prompt-engineering',
    date: '2026-02-14', event: 'Slurm AI for DevOps',
    excerpt: 'AI prompt techniques for infrastructure automation. Patterns, anti-patterns, and a shared vocabulary for reviewing AI-generated IaC.',
    tags: ['AI','DevOps','Prompt Engineering']},
  { title: 'Slurm AI Demo', slug: 'slurm-ai-demo',
    date: '2026-01-22', event: 'Slurm AI for DevOps',
    excerpt: 'Course theme showcase — how the curriculum maps AI capabilities onto the everyday DevOps workflow.',
    tags: ['AI','Demo']},
  { title: 'Multi-AZ data on EKS without tears', slug: 'eks-multi-az',
    date: '2025-11-05', event: 'KubeCon EU · Paris',
    excerpt: 'Topology-aware routing, cost of cross-AZ traffic, and how we got the p99 back under 50ms after a botched migration.',
    tags: ['Kubernetes','AWS','Networking']},
  { title: 'The podcast workflow behind DKT', slug: 'dkt-workflow',
    date: '2025-09-18', event: 'DevOpsConf · online',
    excerpt: 'Five years, 91+ episodes, two shows. The tooling, the outreach script, and the editing pipeline.',
    tags: ['Meta','Podcasting']},
];
const blogPosts = [
  { title: 'Karpenter in production: right-sizing at scale', date: '2026-03-20',
    tags: ['kubernetes','aws','karpenter'],
    excerpt: 'Six months running Karpenter across three production clusters — what actually moved the cost needle.' },
  { title: 'MCP servers, plainly explained', date: '2026-03-02',
    tags: ['ai','mcp','agents'],
    excerpt: 'Strip away the hype. An MCP server is a small RPC surface your model can call. Here is what changes.' },
  { title: 'Why I still write Kubernetes manifests by hand', date: '2026-02-10',
    tags: ['kubernetes','opinion'],
    excerpt: 'Helm charts and operators hide more than they help during incident response. A contrarian take.' },
];

// ---------- Primitives ----------
const Section = ({ id, title, subtitle, children, bg }) => (
  <section id={id} style={{ padding: '80px 24px', background: bg || 'transparent' }}>
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      {title && (
        <div style={{ marginBottom: 40 }}>
          <h2 style={{ fontFamily: VV.fontDisplay, fontSize: 28, fontWeight: 600,
            color: VV.text, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
          {subtitle && <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: '8px 0 0 0', fontSize: 16 }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  </section>
);

const Pill = ({ children, variant = 'default' }) => {
  const st = { default: { bg: VV.surface, fg: VV.text, bd: VV.border },
    teal: { bg: 'rgba(20,184,166,.1)', fg: VV.teal, bd: 'rgba(20,184,166,.3)' }
  }[variant];
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 14px', borderRadius: 9999, fontSize: 13, fontWeight: 500,
    fontFamily: VV.fontBody, background: st.bg, color: st.fg, border: `1px solid ${st.bd}` }}>{children}</span>;
};

const Badge = ({ children, color = VV.teal }) => (
  <span style={{ display:'inline-block', padding:'4px 8px', borderRadius:4,
    fontFamily: VV.fontBody, fontSize:11, fontWeight:600, letterSpacing:'0.08em',
    textTransform:'uppercase', color, background:`${color}1a`, border:`1px solid ${color}40` }}>{children}</span>
);

const Button = ({ children, variant = 'primary', onClick, href }) => {
  const styles = {
    primary: { bg: VV.teal, fg: VV.bg, bd: VV.teal },
    accent:  { bg: VV.amber, fg: VV.bg, bd: VV.amber },
    ghost:   { bg: 'transparent', fg: VV.text, bd: VV.border },
  }[variant];
  const [hover, setHover] = useState(false);
  const hoverBg = { primary: VV.tealHover, accent: VV.amberHover, ghost: 'transparent' }[variant];
  const hoverBd = { primary: VV.tealHover, accent: VV.amberHover, ghost: VV.teal }[variant];
  const props = {
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    onClick,
    style: {
      fontFamily: VV.fontBody, fontSize: 15, fontWeight: 500,
      padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
      border: `1px solid ${hover ? hoverBd : styles.bd}`,
      background: hover ? hoverBg : styles.bg, color: styles.fg,
      transition: 'all 150ms ease-out', textDecoration: 'none',
      display: 'inline-flex', alignItems: 'center', gap: 8,
      boxShadow: hover && variant === 'ghost' ? '0 0 16px rgba(20,184,166,.15)' : 'none',
    }
  };
  return href ? <a href={href} {...props}>{children}</a> : <button {...props}>{children}</button>;
};

const Card = ({ children, onClick, hoverable = true }) => {
  const [h, setH] = useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ background: VV.surface, border: `1px solid ${h && hoverable ? VV.teal : VV.border}`,
        borderRadius: 12, padding: 24, transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
        boxShadow: h && hoverable ? '0 0 20px rgba(20,184,166,.15)' : 'none',
        cursor: onClick ? 'pointer' : 'default' }}>
      {children}
    </div>
  );
};

// ---------- Search Palette ----------
// Indexes presentations + blogPosts into a single fuzzy list.
// Opens with ⌘K / Ctrl+K / "/" — Esc closes, ↑↓ to move, Enter to go.
const buildSearchIndex = () => [
  ...presentations.map(p => ({
    kind: 'slides', title: p.title, sub: `${p.date} · ${p.event}`,
    url: `https://s.vedmich.dev/${p.slug}`, tags: p.tags, body: p.excerpt,
  })),
  ...blogPosts.map(p => ({
    kind: 'post', title: p.title, sub: p.date,
    url: '#blog', tags: p.tags, body: p.excerpt,
  })),
];

const fuzzyScore = (q, item) => {
  const needle = q.toLowerCase().trim();
  if (!needle) return 0;
  const hay = `${item.title} ${item.body} ${item.tags.join(' ')} ${item.kind}`.toLowerCase();
  // exact substring in title = strongest
  if (item.title.toLowerCase().includes(needle)) return 100 - item.title.length * 0.1;
  if (hay.includes(needle)) return 60;
  // token-based: every word in query must appear somewhere
  const tokens = needle.split(/\s+/).filter(Boolean);
  if (tokens.every(t => hay.includes(t))) return 30;
  return 0;
};

const SearchPalette = ({ open, onClose }) => {
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const inputRef = React.useRef(null);
  const index = React.useMemo(buildSearchIndex, []);
  const results = React.useMemo(() => {
    if (!q.trim()) return index.slice(0, 6);
    return index
      .map(i => ({ item: i, score: fuzzyScore(q, i) }))
      .filter(r => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(r => r.item);
  }, [q, index]);

  useEffect(() => { if (open) { setQ(''); setSel(0); setTimeout(() => inputRef.current?.focus(), 10); } }, [open]);
  useEffect(() => { setSel(0); }, [q]);

  if (!open) return null;

  const go = (item) => {
    if (item.url.startsWith('#')) {
      document.querySelector(item.url)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.open(item.url, '_blank');
    }
    onClose();
  };

  const onKeyDown = (e) => {
    if (e.key === 'Escape') { onClose(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setSel(s => Math.min(s + 1, results.length - 1)); }
    else if (e.key === 'ArrowUp')   { e.preventDefault(); setSel(s => Math.max(s - 1, 0)); }
    else if (e.key === 'Enter' && results[sel]) { e.preventDefault(); go(results[sel]); }
  };

  return (
    <div onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.72)',
        backdropFilter: 'blur(6px)', zIndex: 50,
        display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        paddingTop: 96, animation: 'fadeIn 120ms ease-out' }}>
      <div onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 640, background: VV.surface,
          border: `1px solid ${VV.border}`, borderRadius: 14, overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(20,184,166,0.12)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', borderBottom: `1px solid ${VV.border}` }}>
          <span style={{ color: VV.teal, fontFamily: VV.fontMono, fontSize: 16 }}>⌕</span>
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search slides, posts, tags…"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none',
              fontFamily: VV.fontBody, fontSize: 16, color: VV.text }}/>
          <kbd style={{ fontFamily: VV.fontMono, fontSize: 11, color: VV.mute,
            background: VV.bg, padding: '3px 7px', borderRadius: 4,
            border: `1px solid ${VV.border}` }}>Esc</kbd>
        </div>
        <div style={{ maxHeight: 380, overflowY: 'auto' }}>
          {results.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', fontFamily: VV.fontBody,
              color: VV.mute, fontSize: 14 }}>
              No matches for <span style={{ color: VV.text }}>"{q}"</span>. Try: "karpenter", "mcp", "kubernetes".
            </div>
          ) : results.map((r, i) => (
            <div key={`${r.kind}-${r.title}`} onClick={() => go(r)}
              onMouseEnter={() => setSel(i)}
              style={{ padding: '14px 18px', cursor: 'pointer',
                background: i === sel ? 'rgba(20,184,166,0.08)' : 'transparent',
                borderLeft: `2px solid ${i === sel ? VV.teal : 'transparent'}`,
                display: 'grid', gridTemplateColumns: '62px 1fr auto', gap: 14,
                alignItems: 'center' }}>
              <span style={{ fontFamily: VV.fontMono, fontSize: 10, fontWeight: 600,
                color: r.kind === 'slides' ? VV.teal : VV.amber,
                background: r.kind === 'slides' ? 'rgba(20,184,166,0.12)' : 'rgba(245,158,11,0.12)',
                border: `1px solid ${r.kind === 'slides' ? 'rgba(20,184,166,0.3)' : 'rgba(245,158,11,0.3)'}`,
                padding: '3px 8px', borderRadius: 4, letterSpacing: '0.08em',
                textTransform: 'uppercase', textAlign: 'center' }}>
                {r.kind === 'slides' ? 'Slides' : 'Post'}
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: VV.fontDisplay, fontSize: 15, fontWeight: 600,
                  color: VV.text, marginBottom: 3, whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                <div style={{ fontFamily: VV.fontMono, fontSize: 11, color: VV.mute,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.sub}</div>
              </div>
              <span style={{ fontFamily: VV.fontMono, fontSize: 14, color: VV.mute }}>↵</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 18px', borderTop: `1px solid ${VV.border}`,
          fontFamily: VV.fontMono, fontSize: 11, color: VV.muted }}>
          <div style={{ display: 'flex', gap: 14 }}>
            <span><kbd style={kbdS}>↑</kbd> <kbd style={kbdS}>↓</kbd> move</span>
            <span><kbd style={kbdS}>↵</kbd> open</span>
          </div>
          <span>{results.length} result{results.length === 1 ? '' : 's'} · {index.length} indexed</span>
        </div>
      </div>
    </div>
  );
};
const kbdS = { fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#CBD5E1',
  background: 'rgba(148,163,184,0.08)', padding: '1px 5px', borderRadius: 3,
  border: '1px solid rgba(148,163,184,0.2)' };

// ---------- Header ----------
const Header = ({ current, setCurrent, onOpenSearch }) => {
  const nav = [
    ['about','About'], ['podcasts','Podcasts'], ['book','Book'],
    ['speaking','Speaking'], ['presentations','Slides'],
    ['blog','Blog'], ['contact','Contact']
  ];
  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${VV.border}` }}>
      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); setCurrent('home'); }}
           style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <img src="../../assets/vv-logo-hero.png" alt="VV" style={{ width: 32, height: 32, borderRadius: 7 }}/>
          <span style={{ fontFamily: VV.fontDisplay, fontWeight: 700, fontSize: 16, color: VV.text, letterSpacing: '-0.01em' }}>vedmich.dev</span>
        </a>
        <nav style={{ display: 'flex', gap: 24 }}>
          {nav.map(([id, label]) => (
            <a key={id} href={`#${id}`}
              style={{ fontFamily: VV.fontBody, fontSize: 14, fontWeight: 500,
                color: VV.mute, textDecoration: 'none', transition: 'color 150ms' }}
              onMouseEnter={e => e.target.style.color = VV.teal}
              onMouseLeave={e => e.target.style.color = VV.mute}>{label}</a>
          ))}
        </nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={onOpenSearch}
            style={{ fontFamily: VV.fontBody, fontSize: 13, background: VV.bg,
              border: `1px solid ${VV.border}`, color: VV.mute, padding: '6px 8px 6px 10px',
              borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
              transition: 'all 150ms' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = VV.teal;
              e.currentTarget.style.color = VV.text; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = VV.border;
              e.currentTarget.style.color = VV.mute; }}>
            <span style={{ color: VV.teal, fontFamily: VV.fontMono, fontSize: 13 }}>⌕</span>
            <span>Search…</span>
            <kbd style={{ fontFamily: VV.fontMono, fontSize: 10,
              background: VV.surface, padding: '1px 5px', borderRadius: 3,
              border: `1px solid ${VV.border}`, color: VV.muted }}>⌘K</kbd>
          </button>
          <button style={{ fontFamily: VV.fontMono, fontSize: 12, background: 'transparent',
            border: `1px solid ${VV.border}`, color: VV.mute, padding: '6px 10px',
            borderRadius: 6, cursor: 'pointer' }}>EN · RU</button>
        </div>
      </div>
    </header>
  );
};

// ---------- Hero ----------
const Hero = ({ onCTA }) => (
  <section id="hero" style={{ padding: '96px 24px 64px',
    background: 'linear-gradient(160deg,#0F172A,#134E4A)' }}>
    <div style={{ maxWidth: 1120, margin: '0 auto' }}>
      <div style={{ fontFamily: VV.fontMono, color: VV.teal, fontSize: 14, marginBottom: 16 }}>
        ~/vedmich.dev $ whoami
      </div>
      <div style={{ fontFamily: VV.fontMono, color: VV.mute, fontSize: 16, marginBottom: 4 }}>
        Hi, I'm
      </div>
      <h1 style={{ fontFamily: VV.fontDisplay, fontSize: 64, fontWeight: 700,
        letterSpacing: '-0.03em', color: VV.text, margin: 0, lineHeight: 1.05 }}>
        Viktor Vedmich<Cursor/>
      </h1>
      <div style={{ fontFamily: VV.fontMono, color: VV.amber, fontSize: 18, marginTop: 12 }}>
        Senior Solutions Architect @ AWS
      </div>
      <p style={{ fontFamily: VV.fontBody, color: VV.mute, fontSize: 18, marginTop: 18, maxWidth: 640 }}>
        Distributed Systems · Kubernetes · <span style={{ color: VV.text }}>AI Engineer</span>
      </p>
      <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
        {certs.map(c => (
          <Pill key={c.name} variant={c.hl ? 'teal' : 'default'}>
            {c.hl && <span style={{ width: 6, height: 6, borderRadius: 50, background: VV.teal }}/>}
            {c.name}
          </Pill>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 32 }}>
        <Button variant="primary" onClick={onCTA}>Get in touch</Button>
        <Button variant="ghost" href="#about">Read more →</Button>
      </div>
    </div>
  </section>
);

const Cursor = () => {
  const [on, setOn] = useState(true);
  useEffect(() => { const id = setInterval(() => setOn(o => !o), 500); return () => clearInterval(id); }, []);
  return <span style={{ color: VV.teal, opacity: on ? 1 : 0 }}>_</span>;
};

// ---------- About ----------
const About = () => (
  <Section id="about" title="About me">
    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 40, alignItems: 'start' }}>
      <p style={{ fontFamily: VV.fontBody, fontSize: 18, lineHeight: 1.7, color: VV.text, margin: 0 }}>
        Solutions Architect and AI Engineer with 15+ years designing and evolving distributed systems at scale.
        Currently at AWS, owning end-to-end architecture for enterprise clients across hybrid cloud,
        Kubernetes, and GenAI / agentic platforms. CNCF Kubernaut and author of
        <span style={{ color: VV.teal }}> "Cracking the Kubernetes Interview"</span>.
      </p>
      <div>
        <div className="overline" style={{ fontFamily: VV.fontBody, fontSize: 11, fontWeight: 600,
          color: VV.mute, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
          Expertise
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {skills.map(s => <Pill key={s}>{s}</Pill>)}
        </div>
      </div>
    </div>
  </Section>
);

// ---------- Podcasts ----------
const Podcasts = () => (
  <Section id="podcasts" title="Podcasts">
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      <Card>
        <Badge color={VV.teal}>DKT</Badge>
        <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 600, color: VV.text, margin: '12px 0 8px' }}>
          DevOps Kitchen Talks</h3>
        <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          Technical deep-dives into DevOps, Kubernetes, and infrastructure. Interviews with industry experts, mock interviews, and hands-on topics.
        </p>
        <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.muted, marginTop: 16 }}>
          91+ episodes · 10K+ subscribers
        </div>
        <div style={{ marginTop: 16 }}><Button variant="ghost" href="#">Listen →</Button></div>
      </Card>
      <Card>
        <Badge color={VV.amber}>AWS RU</Badge>
        <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 600, color: VV.text, margin: '12px 0 8px' }}>
          AWS на русском</h3>
        <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: 0, fontSize: 15, lineHeight: 1.6 }}>
          AWS services, architectural patterns, AI applications, and IT careers — all in Russian. Vendor-agnostic perspective from inside AWS.
        </p>
        <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.muted, marginTop: 16 }}>
          65+ episodes · 70K+ listens
        </div>
        <div style={{ marginTop: 16 }}><Button variant="ghost" href="#">Listen →</Button></div>
      </Card>
    </div>
  </Section>
);

// ---------- Speaking ----------
const Speaking = () => (
  <Section id="speaking" title="Speaking" subtitle="30+ technical deep-dives per year. Speaker rating: 4.5–4.7 / 5.0" bg={VV.surface}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      {speakingEvents.map(yr => (
        <div key={yr.year} style={{ display: 'grid', gridTemplateColumns: '100px 1fr', gap: 24 }}>
          <div style={{ fontFamily: VV.fontDisplay, fontSize: 36, fontWeight: 700,
            color: VV.teal, letterSpacing: '-0.02em' }}>{yr.year}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {yr.events.map(ev => (
              <div key={ev.name} style={{ borderLeft: `2px solid ${VV.border}`, paddingLeft: 20 }}>
                <div style={{ fontFamily: VV.fontDisplay, fontSize: 18, fontWeight: 600, color: VV.text }}>
                  {ev.name} <span style={{ color: VV.mute, fontWeight: 400 }}>· {ev.location}</span>
                </div>
                {ev.talks.map(t => (
                  <div key={t} style={{ fontFamily: VV.fontBody, fontSize: 14, color: VV.mute, marginTop: 6 }}>
                    → {t}
                  </div>
                ))}
                {ev.highlight && (
                  <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.amber, marginTop: 8 }}>
                    ★ {ev.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Section>
);

// ---------- Book ----------
const Book = () => (
  <Section id="book" title="Book">
    <Card hoverable={false}>
      <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr auto', gap: 28, alignItems: 'center' }}>
        <div style={{ width: 140, height: 200, background: 'linear-gradient(160deg,#134E4A,#0F172A)',
          borderRadius: 8, border: `1px solid ${VV.teal}`, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', padding: 16 }}>
          <div style={{ fontFamily: VV.fontMono, fontSize: 10, color: VV.amber, letterSpacing: '0.1em' }}>PACKT</div>
          <div>
            <div style={{ fontFamily: VV.fontDisplay, fontSize: 16, fontWeight: 700, color: VV.text, lineHeight: 1.1 }}>
              Cracking the Kubernetes Interview
            </div>
            <div style={{ fontFamily: VV.fontMono, fontSize: 10, color: VV.teal, marginTop: 8 }}>
              V. Vedmich
            </div>
          </div>
        </div>
        <div>
          <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 600, color: VV.text, margin: 0 }}>
            Cracking the Kubernetes Interview
          </h3>
          <p style={{ fontFamily: VV.fontBody, fontSize: 15, color: VV.mute, lineHeight: 1.6, margin: '12px 0 0' }}>
            A comprehensive guide covering Kubernetes concepts, architecture, networking, security,
            and real-world scenarios to help you ace your next interview.
          </p>
        </div>
        <Button variant="accent" href="https://www.amazon.com/dp/1835460038">Get on Amazon</Button>
      </div>
    </Card>
  </Section>
);

// ---------- Presentations ----------
const Presentations = () => (
  <Section id="presentations" title="Recent decks"
    subtitle={`${presentations.length} talks · all slides at s.vedmich.dev`} bg={VV.surface}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {presentations.map(p => (
        <Card key={p.slug}>
          <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.muted, marginBottom: 8 }}>
            {p.date} · {p.event}
          </div>
          <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 18, fontWeight: 600, color: VV.text,
            margin: 0, lineHeight: 1.3 }}>
            {p.title}
          </h3>
          <p style={{ fontFamily: VV.fontBody, fontSize: 14, color: VV.mute, margin: '10px 0',
            lineHeight: 1.6 }}>
            {p.excerpt}
          </p>
          <div style={{ fontFamily: VV.fontMono, fontSize: 11, color: VV.teal,
            letterSpacing: '0.06em', marginTop: 8, marginBottom: 10 }}>
            s.vedmich.dev/{p.slug}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {p.tags.map(t => <Badge key={t} color={VV.teal}>{t}</Badge>)}
          </div>
        </Card>
      ))}
    </div>
    <div style={{ marginTop: 28 }}><Button variant="ghost" href="#">All decks →</Button></div>
  </Section>
);

// ---------- Blog ----------
const Blog = () => (
  <Section id="blog" title="Latest writing">
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
      {blogPosts.map(p => (
        <Card key={p.title}>
          <div style={{ fontFamily: VV.fontMono, fontSize: 12, color: VV.muted, marginBottom: 8 }}>{p.date}</div>
          <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 18, fontWeight: 600, color: VV.text, margin: 0, lineHeight: 1.3 }}>
            {p.title}
          </h3>
          <p style={{ fontFamily: VV.fontBody, fontSize: 14, color: VV.mute, margin: '10px 0', lineHeight: 1.6 }}>
            {p.excerpt}
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
            {p.tags.map(t => <Badge key={t} color={VV.teal}>{t}</Badge>)}
          </div>
        </Card>
      ))}
    </div>
    <div style={{ marginTop: 28 }}><Button variant="ghost" href="#">All posts →</Button></div>
  </Section>
);

// ---------- Contact ----------
const Contact = ({ open, setOpen, sent, setSent }) => (
  <Section id="contact" title="Let's connect" subtitle="Find me on these platforms" bg={VV.surface}>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 32 }}>
      {socialLinks.map(s => (
        <a key={s.name} href={s.url}
          style={{ background: VV.bg, border: `1px solid ${VV.border}`, borderRadius: 10,
            padding: 20, textDecoration: 'none', transition: 'all 250ms',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = VV.teal;
            e.currentTarget.style.boxShadow = '0 0 20px rgba(20,184,166,.15)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = VV.border;
            e.currentTarget.style.boxShadow = 'none'; }}>
          <div style={{ fontFamily: VV.fontDisplay, fontSize: 22, fontWeight: 700, color: VV.teal }}>
            {s.name === 'X' ? '𝕏' : s.name[0]}
          </div>
          <div style={{ fontFamily: VV.fontBody, fontSize: 13, color: VV.text }}>{s.name}</div>
        </a>
      ))}
    </div>
    {!open ? (
      <div style={{ textAlign: 'center' }}>
        <Button variant="primary" onClick={() => setOpen(true)}>Write me a message</Button>
      </div>
    ) : (
      <Card hoverable={false}>
        {!sent ? (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: VV.fontBody, fontSize: 13, fontWeight: 500, color: VV.text }}>Name</span>
              <input required type="text" style={inputStyle} placeholder="Your name"/>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: VV.fontBody, fontSize: 13, fontWeight: 500, color: VV.text }}>Email</span>
              <input required type="email" style={inputStyle} placeholder="you@domain.com"/>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontFamily: VV.fontBody, fontSize: 13, fontWeight: 500, color: VV.text }}>Message</span>
              <textarea required rows="4" style={inputStyle} placeholder="What should we build?"/>
            </label>
            <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
              <Button variant="primary">Send</Button>
              <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontFamily: VV.fontMono, fontSize: 32, color: VV.teal }}>✓</div>
            <h3 style={{ fontFamily: VV.fontDisplay, fontSize: 20, color: VV.text, margin: '8px 0' }}>Message sent</h3>
            <p style={{ fontFamily: VV.fontBody, color: VV.mute, margin: 0 }}>I'll get back to you within a day or two.</p>
          </div>
        )}
      </Card>
    )}
  </Section>
);

const inputStyle = {
  fontFamily: VV.fontBody, fontSize: 15, background: VV.bg, color: VV.text,
  border: `1px solid ${VV.border}`, borderRadius: 8, padding: '10px 14px', outline: 'none'
};

// ---------- Footer ----------
const Footer = () => (
  <footer style={{ padding: '32px 24px', borderTop: `1px solid ${VV.border}` }}>
    <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'space-between',
      fontFamily: VV.fontBody, fontSize: 13, color: VV.muted }}>
      <span>© 2026 Viktor Vedmich</span>
      <span>Built with Astro</span>
    </div>
  </footer>
);

// ---------- App ----------
const App = () => {
  const [current, setCurrent] = useState('home');
  const [contactOpen, setContactOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      const k = e.key.toLowerCase();
      if ((e.metaKey || e.ctrlKey) && k === 'k') { e.preventDefault(); setSearchOpen(true); }
      else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT'
        && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault(); setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ background: VV.bg, minHeight: '100vh', fontFamily: VV.fontBody }}>
      <Header current={current} setCurrent={setCurrent} onOpenSearch={() => setSearchOpen(true)}/>
      <Hero onCTA={() => { document.getElementById('contact')?.scrollIntoView({behavior: 'smooth'}); setContactOpen(true); }}/>
      <About/>
      <Podcasts/>
      <Book/>
      <Speaking/>
      <Presentations/>
      <Blog/>
      <Contact open={contactOpen} setOpen={setContactOpen} sent={sent} setSent={setSent}/>
      <Footer/>
      <SearchPalette open={searchOpen} onClose={() => setSearchOpen(false)}/>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
