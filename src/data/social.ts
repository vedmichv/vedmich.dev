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
    title: 'Prompt Engineering for DevOps',
    slug: 'slurm-prompt-engineering',
    description: 'AI prompt techniques for infrastructure automation',
    tags: ['AI', 'DevOps', 'Prompt Engineering'],
  },
  {
    title: 'Slurm AI Demo',
    slug: 'slurm-ai-demo',
    description: 'AI for DevOps course theme showcase',
    tags: ['AI', 'Demo'],
  },
] as const;
