import type { CSSProperties } from 'react'

export const BORDER_COLOR = 'rgba(128, 128, 128, 0.22)'
export const CARD_BG = 'rgba(128, 128, 128, 0.08)'
export const MUTED_OPACITY = 0.6

export const ERROR_COLOR = '#e56b6f'
export const SUCCESS_COLOR = '#50b887'

export const BORDER = 'rgba(128, 128, 128, 0.35)'
export const BORDER_FOCUS = 'rgba(128, 128, 128, 0.85)'
export const BG = 'rgba(128, 128, 128, 0.08)'

export const border = `1px solid ${BORDER_COLOR}`

export const grid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
  gap: '12px',
  padding: '16px',
}