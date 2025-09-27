# AI Property Wizard Test Suite

This directory contains comprehensive tests for the AI Property Wizard feature, covering all aspects of functionality, performance, accessibility, and visual consistency.

## Test Structure

### Test Categories

1. **Unit Tests** - Individual component and function testing
2. **Integration Tests** - Complete wizard flow testing
3. **Accessibility Tests** - WCAG compliance and screen reader support
4. **Performance Tests** - Load times, memory usage, and responsiveness
5. **Visual Regression Tests** - UI consistency across different states

### Test Files

#### Component Tests

- `property-wizard.test.tsx` - Main wizard container component
- `steps/general-info-step.test.tsx` - Step 1 form and AI generation
- `steps/location-step.test.tsx` - Step 2 map and geocoding
- `steps/media-upload-step.test.tsx` - Step 3 image upload and management
- `steps/preview-step.test.tsx` - Step 4 preview and publication

#### Hook Tests

- `hooks/use-wizard-state-manager.test.ts` - State management and persistence
- `hooks/use-ai-generation.test.ts` - AI content generation

#### Service Tests

- `lib/actions/wizard-actions.test.ts` - Server actions for CRUD operations

#### Integration Tests

- `wizard-integration.test.tsx` - End-to-end wizard flow

#### Accessibility Tests

- `wizard-accessibility.test.tsx` - WCAG compliance and keyboard navigation

#### Performance Tests

- `wizard-performance.test.tsx` - Load times and memory usage

#### Visual Regression Tests

- `wizard-visual-regression.test.tsx` - UI consistency testing

## Running Tests

### All Tests

```bash
npm run test:wizard
```

### Specific Test Suites

```bash
npm run test:wizard:unit           # Unit tests only
npm run test:wizard:integration    # Integration tests only
npm run test:wizard:accessibility  # Accessibility tests only
npm run test:wizard:performance    # Performance tests only
npm run test:wizard:visual         # Visual regression tests only
npm run test:wizard:hooks          # Hook tests only
npm run test:wizard:actions        # Action tests only
```

### Development Mode

```bash
npm run test:wizard:watch          # Watch mode for development
npm run test:wizard:coverage       # Generate coverage report
```

### Advanced Usage

```bash
# Run specific suite with verbose output
node scripts/test-wizard.js --suite=accessibility --verbose

# Run with coverage
node scripts/test-wizard.js --coverage

# List available test suites
node scripts/test-wizard.js --list-suites

# Get help
node scripts/test-wizard.js --help
```

## Test Coverage Requirements

### Overall Coverage Targets

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Component-Specific Targets

- **Wizard Components**: 85%
- **Wizard Hooks**: 90%
- **Wizard Actions**: 85%

## Test Scenarios Covered

### Unit Tests

#### PropertyWizard Component

- ✅ Initial render and state
- ✅ Step navigation
- ✅ Progress tracking
- ✅ Loading states
- ✅ Error handling
- ✅ Keyboard shortcuts
- ✅ Draft saving/loading

#### GeneralInfoStep Component

- ✅ Form field rendering
- ✅ Input validation
- ✅ AI content generation
- ✅ Characteristics selection
- ✅ Property type selection
- ✅ Error display

#### LocationStep Component

- ✅ Map interaction
- ✅ Geocoding/reverse geocoding
- ✅ Address form validation
- ✅ Coordinate bounds checking
- ✅ Error handling

#### MediaUploadStep Component

- ✅ File selection and validation
- ✅ Drag and drop functionality
- ✅ Upload progress tracking
- ✅ Image preview and management
- ✅ Batch upload handling
- ✅ Error recovery

#### PreviewStep Component

- ✅ Complete property preview
- ✅ Edit navigation
- ✅ Publication workflow
- ✅ Draft saving
- ✅ Validation before publish

### Hook Tests

#### useWizardStateManager

- ✅ State initialization
- ✅ Form data updates
- ✅ Step navigation
- ✅ Validation tracking
- ✅ History management (undo/redo)
- ✅ Auto-save functionality
- ✅ Persistence handling

#### useAIGeneration

- ✅ Content generation
- ✅ Loading states
- ✅ Error handling
- ✅ Retry functionality
- ✅ Rate limiting
- ✅ Generation history

### Service Tests

#### Wizard Actions

- ✅ Property publication
- ✅ Draft management
- ✅ Authentication checks
- ✅ Database transactions
- ✅ Error handling
- ✅ Validation

### Integration Tests

- ✅ Complete wizard flow (start to finish)
- ✅ Cross-step data persistence
- ✅ Service integration
- ✅ Error recovery scenarios
- ✅ Multi-language support

### Accessibility Tests

- ✅ WCAG 2.1 AA compliance
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Color contrast
- ✅ High contrast mode

### Performance Tests

- ✅ Initial render performance
- ✅ Form input responsiveness
- ✅ Image upload performance
- ✅ Large dataset handling
- ✅ Memory usage
- ✅ Concurrent operations

### Visual Regression Tests

- ✅ Component visual states
- ✅ Responsive design
- ✅ Theme consistency
- ✅ Animation states
- ✅ Error states
- ✅ Loading states

## Mock Strategy

### External Services

- **HuggingFace API** - Mocked for AI generation tests
- **Vercel Blob Storage** - Mocked for upload tests
- **Map Services** - Mocked for location tests
- **Database** - Mocked for action tests

### Browser APIs

- **File API** - Mocked for upload tests
- **Geolocation API** - Mocked for location tests
- **ResizeObserver** - Mocked for responsive tests
- **IntersectionObserver** - Mocked for performance tests

### React Ecosystem

- **Next.js Router** - Mocked for navigation tests
- **React Query** - Mocked for data fetching tests
- **Framer Motion** - Mocked for animation tests

## Test Data

### Sample Property Data

```typescript
const mockPropertyData = {
  title: 'Beautiful House in Santo Domingo',
  description: 'A wonderful property...',
  price: 150000,
  surface: 200,
  propertyType: 'house',
  bedrooms: 3,
  bathrooms: 2,
  characteristics: [...],
  coordinates: { latitude: 18.4861, longitude: -69.9312 },
  address: { ... },
  images: [...],
  // ... other fields
}
```

### Test Utilities

- `createMockFile()` - Generate mock file objects
- `createMockFormData()` - Generate mock form data
- `takeSnapshot()` - Capture visual snapshots
- `measureRenderTime()` - Performance measurement

## Continuous Integration

### Pre-commit Hooks

- Run unit tests
- Check test coverage
- Lint test files

### CI Pipeline

1. Install dependencies
2. Run all test suites
3. Generate coverage report
4. Upload coverage to reporting service
5. Run visual regression tests
6. Archive test artifacts

### Coverage Reporting

- Coverage reports are generated in `coverage/` directory
- HTML reports available at `coverage/lcov-report/index.html`
- Coverage badges updated automatically

## Debugging Tests

### Common Issues

1. **Mock not working** - Check mock setup in `jest.wizard.setup.js`
2. **Async test failures** - Ensure proper `await` usage
3. **DOM cleanup** - Tests should clean up after themselves
4. **Memory leaks** - Check for proper unmounting

### Debug Commands

```bash
# Run single test file
npx jest components/wizard/__tests__/property-wizard.test.tsx

# Run with debug output
npx jest --verbose --no-cache

# Run specific test
npx jest -t "should render initial state"
```

### Test Environment

- **Node.js**: Latest LTS
- **Jest**: 30.x
- **Testing Library**: Latest
- **jsdom**: For DOM simulation

## Contributing

### Adding New Tests

1. Follow existing naming conventions
2. Add appropriate mocks
3. Include both positive and negative test cases
4. Update coverage thresholds if needed
5. Document complex test scenarios

### Test Guidelines

- **Arrange-Act-Assert** pattern
- Descriptive test names
- Single responsibility per test
- Proper cleanup
- Mock external dependencies
- Test edge cases

### Review Checklist

- [ ] Tests cover new functionality
- [ ] Mocks are appropriate
- [ ] Tests are deterministic
- [ ] Coverage thresholds met
- [ ] Documentation updated
- [ ] CI passes

## Resources

- [Testing Library Documentation](https://testing-library.com/)
- [Jest Documentation](https://jestjs.io/)
- [Accessibility Testing Guide](https://web.dev/accessibility-testing/)
- [Visual Regression Testing](https://storybook.js.org/docs/react/writing-tests/visual-testing)
- [Performance Testing Best Practices](https://web.dev/performance-testing/)
