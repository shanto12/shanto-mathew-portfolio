import type { LucideIcon } from 'lucide-react'

export type IconComponent = LucideIcon

export type DemoCategory = 'Security AI' | 'Voice AI' | 'Revenue AI' | 'Creative Systems'

export type Demo = {
  slug: string
  title: string
  url: string
  repoUrl?: string
  category: DemoCategory
  purpose: string
  stack: string[]
  proof: string
  accent: 'teal' | 'emerald' | 'amber' | 'slate'
}

export type SkillGroup = {
  title: string
  summary: string
  items: string[]
}

export type Achievement = {
  value: string
  label: string
  detail: string
}
