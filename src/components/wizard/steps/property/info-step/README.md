# Info Step Components

Esta carpeta contiene los componentes y utilidades para el paso de información básica del wizard de propiedades.

## Estructura

```
info-step/
├── README.md                      # Este archivo
├── constants.ts                   # Constantes de tipos de propiedad y características
├── use-info-handlers.ts          # Hook personalizado para manejar características
├── basic-info-fields.tsx         # Campos de título, descripción, precio y superficie
├── property-type-selector.tsx    # Selector de tipo de propiedad
├── bedroom-bathroom-fields.tsx   # Campos de dormitorios y baños (condicionales)
└── characteristics-selector.tsx  # Selector de características adicionales
```

## Componentes

### BasicInfoFields
Renderiza los campos básicos del formulario:
- Título de la propiedad
- Descripción
- Precio
- Superficie

### PropertyTypeSelector
Botones para seleccionar el tipo de propiedad (apartamento, casa, comercial, terreno, otro).

### BedroomBathroomFields
Campos numéricos para dormitorios y baños. Solo se muestra si el tipo de propiedad es "apartment" o "house".

### CharacteristicsSelector
Dropdown y badges para seleccionar y mostrar características adicionales de la propiedad (piscina, garaje, etc.).

## Hooks

### useInfoHandlers
Hook que proporciona funciones para agregar y eliminar características del formulario.

**Retorna:**
- `addCharacteristic(characteristic: string)`: Agrega una característica
- `removeCharacteristic(characteristic: string)`: Elimina una característica

## Uso

```tsx
import { PropertyInfoStep } from "./info-step";

<PropertyInfoStep data={wizardData} onChange={handleChange} />
```
