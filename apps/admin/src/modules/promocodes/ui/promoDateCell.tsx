import type { DefaultCellComponentProps } from 'payload'

type PromoRow = {
  createdAt?: string | null
}

function formatDate(value: unknown): string | null {
  if (typeof value !== 'string' || !value) return null

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return null

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Minsk',
  }).format(date)
}

export default function PromoDateCell({
  cellData,
  rowData,
  field,
}: DefaultCellComponentProps) {
  const date = formatDate(cellData)

  if (date) {
    return <span>{date}</span>
  }

  if (field && 'name' in field && field.name === 'startsAt') {
    const createdAt = formatDate((rowData as PromoRow)?.createdAt)

    return (
      <span>
        {createdAt ?? 'сразу'}
      </span>
    )
  }

  return <span>бессрочно</span>
}