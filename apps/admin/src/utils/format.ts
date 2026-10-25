export const formatPrice = (n?: number | null) =>
  n == null ? undefined : `${n.toLocaleString('ru-RU')} ₽`

export const formatDateTime = (date?: string | null) =>
  date ? new Date(date).toLocaleString('ru-RU') : undefined

export function getRelativeTime(date?: string | null) {
  if (!date) return 'неизвестно'
  const ts = new Date(date).getTime()
  if (Number.isNaN(ts)) return 'неизвестно'

  const rtf = new Intl.RelativeTimeFormat('ru', { numeric: 'auto' })
  const seconds = Math.floor((Date.now() - ts) / 1000)

  if (seconds < 60) return 'только что'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return rtf.format(-minutes, 'minute')
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return rtf.format(-hours, 'hour')
  const days = Math.floor(hours / 24)
  if (days < 30) return rtf.format(-days, 'day')
  if (days < 365) return rtf.format(-Math.floor(days / 30), 'month')
  return rtf.format(-Math.floor(days / 365), 'year')
}