import type { StatusMeta } from '@/shared/lib/status'

export const orderStatus: Record<string, StatusMeta> = {
  new: { label: 'Новый', color: '#6699ee' },
  processing: { label: 'В процессе', color: '#d6a34d' },
  shipped: { label: 'Отправлен', color: '#9b83e8' },
  completed: { label: 'Завершён', color: '#50b887' },
  cancelled: { label: 'Отменён', color: '#e56b6f' },
}

export const paymentStatus: Record<string, StatusMeta> = {
  pending: { label: 'Ожидает оплаты', color: '#d6a34d' },
  paid: { label: 'Успешная оплата', color: '#50b887' },
  failed: { label: 'Ошибка оплаты', color: '#e56b6f' },
  refunded: { label: 'Возврат средств', color: '#9b83e8' },
}
