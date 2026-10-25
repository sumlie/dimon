import type { DefaultServerCellComponentProps } from 'payload'

type Media = {
  id: string | number
  url?: string | null
  alt?: string | null
  sizes?: { thumbnail?: { url?: string | null } }
}

export default async function PhotoCell({
  cellData,
  payload,
}: DefaultServerCellComponentProps) {
  const first = Array.isArray(cellData) ? cellData[0] : cellData

  if (first == null) {
    return <span style={{ opacity: 0.4 }}>—</span>
  }

  let media: Media | null = null

  if (typeof first === 'object') {
    media = first as Media
  } else {
    try {
      media = (await payload.findByID({
        collection: 'media',
        id: first,
        depth: 0,
      })) as unknown as Media
    } catch {
      media = null
    }
  }

  const url = media?.sizes?.thumbnail?.url ?? media?.url

  if (!url) {
    return <span style={{ opacity: 0.4 }}>—</span>
  }

  const count = Array.isArray(cellData) ? cellData.length : 1

  return (
    <div style={{ position: 'relative', width: 48, height: 48 }}>
      <img
        src={url}
        alt={media?.alt ?? ''}
        style={{
          width: 48,
          height: 48,
          objectFit: 'cover',
          borderRadius: 4,
          display: 'block',
        }}
      />
      {count > 1 && (
        <span
          style={{
            position: 'absolute',
            right: -4,
            bottom: -4,
            padding: '1px 5px',
            fontSize: 11,
            fontWeight: 600,
            borderRadius: 8,
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.7)',
          }}
        >
          +{count - 1}
        </span>
      )}
    </div>
  )
}