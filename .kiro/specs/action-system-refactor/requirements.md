# Requirements Document

## Introduction

El sistema actual de acciones del servidor presenta repetición significativa de código con múltiples tipos de estado de acción (SignInActionState, SignUpActionState, VerifyEmailActionState, etc.) que son esencialmente variaciones del mismo patrón base. Además, existen dos funciones de validación separadas (validatedAction y validatedActionWithUser) que duplican lógica similar. Esta refactorización busca crear un sistema genérico y reutilizable que elimine la duplicación de código y mejore la mantenibilidad.

## Requirements

### Requirement 1

**User Story:** Como desarrollador, quiero un sistema de tipos de estado de acción genérico, para que no tenga que crear tipos específicos para cada acción del servidor.

#### Acceptance Criteria

1. WHEN se define un tipo ActionState genérico THEN el sistema SHALL permitir especificar el tipo de datos específico como parámetro genérico
2. WHEN se necesite un estado de acción específico THEN el sistema SHALL permitir usar ActionState<T> donde T es el tipo de datos específico
3. WHEN se migre el código existente THEN el sistema SHALL mantener compatibilidad con los tipos actuales durante la transición
4. WHEN se use el tipo genérico THEN el sistema SHALL incluir propiedades comunes como success, error, message, data, redirect y url

### Requirement 2

**User Story:** Como desarrollador, quiero una función unificada de validación de acciones, para que no tenga que mantener dos funciones separadas para casos con y sin usuario.

#### Acceptance Criteria

1. WHEN se cree una acción validada THEN el sistema SHALL permitir especificar si requiere autenticación de usuario mediante opciones
2. WHEN se valide una acción sin usuario THEN el sistema SHALL ejecutar la validación de esquema y llamar la función de acción sin parámetro de usuario
3. WHEN se valide una acción con usuario THEN el sistema SHALL obtener el usuario autenticado y pasarlo como parámetro a la función de acción
4. WHEN falle la autenticación en acciones que requieren usuario THEN el sistema SHALL retornar un error apropiado
5. WHEN falle la validación del esquema THEN el sistema SHALL retornar el primer error de validación en formato consistente

### Requirement 3

**User Story:** Como desarrollador, quiero un sistema centralizado de manejo de errores de API, para que no tenga que repetir la lógica de manejo de errores en cada acción.

#### Acceptance Criteria

1. WHEN ocurra un error de API THEN el sistema SHALL extraer el mensaje de error del cuerpo de la respuesta si está disponible
2. WHEN no haya mensaje específico en el error THEN el sistema SHALL usar un mensaje de fallback proporcionado
3. WHEN se maneje un error THEN el sistema SHALL retornar un objeto con success: false y el mensaje de error apropiado
4. WHEN se use el manejador de errores THEN el sistema SHALL ser compatible con el tipo BetterCallAPIError existente

### Requirement 4

**User Story:** Como desarrollador, quiero migrar las acciones existentes al nuevo sistema, para que se beneficien de la reducción de duplicación de código.

#### Acceptance Criteria

1. WHEN se migre una acción existente THEN el sistema SHALL mantener la misma funcionalidad y comportamiento
2. WHEN se actualice una acción THEN el sistema SHALL usar el nuevo tipo ActionState genérico
3. WHEN se actualice una acción THEN el sistema SHALL usar la función unificada de validación
4. WHEN se actualice una acción THEN el sistema SHALL usar el manejador centralizado de errores
5. WHEN se complete la migración THEN el sistema SHALL permitir eliminar los tipos y funciones duplicadas obsoletas

### Requirement 5

**User Story:** Como desarrollador, quiero que el nuevo sistema sea type-safe, para que mantenga las garantías de tipos de TypeScript del sistema actual.

#### Acceptance Criteria

1. WHEN se use ActionState<T> THEN el sistema SHALL inferir correctamente el tipo T en tiempo de compilación
2. WHEN se use createValidatedAction THEN el sistema SHALL validar que los tipos de entrada y salida sean consistentes
3. WHEN se pase un esquema de validación THEN el sistema SHALL asegurar que los datos validados coincidan con el tipo esperado
4. WHEN se especifique withUser: true THEN el sistema SHALL requerir que la función de acción acepte un parámetro User
5. WHEN se compile el código THEN el sistema SHALL no introducir errores de tipos nuevos

### Requirement 6

**User Story:** Como desarrollador, quiero documentación clara del nuevo sistema, para que pueda adoptarlo fácilmente en futuras acciones.

#### Acceptance Criteria

1. WHEN se implemente el nuevo sistema THEN el sistema SHALL incluir ejemplos de uso para casos comunes
2. WHEN se documente el sistema THEN el sistema SHALL explicar cómo migrar acciones existentes
3. WHEN se proporcione documentación THEN el sistema SHALL incluir patrones recomendados para diferentes tipos de acciones
4. WHEN se documente THEN el sistema SHALL explicar las opciones disponibles para createValidatedAction