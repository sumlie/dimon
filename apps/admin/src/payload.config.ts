import { postgresAdapter } from '@payloadcms/db-postgres'
import { mcpPlugin } from '@payloadcms/plugin-mcp'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { sharpTransformer } from '@payloadcms/transformer-sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Admins } from './modules/users'
import { Media } from './modules/media'
import { Folders } from './modules/folders'
import { Tags } from './modules/tags'
import { Categories } from './modules/categories'
import { Products } from './modules/products'
import { Orders } from './modules/orders'
import { Customers } from './modules/customers'

import { OwnerInfo, SocialLinks } from './modules/settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Admins.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  globals: [SocialLinks, OwnerInfo],
  collections: [Admins, Media, Folders, Tags, Categories, Products, Orders, Customers],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payloadTypes.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  localization: {
    locales: [{ code: 'en', label: 'English' }],
    fallback: true,
    defaultLocale: 'en',
  },
  plugins: [mcpPlugin({})],
  upload: {
    transformers: [sharpTransformer()],
  },
})
