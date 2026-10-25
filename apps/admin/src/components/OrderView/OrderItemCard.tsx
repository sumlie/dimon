import { BORDER_COLOR, CARD_BG, MUTED_OPACITY } from '@/consts/theme'
import { formatPrice } from '@/utils/format'

import type { Media, OrderItem, Product } from './types'

function firstPhotoUrl(p?: Product) {
  const photo = p?.photos?.find((x) => typeof x === 'object') as Media | undefined
  return photo?.sizes?.thumbnail?.url ?? photo?.url ?? null
}

export function OrderItemCard({
  item,
  product,
  productId,
  adminRoute,
}: {
  item: OrderItem
  product?: Product
  productId: string | number | null
  adminRoute: string
}) {
  const photo = firstPhotoUrl(product)
  const title = product?.title ?? (productId != null ? `Товар #${productId}` : 'Товар удалён')
  const sum =
    item.quantity != null && item.unitPrice != null ? item.quantity * item.unitPrice : undefined

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '12px 16px',
        borderRadius: '4px',
        background: CARD_BG,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: '4px',
          overflow: 'hidden',
          background: BORDER_COLOR,
        }}
      >
        {photo && (
          <img
            src={photo}
            alt={title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        {productId != null ? (
          <a
            href={`${adminRoute}/collections/products/${productId}`}
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'inherit',
              textDecoration: 'none',
              overflowWrap: 'anywhere',
            }}
          >
            {title}
          </a>
        ) : (
          <span style={{ fontSize: '14px', fontWeight: 500 }}>{title}</span>
        )}
        <div style={{ marginTop: '6px', fontSize: '13px', opacity: MUTED_OPACITY }}>
          {item.quantity ?? '—'} × {formatPrice(item.unitPrice) ?? '—'}
        </div>
      </div>

      <span style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap' }}>
        {formatPrice(sum) ?? '—'}
      </span>
    </div>
  )
}