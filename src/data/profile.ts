import type { Achievement, SkillGroup } from '../lib/types'

export const profile = {
  name: 'Shanto Mathew',
  domain: 'ShantoMathew.com',
  location: 'Dallas-Fort Worth Metroplex',
  headline: 'Forward Deployed AI Engineer',
  summary:
    'I build production GenAI for enterprise banking and AI-enhanced security operations, from first workflow map to a governed, testable deployment.',
  availability: 'Open to impactful FDE, GenAI, security automation, SOAR/XSOAR/XSIAM, and agentic AI work.',
  linkedinUrl: 'https://www.linkedin.com/in/shanto-mathew/',
  githubUrl: 'https://github.com/shanto12',
}

export const achievements: Achievement[] = [
  {
    value: '1,000+',
    label: 'SOAR playbooks',
    detail: 'Built, maintained, and iterated playbooks across SIEM alerts, EDR response, enrichment, routing, and case workflow automation.',
  },
  {
    value: '60%',
    label: 'Less manual intervention',
    detail: 'Reduced L1/L2 security operations effort with production-ready agentic workflows, enrichment, routing, and analyst-assist automation.',
  },
  {
    value: '25+',
    label: 'Global SOAR deployments',
    detail: 'Delivered enterprise SOAR projects across ten countries, with reusable Python frameworks and production integrations.',
  },
  {
    value: '$2M+',
    label: 'Annual savings through automation',
    detail: 'Connected security operations, AI systems, and enterprise workflows to create measurable business impact.',
  },
]

export const agenticTools = [
  {
    name: 'Grok Bot',
    mode: 'Explore / expand context',
    copy: 'Rapid context expansion, multimodal sparks, and first-pass surface mapping before the real build starts.',
    artifact: 'signal map',
    color: 'orange',
  },
  {
    name: 'Claude Code',
    mode: 'Build / shape the repo',
    copy: 'Repository-level implementation, refactors, and interface slices that keep the product moving in code.',
    artifact: 'working slice',
    color: 'violet',
  },
  {
    name: 'Codex',
    mode: 'Verify / make it real',
    copy: 'Tests, review loops, release evidence, and production checks that turn a promising build into a trustworthy one.',
    artifact: 'proof packet',
    color: 'cyan',
  },
  {
    name: 'OpenClaw',
    mode: 'Operate / route the work',
    copy: 'Local task routing, browser-aware routines, and repeatable maintenance for the parts that should not be forgotten.',
    artifact: 'runbook loop',
    color: 'lime',
  },
  {
    name: 'Hermes agents',
    mode: 'Coordinate / carry momentum',
    copy: 'Long-running coordination across tools, prompts, and operational follow-through when the work crosses boundaries.',
    artifact: 'handoff trail',
    color: 'pink',
  },
] as const

export const skillGroups: SkillGroup[] = [
  {
    title: 'AI/ML',
    summary: 'Agentic systems, retrieval-augmented generation, and LLM orchestration.',
    items: ['LangGraph', 'LangChain', 'LlamaIndex', 'RAG', 'LLM fine-tuning', 'Voice AI', 'MCP', 'Agentic AI'],
  },
  {
    title: 'Security Automation',
    summary: 'SOAR platforms and SOC automation with structured playbooks and incident response.',
    items: ['Splunk SOAR', 'Cortex XSOAR', 'Cortex XSIAM', 'MITRE ATT&CK', 'Threat intelligence', 'Playbook automation'],
  },
  {
    title: 'Python & Cloud',
    summary: 'Python expert; integration and API work across AWS, Azure, and GCP.',
    items: ['Python (FastAPI, Flask, transformers, openai, pandas, numpy, sklearn)', 'AWS (EC2, Lambda, SageMaker, Bedrock, Glue, S3)', 'Azure', 'GCP'],
  },
  {
    title: 'Data & Backends',
    summary: 'Data engineering and persistence for operational workflows.',
    items: ['Snowflake', 'PostgreSQL', 'Pinecone', 'Weaviate', 'FAISS'],
  },
]

export const principles = [
  {
    title: 'Ship proof, not promises',
    copy: 'Every serious demo gets a live URL, health endpoint, docs, tests, and evidence that the deployed surface was actually exercised.',
  },
  {
    title: 'Keep humans in control',
    copy: 'AI can enrich, classify, summarize, and draft, but sensitive security decisions need approvals, logs, and reversible workflows.',
  },
  {
    title: 'Automate the repetitive path',
    copy: 'The best automation usually removes context switching, enrichment loops, stale handoffs, and reporting drag.',
  },
  {
    title: 'Make systems inspectable',
    copy: 'Readable source, clear data provenance, public-safe fixtures, and explicit known limits matter as much as the UI.',
  },
]
