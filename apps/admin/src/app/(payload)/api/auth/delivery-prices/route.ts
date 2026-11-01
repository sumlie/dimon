import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config })

    const prices = await payload.findGlobal({
      slug: 'delivery-prices',
      depth: 0,
      overrideAccess: true,
    })

    return Response.json(
      {
        belarus: prices.belarus,
        moscow: prices.moscow,
        russia: prices.russia,
        cis: prices.cis,
        world: prices.world,
      },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  } catch (error) {
    console.error('Failed to load delivery prices:', error)

    return Response.json(
      { error: 'Не удалось загрузить цены доставки' },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store',
        },
      },
    )
  }
}