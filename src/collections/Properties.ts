import { CollectionConfig } from 'payload'

export const Properties: CollectionConfig = {
  slug: 'properties',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'price', 'city', 'status'],
  },
  access: {
    read: () => true,
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
      label: 'Titolo Proprietà',
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Descrizione',
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Prezzo (USD)',
      min: 0,
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      label: 'Tipo',
      options: [
        {
          label: 'Vendita',
          value: 'sale',
        },
        {
          label: 'Affitto',
          value: 'rent',
        },
      ],
    },
    {
      name: 'propertyType',
      type: 'select',
      required: true,
      label: 'Tipo Proprietà',
      options: [
        { label: 'Villa', value: 'villa' },
        { label: 'Appartamento', value: 'apartment' },
        { label: 'Casa', value: 'house' },
        { label: 'Condominio', value: 'condo' },
        { label: 'Penthouse', value: 'penthouse' },
        { label: 'Studio', value: 'studio' },
      ],
    },
    {
      name: 'bedrooms',
      type: 'number',
      required: true,
      label: 'Camere da Letto',
      min: 0,
    },
    {
      name: 'bathrooms',
      type: 'number',
      required: true,
      label: 'Bagni',
      min: 0,
    },
    {
      name: 'area',
      type: 'number',
      label: 'Area (m²)',
      min: 0,
    },
    {
      name: 'garage',
      type: 'checkbox',
      label: 'Garage Disponibile',
      defaultValue: false,
    },
    {
      name: 'pool',
      type: 'checkbox',
      label: 'Piscina',
      defaultValue: false,
    },
    {
      name: 'garden',
      type: 'checkbox',
      label: 'Giardino',
      defaultValue: false,
    },
    {
      name: 'location',
      type: 'group',
      label: 'Ubicazione',
      fields: [
        {
          name: 'address',
          type: 'text',
          label: 'Indirizzo',
        },
        {
          name: 'city',
          type: 'select',
          required: true,
          label: 'Città',
          options: [
            { label: 'Santo Domingo', value: 'santo-domingo' },
            { label: 'Santiago', value: 'santiago' },
            { label: 'Puerto Plata', value: 'puerto-plata' },
            { label: 'Punta Cana', value: 'punta-cana' },
            { label: 'La Romana', value: 'la-romana' },
            { label: 'Samaná', value: 'samana' },
            { label: 'Barahona', value: 'barahona' },
            { label: 'San Pedro de Macorís', value: 'san-pedro' },
          ],
        },
        {
          name: 'province',
          type: 'select',
          required: true,
          label: 'Provincia',
          options: [
            { label: 'Distrito Nacional', value: 'distrito-nacional' },
            { label: 'Santiago', value: 'santiago' },
            { label: 'Puerto Plata', value: 'puerto-plata' },
            { label: 'La Altagracia', value: 'la-altagracia' },
            { label: 'La Romana', value: 'la-romana' },
            { label: 'Samaná', value: 'samana' },
            { label: 'Barahona', value: 'barahona' },
            { label: 'San Pedro de Macorís', value: 'san-pedro-macoris' },
          ],
        },
        {
          name: 'country',
          type: 'text',
          defaultValue: 'Repubblica Dominicana',
          label: 'Paese',
        },
        {
          name: 'coordinates',
          type: 'group',
          label: 'Coordinate GPS',
          fields: [
            {
              name: 'lat',
              type: 'number',
              label: 'Latitudine',
            },
            {
              name: 'lng',
              type: 'number',
              label: 'Longitudine',
            },
          ],
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      label: 'Immagini',
      minRows: 1,
      maxRows: 20,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'alt',
          type: 'text',
          label: 'Testo Alternativo',
        },
      ],
    },
    {
      name: 'features',
      type: 'array',
      label: 'Caratteristiche',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'available',
      label: 'Stato',
      options: [
        {
          label: 'Disponibile',
          value: 'available',
        },
        {
          label: 'Venduto/Affittato',
          value: 'sold',
        },
        {
          label: 'In Trattativa',
          value: 'pending',
        },
        {
          label: 'Ritirato',
          value: 'withdrawn',
        },
      ],
    },
    {
      name: 'agent',
      type: 'relationship',
      relationTo: 'users',
      label: 'Agente Responsabile',
      filterOptions: {
        role: {
          in: ['admin', 'agent'],
        },
      },
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Proprietà in Evidenza',
      defaultValue: false,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data.title) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')
        }
        return data
      },
    ],
  },
}