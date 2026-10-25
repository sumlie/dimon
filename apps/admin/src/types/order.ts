import type { Order, Product } from '@/payload-types'

export type { Order, Product }
export type OrderItem = NonNullable<Order['items']>[number]