# Troubleshooting: Error de Autenticación con Vercel Postgres

## Error Específico

```
VercelPostgresError - 'invalid_connection_string': This connection string is meant to be used with a direct connection. Make sure to use a pooled connection string or try `createClient()` instead.
```

## Causa del Problema

Este error ocurre cuando Better Auth intenta usar una cadena de conexión directa (`POSTGRES_URL` o `POSTGRES_URL_NON_POOLING`) para operaciones de autenticación que requieren una conexión pooled.

## Solución Implementada

### 1. Configuración de Base de Datos Corregida

**Archivo**: `src/lib/db/drizzle.ts`

```typescript
// Prioridad de conexiones:
// 1. POSTGRES_PRISMA_URL (pooled - recomendada)
// 2. POSTGRES_URL_NON_POOLING (directa - solo migraciones)
// 3. POSTGRES_URL (directa - fallback)
const connectionString =
  process.env.POSTGRES_PRISMA_URL ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.POSTGRES_URL;
```

### 2. Better Auth Configurado Correctamente

**Archivo**: `src/lib/auth/auth.ts`

- Instancia separada de base de datos para autenticación
- Uso de conexión pooled para mejor rendimiento
- Importaciones corregidas de las tablas de schema

### 3. Drizzle Kit para Migraciones

**Archivo**: `drizzle.config.ts`

```typescript
// Usar conexión directa para migraciones
url: process.env.POSTGRES_URL_NON_POOLING || process.env.POSTGRES_URL;
```

## Variables de Entorno Requeridas

### En tu archivo `.env`:

```bash
# Conexión pooled (REQUERIDA para la aplicación)
POSTGRES_PRISMA_URL=postgres://user:password@host-pooler.region.aws.neon.tech:5432/db?sslmode=require&pgbouncer=true&connect_timeout=15

# Conexión directa (REQUERIDA para migraciones)
POSTGRES_URL_NON_POOLING=postgres://user:password@host.region.aws.neon.tech:5432/db?sslmode=require

# Better Auth (REQUERIDAS)
BETTER_AUTH_URL=http://localhost:3000
BETTER_AUTH_SECRET=tu_secret_key_aqui
```

## Verificación de la Configuración

### Ejecutar Script de Verificación

```bash
npm run db:check
```

Este script verificará:

- ✅ Variables de entorno configuradas
- ✅ Formato correcto de URLs de conexión
- ✅ Configuración de Better Auth
- ✅ Recomendaciones de mejora

### Logs de la Aplicación

Cuando inicies la aplicación, deberías ver:

```
Using pooled connection: true
Connection type: pooled
```

Si ves `Using pooled connection: false`, verifica que `POSTGRES_PRISMA_URL` esté configurada.

## Pasos para Resolver el Error

### 1. Verificar Variables de Entorno

```bash
# Ejecutar verificación
npm run db:check

# Si hay problemas, actualizar .env con las URLs correctas
```

### 2. Reiniciar la Aplicación

```bash
# Detener la aplicación (Ctrl+C)
# Reiniciar
npm run dev
```

### 3. Verificar en Vercel (Producción)

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Asegúrate de que estén configuradas:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `BETTER_AUTH_URL`
   - `BETTER_AUTH_SECRET`
4. Redeploy la aplicación

## Diferencias Entre Tipos de Conexión

### Conexión Pooled (`POSTGRES_PRISMA_URL`)

- **Uso**: Aplicación principal, autenticación, consultas
- **Características**:
  - Incluye `pgbouncer=true`
  - Mejor rendimiento
  - Manejo automático de conexiones
- **Ejemplo**: `postgres://user:pass@host-pooler.region.aws.neon.tech:5432/db?sslmode=require&pgbouncer=true&connect_timeout=15`

### Conexión Directa (`POSTGRES_URL_NON_POOLING`)

- **Uso**: Migraciones, operaciones administrativas
- **Características**:
  - No incluye `pgbouncer=true`
  - Conexión directa a la base de datos
  - Requerida para Drizzle Kit
- **Ejemplo**: `postgres://user:pass@host.region.aws.neon.tech:5432/db?sslmode=require`

## Errores Comunes y Soluciones

### Error: "No PostgreSQL connection string found"

**Solución**: Configurar al menos `POSTGRES_PRISMA_URL` o `POSTGRES_URL`

### Error: "Connection timeout"

**Solución**: Agregar `connect_timeout=15` a la URL de conexión

### Error durante sign-in/sign-up

**Solución**: Verificar que `BETTER_AUTH_SECRET` esté configurado y sea único

### Error en migraciones

**Solución**: Usar `POSTGRES_URL_NON_POOLING` para ejecutar migraciones

## Contacto

Si el problema persiste después de seguir estos pasos:

1. Ejecuta `npm run db:check` y comparte el resultado
2. Verifica los logs de la aplicación para errores adicionales
3. Asegúrate de que todas las variables de entorno estén configuradas correctamente
