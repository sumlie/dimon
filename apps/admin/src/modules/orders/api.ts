import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'

import type { Order } from '@/payloadTypes'

type CheckoutItem = {
  product: number
  quantity: number
}

type DeliveryRegion =
  | 'belarus'
  | 'moscow'
  | 'russia'
  | 'cis'
  | 'world'

type CheckoutBody = {
  items: CheckoutItem[]
  customerName: string
  username: string
  email: string
  phone: string
  deliveryRegion: DeliveryRegion
  deliveryMethod: 'cdek' | 'belmail' | 'euromail' | 'pickup'
  deliveryAddress: string
  cdekPointCode: string
  comment: string
  promoCode: string
}

class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status = 400,
  ) {
    super(message)
    this.name = 'CheckoutError'
  }
}

const MAX_ITEMS = 100
const MAX_QUANTITY = 100

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PROMO_CODE_RE = /^[A-Z0-9_-]{3,40}$/

function badRequest(error: string): Response {
  return Response.json(
    { error },
    {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    },
  )
}

function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isSafeInteger(value) &&
    value > 0
  )
}

function readText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null

  const text = value.trim()

  if (text.length > maxLength) return null

  return text
}

function validateBody(value: unknown): CheckoutBody | string {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return 'Некорректное тело запроса'
  }

  const body = value as Record<string, unknown>

  if (
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    body.items.length > MAX_ITEMS
  ) {
    return 'Проверь товары в корзине'
  }

  const items: CheckoutItem[] = []
  const seenProducts = new Set<number>()

  for (const value of body.items) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return 'Некорректный товар в заказе'
    }

    const item = value as Record<string, unknown>

    if (
      !isPositiveInteger(item.product) ||
      !isPositiveInteger(item.quantity) ||
      item.quantity > MAX_QUANTITY
    ) {
      return 'Некорректный товар или количество'
    }

    if (seenProducts.has(item.product)) {
      return 'Один товар указан в корзине несколько раз'
    }

    seenProducts.add(item.product)

    items.push({
      product: item.product,
      quantity: item.quantity,
    })
  }

  const customerName = readText(body.customerName, 100)
  const username = readText(body.username, 100)
  const email = readText(body.email, 254)
  const phone = readText(body.phone ?? '', 30)
  const deliveryRegion = readText(body.deliveryRegion, 20)
  const deliveryMethod = readText(body.deliveryMethod, 50)
  const deliveryAddress = readText(body.deliveryAddress, 500)
  const cdekPointCode = readText(body.cdekPointCode ?? '', 100)
  const comment = readText(body.comment ?? '', 1000)
  const promoCode = readText(body.promoCode ?? '', 40)

  if (
    customerName === null ||
    username === null ||
    email === null ||
    phone === null ||
    deliveryRegion === null ||
    deliveryMethod === null ||
    deliveryAddress === null ||
    cdekPointCode === null ||
    comment === null ||
    promoCode === null
  ) {
    return 'Некорректные данные заказа'
  }

  if (!customerName || !username || !email) {
    return 'Заполни имя, email и Telegram'
  }

  if (!EMAIL_RE.test(email)) {
    return 'Укажи корректный email'
  }

  if (
    deliveryRegion !== 'belarus' &&
    deliveryRegion !== 'moscow' &&
    deliveryRegion !== 'russia' &&
    deliveryRegion !== 'cis' &&
    deliveryRegion !== 'world'
  ) {
    return 'Выбери регион доставки'
  }

  if (
    deliveryMethod !== 'cdek' &&
    deliveryMethod !== 'belmail' &&
    deliveryMethod !== 'euromail' &&
    deliveryMethod !== 'pickup'
  ) {
    return 'Выбери способ доставки'
  }

  if (deliveryMethod === 'pickup' && deliveryRegion !== 'belarus') {
    return 'Самовывоз доступен только в Минске'
  }

  if (!deliveryAddress) {
    return 'Укажи адрес доставки или пункт выдачи'
  }

  const cdekMapRegion =
    deliveryRegion === 'belarus' ||
    deliveryRegion === 'moscow' ||
    deliveryRegion === 'russia'

  if (deliveryMethod === 'cdek' && cdekMapRegion && !cdekPointCode) {
    return 'Выбери пункт выдачи СДЭК'
  }

  const normalizedPromoCode = promoCode.toUpperCase()

  if (
    normalizedPromoCode &&
    !PROMO_CODE_RE.test(normalizedPromoCode)
  ) {
    return 'Некорректный промокод'
  }

  return {
    items,
    customerName,
    username,
    email,
    phone,
    deliveryRegion,
    deliveryMethod,
    deliveryAddress,
    cdekPointCode,
    comment,
    promoCode: normalizedPromoCode,
  }
}

export async function POST(request: Request): Promise<Response> {
  let rawBody: unknown

  try {
    rawBody = await request.json()
  } catch {
    return badRequest('Некорректный JSON')
  }

  const body = validateBody(rawBody)

  if (typeof body === 'string') {
    return badRequest(body)
  }

  const payload = await getPayload({ config })

  let transactionID: string | number | null = null

  try {
    transactionID = await payload.db.beginTransaction()

    if (transactionID == null) {
      throw new Error('Не удалось начать транзакцию базы данных')
    }

    // В этой версии адаптера transactionID используется как ключ sessions.
    const session = payload.db.sessions[transactionID]

    if (!session?.db) {
      throw new Error('Транзакционная сессия базы данных не найдена')
    }

    type PostgresTransaction = {
      execute: (
        query: ReturnType<typeof sql>,
      ) => Promise<{ rows: unknown[] }>
    }

    if (!('execute' in session.db)) {
      throw new Error('Ожидалась PostgreSQL-транзакция')
    }

    const transactionDb = session.db as unknown as PostgresTransaction

    const req = {
      payload,
      transactionID,
    }

    const deliveryPrices = await payload.findGlobal({
      slug: 'delivery-prices',
      depth: 0,
      overrideAccess: true,
      req,
    })

    const deliveryPrice =
      body.deliveryMethod === 'pickup'
        ? 0
        : deliveryPrices[body.deliveryRegion]

    if (
      typeof deliveryPrice !== 'number' ||
      !Number.isFinite(deliveryPrice) ||
      deliveryPrice < 0
    ) {
      throw new CheckoutError(
        'Не удалось определить стоимость доставки. Попробуй позже.',
        500,
      )
    }

    const ids = body.items.map((item) => item.product)

    const { docs: products } = await payload.find({
      collection: 'products',
      where: {
        and: [
          { id: { in: ids } },
          { status: { equals: 'published' } },
        ],
      },
      depth: 0,
      pagination: false,
      overrideAccess: true,
      req,
    })

    const productsById = new Map(
      products.map((product) => [Number(product.id), product]),
    )

    if (ids.some((id) => !productsById.has(id))) {
      throw new CheckoutError(
        'Некоторые товары больше недоступны. Обнови страницу.',
        404,
      )
    }

    const items: Order['items'] = body.items.map((item) => {
      const product = productsById.get(item.product)!

      if (
        typeof product.priceRub !== 'number' ||
        !Number.isFinite(product.priceRub) ||
        product.priceRub < 0
      ) {
        throw new CheckoutError('У одного из товаров некорректная цена')
      }

      return {
        product: item.product,
        quantity: item.quantity,
        unitPrice: product.priceRub,
      }
    })

    let discountPercent = 0
    let appliedPromoCode: string | undefined

    if (body.promoCode) {
      /*
       * Предполагаемые имена таблицы и полей:
       * promo_codes, used_count, max_uses, starts_at, expires_at.
       *
       * Запрос блокирует строку промокода до завершения транзакции.
       */
      const result = await transactionDb.execute(sql`
        SELECT
          id,
          code,
          discount_percent,
          is_active,
          max_uses,
          used_count,
          starts_at,
          expires_at
        FROM promo_codes
        WHERE code = ${body.promoCode}
        FOR UPDATE
      `)

      const promo = result.rows[0] as
        | {
            id: number
            code: string
            discount_percent: number | string
            is_active: boolean
            max_uses: number | null
            used_count: number
            starts_at: string | Date | null
            expires_at: string | Date | null
          }
        | undefined

      const now = Date.now()

      const startsAt = promo?.starts_at
        ? new Date(promo.starts_at).getTime()
        : null

      const expiresAt = promo?.expires_at
        ? new Date(promo.expires_at).getTime()
        : null

      const unavailable =
        !promo ||
        !promo.is_active ||
        (startsAt !== null &&
          (!Number.isFinite(startsAt) || startsAt > now)) ||
        (expiresAt !== null &&
          (!Number.isFinite(expiresAt) || expiresAt <= now)) ||
        (promo.max_uses !== null &&
          promo.used_count >= promo.max_uses)

      if (unavailable || !promo) {
        throw new CheckoutError(
          'Промокод недействителен или закончился',
        )
      }

      const percent = Number(promo.discount_percent)

      if (
        !Number.isInteger(percent) ||
        percent < 1 ||
        percent > 100
      ) {
        throw new CheckoutError('У промокода некорректная скидка')
      }

      discountPercent = percent
      appliedPromoCode = promo.code

      await transactionDb.execute(sql`
        UPDATE promo_codes
        SET used_count = used_count + 1
        WHERE id = ${promo.id}
      `)
    }

    const productsTotalKopecks = items.reduce(
      (sum, item) =>
        sum + Math.round(item.unitPrice * 100) * item.quantity,
      0,
    )

    const discountKopecks = Math.round(
      (productsTotalKopecks * discountPercent) / 100,
    )

    const deliveryKopecks = Math.round(deliveryPrice * 100)

    const total =
      (productsTotalKopecks - discountKopecks + deliveryKopecks) / 100

    const deliveryAddress =
      body.deliveryMethod === 'pickup'
        ? 'Минск, проспект Машерова, 60'
        : body.deliveryMethod === 'cdek' && body.cdekPointCode
          ? `${body.deliveryAddress}\nКод ПВЗ СДЭК: ${body.cdekPointCode}`
          : body.deliveryAddress

    const order = await payload.create({
      collection: 'orders',
      overrideAccess: true,
      req,
      data: {
        items,
        total,

        promoCode: appliedPromoCode,
        discountPercent,
        discountAmount: discountKopecks / 100,
        deliveryPrice: deliveryKopecks / 100,

        status: 'new',
        paymentStatus: 'pending',

        customerName: body.customerName,
        username: body.username,
        email: body.email,
        phone: body.phone || undefined,

        deliveryRegion: body.deliveryRegion,
        deliveryMethod: body.deliveryMethod,
        deliveryAddress,

        comment: body.comment || undefined,
      },
    })

    await payload.db.commitTransaction(transactionID)
    transactionID = null

    return Response.json(
      {
        ok: true,
        id: order.id,
        total: order.total,
        discountPercent,
        discountAmount: discountKopecks / 100,
      },
      {
        status: 201,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  } catch (error) {
    if (transactionID != null) {
      try {
        await payload.db.rollbackTransaction(transactionID)
      } catch (rollbackError) {
        payload.logger.error({
          err: rollbackError,
          msg: 'Checkout rollback failed',
        })
      }
    }

    if (error instanceof CheckoutError) {
      return Response.json(
        { error: error.message },
        {
          status: error.status,
          headers: { 'Cache-Control': 'no-store' },
        },
      )
    }

    payload.logger.error({
      err: error,
      msg: 'Checkout failed',
    })

    return Response.json(
      { error: 'Не удалось создать заказ. Попробуй ещё раз.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store' },
      },
    )
  }
}