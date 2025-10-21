# Guía de Reset de Base de Datos

## Cuándo Usar el Reset

Usa el reset de base de datos cuando:

- ✅ Hay conflictos de schema irresolubles (como el error que viste)
- ✅ Quieres empezar con una base de datos completamente limpia
- ✅ Los cambios de schema son demasiado complejos para migrar
- ✅ Estás en desarrollo y no necesitas conservar datos

⚠️ **NUNCA uses esto en producción con datos importantes**

## Opciones Disponibles

### 1. Reset Completo Automático (Recomendado)

```bash
# Setup completo: reset + schema + seed
npm run db:setup

# Con confirmación de seguridad
npm run db:setup:safe
```

Este comando:

1. ✅ Verifica la configuración
2. 🗑️ Limpia la base de datos
3. 📊 Aplica el nuevo schema
4. 🌱 Carga datos iniciales

### 2. Reset Manual (Paso a Paso)

```bash
# Paso 1: Verificar configuración
npm run db:check

# Paso 2: Limpiar base de datos
npm run db:reset --force

# Paso 3: Aplicar schema
npm run db:push

# Paso 4: Cargar datos iniciales (opcional)
npm run db:seed
```

### 3. Solo Verificación

```bash
# Ver qué se haría sin ejecutar
npm run db:reset
```

## Proceso Detallado

### Antes del Reset

1. **Backup de datos importantes** (si los hay):

   ```bash
   # Exportar datos específicos si es necesario
   # (esto es manual, no hay script automático)
   ```

2. **Verificar configuración**:
   ```bash
   npm run db:check
   ```

### Durante el Reset

El script automáticamente:

1. **Verifica variables de entorno**

   - `POSTGRES_URL_NON_POOLING` (preferida)
   - `POSTGRES_URL` (fallback)

2. **Lista todas las tablas existentes**

   ```sql
   SELECT tablename FROM pg_tables WHERE schemaname = 'public'
   ```

3. **Elimina todas las tablas**

   ```sql
   DROP TABLE IF EXISTS "table_name" CASCADE;
   ```

4. **Limpia secuencias**
   ```sql
   DROP SEQUENCE IF EXISTS "sequence_name" CASCADE;
   ```

### Después del Reset

1. **Aplicar nuevo schema**:

   ```bash
   npm run db:push
   ```

2. **Verificar tablas creadas**:

   - `users` - Usuarios y autenticación
   - `sessions` - Sesiones de usuario
   - `accounts` - Cuentas OAuth/password
   - `verification_tokens` - Tokens de verificación
   - `properties` - Propiedades inmobiliarias
   - `lands` - Terrenos
   - `blog_posts` - Posts del blog
   - `wizard_drafts` - Borradores del wizard
   - Y más...

3. **Cargar datos iniciales**:
   ```bash
   npm run db:seed
   ```

## Resolución de Problemas

### Error: "No se encontró POSTGRES_URL"

**Solución**: Configurar variables de entorno

```bash
# En .env
POSTGRES_URL_NON_POOLING=postgres://user:pass@host.region.aws.neon.tech:5432/db?sslmode=require
```

### Error: "Connection timeout"

**Solución**: Verificar conectividad

1. Revisar que la URL sea correcta
2. Verificar que la base de datos esté activa
3. Comprobar permisos de red/firewall

### Error: "Permission denied"

**Solución**: Verificar permisos

1. Confirmar que el usuario tenga permisos de DROP
2. Usar la conexión directa (no pooled)

### Error durante db:push

**Solución**: Schema corrupto

```bash
# Limpiar completamente y reintentar
npm run db:reset --force
npm run db:push
```

## Casos de Uso Específicos

### Desarrollo Local

```bash
# Reset rápido para desarrollo
npm run db:setup
```

### Cambio de Schema Mayor

```bash
# Cuando hay conflictos como el que viste
npm run db:reset --force
npm run db:push
npm run db:seed
```

### Testing

```bash
# Antes de ejecutar tests
npm run db:reset --force
npm run db:push
# No ejecutar seed para tests limpios
```

### Producción (¡CUIDADO!)

```bash
# Solo en casos extremos y con backup
NODE_ENV=production npm run db:reset --force
npm run db:push
# Restaurar datos desde backup
```

## Verificación Post-Reset

### 1. Verificar Tablas

```bash
# Conectar a la base de datos y verificar
npm run db:studio
```

### 2. Probar Autenticación

```bash
# Iniciar la aplicación
npm run dev

# Probar:
# - Sign up de nuevo usuario
# - Sign in
# - Funcionalidad básica
```

### 3. Verificar Datos

```bash
# Si ejecutaste seed, verificar que hay:
# - Propiedades de ejemplo
# - Categorías de blog
# - Datos de prueba
```

## Scripts Disponibles

| Comando                    | Descripción               | Uso                    |
| -------------------------- | ------------------------- | ---------------------- |
| `npm run db:check`         | Verificar configuración   | Siempre antes de reset |
| `npm run db:reset`         | Mostrar qué se haría      | Verificación segura    |
| `npm run db:reset --force` | Limpiar base de datos     | Reset manual           |
| `npm run db:setup`         | Reset completo automático | Recomendado            |
| `npm run db:setup:safe`    | Setup con confirmación    | Más seguro             |
| `npm run db:push`          | Aplicar schema            | Después de reset       |
| `npm run db:seed`          | Cargar datos iniciales    | Opcional               |

## Notas Importantes

- ⚠️ **Siempre hacer backup en producción**
- ✅ **Usar conexión directa para reset**
- 🔄 **El proceso es irreversible**
- 📊 **Verificar schema después del reset**
- 🌱 **Seed es opcional pero recomendado para desarrollo**

## Contacto

Si tienes problemas con el reset:

1. Ejecuta `npm run db:check` y comparte el resultado
2. Verifica que tengas las variables de entorno correctas
3. Asegúrate de usar `--force` para confirmar la operación
