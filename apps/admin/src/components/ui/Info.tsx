import type { ReactNode } from 'react'

import { CARD_BG, MUTED_OPACITY } from '@/consts/theme'

export function Info({
  label,
  value,
  children,
}: {
  label: string
  value?: unknown
  children?: ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '8px',
        minWidth: 0,
        padding: '14px 16px',
        borderRadius: '4px',
        background: CARD_BG,
      }}
    >
      <span style={{ fontSize: '13px', opacity: MUTED_OPACITY }}>{label}</span>
      {children ?? (
        <span
          style={{
            fontSize: '14px',
            fontWeight: 500,
            overflowWrap: 'anywhere',
            whiteSpace: 'pre-wrap',
          }}
        >
          {value == null || value === '' ? '—' : String(value)}
        </span>
      )}
    </div>
  )
}