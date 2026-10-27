import type { DefaultServerCellComponentProps } from 'payload'

import { BORDER_COLOR, MUTED_OPACITY } from '@/shared/lib/theme'

type Media = {
  id: string | number
  url?: string | null
  sizes?: { thumbnail?: { url?: string | null } }
}

type Product = {
  id: string | number
  title?: string
  photos?: (Media | string | number)[] | null
}

type Row = { id?: string; product?: Product | string | number | null }

const productId = (p: Row['product']) =>
  p && typeof p === 'object' ? p.id : (p ?? null)

const photoUrl = (p?: Product) => {
  const photo = p?.photos?.find((x) => typeof x === 'object') as Media | undefined
  return photo?.sizes?.thumbnail?.url ?? photo?.url ?? null
}

export default async function OrderItemsCell({
  cellData,
  payload,
}: DefaultServerCellComponentProps) {
  const rows = (Array.isArray(cellData) ? cellData : []) as Row[]

  if (!rows.length) {
    return <span style={{ opacity: MUTED_OPACITY }}>—</span>
  }

  const ids = [
    ...new Set(rows.map((r) => productId(r.product)).filter((v): v is string | number => v != null)),
  ]

  const byId = new Map<string | number, Product>()

  if (ids.length) {
    try {
      const res = await payload.find({
        collection: 'products',
        where: { id: { in: ids } },
        depth: 1,
        pagination: false,
        overrideAccess: true,
      })
      for (const p of res.docs as unknown as Product[]) byId.set(p.id, p)
    } catch (e) {
      console.error('OrderItemsCell: не удалось загрузить товары', e)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: '4px 0' }}>
      {rows.map((row, i) => {
        const id = productId(row.product)
        const product = id != null ? byId.get(id) : undefined
        const url = photoUrl(product)
        const title = product?.title ?? (id != null ? `Товар #${id}` : 'Товар удалён')

        return (
          <div
            key={row.id ?? i}
            style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 4,
                overflow: 'hidden',
                background: BORDER_COLOR,
              }}
            >
              {url && (
                <img
                  src={url}
                  alt={title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              )}
            </div>
            <span style={{ fontSize: 13, overflowWrap: 'anywhere' }}>{title}</span>
          </div>
        )
      })}
    </div>
  )
}