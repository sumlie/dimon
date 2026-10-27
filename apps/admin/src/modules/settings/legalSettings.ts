import type { GlobalConfig } from 'payload'

export const OwnerInfo: GlobalConfig = {
  slug: 'legal-settings',

  label: 'Owner Info',

  admin: {
    group: 'Tweaks',
  },

  fields: [
    {
      name: 'brandName',
      type: 'text',
      label: 'Название магазина',
      required: true,
    },
    {
      name: 'entrepreneurName',
      type: 'text',
      label: 'ФИО ИП',
      required: true,
    },
    {
      name: 'inn',
      type: 'text',
      label: 'ИНН',
      required: true,
    },
    {
      name: 'ogrnip',
      type: 'text',
      label: 'ОГРНИП',
      required: true,
    },
  ],
}