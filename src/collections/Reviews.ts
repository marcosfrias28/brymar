import { CollectionConfig } from 'payload'

export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'rating', 'status', 'createdAt'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'agent') return true
      return {
        status: {
          equals: 'approved',
        },
      }
    },
    create: () => true, // Chiunque può creare una recensione
    update: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'agent'
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
      label: 'Nome Cliente',
    },
    {
      name: 'email',
      type: 'email',
      required: true,
      label: 'Email',
      admin: {
        description: 'Email non sarà mostrata pubblicamente',
      },
    },
    {
      name: 'rating',
      type: 'number',
      required: true,
      label: 'Valutazione (1-5)',
      min: 1,
      max: 5,
    },
    {
      name: 'title',
      type: 'text',
      label: 'Titolo Recensione',
      maxLength: 100,
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      label: 'Recensione',
      maxLength: 1000,
    },
    {
      name: 'serviceType',
      type: 'select',
      label: 'Tipo Servizio',
      options: [
        { label: 'Acquisto Proprietà', value: 'property-purchase' },
        { label: 'Vendita Proprietà', value: 'property-sale' },
        { label: 'Affitto', value: 'rental' },
        { label: 'Consulenza', value: 'consultation' },
        { label: 'Gestione Proprietà', value: 'property-management' },
        { label: 'Investimenti', value: 'investment' },
        { label: 'Altro', value: 'other' },
      ],
    },
    {
      name: 'propertyRelated',
      type: 'relationship',
      relationTo: 'properties',
      label: 'Proprietà Correlata',
      admin: {
        description: 'Se la recensione è relativa a una proprietà specifica',
      },
    },
    {
      name: 'agentRelated',
      type: 'relationship',
      relationTo: 'users',
      label: 'Agente Correlato',
      filterOptions: {
        role: {
          in: ['agent', 'admin'],
        },
      },
      admin: {
        description: 'Agente che ha fornito il servizio',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      label: 'Stato Moderazione',
      options: [
        {
          label: 'In Attesa',
          value: 'pending',
        },
        {
          label: 'Approvata',
          value: 'approved',
        },
        {
          label: 'Rifiutata',
          value: 'rejected',
        },
        {
          label: 'Segnalata',
          value: 'flagged',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'moderationNotes',
      type: 'textarea',
      label: 'Note Moderazione',
      admin: {
        position: 'sidebar',
        description: 'Note interne per la moderazione',
      },
      access: {
        read: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'agent',
        create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'agent',
        update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'agent',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Recensione in Evidenza',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
      access: {
        create: ({ req: { user } }) => user?.role === 'admin',
        update: ({ req: { user } }) => user?.role === 'admin',
      },
    },
    {
      name: 'location',
      type: 'text',
      label: 'Località Cliente',
      admin: {
        description: 'Es: Santo Domingo, DR',
      },
    },
    {
      name: 'clientPhoto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto Cliente',
      admin: {
        description: 'Foto opzionale del cliente (con consenso)',
      },
    },
    {
      name: 'verifiedPurchase',
      type: 'checkbox',
      label: 'Acquisto Verificato',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Indica se il cliente ha effettivamente acquistato/affittato',
      },
      access: {
        create: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'agent',
        update: ({ req: { user } }) => user?.role === 'admin' || user?.role === 'agent',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, req }) => {
        // Se non è un admin/agent, forza lo stato a pending
        if (req.user?.role !== 'admin' && req.user?.role !== 'agent') {
          data.status = 'pending'
        }
        
        return data
      },
    ],
  },
  timestamps: true,
}