import type { CollectionConfig } from 'payload'

import { createNumberFieldEndpoint, numberField } from '@/endpoints/createNumberFieldEndpoint'
import { createSelectFieldEndpoint } from '@/endpoints/createSelectFieldEndpoint'

const statusField = {
  options: ['draft', 'published'],
}

export const Products: CollectionConfig = {
  endpoints: [
    createNumberFieldEndpoint({
      collection: 'products',
      fields: {
        stock: { ...numberField },
        priceRub: { ...numberField },
        priceByn: { ...numberField },
      },
    }),
    createSelectFieldEndpoint({
      collection: 'products',
      fields: {
        status: { ...statusField },
      },
    }),
  ],

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
          Cell: '/components/PhotoCell',
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
          Cell: '/components/EditableNumberCell',
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
          Cell: '/components/EditableNumberCell',
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
          Cell: '/components/EditableNumberCell',
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
      options: [
        { label: 'Черновик', value: 'draft' },
        { label: 'Опубликован', value: 'published' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        components: {
          Cell: '/components/EditableSelectCell',
        },
        custom: {
          updateURL: '/api/products/:id/update-select',
        },
      },
    },
  ],
}
