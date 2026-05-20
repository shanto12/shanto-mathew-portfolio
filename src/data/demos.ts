import type { Demo } from '../lib/types'

export const demos: Demo[] = [
  {
    slug: 'security-ops-playbook-analyzer',
    title: 'SOC AI Agent Demo',
    url: 'https://security-ops-playbook-analyzer.netlify.app',
    category: 'Security AI',
    purpose:
      'Security-operations agent simulator with LLM-backed tool calls, human approval, final reports, export, and replay.',
    stack: ['React', 'LangGraph-style flow', 'SSE', 'GLM', 'Netlify Functions'],
    proof: 'Production evidence documents end-to-end incident generation, tool calls, HITL approval, reporting, and replay.',
    accent: 'teal',
  },
  {
    slug: 'grok-medical-frontdesk',
    title: 'Grok Medical Front Desk',
    url: 'https://grok-medical-frontdesk.netlify.app',
    category: 'Voice AI',
    purpose:
      'Synthetic medical front-desk voice console for scheduling, patient-safe guardrails, audit timeline, and live health checks.',
    stack: ['React', 'xAI Voice', 'Ephemeral tokens', 'Netlify Functions'],
    proof: 'Deployed Netlify app with `/api/health`, `/api/mint-token`, CSP, and voice workflow evidence.',
    accent: 'emerald',
  },
  {
    slug: 'grok-experience-navigator',
    title: 'Grok Experience Navigator',
    url: 'https://grok-experience-navigator.netlify.app',
    category: 'Voice AI',
    purpose:
      'Voice-guided enterprise experience center where visitors can ask a live guide to navigate product, security, ROI, and support rooms.',
    stack: ['React', 'xAI Voice', 'Navigation tools', 'Playwright'],
    proof: 'Live production URL and test evidence for navigation, voice config, health, and security headers.',
    accent: 'teal',
  },
  {
    slug: 'nocturne-ai-hotel',
    title: 'Nocturne Hotel | Poe Concierge',
    url: 'https://nocturne-ai-hotel.netlify.app',
    category: 'Voice AI',
    purpose:
      'Immersive AI hotel concierge with generated room scenes, synthetic chat, hotspots, voice/TTS, and audit-safe workflows.',
    stack: ['React', 'Generated assets', 'xAI Realtime', 'Netlify'],
    proof: 'Production deployment includes generated visual assets, health route, voice boundary, and test evidence.',
    accent: 'amber',
  },
  {
    slug: 'y22-ai-sales-roleplay',
    title: 'Y22 Roleplay',
    url: 'https://y22-ai-sales-roleplay.netlify.app',
    repoUrl: 'https://github.com/shanto12/y22-ai-sales-roleplay',
    category: 'Voice AI',
    purpose:
      'Voice-driven AI sales roleplay cockpit with persona prompts, live call flow, coaching, prompt lab, and scorecard.',
    stack: ['React', 'xAI Voice', 'Whisper coaching', 'SSE scoring'],
    proof: 'Public Netlify app and GitHub repo with interview-pack documentation and production-facing resume bullets.',
    accent: 'emerald',
  },
  {
    slug: 'elevenlabs-forward-deployed-engineer',
    title: 'Enterprise Voice AI Launch Console',
    url: 'https://elevenlabs-forward-deployed-engineer.netlify.app',
    category: 'Voice AI',
    purpose:
      'Launch-room console for strategic voice AI deployments: readiness, blockers, scenario replay, safety controls, and stakeholder updates.',
    stack: ['React', 'TypeScript', 'Launch readiness', 'Netlify Functions'],
    proof: 'Production URL, deploy evidence, health function, docs, architecture, and demo scripts.',
    accent: 'slate',
  },
  {
    slug: 'vapi-pilot-command-center',
    title: 'ForwardOps Voice Pilot Command Center',
    url: 'https://vapi-pilot-command-center.netlify.app',
    category: 'Voice AI',
    purpose:
      'Forward-deployed pilot command center for scope, UAT, launch blockers, stakeholder updates, and reusable deployment kits.',
    stack: ['React', 'Pilot workflow', 'Synthetic data', 'Netlify health'],
    proof: 'Live Netlify URL with local and production evidence for `/api/health` and pilot workflows.',
    accent: 'teal',
  },
  {
    slug: 'gp-agentic-revenue-ops',
    title: 'Agentic Marketing Operations Workbench',
    url: 'https://gp-agentic-revenue-ops.netlify.app',
    category: 'Revenue AI',
    purpose:
      'Agentic revenue and marketing workbench for buyer-intent signals, ICP scoring, campaign drafting, and auditable agent runs.',
    stack: ['React', 'RAG', 'Netlify Blobs', 'AI boundary', 'HITL'],
    proof: 'Manifest and test evidence describe server-side AI boundaries, audit logs, synthetic/degraded mode, and live route checks.',
    accent: 'amber',
  },
  {
    slug: 'flux-atlas',
    title: 'Flux Atlas',
    url: 'https://flux-atlas-demo.netlify.app',
    category: 'Creative Systems',
    purpose:
      'Interactive generative flow-field website with a live motion canvas, responsive controls, accessibility checks, and production smoke tests.',
    stack: ['React', 'Canvas', 'Motion controls', 'Playwright'],
    proof: 'Netlify deployment and evidence cover desktop/mobile UI, canvas controls, security headers, and `/api/health`.',
    accent: 'slate',
  },
]

export const categories = ['All', 'Security AI', 'Voice AI', 'Revenue AI', 'Creative Systems'] as const
