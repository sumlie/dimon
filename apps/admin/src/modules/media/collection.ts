import type { CollectionConfig } from 'payload'
import { createFolderField, createTagField } from 'payload'

const folderField = createFolderField({ relationTo: 'folders' })

if (folderField.type !== 'relationship' || folderField.hasMany === true) {
  throw new Error('Expected a single relationship field for folders')
}

const { Field: _hiddenField, ...folderComponents } =
  folderField.admin?.components ?? {}

const { position: _position, ...folderAdmin } = folderField.admin ?? {}

export const Media: CollectionConfig = {
  slug: 'media',

  access: {
    read: () => true,
  },

  admin: {
    group: 'Workspace',
  },

  fields: [
    //@ts-ignore
    {
      ...folderField,
      admin: {
        ...folderAdmin,
        components: folderComponents,
      },
    },
    createTagField({ relationTo: 'tags' }),
  ],

  upload: {
    bulkUpload: true,
  },
}