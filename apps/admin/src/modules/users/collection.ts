import type { CollectionConfig } from 'payload'

export const Admins: CollectionConfig = {
  slug: 'admins',
  admin: {
    useAsTitle: 'email',
    group: 'Workspace',
  },
  auth: true,
  fields: [
  ],
  versions: false,
}
