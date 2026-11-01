
import type { CollectionConfig } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',

  labels: {
    singular: 'Categories',
    plural: 'Categories',
  },

  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug'],
    group: 'Shop',
  },

  access: {
    read: () => true,
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
      label: 'Slug',
      unique: true,
      // required: true,
    },
    {
      name: 'products',
      type: 'join',
      label: 'Товары категории',
      collection: 'products',
      on: 'category',
      defaultLimit: 10,
      defaultSort: 'title',
      admin: {
        defaultColumns: ['title', 'category', 'priceByn', 'priceRub', 'stock', 'status'],
      },
    },
  ],
}
