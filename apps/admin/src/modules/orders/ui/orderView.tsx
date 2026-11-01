import type { DocumentViewServerProps, PayloadRequest } from 'payload'

import { grid, MUTED_OPACITY } from '@/shared/lib/theme'
import {
  formatDateTime,
  formatPrice,
  getRelativeTime,
} from '@/shared/lib/format'

import { Info } from '@/shared/ui/info'
import { Section } from '@/shared/ui/section'
import { StatusSelect } from '@/shared/ui/statusSelect'

import { getProductId, getProductsById } from './getProductsById'
import { OrderItemCard } from './orderItemCard'
import type { OrderDocument } from './types'

const STATUS_UPDATE_URL = '/api/orders/:id/update-status'

const PAYMENT_STATUS_UPDATE_URL =
  '/api/orders/:id/update-payment-status'

const DELIVERY_METHOD_LABELS: Record<string, string> = {
  pickup: 'Самовывоз',
  cdek: 'СДЭК',
  belmail: 'Белпочта',
  euromail: 'Европочта',
}

const DELIVERY_REGION_LABELS: Record<string, string> = {
  belarus: 'Беларусь',
  moscow: 'Москва и Московская область',
  russia: 'Другие регионы России',
  cis: 'Страны СНГ',
  world: 'Остальной мир',
}

/*
 * Дополнительные поля добавляем здесь, чтобы не требовать
 * немедленного изменения существующего OrderDocument.
 */

function getOptions(req: PayloadRequest, name: string) {
  const field = req.payload.collections.orders.config.fields.find(
    (item) => 'name' in item && item.name === name,
  ) as
    | {
        options?: (
          | { label: unknown; value: string }
          | string
        )[]
      }
    | undefined

  return (field?.options ?? []).map((option) =>
    typeof option === 'string'
      ? { label: option, value: option }
      : {
          label: String(option.label),
          value: option.value,
        },
  )
}

function getLabel(
  value: string | null | undefined,
  labels: Record<string, string>,
): string {
  if (!value) return '—'

  return labels[value] ?? value
}

function formatOptionalPrice(value: unknown): string {
  if (
    typeof value !== 'number' ||
    !Number.isFinite(value)
  ) {
    return '—'
  }

  return formatPrice(value) ?? '—'
}

export default async function OrderView({
  doc,
  initPageResult,
}: DocumentViewServerProps) {
  const order = doc as unknown as OrderDocument

  const id = String(order.id)
  const items = order.items ?? []

  const { req } = initPageResult
  const adminRoute = req.payload.config.routes?.admin ?? '/admin'

  const productsById = await getProductsById(req, items)

  const statusOptions = getOptions(req, 'status')
  const paymentOptions = getOptions(req, 'paymentStatus')

  const isPickup = order.deliveryMethod === 'pickup'

  const deliveryMethod = getLabel(
    order.deliveryMethod,
    DELIVERY_METHOD_LABELS,
  )

  const deliveryRegion = getLabel(
    order.deliveryRegion,
    DELIVERY_REGION_LABELS,
  )

  /*
   * Считаем стоимость по сохранённым ценам заказа.
   * Не берём текущие цены товаров: они могли измениться.
   *
   * Если в старом заказе unitPrice отсутствует, не показываем
   * выдуманную сумму.
   */
  const itemsTotalKopecks = items.reduce<number | null>((sum, item) => {
    if (
      sum === null ||
      typeof item.quantity !== 'number' ||
      !Number.isFinite(item.quantity) ||
      typeof item.unitPrice !== 'number' ||
      !Number.isFinite(item.unitPrice)
    ) {
      return null
    }

    return sum + Math.round(item.unitPrice * 100) * item.quantity
  }, 0)

  const itemsTotal =
    items.length > 0 && itemsTotalKopecks !== null
      ? itemsTotalKopecks / 100
      : null

  const hasDiscount =
    Boolean(order.promoCode) ||
    (typeof order.discountAmount === 'number' &&
      order.discountAmount > 0)

  const discountLabel =
    typeof order.discountPercent === 'number' &&
    order.discountPercent > 0
      ? `Скидка ${order.discountPercent}%`
      : 'Скидка'

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        padding: '0 30px 40px',
        boxSizing: 'border-box',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          flexWrap: 'wrap',
          padding: '8px 0 24px',
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            Заказ №{id}
          </h1>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: '13px',
              opacity: MUTED_OPACITY,
            }}
          >
            Создан {getRelativeTime(order.createdAt)}
          </p>
        </div>
      </header>

      <main
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
      >
        <Section title="Информация о заказе">
          <div style={grid}>
            <Info label="ID заказа" value={order.id} />

            <Info label="Статус">
              <StatusSelect
                fieldName="status"
                updateURL={STATUS_UPDATE_URL}
                id={order.id}
                value={order.status}
                options={statusOptions}
              />
            </Info>

            <Info label="Статус оплаты">
              <StatusSelect
                fieldName="paymentStatus"
                updateURL={PAYMENT_STATUS_UPDATE_URL}
                id={order.id}
                value={order.paymentStatus}
                options={paymentOptions}
              />
            </Info>

            <Info
              label="Общая стоимость"
              value={formatOptionalPrice(order.total)}
            />

            <Info
              label="Дата создания"
              value={formatDateTime(order.createdAt)}
            />
          </div>
        </Section>

        <Section
          title="Товары"
          aside={
            <span
              style={{
                fontSize: '13px',
                fontWeight: 400,
                opacity: MUTED_OPACITY,
              }}
            >
              Позиций: {items.length}
            </span>
          }
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '16px',
            }}
          >
            {items.length === 0 && (
              <span
                style={{
                  fontSize: '14px',
                  opacity: MUTED_OPACITY,
                }}
              >
                Нет товаров
              </span>
            )}

            {items.map((item, index) => {
              const productId = getProductId(item.product)

              return (
                <OrderItemCard
                  key={item.id ?? index}
                  item={item}
                  productId={productId}
                  product={
                    productId != null
                      ? productsById.get(productId)
                      : undefined
                  }
                  adminRoute={adminRoute}
                />
              )
            })}

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '12px',
                paddingTop: '4px',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  fontWeight: 400,
                  opacity: MUTED_OPACITY,
                }}
              >
                Итого:
              </span>

              {formatOptionalPrice(order.total)}
            </div>
          </div>
        </Section>

        <Section title="Покупатель">
          <div style={grid}>
            <Info label="Имя" value={order.customerName} />
            <Info label="Аккаунт" value={order.username} />
            <Info label="Email" value={order.email} />
            <Info label="Телефон" value={order.phone} />
          </div>
        </Section>

        <Section title="Получение и оплата">
          <div style={grid}>
            <Info
              label="Способ получения"
              value={deliveryMethod}
            />

            <Info
              label="Регион"
              value={deliveryRegion}
            />

            <Info
              label={isPickup ? 'Адрес самовывоза' : 'Адрес / пункт выдачи'}
              value={order.deliveryAddress}
            />

            <Info
              label={isPickup ? 'Стоимость самовывоза' : 'Стоимость доставки'}
              value={
                order.deliveryPrice === 0
                  ? 'Бесплатно'
                  : formatOptionalPrice(order.deliveryPrice)
              }
            />

            <Info
              label="Способ оплаты"
              value={order.paymentMethod}
            />
          </div>
        </Section>

        {order.comment && (
          <Section title="Комментарий покупателя">
            <div style={{ padding: '16px' }}>
              <Info label="Комментарий" value={order.comment} />
            </div>
          </Section>
        )}

        <Section title="Стоимость заказа">
          <div style={{ padding: '16px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
                gap: '12px',
              }}
            >
              <Info
                label="Товары"
                value={formatOptionalPrice(itemsTotal)}
              />

              {order.promoCode && (
                <Info
                  label="Промокод"
                  value={order.promoCode}
                />
              )}

              {hasDiscount && (
                <Info label={discountLabel}>
                  <span style={{ color: '#e5484d', fontWeight: 600 }}>
                    {typeof order.discountAmount === 'number' &&
                    Number.isFinite(order.discountAmount)
                      ? `− ${formatOptionalPrice(order.discountAmount)}`
                      : '—'}
                  </span>
                </Info>
              )}

              <Info
                label={isPickup ? 'Самовывоз' : 'Доставка'}
                value={
                  order.deliveryPrice === 0
                    ? 'Бесплатно'
                    : formatOptionalPrice(order.deliveryPrice)
                }
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '20px',
                flexWrap: 'wrap',
                marginTop: '16px',
                padding: '18px 20px',
                border: '1px solid var(--theme-elevation-300)',
                borderLeft: '4px solid var(--theme-text)',
                background: 'var(--theme-elevation-100)',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  opacity: MUTED_OPACITY,
                }}
              >
                Итого к оплате
              </span>

              <span
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                }}
              >
                {formatOptionalPrice(order.total)}
              </span>
            </div>
          </div>
        </Section>
      </main>
    </div>
  )
}