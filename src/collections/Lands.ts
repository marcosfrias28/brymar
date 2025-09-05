import { CollectionConfig } from 'payload'

export const Lands: CollectionConfig = {
  slug: 'lands',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'area', 'price', 'location.city', 'status'],
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
      name: 'name',
      type: 'text',
      required: true,
      label: 'Nome Terreno',
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      label: 'Descrizione',
    },
    {
      name: 'area',
      type: 'number',
      required: true,
      label: 'Area (m²)',
      min: 1,
    },
    {
      name: 'areaHectares',
      type: 'number',
      label: 'Area (Ettari)',
      admin: {
        description: 'Calcolato automaticamente dall\'area in m²',
        readOnly: true,
      },
    },
    {
      name: 'price',
      type: 'number',
      required: true,
      label: 'Prezzo (USD)',
      min: 0,
    },
    {
      name: 'pricePerSquareMeter',
      type: 'number',
      label: 'Prezzo per m² (USD)',
      admin: {
        description: 'Calcolato automaticamente',
        readOnly: true,
      },
    },
    {
      name: 'landType',
      type: 'select',
      required: true,
      label: 'Tipo Terreno',
      options: [
        { label: 'Residenziale', value: 'residential' },
        { label: 'Commerciale', value: 'commercial' },
        { label: 'Agricolo', value: 'agricultural' },
        { label: 'Industriale', value: 'industrial' },
        { label: 'Turistico', value: 'tourism' },
        { label: 'Misto', value: 'mixed' },
      ],
    },
    {
      name: 'zoning',
      type: 'select',
      label: 'Zonizzazione',
      options: [
        { label: 'Residenziale R1', value: 'r1' },
        { label: 'Residenziale R2', value: 'r2' },
        { label: 'Commerciale C1', value: 'c1' },
        { label: 'Commerciale C2', value: 'c2' },
        { label: 'Industriale I1', value: 'i1' },
        { label: 'Turistico T1', value: 't1' },
        { label: 'Agricolo A1', value: 'a1' },
        { label: 'Misto M1', value: 'm1' },
      ],
    },
    {
      name: 'topography',
      type: 'select',
      label: 'Topografia',
      options: [
        { label: 'Pianeggiante', value: 'flat' },
        { label: 'Leggermente Inclinato', value: 'slightly-sloped' },
        { label: 'Collinare', value: 'hilly' },
        { label: 'Montagnoso', value: 'mountainous' },
      ],
    },
    {
      name: 'utilities',
      type: 'group',
      label: 'Servizi Disponibili',
      fields: [
        {
          name: 'electricity',
          type: 'checkbox',
          label: 'Elettricità',
          defaultValue: false,
        },
        {
          name: 'water',
          type: 'checkbox',
          label: 'Acqua',
          defaultValue: false,
        },
        {
          name: 'sewage',
          type: 'checkbox',
          label: 'Fognature',
          defaultValue: false,
        },
        {
          name: 'internet',
          type: 'checkbox',
          label: 'Internet/Telefono',
          defaultValue: false,
        },
        {
          name: 'gas',
          type: 'checkbox',
          label: 'Gas',
          defaultValue: false,
        },
      ],
    },
    {
      name: 'access',
      type: 'group',
      label: 'Accesso',
      fields: [
        {
          name: 'roadAccess',
          type: 'select',
          label: 'Accesso Stradale',
          options: [
            { label: 'Strada Asfaltata', value: 'paved' },
            { label: 'Strada Sterrata', value: 'dirt' },
            { label: 'Sentiero', value: 'path' },
            { label: 'Nessun Accesso Diretto', value: 'no-direct' },
          ],
        },
        {
          name: 'publicTransport',
          type: 'checkbox',
          label: 'Trasporto Pubblico Vicino',
          defaultValue: false,
        },
      ],
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
            { label: 'Jarabacoa', value: 'jarabacoa' },
            { label: 'Constanza', value: 'constanza' },
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
            { label: 'La Vega', value: 'la-vega' },
          ],
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
      maxRows: 15,
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
        {
          name: 'description',
          type: 'text',
          label: 'Descrizione Immagine',
        },
      ],
    },
    {
      name: 'documents',
      type: 'array',
      label: 'Documenti',
      fields: [
        {
          name: 'document',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          label: 'Tipo Documento',
          options: [
            { label: 'Titolo di Proprietà', value: 'title-deed' },
            { label: 'Certificato Catastale', value: 'cadastral' },
            { label: 'Planimetria', value: 'survey' },
            { label: 'Permessi', value: 'permits' },
            { label: 'Altro', value: 'other' },
          ],
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
          label: 'Venduto',
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
      label: 'Terreno in Evidenza',
      defaultValue: false,
    },
  ],
  hooks: {
    beforeChange: [
      ({ data }) => {
        // Calcola ettari dall'area in m²
        if (data.area) {
          data.areaHectares = data.area / 10000
        }
        
        // Calcola prezzo per m²
        if (data.price && data.area) {
          data.pricePerSquareMeter = data.price / data.area
        }
        
        return data
      },
    ],
  },
}