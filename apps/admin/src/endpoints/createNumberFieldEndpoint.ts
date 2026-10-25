import { and, eq } from '@payloadcms/db-postgres/drizzle'
import type { Endpoint } from 'payload'

type NumberFieldRule = {
  integer?: boolean
  min?: number
  max?: number
}

type CreateNumberFieldEndpointOptions = {
  collection: string
  fields: Record<string, NumberFieldRule>
  path?: string
}

export const numberField = {
  integer: true,
  min: 0,
}

export const createNumberFieldEndpoint = ({
  collection,
  fields,
  path = '/:id/update-number',
}: CreateNumberFieldEndpointOptions): Endpoint => ({
  path,
  method: 'post',

  handler: async (req) => {
    if (!req.user) {
      return Response.json(
        { error: 'Необходима авторизация' },
        { status: 401 },
      )
    }

    const id = Number(req.routeParams?.id)

    if (!Number.isSafeInteger(id) || id <= 0) {
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
      typeof value !== 'number' ||
      !Number.isFinite(value) ||
      (rule.integer && !Number.isSafeInteger(value)) ||
      (rule.min !== undefined && value < rule.min) ||
      (rule.max !== undefined && value > rule.max) ||
      typeof expectedValue !== 'number' ||
      !Number.isFinite(expectedValue)
    ) {
      return Response.json(
        { error: 'Некорректное значение' },
        { status: 400 },
      )
    }

    const table = req.payload.db.tables[collection] as
      | Record<string, any>
      | undefined

    const idColumn = table?.id
    const valueColumn = table?.[field]

    if (!idColumn || !valueColumn) {
      return Response.json(
        { error: 'Таблица или поле не найдены' },
        { status: 500 },
      )
    }

    const [updated] = await req.payload.db.drizzle
      .update(table as any)
      .set({ [field]: value })
      .where(
        and(
          eq(idColumn, id),
          eq(valueColumn, expectedValue),
        ),
      )
      .returning({ value: valueColumn })

    if (!updated) {
      return Response.json(
        {
          error:
            'Значение изменилось другим администратором. Обнови данные.',
        },
        { status: 409 },
      )
    }

    return Response.json({ value: updated.value })
  },
})