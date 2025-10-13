---
inclusion: always
---

# DDD Clean Architecture Migration Guidelines

## Contexto del Proyecto

Este proyecto es una plataforma inmobiliaria (Brymar Real Estate) construida con Next.js 15, TypeScript, y PostgreSQL. Actualmente usa una arquitectura en capas tradicional y está planificada una migración gradual hacia Domain-Driven Design (DDD) con Clean Architecture.

## Principios DDD para Aplicar

### 1. Separación de Dominios Identificados

**Bounded Contexts principales:**

- **User Management:** Autenticación, perfiles, roles
- **Property Management:** Propiedades, drafts, media
- **Land Management:** Terrenos y su gestión
- **Content Management:** Blog, páginas, secciones
- **Wizard System:** Sistema unificado de wizards
- **Analytics & Reporting:** Métricas y análisis

### 2. Estructura de Directorios DDD Target

```
src/
├── domain/                 # Domain Layer
│   ├── user/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── repositories/
│   │   └── services/
│   ├── property/
│   ├── land/
│   ├── content/
│   └── shared/
├── application/            # Application Layer
│   ├── use-cases/
│   ├── services/
│   └── dto/
├── infrastructure/         # Infrastructure Layer
│   ├── database/
│   ├── external-services/
│   └── repositories/
└── presentation/           # Presentation Layer
    ├── components/
    ├── pages/
    └── hooks/
```

### 3. Patrones a Implementar

#### **Repository Pattern**

- Abstraer acceso a datos
- Interfaces en domain, implementaciones en infrastructure
- Usar Drizzle ORM como implementación

#### **Use Case Pattern**

- Un use case por acción de negocio
- Input/Output DTOs claramente definidos
- Validación en application layer

#### **Domain Services**

- Lógica de negocio que no pertenece a una entidad específica
- Servicios de dominio puros sin dependencias externas

#### **Value Objects**

- Objetos inmutables para conceptos de dominio
- Validación en construcción
- Ejemplos: Email, Price, Address, Coordinates

### 4. Reglas de Migración

#### **Fase 1: Domain Layer**

```typescript
// Ejemplo de Entity
export class Property {
  private constructor(
    private readonly id: PropertyId,
    private title: PropertyTitle,
    private price: Price,
    private location: Address
  ) {}

  static create(data: CreatePropertyData): Property {
    // Validaciones de dominio
    return new Property(/* ... */);
  }

  updatePrice(newPrice: Price): void {
    // Lógica de negocio para cambio de precio
    this.price = newPrice;
  }
}
```

#### **Fase 2: Application Layer**

```typescript
// Ejemplo de Use Case
export class CreatePropertyUseCase {
  constructor(
    private propertyRepository: PropertyRepository,
    private imageService: ImageService
  ) {}

  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    // 1. Validar input
    // 2. Crear entidad de dominio
    // 3. Aplicar reglas de negocio
    // 4. Persistir via repository
    // 5. Retornar output
  }
}
```

#### **Fase 3: Infrastructure Layer**

```typescript
// Ejemplo de Repository Implementation
export class DrizzlePropertyRepository implements PropertyRepository {
  constructor(private db: Database) {}

  async save(property: Property): Promise<void> {
    // Mapear domain entity a database schema
    // Usar Drizzle para persistir
  }

  async findById(id: PropertyId): Promise<Property | null> {
    // Consultar con Drizzle
    // Mapear database record a domain entity
  }
}
```

### 5. Convenciones de Código

#### **Naming Conventions**

- Entities: PascalCase (Property, User, Land)
- Value Objects: PascalCase con sufijo VO si es necesario
- Use Cases: PascalCase con sufijo UseCase
- Repositories: PascalCase con sufijo Repository
- Services: PascalCase con sufijo Service

#### **File Organization**

- Un archivo por clase/interface
- Barrel exports en index.ts
- Tests junto al código que testean

#### **Dependency Injection**

- Usar interfaces para abstracciones
- Implementar IoC container simple o usar library
- Constructor injection preferido

### 6. Migración de Server Actions

#### **Antes (Actual):**

```typescript
export async function createProperty(formData: FormData) {
  // Validación, lógica de negocio, y persistencia mezcladas
}
```

#### **Después (DDD):**

```typescript
// Server Action como adapter
export async function createProperty(formData: FormData) {
  const input = mapFormDataToInput(formData);
  const useCase = container.get<CreatePropertyUseCase>("CreatePropertyUseCase");
  const result = await useCase.execute(input);
  return mapOutputToResponse(result);
}
```

### 7. Testing Strategy

#### **Domain Layer Tests**

- Unit tests para entities y value objects
- Tests de comportamiento, no de implementación
- Mocks mínimos, objetos reales cuando sea posible

#### **Application Layer Tests**

- Integration tests para use cases
- Mock repositories y external services
- Test happy path y edge cases

#### **Infrastructure Tests**

- Repository tests con base de datos real (test containers)
- External service integration tests
- Performance tests para queries complejas

### 8. Reglas de Implementación

#### **Domain Layer Rules**

- No dependencias externas (solo TypeScript/JavaScript nativo)
- No imports de infrastructure o presentation
- Lógica de negocio pura
- Inmutabilidad preferida

#### **Application Layer Rules**

- Puede depender de domain layer
- Define interfaces para infrastructure
- Coordina use cases
- Maneja transacciones

#### **Infrastructure Layer Rules**

- Implementa interfaces de application/domain
- Maneja persistencia y servicios externos
- Configuración y setup
- Logging y monitoring

#### **Presentation Layer Rules**

- Solo lógica de presentación
- Llama a application layer via use cases
- Maneja input/output del usuario
- Validación de UI (adicional a domain)

### 9. Herramientas y Librerías Recomendadas

#### **Para DDD Implementation**

- **Validation:** Zod (mantener actual)
- **DI Container:** TSyringe o implementación custom
- **Testing:** Jest + Testing Library (mantener actual)
- **Mocking:** MSW para external services

#### **Para Migration**

- **Database:** Mantener Drizzle ORM
- **API Layer:** Mantener Next.js Server Actions como adapters
- **UI:** Mantener estructura actual de componentes

### 10. Checklist de Migración

#### **Por cada Bounded Context:**

- [ ] Identificar entities y value objects
- [ ] Definir repository interfaces
- [ ] Implementar domain services
- [ ] Crear use cases principales
- [ ] Implementar repositories con Drizzle
- [ ] Migrar server actions como adapters
- [ ] Actualizar tests
- [ ] Documentar domain model

#### **Validación de Migración:**

- [ ] Lógica de negocio está en domain layer
- [ ] No hay dependencias circulares
- [ ] Tests cubren casos de uso principales
- [ ] Performance no se degradó
- [ ] API contracts no cambiaron

### 11. Ejemplos de Refactoring

#### **Current Property Creation:**

```typescript
// lib/actions/property-actions.ts - ANTES
export async function createProperty(formData: FormData) {
  const data = parseFormData(formData);
  const validated = PropertySchema.parse(data);

  // Lógica de negocio mezclada
  if (validated.price < 0) throw new Error("Invalid price");

  // Persistencia directa
  const property = await db.insert(properties).values(validated);
  return { success: true, data: property };
}
```

#### **DDD Property Creation:**

```typescript
// domain/property/entities/Property.ts - DESPUÉS
export class Property {
  static create(data: CreatePropertyData): Property {
    const price = Price.create(data.price); // Value object con validación
    const title = PropertyTitle.create(data.title);
    // ... más validaciones de dominio
    return new Property(PropertyId.generate(), title, price /* ... */);
  }
}

// application/use-cases/CreatePropertyUseCase.ts
export class CreatePropertyUseCase {
  async execute(input: CreatePropertyInput): Promise<CreatePropertyOutput> {
    const property = Property.create(input);
    await this.propertyRepository.save(property);
    return CreatePropertyOutput.from(property);
  }
}

// Server Action como adapter
export async function createProperty(formData: FormData) {
  const input = CreatePropertyInput.fromFormData(formData);
  const result = await createPropertyUseCase.execute(input);
  return { success: true, data: result };
}
```

---

**Nota:** Esta migración debe ser gradual, comenzando por un bounded context pequeño como User Management, y luego expandiendo a otros dominios. Mantener la funcionalidad actual mientras se refactoriza incrementalmente.
