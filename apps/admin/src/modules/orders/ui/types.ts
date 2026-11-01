export type Media = {
  id: string | number
  url?: string | null
  alt?: string | null
  sizes?: {
    thumbnail?: {
      url?: string | null
    }
  }
}

export type Product = {
  id: string | number
  title?: string
  photos?: (Media | string | number)[] | null
}

export type OrderItem = {
  id?: string | number
  product?: Product | string | number | null
  quantity?: number | null
  unitPrice?: number | null
}

export type OrderDocument = {
  id: string | number
  createdAt?: string
  status?: string
  total?: number | null

  customerName?: string | null
  username?: string | null
  email?: string | null
  phone?: string | null

  deliveryMethod?: string | null
  deliveryRegion?: string | null
  deliveryAddress?: string | null
  deliveryPrice?: number | null

  paymentMethod?: string | null
  paymentStatus?: string | null

  promoCode?: string | null
  discountPercent?: number | null
  discountAmount?: number | null

  comment?: string | null
  items?: OrderItem[] | null
}