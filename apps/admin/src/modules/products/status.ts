import type { StatusMeta } from '@/shared/lib/status'

export const productStatus: Record<string, StatusMeta> = {
  draft: { label: 'Черновик', color: '#8a9cc2' },
  published: { label: 'Опубликован', color: '#50b887' },
}
