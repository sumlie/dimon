import type { StatusMeta } from '@/consts/status-colors'

export function Badge({ label, color }: StatusMeta) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '5px 9px',
        borderRadius: '4px',
        color,
        background: `color-mix(in srgb, ${color} 14%, transparent)`,
        fontSize: '13px',
        fontWeight: 500,
      }}
    >
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: color }} />
      {label}
    </span>
  )
}

export function StatusBadge({
  value,
  map,
}: {
  value?: string | null
  map: Record<string, StatusMeta>
}) {
  const meta = map[value ?? '']
  return <Badge label={meta?.label ?? (value || '—')} color={meta?.color ?? 'currentColor'} />
}