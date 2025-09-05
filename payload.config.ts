import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { webpackBundler } from '@payloadcms/bundler-webpack'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import path from 'path'

// Import collections
import { Users } from './src/collections/Users'
import { Properties } from './src/collections/Properties'
import { BlogPosts } from './src/collections/BlogPosts'
import { Lands } from './src/collections/Lands'
import { Reviews } from './src/collections/Reviews'
import { Media } from './src/collections/Media'

// Import auth adapter
import { PayloadAuthAdapter } from './lib/payload/auth-adapter'

export default buildConfig({
  admin: {
    user: Users.slug,
    bundler: webpackBundler(),
    meta: {
      titleSuffix: '- Brymar Real Estate CMS',
      favicon: '/favicon.ico',
      ogImage: '/og-image.jpg',
    },
    webpack: (config) => {
      return {
        ...config,
        resolve: {
          ...config.resolve,
          fallback: {
            ...config.resolve?.fallback,
            fs: false,
          },
        },
      }
    },
  },
  collections: [
    Users,
    Properties,
    BlogPosts,
    Lands,
    Reviews,
    Media,
  ],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  plugins: [
    vercelBlobStorage({
      collections: {
        media: {
          prefix: 'brymar-media',
        },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN!,
    }),
  ],
  db: postgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL!,
    },
  }),
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET!,
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  cors: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://*.vercel.app',
  ],
  csrf: [
    process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'https://*.vercel.app',
  ],
  onInit: async (payload) => {
    // Crea utente admin di default se non esiste
    const existingUsers = await payload.find({
      collection: 'users',
      limit: 1,
    })

    if (existingUsers.docs.length === 0) {
      await payload.create({
        collection: 'users',
        data: {
          email: 'admin@brymar.com',
          password: 'admin123',
          name: 'Admin Brymar',
          role: 'admin',
        },
      })
      console.log('✅ Utente admin creato: admin@brymar.com / admin123')
    }
  },
})