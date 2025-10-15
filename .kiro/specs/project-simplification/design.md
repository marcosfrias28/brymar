# Design Document

## Overview

Il progetto attuale ha una complessità eccessiva con oltre 500 file, multiple configurazioni di test, layer di astrazione DDD non necessari e inconsistenze tra schemi database e modelli di dominio. Il design proposto elimina drasticamente questa complessità mantenendo solo l'essenziale per il funzionamento.

## Architecture

### Architettura Target Semplificata

```
src/
├── app/                    # Next.js App Router (mantiene)
├── components/             # Componenti UI (semplificati)
├── lib/
│   ├── db/
│   │   ├── schema.ts      # Unica fonte di verità per i dati
│   │   └── index.ts       # Database connection
│   ├── actions/           # Server Actions (logica diretta)
│   ├── auth/              # Autenticazione (semplificata)
│   └── utils.ts           # Utilities essenziali
├── hooks/                 # Custom hooks (solo essenziali)
├── types/                 # Types derivati da schema Drizzle
└── styles/                # CSS globali
```

### Eliminazione di Layer Non Necessari

- **Domain Layer**: Eliminato completamente - gli schemi Drizzle sono l'unica fonte di verità
- **Application Layer**: Eliminato - logica direttamente nelle Server Actions
- **Infrastructure Layer**: Eliminato - accesso diretto al database via Drizzle
- **Repository Pattern**: Eliminato - query dirette con Drizzle
- **Use Cases**: Eliminati - logica nelle Server Actions
- **DTOs**: Eliminati - uso diretto dei tipi Drizzle

## Components and Interfaces

### Struttura Componenti Semplificata

```
components/
├── ui/                    # Componenti base (Radix UI)
├── forms/                 # Form components
│   ├── property-form.tsx
│   ├── land-form.tsx
│   └── blog-form.tsx
├── lists/                 # List components
│   ├── property-list.tsx
│   ├── land-list.tsx
│   └── blog-list.tsx
├── layout/                # Layout components
│   ├── header.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
└── wizard/                # Wizard semplificato
    ├── wizard-container.tsx
    ├── wizard-steps.tsx
    └── wizard-navigation.tsx
```

### Accorpamento Componenti

- **Property Components**: Da 15+ file a 3 file essenziali
- **Land Components**: Da 10+ file a 3 file essenziali
- **Blog Components**: Da 8+ file a 3 file essenziali
- **Wizard Components**: Da 50+ file a 5 file essenziali
- **Dashboard Components**: Da 12+ file a 4 file essenziali

## Data Models

### Schema Drizzle Come Unica Fonte di Verità

```typescript
// lib/db/schema.ts - Mantiene struttura attuale
export const properties = pgTable("properties", { ... });
export const lands = pgTable("lands", { ... });
export const blogPosts = pgTable("blog_posts", { ... });

// Types derivati direttamente da schema
export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
```

### Eliminazione di Modelli Duplicati

- **Domain Entities**: Eliminati - uso diretto tipi Drizzle
- **Value Objects**: Eliminati - validazione con Zod
- **Aggregates**: Eliminati - relazioni gestite da Drizzle
- **Domain Services**: Eliminati - logica nelle Server Actions

### Validazione Semplificata

```typescript
// lib/validations.ts
import { z } from "zod";

export const PropertySchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  // ... altri campi
});

export const LandSchema = z.object({
  name: z.string().min(1),
  area: z.number().positive(),
  // ... altri campi
});
```

## Error Handling

### Sistema di Error Handling Semplificato

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export const handleError = (error: unknown) => {
  if (error instanceof AppError) {
    return { error: error.message, code: error.code };
  }
  return { error: "Errore interno del server", code: "INTERNAL_ERROR" };
};
```

### Server Actions con Error Handling Diretto

```typescript
// lib/actions/property-actions.ts
export async function createProperty(formData: FormData) {
  try {
    const data = PropertySchema.parse(Object.fromEntries(formData));
    const property = await db.insert(properties).values(data).returning();
    return { success: true, data: property[0] };
  } catch (error) {
    return handleError(error);
  }
}
```

## Testing Strategy

### Test Minimi Essenziali

- **Eliminazione Completa**: Tutti i file di test esistenti (200+ file)
- **Test Essenziali**: Solo 5-10 test critici per funzionalità core
- **Test Strategy**: Focus su integration test end-to-end

```
src/
└── __tests__/
    ├── auth.test.ts           # Test autenticazione
    ├── property-crud.test.ts  # Test CRUD proprietà
    ├── land-crud.test.ts      # Test CRUD terreni
    ├── blog-crud.test.ts      # Test CRUD blog
    └── wizard.test.ts         # Test wizard flow
```

### Configurazioni Test Semplificate

- **Jest Configs**: Da 6 file a 1 file
- **Playwright Config**: Mantenuto ma semplificato
- **Test Scripts**: Da 20+ script a 3 script essenziali

## File Cleanup Plan

### File da Eliminare (Stima: 300+ file)

#### Test Files (200+ file)

- `src/components/__tests__/` (tutti i file)
- `src/hooks/__tests__/` (tutti i file)
- `src/lib/__tests__/` (tutti i file)
- `src/infrastructure/__tests__/` (tutti i file)
- `src/tests/e2e/` (maggior parte dei file)
- `coverage/` (intera directory)

#### DDD Architecture Files (50+ file)

- `src/domain/` (intera directory)
- `src/application/` (intera directory)
- `src/infrastructure/` (intera directory)
- `src/presentation/` (intera directory)

#### Duplicate/Unused Components (30+ file)

- Componenti wizard granulari non utilizzati
- Componenti dashboard duplicati
- Componenti shared non referenziati
- Componenti di layout ridondanti

#### Configuration Files (10+ file)

- `jest.*.config.js` (mantenere solo jest.config.js)
- Script di test specializzati
- File di configurazione DDD

#### Documentation Files (10+ file)

- File README multipli
- Documentazione DDD
- Guide di migrazione obsolete

### File da Mantenere (Stima: 150 file)

#### Core Application

- `src/app/` (Next.js routes)
- `src/lib/db/schema.ts` (unica fonte di verità)
- `src/lib/actions/` (Server Actions semplificate)
- `src/lib/auth/` (autenticazione essenziale)

#### Essential Components

- `src/components/ui/` (Radix UI components)
- Componenti form essenziali
- Componenti layout base
- Wizard semplificato

#### Configuration

- `package.json`
- `next.config.ts`
- `tailwind.config.ts`
- `drizzle.config.ts`

## Migration Strategy

### Fase 1: Backup e Analisi

1. Backup completo del progetto
2. Analisi dipendenze per identificare file critici
3. Test funzionalità esistenti

### Fase 2: Eliminazione Graduale

1. Eliminare file di test non critici
2. Rimuovere layer DDD (domain, application, infrastructure)
3. Consolidare componenti duplicati
4. Semplificare configurazioni

### Fase 3: Refactoring

1. Migrare logica da use cases a Server Actions
2. Sostituire repository pattern con query Drizzle dirette
3. Unificare validazioni con Zod
4. Semplificare error handling

### Fase 4: Validazione

1. Test funzionalità core
2. Verifica performance
3. Test deployment
4. Documentazione essenziale

## Performance Considerations

### Benefici Attesi

- **Bundle Size**: Riduzione del 40-50%
- **Build Time**: Riduzione del 30-40%
- **Development Experience**: Miglioramento significativo
- **Maintenance**: Drastica semplificazione

### Metriche Target

- **File Count**: Da 500+ a 150 file
- **Test Files**: Da 200+ a 5-10 file
- **Configuration Files**: Da 15+ a 5 file
- **Component Files**: Da 100+ a 30-40 file

## Risk Mitigation

### Rischi Identificati

1. **Perdita di Funzionalità**: Mitigato con test pre/post migrazione
2. **Regressioni**: Mitigato con backup completo
3. **Dipendenze Rotte**: Mitigato con analisi graduale
4. **Performance Issues**: Mitigato con monitoring

### Rollback Plan

- Backup completo pre-migrazione
- Git branches per ogni fase
- Possibilità di rollback immediato
- Test automatici per validazione

## Success Criteria

### Criteri di Successo

1. **Funzionalità**: Tutte le funzionalità core operative
2. **Performance**: Nessuna degradazione significativa
3. **Maintainability**: Codice più semplice e comprensibile
4. **File Count**: Riduzione di almeno 50% dei file
5. **Build Time**: Miglioramento dei tempi di build
6. **Developer Experience**: Navigazione e comprensione più facile
