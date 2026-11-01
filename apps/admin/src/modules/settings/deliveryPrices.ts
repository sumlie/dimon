import type { GlobalConfig } from 'payload'

export const DeliveryPrices: GlobalConfig = {
  slug: 'delivery-prices',

  label: 'Delivery prices',

  admin: {
    group: 'Tweaks',
  },

  access: {
    read: () => true,
    update: ({ req: { user } }) => user?.collection === 'admins',
  },

  fields: [
    {
      name: 'belarus',
      type: 'number',
      label: 'Беларусь (RUB)',
      required: true,
      min: 0,
      defaultValue: 0,
    },
    {
      name: 'moscow',
      type: 'number',
      label: 'Московская область (RUB)',
      required: true,
      min: 0,
      defaultValue: 490,
    },
    {
      name: 'russia',
      type: 'number',
      label: 'Другие регионы РФ (RUB)',
      required: true,
      min: 0,
      defaultValue: 640,
    },
    {
      name: 'cis',
      type: 'number',
      label: 'Страны СНГ (RUB)',
      required: true,
      min: 0,
      defaultValue: 790,
    },
    {
      name: 'world',
      type: 'number',
      label: 'Остальной Мир (RUB)',
      required: true,
      min: 0,
      defaultValue: 3190,
    },
  ],
}