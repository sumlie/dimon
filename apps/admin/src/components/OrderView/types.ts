export type Media = {
  id: string | number
  url?: string | null
  alt?: string | null
  sizes?: { thumbnail?: { url?: string | null } }
}

export type Product = {
  id: string | number
  title?: string
  photos?: (Media | string | number)[] | null
}

export type OrderItem = {
  id?: string | number
  product?: Product | string | number | null
  quantity?: number
  unitPrice?: number
}

export type OrderDocument = {
  id: string | number
  createdAt?: string
  status?: string
  total?: number
  customerName?: string
  username?: string
  email?: string
  phone?: string
  deliveryMethod?: string
  deliveryAddress?: string
  paymentMethod?: string
  paymentStatus?: string
  comment?: string
  items?: OrderItem[]
}