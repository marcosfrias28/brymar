# Wizard Framework - Clean Architecture

This directory contains the unified wizard framework that provides a comprehensive, type-safe, and maintainable solution for multi-step form workflows. The framework follows clean architecture principles and eliminates all previous code duplication.

## 🏗️ Architecture Overview

The wizard framework is organized using domain-driven design with clear separation of concerns:

```
components/wizard/
├── core/           # Framework foundation (domain-agnostic)
├── property/       # Property-specific wizard implementation
├── land/          # Land-specific wizard implementation
├── blog/          # Blog-specific wizard implementation
├── shared/        # Reusable components across wizard types
└── __tests__/     # Comprehensive test suite
```

### Core Principles

1. **Single Responsibility**: Each component has one clear purpose
2. **Composition over Inheritance**: Build complex wizards by composing simple parts
3. **Type Safety**: Full TypeScript support with generics
4. **Performance**: Lazy loading, memoization, and efficient state management
5. **Accessibility**: WCAG 2.1 AA compliance with keyboard navigation
6. **Mobile-First**: Responsive design with touch-optimized interactions

## 🚀 Quick Start

### Basic Usage

```tsx
import { PropertyWizard } from "@/components/wizard";

function CreatePropertyPage() {
  return (
    <PropertyWizard
      onComplete={async (data) => {
        // Handle successful completion
        const result = await createProperty(data);
        router.push(`/properties/${result.id}`);
      }}
      onSaveDraft={async (data, step) => {
        // Handle draft saving
        const draftId = await saveDraft(data, step);
        return draftId;
      }}
      onCancel={() => {
        // Handle cancellation
        router.back();
      }}
    />
  );
}
```

### Advanced Usage with Custom Configuration

```tsx
import { Wizard, useWizard } from "@/components/wizard/core";
import { customWizardConfig } from "./config";

function CustomWizard() {
  const wizard = useWizard({
    config: customWizardConfig,
    initialData: { title: "Draft Title" },
    onComplete: handleComplete,
    onSaveDraft: handleSaveDraft,
  });

  return (
    <Wizard
      config={customWizardConfig}
      showProgress={true}
      showStepNumbers={true}
      enableKeyboardNavigation={true}
      enableMobileOptimizations={true}
    />
  );
}
```

## 📋 Available Wizards

### Property Wizard

Complete property listing creation with:

- General information (price, type, bedrooms, etc.)
- Location selection with interactive map
- Media upload with image optimization
- Preview and publishing

```tsx
import { PropertyWizard } from "@/components/wizard";
```

### Land Wizard

Land listing creation with:

- Land details (size, type, zoning)
- Location and terrain information
- Development potential assessment
- Media and documentation

```tsx
import { LandWizard } from "@/components/wizard";
```

### Blog Wizard

Blog post creation with:

- Rich text content editing
- SEO optimization tools
- Media management
- Publishing workflow

```tsx
import { BlogWizard } from "@/components/wizard";
```

## 🔧 Core Components

### Wizard Shell

The main orchestrator component that manages the entire wizard flow:

```tsx
<Wizard<PropertyWizardData>
  config={propertyWizardConfig}
  initialData={initialData}
  onComplete={handleComplete}
  showProgress={true}
  enableKeyboardNavigation={true}
/>
```

### useWizard Hook

The central hook that replaces all previous wizard hooks:

```tsx
const wizard = useWizard({
  config: wizardConfig,
  initialData: {},
  onComplete: async (data) => {
    /* ... */
  },
  onSaveDraft: async (data, step) => {
    /* ... */
  },
});

// Access wizard state and methods
const {
  data,
  updateData,
  currentStep,
  nextStep,
  previousStep,
  canGoNext,
  canComplete,
  saveDraft,
  complete,
  isLoading,
  errors,
} = wizard;
```

## 🎨 Shared Components

### Image Upload

Reusable image upload with optimization:

```tsx
import { ImageUploadStep } from "@/components/wizard/shared";

<ImageUploadStep
  images={data.images}
  onImagesChange={(images) => updateData({ images })}
  maxImages={10}
  acceptedTypes={["image/jpeg", "image/png", "image/webp"]}
/>;
```

### Location Picker

Interactive map-based location selection:

```tsx
import { LocationPickerStep } from "@/components/wizard/shared";

<LocationPickerStep
  coordinates={data.coordinates}
  address={data.address}
  onLocationChange={(location) => updateData(location)}
  showMap={true}
  enableGeolocation={true}
/>;
```

## 🔍 Type Safety

The framework is fully type-safe with TypeScript generics:

```tsx
// Define your wizard data type
interface CustomWizardData extends WizardData {
  customField: string;
  optionalField?: number;
}

// Use with full type safety
const wizard = useWizard<CustomWizardData>({
  config: customConfig,
  initialData: { title: "", description: "", customField: "" },
  onComplete: async (data: CustomWizardData) => {
    // data is fully typed
    console.log(data.customField); // ✅ Type-safe
  },
});
```

## 💾 Persistence & Auto-Save

### Auto-Save Configuration

```tsx
const wizardConfig: WizardConfig<PropertyWizardData> = {
  // ... other config
  persistence: {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    storageKey: "property-wizard",
  },
};
```

### Manual Draft Management

```tsx
// Save draft manually
const draftId = await wizard.saveDraft();

// Load existing draft
const loaded = await wizard.loadDraft(draftId);

// Delete draft
await wizard.deleteDraft(draftId);
```

## 🧪 Testing

The framework includes comprehensive testing:

```bash
# Run wizard tests
pnpm test:wizard

# Run with coverage
pnpm test:wizard --coverage

# Run specific test suites
pnpm test components/wizard/core
pnpm test components/wizard/property
```

### Test Categories

- **Unit Tests**: Individual component and hook testing
- **Integration Tests**: Complete wizard workflow testing
- **Performance Tests**: Load time and interaction benchmarks
- **Accessibility Tests**: Keyboard navigation and screen reader support
- **Visual Regression Tests**: UI consistency across updates

## 🚀 Performance Features

### Lazy Loading

Steps are loaded on demand to reduce initial bundle size:

```tsx
const LazyStep = createLazyStep(() => import("./CustomStep"));
```

### Memoization

Components are optimized with React.memo and useMemo:

```tsx
const MemoizedStep = withLazyLoading(CustomStep);
```

### Bundle Splitting

Each wizard type is in a separate chunk for optimal loading.

## ♿ Accessibility Features

- **Keyboard Navigation**: Full keyboard support with proper focus management
- **Screen Reader Support**: ARIA labels and live regions
- **High Contrast**: Support for high contrast themes
- **Reduced Motion**: Respects user motion preferences
- **Touch Targets**: Minimum 44px touch targets on mobile

## 📱 Mobile Optimizations

- **Touch Gestures**: Swipe navigation between steps
- **Responsive Layout**: Adapts to different screen sizes
- **Performance**: Optimized for mobile devices
- **Offline Support**: Local storage backup for drafts

## 🔧 Configuration

### Creating Custom Wizard Configs

```tsx
import { WizardConfig } from "@/types/wizard-core";

const customWizardConfig: WizardConfig<CustomWizardData> = {
  id: "custom-wizard",
  type: "custom",
  title: "Custom Wizard",
  steps: [
    {
      id: "step1",
      title: "Step 1",
      component: Step1Component,
      validation: step1Schema,
    },
    // ... more steps
  ],
  validation: {
    stepSchemas: {
      step1: step1Schema,
    },
    finalSchema: completeSchema,
  },
  persistence: {
    autoSave: true,
    autoSaveInterval: 30000,
  },
};
```

## 🐛 Error Handling

The framework provides comprehensive error handling:

```tsx
// Error boundary with recovery strategies
<WizardErrorBoundary
  onError={(error) => {
    console.error("Wizard error:", error);
    // Custom error handling
  }}
>
  <Wizard config={config} />
</WizardErrorBoundary>
```

### Error Recovery Strategies

- **Retry**: Attempt the failed operation again
- **Skip**: Skip the current step if optional
- **Go to Step**: Navigate to a specific step
- **Save Draft**: Save current progress before recovery
- **Reset**: Reset wizard to initial state

## 📚 Migration Guide

### From Legacy Wizards

If you're migrating from previous wizard implementations:

1. **Replace imports**:

   ```tsx
   // Old
   import { PropertyWizard } from "@/components/property-wizard";

   // New
   import { PropertyWizard } from "@/components/wizard";
   ```

2. **Update props**:

   ```tsx
   // Old props are mostly compatible
   <PropertyWizard onComplete={handleComplete} onSaveDraft={handleSaveDraft} />
   ```

3. **Update hooks**:

   ```tsx
   // Old
   import { usePropertyWizard } from "@/hooks/use-property-wizard";

   // New
   import { useWizard } from "@/hooks/wizard";
   ```

## 🤝 Contributing

When contributing to the wizard framework:

1. **Follow the architecture**: Keep domain logic separated
2. **Add tests**: All new features must include tests
3. **Update documentation**: Keep README and inline docs current
4. **Type safety**: Ensure full TypeScript coverage
5. **Accessibility**: Test with keyboard and screen readers

## 📄 License

This wizard framework is part of the Marbry Inmobiliaria project and follows the project's licensing terms.
