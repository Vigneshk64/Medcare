export const ROLE_COLORS = {
  patient: {
    name: 'Patient',
    primary: '#F97316',
    bg: 'bg-orange-600',
    border: 'border-orange-500',
    shadow: 'shadow-orange-500/30',
    gradient: 'from-orange-500 to-orange-600',
    light: 'text-orange-100',
    dark: 'text-orange-900',
  },
  doctor: {
    name: 'Doctor',
    primary: '#3B82F6',
    bg: 'bg-blue-600',
    border: 'border-blue-500',
    shadow: 'shadow-blue-500/30',
    gradient: 'from-blue-500 to-blue-600',
    light: 'text-blue-100',
    dark: 'text-blue-900',
  },
  pharmacist: {
    name: 'Pharmacist',
    primary: '#10B981',
    bg: 'bg-emerald-600',
    border: 'border-emerald-500',
    shadow: 'shadow-emerald-500/30',
    gradient: 'from-emerald-500 to-emerald-600',
    light: 'text-emerald-100',
    dark: 'text-emerald-900',
  },
  delivery: {
    name: 'Delivery',
    primary: '#A855F7',
    bg: 'bg-purple-600',
    border: 'border-purple-500',
    shadow: 'shadow-purple-500/30',
    gradient: 'from-purple-500 to-purple-600',
    light: 'text-purple-100',
    dark: 'text-purple-900',
  },
  admin: {
    name: 'Admin',
    primary: '#EF4444',
    bg: 'bg-red-600',
    border: 'border-red-500',
    shadow: 'shadow-red-500/30',
    gradient: 'from-red-500 to-red-600',
    light: 'text-red-100',
    dark: 'text-red-900',
  },
} as const

export const SEVERITY_COLORS = {
  danger: {
    bg: 'bg-red-900/20',
    border: 'border-red-700',
    text: 'text-red-100',
    tag: '[[RED]]',
  },
  warning: {
    bg: 'bg-yellow-900/20',
    border: 'border-yellow-700',
    text: 'text-yellow-100',
    tag: '[[YELLOW]]',
  },
  safe: {
    bg: 'bg-green-900/20',
    border: 'border-green-700',
    text: 'text-green-100',
    tag: '[[GREEN]]',
  },
} as const

export const SPACING = {
  card: { px: 'px-6', py: 'py-6' },
  section: { px: 'px-4', py: 'py-4' },
  compact: { px: 'px-3', py: 'py-3' },
} as const

export const BORDER_RADIUS = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
} as const

export const COMPONENT_SIZES = {
  sidebar: 'w-64',
  headerHeight: 'h-16',
  cardRadius: 'rounded-2xl',
  buttonSmall: 'px-3 py-2 text-sm',
  buttonMedium: 'px-4 py-3 text-base',
  buttonLarge: 'px-6 py-3 text-lg',
} as const

export const SHADOWS = {
  glass: '0 8px 32px rgba(0, 0, 0, 0.3)',
  card: '0 4px 20px rgba(0, 0, 0, 0.2)',
  hover: '0 12px 40px rgba(0, 0, 0, 0.4)',
} as const

export const TRANSITIONS = {
  fast: 'duration-150',
  normal: 'duration-300',
  slow: 'duration-500',
  colorTransition: 'transition-colors duration-300',
  allTransition: 'transition-all duration-300',
} as const

export const TYPOGRAPHY = {
  heading1: 'text-4xl font-bold',
  heading2: 'text-2xl font-semibold',
  heading3: 'text-xl font-semibold',
  body: 'text-base font-normal',
  label: 'text-sm font-medium',
  small: 'text-xs font-normal',
} as const

export type Role = keyof typeof ROLE_COLORS
type SeverityLevel = keyof typeof SEVERITY_COLORS

export function getRoleColor(role: Role) {
  return ROLE_COLORS[role]
}

export function getSeverityColor(severity: SeverityLevel) {
  return SEVERITY_COLORS[severity]
}

export function extractSeverityFromResponse(text: string): Array<{ text: string; severity?: SeverityLevel }> {
  const sections: Array<{ text: string; severity?: SeverityLevel }> = []
  let current = text

  const patterns = [
    { tag: '[[RED]]', severity: 'danger' as const },
    { tag: '[[YELLOW]]', severity: 'warning' as const },
    { tag: '[[GREEN]]', severity: 'safe' as const },
  ]

  let lastIndex = 0

  for (const { tag, severity } of patterns) {
    let index = current.indexOf(tag)
    while (index !== -1) {
      if (index > lastIndex) {
        sections.push({ text: current.substring(lastIndex, index) })
      }

      const nextIndex = current.indexOf('[[', index + 1)
      const endIndex = nextIndex !== -1 ? nextIndex : current.length
      const content = current.substring(index + tag.length, endIndex)

      sections.push({ text: content.trim(), severity })
      lastIndex = endIndex
      index = current.indexOf(tag, endIndex)
    }
  }

  if (lastIndex < current.length) {
    sections.push({ text: current.substring(lastIndex) })
  }

  return sections.filter(s => s.text.length > 0)
}
