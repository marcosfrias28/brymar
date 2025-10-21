# Configuración de Base de Datos

## Variables de Entorno Requeridas

Para que la aplicación funcione correctamente con Vercel Postgres, necesitas configurar las siguientes variables de entorno:

### Variables de Vercel Postgres

```bash
# Conexión pooled (recomendada para la aplicación)
POSTGRES_PRISMA_URL=postgres://user:password@host-pooler.region.aws.neon.tech:5432/database?sslmode=require&pgbouncer=true&connect_timeout=15

# Conexión directa (solo para migraciones)
POSTGRES_URL_NON_POOLING=postgres://user:password@host.region.aws.neon.tech:5432/database?sslmode=require

# Conexión directa (fallback)
POSTGRES_URL=postgres://user:password@host.region.aws.neon.tech:5432/database?sslmode=require
```

### Configuración Actual

La aplicación está configurada para usar:

1. **Para la aplicación principal**: `POSTGRES_PRISMA_URL` (conexión pooled)
2. **Para migraciones**: `POSTGRES_URL_NON_POOLING` (conexión directa)
3. **Fallback**: `POSTGRES_URL` (conexión directa)

## Resolución del Error "invalid_connection_string"

Si ves el error:

```
VercelPostgresError - 'invalid_connection_string': This connection string is meant to be used with a direct connection. Make sure to use a pooled connection string or try `createClient()` instead.
```

### Causa

Este error ocurre cuando intentas usar una cadena de conexión directa (`POSTGRES_URL` o `POSTGRES_URL_NON_POOLING`) para operaciones de la aplicación que requieren conexiones pooled.

### Solución

1. Asegúrate de que `POSTGRES_PRISMA_URL` esté configurada correctamente
2. Verifica que la URL contenga `pgbouncer=true` para indicar que es una conexión pooled
3. Reinicia la aplicación después de actualizar las variables de entorno

## Tipos de Conexión

### Conexión Pooled (Recomendada para Producción)

- **Variable**: `POSTGRES_PRISMA_URL`
- **Uso**: Operaciones de la aplicación, autenticación, consultas normales
- **Características**:
  - Mejor rendimiento
  - Manejo automático de conexiones
  - Incluye `pgbouncer=true`

### Conexión Directa

- **Variables**: `POSTGRES_URL_NON_POOLING`, `POSTGRES_URL`
- **Uso**: Migraciones de base de datos, operaciones administrativas
- **Características**:
  - Conexión directa a la base de datos
  - Requerida para migraciones con Drizzle Kit
  - No incluye `pgbouncer=true`

## Verificación

Para verificar que la configuración es correcta:

1. Revisa los logs de la aplicación para confirmar el tipo de conexión:

   ```
   Using pooled connection: true
   Connection type: pooled
   ```

2. Si ves `Using pooled connection: false`, verifica que `POSTGRES_PRISMA_URL` esté configurada.

## Configuración en Vercel

En el dashboard de Vercel:

1. Ve a tu proyecto → Settings → Environment Variables
2. Asegúrate de que todas las variables estén configuradas:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_URL`
3. Redeploy la aplicación después de actualizar las variables

## Troubleshooting

### Error: "No PostgreSQL connection string found"

- Verifica que al menos una de las variables de conexión esté configurada
- Revisa que no haya espacios extra en las variables de entorno

### Error: "Connection timeout"

- Verifica que la URL incluya `connect_timeout=15`
- Asegúrate de que la región de la base de datos sea correcta

### Error durante migraciones

- Usa `POSTGRES_URL_NON_POOLING` para ejecutar migraciones
- Ejecuta: `npm run db:migrate` o `npx drizzle-kit migrate`
