# Core Wizard Framework

This directory contains the foundational components that power the entire wizard system. These components are domain-agnostic and provide the essential building blocks for all wizard implementations.

## 🏗️ Architecture

The core framework follows a layered architecture:

```
Core Framework
├── Wizard Shell (Main Orchestrator)
├── Step Renderer (Dynamic Component Loading)
├── Navigation System (User Controls)
├── Progress Tracking (Visual Feedback)
└── Error Boundary (Fault Tolerance)
```

## 📦 Components

### Wizard Shell (`wizard.tsx`)

The main orchestrator component that manages the entire wizard lifecycle.

**Features:**

- Type-safe with TypeScript generics
- Configurable step flow
- Auto-save functionality
- Mobile-responsive design
- Accessibility support

**Usage:**

```tsx
import { Wizard } from "@/components/wizard/core";

<Wizard<PropertyWizardData>
  config={propertyWizardConfig}
  initialData={draftData}
  onComplete={handleComplete}
  onSaveDraft={handleSaveDraft}
  showProgress={true}
  enableKeyboardNavigation={true}
/>;
```

### Step Renderer (`wizard-step-renderer.tsx`)

Handles dynamic step component rendering with performance optimizations.

**Features:**

- Lazy loading of step components
- Performance monitoring
- Accessibility enhancements
- Error boundaries per step
- Memoization for expensive renders

**Usage:**

```tsx
import { WizardStepRenderer } from "@/components/wizard/core";

<WizardStepRenderer
  step={currentStep}
  data={wizardData}
  onUpdate={updateData}
  onNext={nextStep}
  onPrevious={previousStep}
  errors={validationErrors}
  isLoading={isLoading}
  isMobile={isMobile}
/>;
```

### Navigation System (`wizard-navigation.tsx`)

Provides user controls for wizard navigation with full accessibility support.

**Features:**

- Keyboard navigation (Tab, Enter, Arrow keys)
- Touch gesture support
- Loading states
- Disabled state management
- Screen reader compatibility

**Usage:**

```tsx
import { WizardNavigation } from "@/components/wizard/core";

<WizardNavigation
  canGoNext={canGoNext}
  canGoPrevious={canGoPrevious}
  canComplete={canComplete}
  onNext={handleNext}
  onPrevious={handlePrevious}
  onComplete={handleComplete}
  onSaveDraft={handleSaveDraft}
  isLoading={isLoading}
  isMobile={isMobile}
/>;
```

### Progress Tracking (`wizard-progress.tsx`)

Visual progress indicators with multiple display modes.

**Features:**

- Linear progress bar
- Circular progress indicator
- Compact mode for mobile
- Step number display
- Completion percentage

**Usage:**

```tsx
import { WizardProgress } from "@/components/wizard/core";

<WizardProgress
  steps={wizardSteps}
  currentStep={currentStepIndex}
  showStepNumbers={true}
  isMobile={isMobile}
/>;
```

### Error Boundary (`wizard-error-boundary.tsx`)

Comprehensive error handling with recovery strategies.

**Features:**

- Error categorization (validation, network, storage, permission)
- Recovery strategies (retry, skip, reset, save draft)
- User-friendly error messages
- Error reporting and logging
- Graceful degradation

**Usage:**

```tsx
import { WizardErrorBoundary } from "@/components/wizard/core";

<WizardErrorBoundary onError={handleError} fallback={ErrorFallbackComponent}>
  <Wizard config={config} />
</WizardErrorBoundary>;
```

## 🎯 Core Hook: useWizard

The central hook that replaces all previous wizard hooks and provides comprehensive state management.

**Features:**

- Centralized state management
- Type-safe with generics
- Auto-save functionality
- Validation integration
- Navigation logic
- Error handling
- Performance optimization

**Usage:**

```tsx
import { useWizard } from "@/hooks/wizard";

const wizard = useWizard<PropertyWizardData>({
  config: propertyWizardConfig,
  initialData: { title: "", description: "" },
  onComplete: async (data) => {
    const result = await createProperty(data);
    router.push(`/properties/${result.id}`);
  },
  onSaveDraft: async (data, step) => {
    return await saveDraft(data, step);
  },
});

// Access all wizard functionality
const {
  // Data management
  data,
  updateData,
  resetData,

  // Navigation
  currentStep,
  currentStepIndex,
  totalSteps,
  progress,
  goToStep,
  nextStep,
  previousStep,
  canGoNext,
  canGoPrevious,

  // Validation
  validateCurrentStep,
  validateAllSteps,
  getStepErrors,
  clearErrors,

  // Persistence
  saveDraft,
  loadDraft,
  deleteDraft,
  hasDraft,

  // Completion
  complete,
  canComplete,

  // State
  isLoading,
  isSaving,
  isValidating,
  error,
} = wizard;
```

## 🔧 Configuration System

### Wizard Configuration

Define wizard behavior through configuration objects:

```tsx
import { WizardConfig } from "@/types/wizard-core";

const wizardConfig: WizardConfig<CustomWizardData> = {
  id: "custom-wizard",
  type: "custom",
  title: "Custom Wizard",
  description: "Create custom content",

  steps: [
    {
      id: "basic-info",
      title: "Basic Information",
      description: "Enter basic details",
      component: BasicInfoStep,
      validation: basicInfoSchema,
      isOptional: false,
      canSkip: false,
    },
    {
      id: "advanced",
      title: "Advanced Settings",
      component: AdvancedStep,
      validation: advancedSchema,
      isOptional: true,
      canSkip: true,
    },
  ],

  validation: {
    stepSchemas: {
      "basic-info": basicInfoSchema,
      advanced: advancedSchema,
    },
    finalSchema: completeSchema,
  },

  persistence: {
    autoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    storageKey: "custom-wizard",
  },

  navigation: {
    allowSkipSteps: true,
    showProgress: true,
    showStepNumbers: true,
  },
};
```

### Step Component Interface

All step components must implement the `WizardStepProps` interface:

```tsx
import { WizardStepProps } from "@/types/wizard-core";

interface CustomStepProps extends WizardStepProps<CustomWizardData> {
  // Additional props specific to this step
}

function CustomStep({
  data,
  onUpdate,
  onNext,
  onPrevious,
  errors,
  isLoading,
  isMobile,
}: CustomStepProps) {
  return (
    <div className="wizard-step">
      {/* Step content */}
      <input
        value={data.customField || ""}
        onChange={(e) => onUpdate({ customField: e.target.value })}
        className={errors.customField ? "error" : ""}
      />
      {errors.customField && (
        <span className="error-message">{errors.customField}</span>
      )}
    </div>
  );
}
```

## 🚀 Performance Optimizations

### Lazy Loading

Steps are loaded on demand to reduce initial bundle size:

```tsx
import { createLazyStep } from "@/components/wizard/core";

const LazyAdvancedStep = createLazyStep(() => import("./AdvancedStep"), {
  fallback: <StepSkeleton />,
});
```

### Memoization

Components are optimized with React.memo:

```tsx
import { withLazyLoading } from "@/components/wizard/core";

const OptimizedStep = withLazyLoading(CustomStep);
```

### Performance Monitoring

Track step performance with built-in hooks:

```tsx
import { useStepPerformance } from "@/components/wizard/core";

function CustomStep(props) {
  const { startTiming, endTiming } = useStepPerformance("custom-step");

  useEffect(() => {
    startTiming();
    // Step initialization
    return () => endTiming();
  }, []);

  return <div>Step content</div>;
}
```

## ♿ Accessibility Features

### Keyboard Navigation

Full keyboard support with proper focus management:

```tsx
import { useWizardKeyboardNavigation } from "@/components/wizard/core";

function CustomWizard() {
  useWizardKeyboardNavigation({
    onNext: handleNext,
    onPrevious: handlePrevious,
    onComplete: handleComplete,
    enabled: true,
  });

  return <Wizard config={config} />;
}
```

### Screen Reader Support

Built-in ARIA labels and live regions:

```tsx
import { useStepAccessibility } from "@/components/wizard/core";

function CustomStep(props) {
  const { announceStep, announceError } = useStepAccessibility();

  useEffect(() => {
    announceStep("Step 1 of 3: Basic Information");
  }, []);

  return <div>Step content</div>;
}
```

## 🧪 Testing Utilities

The core framework provides testing utilities:

```tsx
import {
  renderWizardStep,
  mockWizardConfig,
} from "@/components/wizard/core/__tests__/test-utils";

describe("CustomStep", () => {
  it("should render correctly", () => {
    const { getByRole } = renderWizardStep(CustomStep, {
      data: { customField: "test" },
      config: mockWizardConfig,
    });

    expect(getByRole("textbox")).toBeInTheDocument();
  });
});
```

## 🔍 Type Safety

The core framework is fully type-safe:

```tsx
// Define your data type
interface CustomWizardData extends WizardData {
  customField: string;
  optionalField?: number;
}

// Use with full type safety
const wizard = useWizard<CustomWizardData>({
  config: customConfig,
  initialData: { title: "", description: "", customField: "" },
});

// All methods are type-safe
wizard.updateData({ customField: "new value" }); // ✅
wizard.updateData({ invalidField: "value" }); // ❌ TypeScript error
```

## 🐛 Error Handling

### Error Categories

The framework categorizes errors for appropriate handling:

- **Validation**: Form validation errors
- **Network**: API communication failures
- **Storage**: Local storage or database errors
- **Permission**: Authorization failures

### Recovery Strategies

Each error type has appropriate recovery strategies:

```tsx
const errorRecovery: ErrorRecoveryStrategy = {
  retry: () => wizard.nextStep(),
  skip: () => wizard.goToStep("next-step"),
  goToStep: (stepId) => wizard.goToStep(stepId),
  saveDraft: () => wizard.saveDraft(),
  reset: () => wizard.resetData(),
};
```

## 📚 Best Practices

1. **Keep steps focused**: Each step should have a single responsibility
2. **Use validation schemas**: Always define Zod schemas for type safety
3. **Handle loading states**: Provide feedback during async operations
4. **Test accessibility**: Use keyboard and screen readers
5. **Optimize performance**: Use lazy loading for heavy components
6. **Handle errors gracefully**: Provide recovery options for users

## 🔗 Related Documentation

- [Wizard Framework Overview](../README.md)
- [Property Wizard](../property/README.md)
- [Land Wizard](../land/README.md)
- [Blog Wizard](../blog/README.md)
- [Shared Components](../shared/README.md)
