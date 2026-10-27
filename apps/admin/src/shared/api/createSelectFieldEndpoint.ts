
import type { Endpoint } from 'payload'

type SelectFieldRule = {
  options: readonly (string | number | boolean)[]
}

type CreateSelectFieldEndpointOptions = {
  collection: string
  fields: Record<string, SelectFieldRule>
  path?: string
}

export const createSelectFieldEndpoint = ({
  collection,
  fields,
  path = '/:id/update-select',
}: CreateSelectFieldEndpointOptions): Endpoint => ({
  path,
  method: 'post',

  handler: async (req) => {
    if (!req.user) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 },
      )
    }

    const id = req.routeParams?.id

    if (!id || !/^\d+$/.test(String(id)) || Number(id) <= 0) {
      return Response.json(
        { error: 'Некорректный ID записи' },
        { status: 400 },
      )
    }

    // @ts-ignore
    const body: unknown = await req.json().catch(() => null)

    if (!body || typeof body !== 'object') {
      return Response.json(
        { error: 'Некорректное тело запроса' },
        { status: 400 },
      )
    }

    const { field, value, expectedValue } = body as Record<
      string,
      unknown
    >

    if (typeof field !== 'string' || !Object.hasOwn(fields, field)) {
      return Response.json(
        { error: 'Изменение этого поля запрещено' },
        { status: 403 },
      )
    }

    const rule = fields[field]

    if (
      !rule.options.some((option) => option === value) ||
      typeof expectedValue !== typeof value
    ) {
      return Response.json(
        { error: 'Недопустимое значение поля' },
        { status: 400 },
      )
    }

    try {
      const document = await req.payload.findByID({
        collection: collection as any,
        id: id as any,
        depth: 0,
        req,
        overrideAccess: false,
      })

      const currentValue = (document as Record<string, unknown>)[field]

      if (currentValue !== expectedValue) {
        return Response.json(
          {
            error:
              'Значение изменилось. Обнови данные и попробуй снова.',
          },
          { status: 409 },
        )
      }

      const updated = await req.payload.update({
        collection: collection as any,
        id: id as any,
        data: { [field]: value } as any,
        req,
        overrideAccess: false,
      })

      return Response.json({
        value: (updated as Record<string, unknown>)[field],
      })
    } catch (error) {
      req.payload.logger.error({
        err: error,
        msg: `Failed to update ${collection}.${field}`,
      })

      return Response.json(
        { error: 'Не удалось обновить значение' },
        { status: 500 },
      )
    }
  },
})
