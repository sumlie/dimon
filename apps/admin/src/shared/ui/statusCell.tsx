'use client'

import type { DefaultCellComponentProps } from 'payload'

import { statusColors } from '@/shared/lib/statusColors'

const StatusCell = ({ cellData, field }: DefaultCellComponentProps) => {
  const value = cellData == null ? '' : String(cellData)
  const color = statusColors[value]

  const label =
    field?.type === 'select' && Array.isArray(field.options)
      ? field.options.find((option) => {
          if (typeof option === 'string') {
            return option === value
          }

          return String(option.value) === value
        })
      : undefined

  const text =
  typeof label === 'object' && label !== null && 'label' in label
    ? typeof label.label === 'string'
      ? label.label
      : typeof label.label === 'object' && label.label !== null
        ? Object.values(label.label)[0] ?? value
        : value
    : value

  if (!value) {
    return <span className="opacity-50">—</span>
  }

  return (
    <span
      style={{
        color: color ?? 'var(--theme-text)',
        borderColor: color ?? 'transparent',
        backgroundColor: color ? `${color}35` : 'transparent',
        height: '24px',
        width: '130px',
        fontSize: '14px',
        padding: '0 8px',
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {text}
    </span>
  )
}

export default StatusCell
