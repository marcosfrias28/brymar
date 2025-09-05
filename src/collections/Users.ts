import { CollectionConfig } from 'payload'
import { PayloadAuthAdapter } from '../../lib/payload/auth-adapter'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    verify: {
      generateEmailHTML: ({ token }) => {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Verifica il tuo account Brymar</h2>
          <p>Clicca sul link sottostante per verificare il tuo account:</p>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/verify-email?token=${token}" 
             style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Verifica Account
          </a>
          <p style="margin-top: 20px; color: #666;">Se non hai richiesto questa verifica, ignora questa email.</p>
        </div>
        `
      },
    },
    forgotPassword: {
      generateEmailHTML: ({ token }) => {
        return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Reset Password Brymar</h2>
          <p>Clicca sul link sottostante per reimpostare la tua password:</p>
          <a href="${process.env.NEXT_PUBLIC_SERVER_URL}/reset-password?token=${token}" 
             style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
            Reset Password
          </a>
          <p style="margin-top: 20px; color: #666;">Se non hai richiesto questo reset, ignora questa email.</p>
        </div>
        `
      },
    },
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    create: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
    update: ({ req: { user } }) => {
      if (user?.role === 'admin') return true
      return {
        id: {
          equals: user?.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome Completo',
    },
    {
      name: 'betterAuthId',
      type: 'text',
      label: 'Better Auth ID',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'syncedAt',
      type: 'date',
      label: 'Ultima Sincronizzazione',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'user',
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Agente',
          value: 'agent',
        },
        {
          label: 'Utente',
          value: 'user',
        },
      ],
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      label: 'Immagine Profilo',
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Sincronizza con Better Auth se necessario
        if (operation === 'create' && req.user) {
          data.betterAuthId = req.user.id
          data.syncedAt = new Date().toISOString()
        }
        
        return data
      },
    ],
  },
}