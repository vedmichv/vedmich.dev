export const socialLinks = [
  {
    name: 'LinkedIn',
    url: 'https://de.linkedin.com/in/vedmich',
    icon: 'linkedin',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/vedmichv',
    icon: 'github',
  },
  {
    name: 'YouTube',
    url: 'https://www.youtube.com/c/DevOpsKitchenTalks',
    icon: 'youtube',
  },
  {
    name: 'X / Twitter',
    url: 'https://x.com/vedmichv',
    icon: 'twitter',
  },
  {
    name: 'Telegram',
    url: 'https://t.me/ViktorVedmich',
    icon: 'telegram',
  },
] as const;

export const certifications = [
  { name: 'CNCF Kubernaut', badge: 'kubernaut' },
  { name: 'CKA', badge: 'cka' },
  { name: 'CKS', badge: 'cks' },
  { name: 'CKAD', badge: 'ckad' },
  { name: 'KCNA', badge: 'kcna' },
  { name: 'KCSA', badge: 'kcsa' },
] as const;

export const skills = [
  'AI Engineering',
  'Distributed Systems',
  'Kubernetes',
  'AWS Cloud',
  'Platform Engineering',
  'API Design',
  'Observability',
  'GenAI / LLM',
  'Terraform',
  'Python',
  'Cost Optimization',
] as const;

export const speakingEvents = [
  {
    year: '2026',
    events: [
      {
        name: 'Code Europe',
        location: 'Krakow',
        talks: [
          'Mastering Kubernetes Scalability with Karpenter',
          'Building Production GenAI: MCP and Multi-Agent Systems in Action',
        ],
      },
      {
        name: 'AWS Community Day Slovakia',
        location: 'Bratislava',
        talks: ['Karpenter in Production: Architecting Cost-Efficient K8s Clusters'],
      },
    ],
  },
  {
    year: '2024',
    events: [
      {
        name: 'AWS Summit Amsterdam',
        location: 'Amsterdam',
        talks: [
          'New Era of IaC: Effective Kubernetes Management with cdk8s',
          'Build Verifiable and Effective Application Authorization in 40 Minutes',
        ],
      },
      {
        name: 'AWS Community Day Armenia',
        location: 'Yerevan',
        talks: ['Kubernetes Security'],
      },
    ],
  },
  {
    year: '2023',
    events: [
      {
        name: 'AWS re:Invent',
        location: 'Las Vegas',
        talks: ['New Era of IaC: Effective Kubernetes Management with CDK8S (BOA310)'],
        highlight: 'Speaker rating: 4.7/5.0',
      },
    ],
  },
] as const;

export const presentations = [
  {
    date: '2026-04-19',
    event: 'AWS Community Day',
    location: 'Bratislava',
    title: 'Karpenter in production: right-sizing at scale',
    description:
      "Architecting cost-efficient K8s clusters. Lessons from 12 production deployments — what worked, what didn't, and the numbers.",
    slug: 'karpenter-prod',
    tags: ['Kubernetes', 'AWS', 'Karpenter'],
  },
  {
    date: '2026-03-08',
    event: 'Code Europe',
    location: 'Krakow',
    title: 'MCP servers for platform teams',
    description:
      'What the Model Context Protocol actually solves for infrastructure tooling — with three live demos and a reference implementation.',
    slug: 'mcp-platform',
    tags: ['AI', 'MCP', 'Agents'],
  },
  {
    date: '2026-02-14',
    event: 'Slurm AI for DevOps',
    location: null,
    title: 'Prompt Engineering for DevOps',
    description:
      'AI prompt techniques for infrastructure automation. Patterns, anti-patterns, and a shared vocabulary for reviewing AI-generated IaC.',
    slug: 'slurm-prompt-engineering',
    tags: ['AI', 'DevOps', 'Prompt Engineering'],
  },
  {
    date: '2026-01-22',
    event: 'Slurm AI for DevOps',
    location: null,
    title: 'Slurm AI Demo',
    description:
      'Course theme showcase — how the curriculum maps AI capabilities onto the everyday DevOps workflow.',
    slug: 'slurm-ai-demo',
    tags: ['AI', 'Demo'],
  },
  {
    date: '2025-11-05',
    event: 'KubeCon EU',
    location: 'Paris',
    title: 'Multi-AZ data on EKS without tears',
    description:
      'Topology-aware routing, cost of cross-AZ traffic, and how we got the p99 back under 50ms after a botched migration.',
    slug: 'eks-multi-az',
    tags: ['Kubernetes', 'AWS', 'Networking'],
  },
  {
    date: '2025-09-18',
    event: 'DevOpsConf',
    location: 'online',
    title: 'The podcast workflow behind DKT',
    description:
      'Five years, 91+ episodes, two shows. The tooling, the outreach script, and the editing pipeline.',
    slug: 'dkt-workflow',
    tags: ['Meta', 'Podcasting'],
  },
] as const;
