import type { CollectionConfig } from 'payload'

import { socialSessionStrategy } from '../auth/session'
import { adminOrSelf, onlyAdmin, onlyCustomer } from './access'
import { customerHooks } from './hooks'

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: 'Customer', plural: 'Customers' },

  auth: {
    tokenExpiration: 60 * 60 * 2,
    verify: true,
    useSessions: true,
    strategies: [socialSessionStrategy],
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    removeTokenFromResponses: true,
    cookies: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      domain: process.env.COOKIE_DOMAIN,
    },
  },

  admin: {
    group: 'Shop',
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'phone', 'createdAt'],
  },

  access: {
    create: () => false,
    read: adminOrSelf,
    update: adminOrSelf,
    delete: adminOrSelf,
  },

  hooks: customerHooks,

  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Имя',
      required: true,
      access: { update: onlyCustomer },
    },
    {
      name: 'phone',
      type: 'text',
      label: 'Телефон',
      access: { update: onlyCustomer },
    },
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      maxLength: 33,
      access: {
        update: onlyCustomer,
      },
    },
    {
      name: 'email',
      type: 'email',
      label: 'Email',
      required: true,
      access: {
        update: onlyAdmin,
      },
    },
    {
      name: 'addresses',
      type: 'array',
      label: 'Адреса доставки',
      maxRows: 5,
      access: { update: onlyCustomer },
      fields: [
        {
          name: 'label',
          type: 'text',
          label: 'Название',
          admin: { description: 'Например: Дом, Работа' },
        },
        { name: 'recipientName', type: 'text', label: 'Получатель' },
        { name: 'recipientPhone', type: 'text', label: 'Телефон получателя' },
        { name: 'deliveryMethod', type: 'text', label: 'Способ доставки' },
        { name: 'address', type: 'textarea', label: 'Адрес / пункт выдачи', required: true },
        { name: 'isDefault', type: 'checkbox', label: 'По умолчанию', defaultValue: false },
      ],
    },
    {
      name: 'defaultPaymentMethod',
      type: 'text',
      label: 'Способ оплаты по умолчанию',
      access: { update: onlyCustomer },
    },

    {
      name: 'accounts',
      type: 'array',
      label: 'Привязанные соцсети (устарело)',
      admin: {
        readOnly: true,
        hidden: true,
        description: 'Данные перенесены в коллекцию customer-identities.',
      },
      access: { create: () => false, read: onlyAdmin, update: () => false },
      fields: [
        {
          name: 'provider',
          type: 'select',
          required: true,
          options: ['google', 'telegram', 'vk', 'yandex'],
        },
        { name: 'providerId', type: 'text', required: true, index: true },
      ],
    },

    {
      name: 'emailVerifiedAt',
      type: 'date',
      label: 'Email подтверждён',
      admin: { readOnly: true, position: 'sidebar' },
      access: { update: onlyAdmin },
    },
    {
      name: 'socialOnly',
      type: 'checkbox',
      label: 'Только соцвход',
      defaultValue: false,
      admin: { readOnly: true, position: 'sidebar' },
      access: { update: onlyAdmin },
    },
    {
      name: 'registrationCompletedAt',
      type: 'date',
      label: 'Регистрация завершена',
      admin: { readOnly: true, position: 'sidebar' },
      access: { update: onlyAdmin },
    },

    {
      name: 'isBlocked',
      type: 'checkbox',
      label: 'Заблокирован',
      defaultValue: false,
      access: { update: onlyAdmin },
      admin: { position: 'sidebar' },
    },
    {
      name: 'consentAt',
      type: 'date',
      label: 'Согласие на обработку данных',
      admin: { readOnly: true, position: 'sidebar' },
      access: { update: () => false },
    },
  ],
}
