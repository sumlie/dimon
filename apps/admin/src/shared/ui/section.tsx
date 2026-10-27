import type { ReactNode } from 'react'

import { border } from '@/shared/lib/theme'

export function Section({
  title,
  aside,
  children,
}: {
  title: string
  aside?: ReactNode
  children: ReactNode
}) {
  return (
    <section style={{ border, borderRadius: '6px', overflow: 'hidden' }}>
      <h2
        style={{
          margin: 0,
          padding: '16px 16px 0',
          fontSize: '15px',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        {title}
        {aside}
      </h2>
      {children}
    </section>
  )
}