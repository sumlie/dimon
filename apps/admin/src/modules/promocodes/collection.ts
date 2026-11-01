import type { CollectionConfig } from 'payload'

export const PromoCodes: CollectionConfig = {
  slug: 'promo-codes',

  labels: {
    singular: 'PromoCode',
    plural: 'PromoCodes',
  },

  admin: {
    group: 'Shop',
    useAsTitle: 'code',
    defaultColumns: [
      'code',
      'discountPercent',
      'isActive',
      'startsAt',
      'expiresAt',
    ],
  },

  access: {
    create: ({ req: { user } }) => user?.collection === 'admins',
    read: ({ req: { user } }) => user?.collection === 'admins',
    update: ({ req: { user } }) => user?.collection === 'admins',
    delete: ({ req: { user } }) => user?.collection === 'admins',
  },

  fields: [
    {
      name: 'code',
      type: 'text',
      label: 'Промокод',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Например: DIMON10',
      },
      hooks: {
        beforeValidate: [
          ({ value }) =>
            typeof value === 'string'
              ? value.trim().toUpperCase()
              : value,
        ],
      },
      //@ts-ignore
      validate: (value) => {
        if (
          typeof value !== 'string' ||
          !/^[A-Z0-9_-]{3,40}$/.test(value)
        ) {
          return 'От 3 до 40 символов: латинские буквы, цифры, дефис или подчёркивание.'
        }

        return true
      },
    },
    {
      name: 'discountPercent',
      type: 'number',
      label: 'Скидка (%)',
      required: true,
      min: 1,
      max: 100,
      //@ts-ignore
      validate: (value) =>
        typeof value === 'number' &&
        Number.isInteger(value) &&
        value >= 1 &&
        value <= 100
          ? true
          : 'Укажи целое число от 1 до 100.',
    },
    {
      name: 'isActive',
      type: 'checkbox',
      label: 'Активен',
      defaultValue: true,
    },
    {
      name: 'maxUses',
      type: 'number',
      label: 'Максимальное количество активаций',
      min: 1,
      admin: {
        description:
          'Оставь пустым, если количество использований не ограничено.',
      },
      //@ts-ignore
      validate: (value) => {
        if (value == null) return true

        return Number.isInteger(value) && value >= 1
          ? true
          : 'Укажи целое число больше нуля.'
      },
    },
    {
      name: 'usedCount',
      type: 'number',
      label: 'Использовано раз',
      required: true,
      defaultValue: 0,
      min: 0,
      admin: {
        readOnly: true,
        description: 'Увеличивается сервером при оформлении заказа.',
      },
      access: {
        update: () => false,
      },
    },
    {
      name: 'startsAt',
      type: 'date',
      label: 'Начало действия',
      admin: {
        description: 'Оставь пустым, если промокод действует сразу.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        components: {
          Cell: '/modules/promocodes/ui/promoDateCell',
        },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Окончание действия',
      admin: {
        description: 'Оставь пустым, если срок действия не ограничен.',
        date: {
          pickerAppearance: 'dayAndTime',
        },
        components: {
          Cell: '/modules/promocodes/ui/promoDateCell',
        },
      },
    },
  ],
}