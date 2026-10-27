import { orderStatus, paymentStatus } from '@/modules/orders/status'
import { productStatus } from '@/modules/products/status'

/**
 * Cross-module registry used by generic status UI (cells/selects).
 * Status labels and their modules of origin stay inside `modules/*`.
 */
export const statusColors: Record<string, string> = Object.fromEntries(
  Object.entries({ ...productStatus, ...orderStatus, ...paymentStatus }).map(
    ([key, meta]) => [key, meta.color],
  ),
)
