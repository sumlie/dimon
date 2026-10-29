import type { CollectionConfig } from 'payload'

import { numberField } from '@/shared/api/createNumberFieldEndpoint'
import { toOptions } from '@/shared/lib/status'

import { productEndpoints } from './endpoints'
import { productStatus } from './status'

export const Products: CollectionConfig = {
  endpoints: productEndpoints,

  slug: 'products',

  labels: {
    singular: 'Products',
    plural: 'Products',
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title','photos', 'category', 'priceByn', 'priceRub', 'stock', 'status'],
    group: 'Shop',
  },

  access: {
    read: ({ req: { user } }) => {
      if (user) return true;
      return {
        status: { equals: 'published' },
      };
    },
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      label: 'URL',
      required: true,
      unique: true,
      index: true,
    },
    {
      name: 'photos',
      type: 'upload',
      label: 'Фото',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: {
        components: {
          Cell: '/modules/products/ui/photoCell',
        },
      },
    },
    {
      name: 'category',
      type: 'relationship',
      label: 'Категория',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Описание',
    },
    {
      name: 'priceRub',
      type: 'number',
      label: 'Цена (RUB)',
      required: true,
      ...numberField,
      admin: {
        components: {
          Cell: '/shared/ui/editableNumberCell',
        },
        custom: {
          updateURL: '/api/products/:id/update-number',
        },
      },
    },
    {
      name: 'priceByn',
      type: 'number',
      label: 'Цена (BYN)',
      required: true,
      ...numberField,
      admin: {
        components: {
          Cell: '/shared/ui/editableNumberCell',
        },
        custom: {
          updateURL: '/api/products/:id/update-number',
        },
      },
    },
    {
      name: 'stock',
      type: 'number',
      label: "Остаток",
      defaultValue: 0,
      ...numberField,
      required: true,
      admin: {
        components: {
          Cell: '/shared/ui/editableNumberCell',
        },
        custom: {
          updateURL: '/api/products/:id/update-number',
        },
      },
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Теги',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Показывать на главной',
      defaultValue: false,
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      options: toOptions(productStatus),
      defaultValue: 'draft',
      required: true,
      admin: {
        components: {
          Cell: '/shared/ui/editableSelectCell',
        },
        custom: {
          updateURL: '/api/products/:id/update-select',
        },
      },
    },
  ],
}
