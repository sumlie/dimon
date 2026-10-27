import type { DocumentViewServerProps, PayloadRequest } from 'payload'

import { grid, MUTED_OPACITY } from '@/shared/lib/theme'
import { formatDateTime, formatPrice, getRelativeTime } from '@/shared/lib/format'

import { Info } from '@/shared/ui/info'
import { Section } from '@/shared/ui/section'
import { StatusSelect } from '@/shared/ui/statusSelect'
import { getProductId, getProductsById } from './getProductsById'
import { OrderItemCard } from './orderItemCard'
import type { OrderDocument } from './types'

const STATUS_UPDATE_URL = '/api/orders/:id/update-status'
const PAYMENT_STATUS_UPDATE_URL = '/api/orders/:id/update-payment-status'

function getOptions(req: PayloadRequest, name: string) {
  const field = req.payload.collections.orders.config.fields.find(
    (f) => 'name' in f && f.name === name,
  ) as { options?: ({ label: unknown; value: string } | string)[] } | undefined

  return (field?.options ?? []).map((o) =>
    typeof o === 'string'
      ? { label: o, value: o }
      : { label: String(o.label), value: o.value },
  )
}

export default async function OrderView({ doc, initPageResult }: DocumentViewServerProps) {
  const order = doc as unknown as OrderDocument
  const id = String(order.id)
  const items = order.items ?? []

  const { req } = initPageResult
  const adminRoute = req.payload.config.routes?.admin ?? '/admin'

  const productsById = await getProductsById(req, items)

  const statusOptions = getOptions(req, 'status')
  const paymentOptions = getOptions(req, 'paymentStatus')

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
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 600, lineHeight: 1.4 }}>
            Заказ №{id}
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: MUTED_OPACITY }}>
            Создан {getRelativeTime(order.createdAt)}
          </p>
        </div>
      </header>

      <main style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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
            <Info label="Общая стоимость" value={formatPrice(order.total)} />
            <Info label="Дата создания" value={formatDateTime(order.createdAt)} />
          </div>
        </Section>

        <Section
          title="Товары"
          aside={
            <span style={{ fontSize: '13px', fontWeight: 400, opacity: MUTED_OPACITY }}>
              Позиций: {items.length}
            </span>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            {items.length === 0 && (
              <span style={{ fontSize: '14px', opacity: MUTED_OPACITY }}>Нет товаров</span>
            )}

            {items.map((item, i) => {
              const productId = getProductId(item.product)
              return (
                <OrderItemCard
                  key={item.id ?? i}
                  item={item}
                  productId={productId}
                  product={productId != null ? productsById.get(productId) : undefined}
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
              <span style={{ fontWeight: 400, opacity: MUTED_OPACITY }}>Итого:</span>
              {formatPrice(order.total) ?? '—'}
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

        <Section title="Доставка и оплата">
          <div style={grid}>
            <Info label="Способ доставки" value={order.deliveryMethod} />
            <Info label="Адрес / пункт выдачи" value={order.deliveryAddress} />
            <Info label="Способ оплаты" value={order.paymentMethod} />
          </div>
        </Section>

        {order.comment && (
          <Section title="Комментарий покупателя">
            <div style={{ padding: '16px' }}>
              <Info label="Комментарий" value={order.comment} />
            </div>
          </Section>
        )}
      </main>
    </div>
  )
}