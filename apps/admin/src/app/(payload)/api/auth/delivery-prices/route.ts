import config from '@payload-config'
import { getPayload } from 'payload'

export async function GET(): Promise<Response> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'delivery-prices',
      depth: 0,
      overrideAccess: true,
    })

    return Response.json({
      belarus: settings.belarus,
      moscow: settings.moscow,
      russia: settings.russia,
      cis: settings.cis,
      world: settings.world,
      pickupEnabled: settings.pickupEnabled === true,
      pickupAddress: settings.pickupAddress ?? null,
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to load delivery settings:', error)
    return Response.json({ error: 'Не удалось загрузить настройки доставки' }, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}
