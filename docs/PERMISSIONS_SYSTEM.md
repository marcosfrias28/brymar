# Sistema di Gestione dei Permessi

Questo documento descrive il sistema di gestione dei permessi implementato per l'applicazione Brymar Inmobiliaria.

## Architettura del Sistema

Il sistema di permessi è composto da diversi livelli:

1. **Middleware di Autenticazione** (`middleware.ts`)
2. **Utilità di Permessi** (`lib/auth/permissions.ts`)
3. **Hook React** (`hooks/use-permissions.ts`)
4. **Componenti di Protezione** (`components/auth/route-guard.tsx`)

## Ruoli Utente

Il sistema supporta tre ruoli principali:

### Admin
- Accesso completo a tutte le funzionalità
- Può gestire utenti, proprietà, terreni, blog e impostazioni
- Accesso al dashboard completo

### Agent (Agente)
- Accesso limitato alle funzionalità operative
- Può gestire proprietà e terreni
- Accesso alle impostazioni personali
- **Non può** gestire blog o altri utenti

### User (Utente)
- Accesso solo alle aree pubbliche
- **Non può** accedere al dashboard
- Limitato alla visualizzazione del contenuto pubblico

## Permessi Dettagliati

| Permesso | Admin | Agent | User |
|----------|-------|-------|------|
| `canAccessDashboard` | ✅ | ✅ | ❌ |
| `canManageProperties` | ✅ | ✅ | ❌ |
| `canManageLands` | ✅ | ✅ | ❌ |
| `canManageBlog` | ✅ | ❌ | ❌ |
| `canManageUsers` | ✅ | ❌ | ❌ |
| `canViewSettings` | ✅ | ✅ | ❌ |

## Route Protette

Le seguenti route sono protette dal middleware:

- `/dashboard` - Richiede `canAccessDashboard`
- `/dashboard/properties` - Richiede `canManageProperties`
- `/dashboard/lands` - Richiede `canManageLands`
- `/dashboard/blog` - Richiede `canManageBlog`
- `/dashboard/settings` - Richiede `canViewSettings`

## Route Pubbliche

Le seguenti route sono accessibili senza autenticazione:

- `/` (Homepage)
- `/sign-in`
- `/sign-up`
- `/forgot-password`
- `/verify-email`
- `/api/auth/*`
- `/properties`
- `/lands`
- `/blog`
- `/about`
- `/contact`
- `/search`
- `/robots.txt`

## Utilizzo del Sistema

### 1. Middleware Automatico

Il middleware si attiva automaticamente su tutte le route non pubbliche e:

- Verifica la presenza di una sessione valida
- Controlla che l'utente abbia un ruolo valido
- Verifica i permessi per la route specifica
- Reindirizza a `/sign-in` se l'accesso è negato

### 2. Hook usePermissions

```tsx
import { usePermissions } from '@/hooks/use-permissions';

function MyComponent() {
  const { 
    canManageProperties, 
    hasPermission, 
    hasRoutePermission 
  } = usePermissions();

  if (canManageProperties) {
    return <PropertyManager />;
  }

  return <AccessDenied />;
}
```

### 3. Componenti di Protezione

#### RouteGuard

```tsx
import { RouteGuard } from '@/components/auth/route-guard';

function ProtectedPage() {
  return (
    <RouteGuard requiredPermission="canManageProperties">
      <PropertyManagement />
    </RouteGuard>
  );
}
```

#### PermissionGate

```tsx
import { PermissionGate } from '@/components/auth/route-guard';

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <PermissionGate permission="canManageBlog">
        <BlogManagement />
      </PermissionGate>
    </div>
  );
}
```

#### RoleGate

```tsx
import { RoleGate } from '@/components/auth/route-guard';

function AdminPanel() {
  return (
    <RoleGate allowedRoles={['admin']}>
      <AdminControls />
    </RoleGate>
  );
}
```

## Sicurezza

### Principi di Sicurezza Implementati

1. **Deny by Default**: Tutti gli accessi sono negati di default
2. **Least Privilege**: Ogni ruolo ha solo i permessi minimi necessari
3. **Defense in Depth**: Controlli sia lato server (middleware) che client (componenti)
4. **Session Validation**: Verifica continua della validità della sessione
5. **Role Validation**: Controllo della validità del ruolo utente

### Gestione degli Errori

- **Sessione Invalida**: Reindirizzamento automatico al login
- **Ruolo Invalido**: Trattato come utente non autenticato
- **Permessi Insufficienti**: Reindirizzamento al login con messaggio di errore
- **Errori di Autenticazione**: Log degli errori e fallback sicuro

## Estensibilità

### Aggiungere Nuovi Ruoli

1. Aggiornare il tipo `UserRole` in `lib/auth/permissions.ts`
2. Aggiungere la configurazione dei permessi in `ROLE_PERMISSIONS`
3. Aggiornare il database schema se necessario

### Aggiungere Nuovi Permessi

1. Aggiornare l'interfaccia `RolePermissions`
2. Configurare i permessi per ogni ruolo esistente
3. Aggiungere le route protette in `PROTECTED_ROUTES` se necessario

### Aggiungere Nuove Route Protette

1. Aggiungere la route e il permesso richiesto in `PROTECTED_ROUTES`
2. Il middleware applicherà automaticamente la protezione

## Testing

### Scenari di Test Raccomandati

1. **Accesso Non Autenticato**
   - Tentativo di accesso a route protette
   - Reindirizzamento corretto al login

2. **Ruoli e Permessi**
   - Verifica accesso per ogni ruolo
   - Test dei permessi specifici
   - Verifica negazione accessi non autorizzati

3. **Sessioni**
   - Comportamento con sessioni scadute
   - Gestione di sessioni invalide

4. **Edge Cases**
   - Utenti senza ruolo
   - Ruoli non validi
   - Errori di rete durante la verifica

## Monitoraggio

### Log di Sicurezza

In ambiente di sviluppo, il middleware aggiunge header di debug:

- `X-Middleware-Reason`: Motivo del rifiuto dell'accesso
- `X-User-ID`: ID dell'utente autenticato
- `X-User-Role`: Ruolo dell'utente

### Metriche Consigliate

- Tentativi di accesso non autorizzato
- Frequenza di utilizzo per ruolo
- Errori di autenticazione
- Performance del middleware

## Manutenzione

### Aggiornamenti Regolari

1. Revisione periodica dei permessi
2. Audit dei log di sicurezza
3. Test di penetrazione
4. Aggiornamento delle dipendenze di sicurezza

### Best Practices

1. Non hardcodare mai i permessi nei componenti
2. Utilizzare sempre gli hook e i componenti forniti
3. Testare tutti i percorsi di accesso
4. Mantenere la documentazione aggiornata
5. Implementare logging appropriato per audit