import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',

  labels: {
    singular: 'Page',
    plural: 'Pages',
  },

  admin: {
    group: 'Content',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
  },

  access: {
    create: ({ req: { user } }) => user?.collection === 'admins',

    read: ({ req: { user } }) => {
      if (user?.collection === 'admins') return true

      return {
        status: {
          equals: 'published',
        },
      }
    },

    update: ({ req: { user } }) => user?.collection === 'admins',
    delete: ({ req: { user } }) => user?.collection === 'admins',
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Название страницы',
      required: true,
      admin: {
        description: 'Заголовок, который увидят посетители сайта.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Адрес страницы',
      required: true,
      unique: true,
      index: true,
      admin: {
        description:
          'Например: terms-of-use. Указывай без слэша в начале.',
      },
      //@ts-ignore
      validate: (value) => {
        if (
          typeof value !== 'string' ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
        ) {
          return 'Используй строчные латинские буквы, цифры и дефисы.'
        }

        return true
      },
    },
    {
      name: 'content',
      type: 'code',
      label: 'Содержимое',
      required: true,
      admin: {
        language: 'markdown',
        description:
          'Текст страницы в формате Markdown. Главный заголовок берётся из поля «Название страницы».',
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Статус',
      required: true,
      defaultValue: 'draft',
      options: [
        {
          label: 'Черновик',
          value: 'draft',
        },
        {
          label: 'Опубликовано',
          value: 'published',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
}