import type { Access, CollectionConfig } from 'payload'

const adminOnly: Access = ({ req: { user } }) => user?.collection === 'admins'

const ownerOrAdmin: Access = ({ req: { user } }) => {
  if (user?.collection === 'admins') return true
  if (user?.collection === 'customers' && !user.isBlocked) {
    return { customer: { equals: user.id } }
  }
  return false
}

export const CustomerIdentities: CollectionConfig = {
  slug: 'customer-identities',
  labels: { singular: 'Identity', plural: 'Identities' },
  admin: {
    group: 'Users',
    useAsTitle: 'providerId',
    defaultColumns: ['customer', 'provider', 'providerId', 'lastLoginAt'],
    description: 'External login providers linked to customers. Managed by the auth API.',
  },
  access: {
    create: () => false,
    read: ownerOrAdmin,
    update: () => false,
    delete: adminOnly,
  },
  indexes: [{ fields: ['provider', 'providerId'], unique: true }],
  fields: [
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
    },
    {
      name: 'provider',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'Google', value: 'google' },
        { label: 'Yandex', value: 'yandex' },
        { label: 'Telegram', value: 'telegram' },
        { label: 'VK', value: 'vk' },
      ],
    },
    { name: 'providerId', type: 'text', required: true, index: true },
    { name: 'email', type: 'email' },
    { name: 'emailVerified', type: 'checkbox', defaultValue: false },
    { name: 'linkedAt', type: 'date', defaultValue: () => new Date() },
    { name: 'lastLoginAt', type: 'date' },
  ],
}
