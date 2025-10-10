# Wizard Framework Test Suite

This directory contains comprehensive tests for the wizard framework, covering all aspects of functionality, performance, accessibility, and visual consistency.

## Test Structure

### Test Categories

1. **Unit Tests** (`wizard-framework-unit.test.tsx`)

   - Core wizard hook functionality
   - Wizard validator logic
   - Individual component behavior
   - Data management and state handling

2. **Integration Tests** (`wizard-integration.test.tsx`)

   - End-to-end wizard workflows
   - Cross-wizard functionality
   - Draft saving and loading
   - Error recovery scenarios

3. **Performance Tests** (`wizard-performance.test.tsx`)

   - Rendering performance benchmarks
   - Memory usage monitoring
   - Navigation speed tests
   - Auto-save debouncing

4. **Accessibility Tests** (`wizard-accessibility.test.tsx`)

   - WCAG 2.1 AA compliance
   - Keyboard navigation
   - Screen reader support
   - Focus management

5. **Visual Regression Tests** (`wizard-visual-regression.test.tsx`)

   - Layout consistency across viewports
   - Theme variations
   - Component visual states
   - Cross-browser compatibility

6. **Interactive Map Tests** (`interactive-map-integration.test.tsx`)
   - Map component integration
   - Location selection functionality
   - Geolocation handling
   - Mobile map experience

## Running Tests

### All Tests

```bash
npm run test:wizard
```

### Specific Test Suites

```bash
# Unit tests only
npm run test:wizard:unit

# Integration tests only
npm run test:wizard:integration

# Performance tests only
npm run test:wizard:performance

# Accessibility tests only
npm run test:wizard:accessibility

# Visual regression tests only
npm run test:wizard:visual
```

### Watch Mode

```bash
npm run test:wizard:watch
```

### Coverage Reports

```bash
npm run test:wizard:coverage
```

## Test Configuration

### Performance Benchmarks

The performance tests validate against these benchmarks:

- **Initial Render**: < 200ms for wizard with 5 steps
- **Step Navigation**: < 100ms between steps
- **Data Validation**: < 50ms for complex validation
- **Draft Save**: < 200ms including network simulation
- **Memory Usage**: < 10MB for large wizard configurations

### Accessibility Standards

All tests validate against:

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast requirements
- Touch target sizes (44px minimum)

### Browser Support

Visual regression tests cover:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Viewport Testing

Tests validate responsive behavior across:

- Desktop: 1920x1080
- Tablet: 768x1024
- Mobile: 375x667
- Small Mobile: 320x568

## Test Data and Mocks

### Mock Services

- **WizardPersistence**: Mocked for consistent test behavior
- **Geolocation API**: Mocked for location testing
- **LocalStorage**: Mocked for persistence testing
- **Network Requests**: Mocked for offline/online scenarios

### Test Data

Each test suite uses realistic test data that mirrors production usage:

- Property wizard data with complete property information
- Land wizard data with zoning and utility information
- Blog wizard data with content and SEO metadata

## Coverage Requirements

### Minimum Coverage Thresholds

- **Core Components**: 90% (branches, functions, lines, statements)
- **Hooks**: 85% (branches, functions, lines, statements)
- **Utilities**: 85% (branches, functions, lines, statements)
- **Overall**: 80% (branches, functions, lines, statements)

### Coverage Reports

Coverage reports are generated in multiple formats:

- **Text**: Console output during test runs
- **HTML**: Interactive coverage report at `coverage/wizard/index.html`
- **LCOV**: For CI/CD integration
- **JSON**: For programmatic analysis

## Continuous Integration

### GitHub Actions

The test suite integrates with GitHub Actions for:

- Automated test execution on pull requests
- Coverage reporting and enforcement
- Performance regression detection
- Accessibility compliance validation

### Test Artifacts

CI generates and stores:

- Test results and coverage reports
- Performance benchmark data
- Visual regression screenshots
- Accessibility audit reports

## Debugging Tests

### Common Issues

1. **Async Test Failures**

   - Use `waitFor` for async operations
   - Ensure proper cleanup in `afterEach`
   - Check for race conditions

2. **Mock Issues**

   - Verify mocks are cleared between tests
   - Check mock implementation matches real API
   - Ensure proper mock restoration

3. **Performance Test Flakiness**
   - Run tests multiple times for consistency
   - Check for external factors affecting performance
   - Adjust timeouts for slower environments

### Debug Commands

```bash
# Run tests with debug output
npm run test:wizard -- --verbose

# Run specific test file
npm run test:wizard -- wizard-framework-unit.test.tsx

# Run tests in watch mode with coverage
npm run test:wizard:watch -- --coverage
```

## Contributing

### Adding New Tests

1. Follow the existing test structure and naming conventions
2. Include both positive and negative test cases
3. Add performance benchmarks for new features
4. Ensure accessibility compliance for UI components
5. Update this README with new test categories

### Test Guidelines

- **Descriptive Names**: Use clear, descriptive test names
- **Arrange-Act-Assert**: Follow the AAA pattern
- **Isolation**: Each test should be independent
- **Cleanup**: Always clean up resources in `afterEach`
- **Mocking**: Mock external dependencies consistently

### Performance Considerations

- Keep test execution time reasonable (< 30s per suite)
- Use appropriate timeouts for different test types
- Optimize test data size for performance tests
- Consider parallel execution for independent tests

## Troubleshooting

### Common Test Failures

1. **Timeout Errors**

   - Increase timeout for slow operations
   - Check for infinite loops or hanging promises
   - Verify mock implementations

2. **Memory Leaks**

   - Ensure proper cleanup of event listeners
   - Clear timers and intervals
   - Restore mocks after tests

3. **Flaky Tests**
   - Add proper wait conditions
   - Avoid hardcoded delays
   - Check for race conditions

### Getting Help

- Check existing test patterns for similar functionality
- Review mock implementations for external dependencies
- Consult the main project documentation for API details
- Ask team members for guidance on complex test scenarios
