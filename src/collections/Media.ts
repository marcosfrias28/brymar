import { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticURL: '/media',
    staticDir: 'media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 1024,
        position: 'centre',
      },
      {
        name: 'tablet',
        width: 1024,
        height: undefined,
        position: 'centre',
      },
      {
        name: 'desktop',
        width: 1920,
        height: undefined,
        position: 'centre',
      },
    ],
    adminThumbnail: 'thumbnail',
    mimeTypes: [
      'image/*',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
  },
  admin: {
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'mimeType', 'filesize'],
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => {
      return !!user // Solo utenti autenticati possono caricare file
    },
    update: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'agent'
    },
    delete: ({ req: { user } }) => {
      return user?.role === 'admin'
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Testo Alternativo',
      required: true,
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Didascalia',
    },
    {
      name: 'description',
      type: 'textarea',
      label: 'Descrizione',
    },
    {
      name: 'category',
      type: 'select',
      label: 'Categoria',
      options: [
        { label: 'Proprietà - Esterno', value: 'property-exterior' },
        { label: 'Proprietà - Interno', value: 'property-interior' },
        { label: 'Proprietà - Bagno', value: 'property-bathroom' },
        { label: 'Proprietà - Cucina', value: 'property-kitchen' },
        { label: 'Proprietà - Camera', value: 'property-bedroom' },
        { label: 'Proprietà - Giardino', value: 'property-garden' },
        { label: 'Proprietà - Piscina', value: 'property-pool' },
        { label: 'Terreno', value: 'land' },
        { label: 'Blog', value: 'blog' },
        { label: 'Profilo Utente', value: 'profile' },
        { label: 'Documenti', value: 'documents' },
        { label: 'Logo/Branding', value: 'branding' },
        { label: 'Altro', value: 'other' },
      ],
    },
    {
      name: 'tags',
      type: 'array',
      label: 'Tag',
      fields: [
        {
          name: 'tag',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'photographer',
      type: 'text',
      label: 'Fotografo/Autore',
    },
    {
      name: 'copyright',
      type: 'text',
      label: 'Copyright',
    },
    {
      name: 'location',
      type: 'group',
      label: 'Ubicazione Foto',
      fields: [
        {
          name: 'city',
          type: 'text',
          label: 'Città',
        },
        {
          name: 'country',
          type: 'text',
          label: 'Paese',
          defaultValue: 'Repubblica Dominicana',
        },
      ],
    },
    {
      name: 'usage',
      type: 'select',
      hasMany: true,
      label: 'Utilizzo Consentito',
      options: [
        { label: 'Sito Web', value: 'website' },
        { label: 'Social Media', value: 'social' },
        { label: 'Stampa', value: 'print' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Presentazioni', value: 'presentations' },
      ],
      defaultValue: ['website'],
    },
    {
      name: 'quality',
      type: 'select',
      label: 'Qualità Immagine',
      options: [
        { label: 'Alta Risoluzione', value: 'high' },
        { label: 'Media Risoluzione', value: 'medium' },
        { label: 'Bassa Risoluzione', value: 'low' },
        { label: 'Thumbnail', value: 'thumbnail' },
      ],
      admin: {
        description: 'Qualità dell\'immagine originale',
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Immagine in Evidenza',
      defaultValue: false,
      admin: {
        description: 'Mostra nella galleria principale',
      },
    },
    {
      name: 'uploadedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Caricato da',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ req, data }) => {
        // Imposta automaticamente l'utente che ha caricato il file
        if (req.user) {
          data.uploadedBy = req.user.id
        }
        
        return data
      },
    ],
    afterChange: [
      ({ doc, req }) => {
        // Log dell'upload per audit
        if (req.user) {
          console.log(`File ${doc.filename} caricato da ${req.user.email}`)
        }
      },
    ],
  },
  timestamps: true,
}