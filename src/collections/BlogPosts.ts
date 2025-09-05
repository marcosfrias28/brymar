import { CollectionConfig } from 'payload'

export const BlogPosts: CollectionConfig = {
  slug: 'blog-posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'author', 'status', 'publishedDate'],
  },
  access: {
    read: ({ req: { user } }) => {
      if (user?.role === 'admin' || user?.role === 'agent') return true
      return {
        status: {
          equals: 'published',
        },
      }
    },
    create: ({ req: { user } }) => {
      return user?.role === 'admin' || user?.role === 'agent'
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
      name: 'title',
      type: 'text',
      required: true,
      label: 'Titolo',
    },
    {
      name: 'slug',
      type: 'text',
      label: 'Slug URL',
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Estratto',
      maxLength: 300,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      label: 'Contenuto',
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
      label: 'Immagine in Evidenza',
    },
    {
      name: 'gallery',
      type: 'array',
      label: 'Galleria Immagini',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
          label: 'Didascalia',
        },
      ],
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      label: 'Autore',
      filterOptions: {
        role: {
          in: ['admin', 'agent'],
        },
      },
    },
    {
      name: 'categories',
      type: 'select',
      hasMany: true,
      label: 'Categorie',
      options: [
        { label: 'Mercato Immobiliare', value: 'market' },
        { label: 'Consigli per Acquirenti', value: 'buyer-tips' },
        { label: 'Investimenti', value: 'investments' },
        { label: 'Lifestyle', value: 'lifestyle' },
        { label: 'Notizie Aziendali', value: 'company-news' },
        { label: 'Guide Legali', value: 'legal-guides' },
        { label: 'Tendenze Design', value: 'design-trends' },
        { label: 'Località', value: 'locations' },
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
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      label: 'Stato',
      options: [
        {
          label: 'Bozza',
          value: 'draft',
        },
        {
          label: 'In Revisione',
          value: 'review',
        },
        {
          label: 'Pubblicato',
          value: 'published',
        },
        {
          label: 'Archiviato',
          value: 'archived',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'publishedDate',
      type: 'date',
      label: 'Data Pubblicazione',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Articolo in Evidenza',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'seo',
      type: 'group',
      label: 'SEO',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          label: 'Meta Title',
          maxLength: 60,
        },
        {
          name: 'metaDescription',
          type: 'textarea',
          label: 'Meta Description',
          maxLength: 160,
        },
        {
          name: 'keywords',
          type: 'text',
          label: 'Keywords (separate con virgole)',
        },
      ],
      admin: {
        position: 'sidebar',
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        
        if (data.status === 'published' && !data.publishedDate) {
          data.publishedDate = new Date().toISOString()
        }
        
        return data
      },
    ],
  },
}