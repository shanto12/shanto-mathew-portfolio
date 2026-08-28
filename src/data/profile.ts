import type { Achievement, SkillGroup } from '../lib/types'

export const profile = {
  name: 'Shanto Mathew',
  domain: 'ShantoMathew.com',
  location: 'Dallas-Fort Worth Metroplex',
  headline: 'Senior AI Security Automation Engineer & Agentic AI Builder',
  summary:
    'I build governed AI systems that automate security operations, connect tools through APIs, and turn ambitious demos into deployed, testable products.',
  availability: 'Open to impactful GenAI, security automation, SOAR/XSOAR/XSIAM, and forward-deployed AI roles.',
  linkedinUrl: 'https://www.linkedin.com/in/shanto-mathew/',
  githubUrl: 'https://github.com/shanto12',
}

export const achievements: Achievement[] = [
  {
    value: '50+',
    label: 'SOAR playbooks',
    detail: 'Built and maintained playbooks across SIEM alerts, EDR response, enrichment, routing, and case workflow automation.',
  },
  {
    value: '70%',
    label: 'Faster response paths',
    detail: 'Reduced repetitive incident-response work through enrichment, deduplication, routing, and analyst-assist automation.',
  },
  {
    value: '95%',
    label: 'Initial triage target',
    detail: 'Designed LLM-assisted classification workflows with structured outputs, guardrails, and human review boundaries.',
  },
  {
    value: '9',
    label: 'Live public demos',
    detail: 'Shipped Netlify-hosted AI, voice, security, and product demos with docs, health checks, and production verification.',
  },
]

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
