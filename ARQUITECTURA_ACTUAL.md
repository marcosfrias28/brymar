# Resumen de Arquitectura Actual - Brymar Real Estate Platform

## Información General del Proyecto

**Tecnologías Principales:**

- **Framework:** Next.js 15.1.4 con App Router
- **Runtime:** React 19.0.0
- **Lenguaje:** TypeScript 5.7.3
- **Base de Datos:** PostgreSQL con Drizzle ORM
- **Autenticación:** Better Auth
- **UI:** Radix UI + Tailwind CSS + Shadcn/ui
- **Estado:** Zustand (mínimo uso)
- **Validación:** Zod
- **Testing:** Jest + Playwright
- **Deployment:** Vercel

## Estructura de Directorios Actual

```
brymar/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Rutas de autenticación
│   ├── (dashboard)/       # Panel administrativo
│   ├── actions/           # Server Actions específicas de páginas
│   ├── admin/             # Administración
│   ├── api/               # API Routes
│   ├── properties/        # Páginas de propiedades
│   └── search/            # Búsqueda
├── components/            # Componentes React
│   ├── admin/             # Componentes administrativos
│   ├── auth/              # Componentes de autenticación
│   ├── wizard/            # Sistema de wizards
│   ├── ui/                # Componentes base (Shadcn)
│   └── shared/            # Componentes compartidos
├── lib/                   # Lógica de negocio y utilidades
│   ├── actions/           # Server Actions centralizadas
│   ├── auth/              # Configuración de autenticación
│   ├── db/                # Esquemas y configuración de BD
│   ├── schemas/           # Esquemas de validación Zod
│   ├── services/          # Servicios de negocio
│   └── utils/             # Utilidades
├── hooks/                 # Custom React Hooks
├── middleware.ts          # Middleware de autenticación
└── types/                 # Definiciones de tipos TypeScript
```

## Arquitectura Actual: Análisis Detallado

### 1. **Patrón Arquitectónico Actual: Layered Architecture (Capas)**

La aplicación sigue una arquitectura en capas típica de Next.js:

**Capa de Presentación (UI Layer):**

- Componentes React en `/components`
- Páginas en `/app` con App Router
- Hooks personalizados en `/hooks`

**Capa de Lógica de Negocio (Business Logic Layer):**

- Server Actions en `/lib/actions` y `/app/actions`
- Servicios en `/lib/services`
- Validaciones en `/lib/schemas`

**Capa de Datos (Data Layer):**

- Esquemas Drizzle en `/lib/db/schema.ts`
- Configuración de base de datos
- Migraciones

### 2. **Dominio de Negocio Identificado**

**Dominios Principales:**

1. **Autenticación y Usuarios** (`users`, `session`, `accounts`)
2. **Propiedades** (`properties`, `propertyDrafts`, `propertyImages`)
3. **Terrenos** (`lands`, `landDrafts`)
4. **Blog** (`blogPosts`, `blogDrafts`)
5. **Wizards Unificados** (`wizardDrafts`, `wizardMedia`)
6. **Administración de Contenido** (`pageSections`, `contactInfo`)
7. **Favoritos y Interacciones** (`userFavorites`, `reviews`)

### 3. **Problemas Arquitectónicos Identificados**

#### **Acoplamiento Alto:**

- Server Actions mezcladas entre `/lib/actions` y `/app/actions`
- Lógica de negocio dispersa en componentes
- Dependencias directas entre capas

#### **Responsabilidades Mezcladas:**

- Componentes con lógica de negocio
- Server Actions con validación, lógica y persistencia
- Servicios con responsabilidades múltiples

#### **Falta de Separación de Dominios:**

- Esquema de BD monolítico en un solo archivo
- Lógica de diferentes dominios mezclada
- No hay boundaries claros entre contextos

#### **Testing y Mantenibilidad:**

- Tests dispersos sin estructura clara
- Dificultad para testear lógica de negocio aislada
- Dependencias difíciles de mockear

### 4. **Fortalezas de la Arquitectura Actual**

#### **Tecnologías Modernas:**

- Next.js 15 con App Router
- TypeScript para type safety
- Drizzle ORM con type inference
- Validación con Zod

#### **Sistema de Wizards Avanzado:**

- Wizard unificado para diferentes entidades
- Manejo de drafts y media
- Analytics y tracking

#### **Autenticación Robusta:**

- Better Auth con múltiples providers
- Middleware de seguridad avanzado
- Manejo de roles y permisos

#### **UI/UX Consistente:**

- Design system con Shadcn/ui
- Componentes reutilizables
- Accesibilidad considerada

### 5. **Entidades y Agregados Identificados**

#### **User Aggregate:**

- `User` (root)
- `Session`
- `Account`
- `UserFavorites`

#### **Property Aggregate:**

- `Property` (root)
- `PropertyDraft`
- `PropertyImage`
- `PropertyVideo`
- `PropertyCharacteristic`

#### **Land Aggregate:**

- `Land` (root)
- `LandDraft`

#### **Blog Aggregate:**

- `BlogPost` (root)
- `BlogDraft`

#### **Wizard Aggregate:**

- `WizardDraft` (root)
- `WizardMedia`
- `WizardAnalytic`

### 6. **Servicios de Dominio Identificados**

- **AI Generation Service:** Generación de contenido con IA
- **Image Upload Service:** Manejo de media
- **Map Service:** Servicios de geolocalización
- **Analytics Service:** Tracking de wizards
- **Template Service:** Plantillas de contenido

### 7. **Casos de Uso Principales**

#### **Gestión de Propiedades:**

- Crear propiedad via wizard
- Editar propiedad existente
- Buscar y filtrar propiedades
- Gestionar media de propiedades

#### **Gestión de Usuarios:**

- Registro y autenticación
- Gestión de perfil
- Sistema de favoritos
- Roles y permisos

#### **Sistema de Wizards:**

- Crear drafts
- Navegar entre pasos
- Generar contenido con IA
- Publicar contenido final

#### **Administración:**

- Gestión de contenido
- Analytics y reportes
- Configuración del sistema

### 8. **Infraestructura y Servicios Externos**

- **Base de Datos:** PostgreSQL (Neon/Vercel)
- **Storage:** Vercel Blob para imágenes
- **AI:** HuggingFace API
- **Email:** Resend
- **Analytics:** Vercel Analytics
- **Deployment:** Vercel

## Preparación para Migración a DDD

### **Beneficios Esperados de DDD:**

1. **Separación Clara de Dominios**
2. **Lógica de Negocio Centralizada**
3. **Mejor Testabilidad**
4. **Escalabilidad Mejorada**
5. **Mantenimiento Simplificado**

### **Desafíos de la Migración:**

1. **Refactoring Gradual Necesario**
2. **Reestructuración de Base de Datos**
3. **Migración de Server Actions**
4. **Actualización de Tests**
5. **Formación del Equipo en DDD**

### **Estrategia de Migración Recomendada:**

1. **Fase 1:** Identificar y separar dominios
2. **Fase 2:** Crear domain models y repositories
3. **Fase 3:** Implementar use cases
4. **Fase 4:** Refactorizar infrastructure layer
5. **Fase 5:** Migrar tests y documentación

---

_Documento generado el: ${new Date().toLocaleDateString('es-ES')}_
_Versión del proyecto analizada: Next.js 15.1.4_
