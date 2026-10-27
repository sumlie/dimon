import type { CollectionConfig } from 'payload'

import { toOptions } from '@/shared/lib/status'

import { orderEndpoints } from './endpoints'
import { orderStatus, paymentStatus } from './status'

export const Orders: CollectionConfig = {
  slug: 'orders',

  access: {
    create: () => false,
    read: ({ req: { user } }) => {
      if (user?.collection === 'admins') return true
      if (user?.collection === 'customers') return { customer: { equals: user.id } }
      return false
    },
    delete: () => false,
  },

  endpoints: orderEndpoints,

  admin: {
    group: 'Shop',
    useAsTitle: 'id',
    defaultColumns: [
      'id',
      'customerName',
      'username',
      'items',
      'total',
      'createdAt',
      'status',
      'paymentStatus',
    ],
    components: {
      views: {
        edit: {
          root: {
            Component: '/modules/orders/ui/orderView'
          }
        }
      }
    }
  },

  fields: [
    {
      name: 'items',
      type: 'array',
      label: 'Товары в заказе',
      required: true,
      minRows: 1,
      labels: { singular: 'Товар', plural: 'Товары' },
      admin: {
        components: {
          Cell: '/modules/orders/ui/orderItemsCell',
        },
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products',
          required: true,
          label: 'Товар',
          admin: {
            allowCreate: false,
            allowEdit: false,
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          defaultValue: 1,
          label: 'Количество',
        },
        {
          name: 'unitPrice',
          type: 'number',
          required: true,
          min: 0,
          label: 'Цена за единицу',
        },
      ],
    },
    {
      name: 'total',
      type: 'number',
      required: true,
      min: 0,
      label: 'Сумма (RUB)',
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      label: 'Статус заказа',
      options: toOptions(orderStatus),
      admin: {
        components: {
          Cell: '/shared/ui/editableSelectCell',
        },
        custom: {
          updateURL: '/api/orders/:id/update-status',
        },
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'customerName',
      type: 'text',
      required: true,
      label: 'Имя покупателя',
    },
    {
      name: 'username',
      type: 'text',
      required: true,
      label: 'Аккаунт',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Телефон',
    },
    {
      name: 'deliveryMethod',
      type: 'text',
      label: 'Способ доставки',
    },
    {
      name: 'deliveryAddress',
      type: 'textarea',
      label: 'Адрес доставки / пункт выдачи',
    },
    {
      name: 'paymentMethod',
      type: 'text',
      label: 'Способ оплаты',
    },
    {
      name: 'paymentStatus',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Статус оплаты',
      options: toOptions(paymentStatus),
      admin: {
        components: {
          Cell: '/shared/ui/editableSelectCell',
        },
        custom: {
          updateURL: '/api/orders/:id/update-payment-status',
        },
      },
    },
    {
      name: 'comment',
      type: 'textarea',
      label: 'Комментарий покупателя',
    },
  ],
}