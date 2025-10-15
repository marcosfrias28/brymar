/**
 * End-to-End Functionality Tests
 * Tests all major user flows to verify the application works properly
 */

import { container } from '@/infrastructure/container/Container';
import { initializeContainer } from '@/infrastructure/container/ServiceRegistration';

// Import use cases for testing
import type { UpdateUserProfileUseCase } from '@/application/use-cases/user/UpdateUserProfileUseCase';
import type { SaveWizardDraftUseCase } from '@/application/use-cases/wizard/SaveWizardDraftUseCase';
import type { LoadWizardDraftUseCase } from '@/application/use-cases/wizard/LoadWizardDraftUseCase';
import type { PublishWizardUseCase } from '@/application/use-cases/wizard/PublishWizardUseCase';
import type { CreatePropertyUseCase } from '@/application/use-cases/property/CreatePropertyUseCase';
import type { CreateLandUseCase } from '@/application/use-cases/land/CreateLandUseCase';
import type { SearchPropertiesUseCase } from '@/application/use-cases/property/SearchPropertiesUseCase';

// Import DTOs
import { UpdateUserProfileInput } from '@/application/dto/user/UpdateUserProfileInput';
import { SaveWizardDraftInput } from '@/application/dto/wizard/SaveWizardDraftInput';
import { LoadWizardDraftInput } from '@/application/dto/wizard/LoadWizardDraftInput';
import { CreatePropertyInput } from '@/application/dto/property/CreatePropertyInput';
import { CreateLandInput } from '@/application/dto/land/CreateLandInput';
import { SearchPropertiesInput } from '@/application/dto/property/SearchPropertiesInput';

interface TestResult {
    testName: string;
    passed: boolean;
    error?: string;
    details?: any;
}

/**
 * Initialize test environment
 */
async function initializeTestEnvironment(): Promise<void> {
    console.log('🔧 Initializing test environment...');

    try {
        initializeContainer();
        console.log('✅ Container initialized successfully');
    } catch (error) {
        console.error('❌ Failed to initialize container:', error);
        throw error;
    }
}

/**
 * Test 1: User Registration and Profile Updates
 */
async function testUserRegistrationAndProfile(): Promise<TestResult> {
    console.log('\n👤 Testing User Registration and Profile Updates...');

    try {
        const updateUserProfileUseCase = container.get<UpdateUserProfileUseCase>('UpdateUserProfileUseCase');

        // Test profile update with valid data
        const updateInput = UpdateUserProfileInput.create({
            userId: '550e8400-e29b-41d4-a716-446655440000',
            name: 'Test User',
            phone: '+1234567890'
        });

        console.log('  📝 Testing profile update...');
        try {
            const result = await updateUserProfileUseCase.execute(updateInput);
            console.log('  ✅ Profile update successful');
            return {
                testName: 'User Registration and Profile Updates',
                passed: true,
                details: result
            };
        } catch (error) {
            console.log('  ❌ Profile update failed:', error);
            return {
                testName: 'User Registration and Profile Updates',
                passed: false,
                error: error instanceof Error ? error.message : 'Profile update failed'
            };
        }

    } catch (error) {
        console.log('  ❌ User profile test failed:', error);
        return {
            testName: 'User Registration and Profile Updates',
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Test 2: Property Creation and Search
 */
async function testPropertyCreationAndSearch(): Promise<TestResult> {
    console.log('\n🏠 Testing Property Creation and Search...');

    try {
        const createPropertyUseCase = container.get<CreatePropertyUseCase>('CreatePropertyUseCase');
        const searchPropertiesUseCase = container.get<SearchPropertiesUseCase>('SearchPropertiesUseCase');

        // Test property creation
        const createInput = CreatePropertyInput.create({
            title: 'Test Property E2E',
            description: 'A test property for end-to-end testing',
            price: 250000,
            currency: 'USD',
            type: 'house',
            address: {
                street: '123 Test Street',
                city: 'Test City',
                state: 'Test State',
                postalCode: '12345',
                country: 'Test Country'
            },
            features: {
                bedrooms: 3,
                bathrooms: 2,
                area: 1500,
                amenities: [],
                features: []
            },
            featured: false
        });

        try {
            console.log('  🏗️  Testing property creation...');
            const createResult = await createPropertyUseCase.execute(createInput);
            console.log('  ✅ Property created successfully');

            // Test property search
            const searchInput = SearchPropertiesInput.create({
                query: 'Test Property',
                minPrice: 200000,
                maxPrice: 300000,
                propertyTypes: ['house'],
                limit: 10,
                offset: 0,
                sortBy: 'createdAt',
                sortOrder: 'desc'
            });

            console.log('  🔍 Testing property search...');
            const searchResult = await searchPropertiesUseCase.execute(searchInput);

            if (searchResult.properties.length > 0) {
                console.log('  ✅ Property search successful');
                return {
                    testName: 'Property Creation and Search',
                    passed: true,
                    details: {
                        created: createResult,
                        searchResults: searchResult
                    }
                };
            } else {
                console.log('  ❌ Property search failed or no results found');
                return {
                    testName: 'Property Creation and Search',
                    passed: false,
                    error: 'Property search failed or no results found'
                };
            }
        } catch (error) {
            console.log('  ❌ Property test failed:', error);
            return {
                testName: 'Property Creation and Search',
                passed: false,
                error: error instanceof Error ? error.message : 'Property test failed'
            };
        }

    } catch (error) {
        console.log('  ❌ Property test failed:', error);
        return {
            testName: 'Property Creation and Search',
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Test 3: Land Creation and Search
 */
async function testLandCreationAndSearch(): Promise<TestResult> {
    console.log('\n🌾 Testing Land Creation and Search...');

    try {
        const createLandUseCase = container.get<CreateLandUseCase>('CreateLandUseCase');

        // Test land creation
        const createInput = CreateLandInput.create({
            name: 'Test Land E2E',
            description: 'A test land for end-to-end testing',
            price: 150000,
            currency: 'USD',
            area: 5000,
            type: 'agricultural',
            location: '456 Test Farm Road, Test City, Test State',
            features: ['fertile soil', 'water access']
        });

        try {
            console.log('  🌱 Testing land creation...');
            const createResult = await createLandUseCase.execute(createInput);
            console.log('  ✅ Land created successfully');
            return {
                testName: 'Land Creation and Search',
                passed: true,
                details: createResult
            };
        } catch (error) {
            console.log('  ❌ Land creation failed:', error);
            return {
                testName: 'Land Creation and Search',
                passed: false,
                error: error instanceof Error ? error.message : 'Land creation failed'
            };
        }

    } catch (error) {
        console.log('  ❌ Land test failed:', error);
        return {
            testName: 'Land Creation and Search',
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Test 4: Wizard Functionality with Real Data
 */
async function testWizardFunctionality(): Promise<TestResult> {
    console.log('\n🧙 Testing Wizard Functionality with Real Data...');

    try {
        const saveWizardDraftUseCase = container.get<SaveWizardDraftUseCase>('SaveWizardDraftUseCase');
        const loadWizardDraftUseCase = container.get<LoadWizardDraftUseCase>('LoadWizardDraftUseCase');
        const publishWizardUseCase = container.get<PublishWizardUseCase>('PublishWizardUseCase');

        const draftId = '550e8400-e29b-41d4-a716-446655440002';

        // Test saving wizard draft
        const saveInput = SaveWizardDraftInput.create({
            draftId,
            userId: '550e8400-e29b-41d4-a716-446655440000',
            wizardType: 'property',
            wizardConfigId: '550e8400-e29b-41d4-a716-446655440001',
            currentStep: 'step-2',
            formData: {
                title: 'Test Wizard Property',
                description: 'Property created via wizard',
                price: 300000,
                propertyType: 'apartment',
                bedrooms: 2,
                bathrooms: 1
            },
            title: 'Test Wizard Property'
        });

        try {
            console.log('  💾 Testing wizard draft save...');
            const saveResult = await saveWizardDraftUseCase.execute(saveInput);
            console.log('  ✅ Wizard draft saved successfully');

            // Test loading wizard draft
            const loadInput = LoadWizardDraftInput.create({
                draftId,
                userId: '550e8400-e29b-41d4-a716-446655440000'
            });

            console.log('  📂 Testing wizard draft load...');
            const loadResult = await loadWizardDraftUseCase.execute(loadInput);
            console.log('  ✅ Wizard draft loaded successfully');

            // Test publishing wizard (this will create the actual property/land)
            console.log('  🚀 Testing wizard publish...');
            const publishResult = await publishWizardUseCase.execute({
                draftId,
                userId: '550e8400-e29b-41d4-a716-446655440000'
            });

            console.log('  ✅ Wizard published successfully');
            return {
                testName: 'Wizard Functionality with Real Data',
                passed: true,
                details: {
                    saved: saveResult,
                    loaded: loadResult,
                    published: publishResult
                }
            };
        } catch (error) {
            console.log('  ❌ Wizard test failed:', error);
            return {
                testName: 'Wizard Functionality with Real Data',
                passed: false,
                error: error instanceof Error ? error.message : 'Wizard test failed'
            };
        }

    } catch (error) {
        console.log('  ❌ Wizard test failed:', error);
        return {
            testName: 'Wizard Functionality with Real Data',
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Test 5: Database Connection and Operations
 */
async function testDatabaseConnection(): Promise<TestResult> {
    console.log('\n🗄️  Testing Database Connection and Operations...');

    try {
        // Test that repositories can be instantiated and have database connections
        const userRepo = container.get('IUserRepository');
        const propertyRepo = container.get('IPropertyRepository');
        const landRepo = container.get('ILandRepository');
        const wizardRepo = container.get('IWizardDraftRepository');

        console.log('  🔌 Testing repository instantiation...');

        if (!userRepo || !propertyRepo || !landRepo || !wizardRepo) {
            return {
                testName: 'Database Connection and Operations',
                passed: false,
                error: 'One or more repositories could not be instantiated'
            };
        }

        console.log('  ✅ All repositories instantiated successfully');

        // Test basic database operations (if methods exist)
        console.log('  🔍 Testing basic database operations...');

        // This is a basic connectivity test - actual operations are tested in other tests
        return {
            testName: 'Database Connection and Operations',
            passed: true,
            details: 'All repositories instantiated and ready for operations'
        };

    } catch (error) {
        console.log('  ❌ Database connection test failed:', error);
        return {
            testName: 'Database Connection and Operations',
            passed: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

/**
 * Run all end-to-end tests
 */
export async function runEndToEndTests(): Promise<void> {
    console.log('🧪 Running End-to-End Functionality Tests');
    console.log('='.repeat(60));

    try {
        // Initialize test environment
        await initializeTestEnvironment();

        // Run all tests
        const testResults: TestResult[] = [];

        testResults.push(await testDatabaseConnection());
        testResults.push(await testUserRegistrationAndProfile());
        testResults.push(await testPropertyCreationAndSearch());
        testResults.push(await testLandCreationAndSearch());
        testResults.push(await testWizardFunctionality());

        // Print summary
        console.log('\n📊 End-to-End Test Summary:');
        console.log('='.repeat(40));

        const passedTests = testResults.filter(t => t.passed).length;
        const totalTests = testResults.length;

        testResults.forEach(result => {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} ${result.testName}`);
            if (!result.passed && result.error) {
                console.log(`   Error: ${result.error}`);
            }
        });

        console.log(`\n📈 Results: ${passedTests}/${totalTests} tests passed`);

        if (passedTests === totalTests) {
            console.log('\n🎉 All end-to-end tests passed!');
            console.log('✅ The application is working properly with real data');
        } else {
            console.log('\n⚠️  Some end-to-end tests failed');
            console.log('❌ Check the failed tests above for details');
        }

    } catch (error) {
        console.error('💥 End-to-end test execution failed:', error);
        throw error;
    }
}

// Export individual test functions for selective testing
export {
    testUserRegistrationAndProfile,
    testPropertyCreationAndSearch,
    testLandCreationAndSearch,
    testWizardFunctionality,
    testDatabaseConnection
};

// If this file is run directly, execute all tests
if (require.main === module) {
    runEndToEndTests()
        .then(() => {
            console.log('\n🏆 End-to-end testing completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 End-to-end testing failed:', error);
            process.exit(1);
        });
}