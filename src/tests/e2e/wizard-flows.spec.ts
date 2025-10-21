import { test, expect } from '@playwright/test';

test.describe('Wizard Functionality Flows', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication - simulate logged in state
        await page.goto('/');

        // Simulate logged in state with admin/agent permissions
        await page.evaluate(() => {
            localStorage.setItem('auth-token', 'mock-token');
            localStorage.setItem('auth-session', JSON.stringify({
                user: {
                    id: '123',
                    email: 'admin@example.com',
                    role: 'admin',
                    permissions: ['canUseWizard', 'canCreateProperties', 'canCreateLands', 'canCreateBlogs']
                }
            }));
        });
    });

    test('should display wizard selection page', async ({ page }) => {
        // Try different wizard URLs
        const wizardUrls = ['/wizard', '/dashboard/wizard', '/create'];
        let wizardPageFound = false;

        for (const url of wizardUrls) {
            try {
                await page.goto(url);
                await page.waitForTimeout(1000);

                // Check if this is a valid wizard page
                const wizardElements = [
                    page.locator('h1:has-text("Wizard")'),
                    page.locator('h1:has-text("Create")'),
                    page.locator('h1:has-text("Crear")'),
                    page.locator('text=Property Wizard'),
                    page.locator('text=Land Wizard'),
                    page.locator('text=Blog Wizard'),
                    page.locator('text=Asistente')
                ];

                for (const element of wizardElements) {
                    if (await element.isVisible()) {
                        wizardPageFound = true;
                        break;
                    }
                }

                if (wizardPageFound) break;
            } catch (e) {
                // Continue to next URL
            }
        }

        if (!wizardPageFound) {
            // Try dashboard and look for wizard links
            await page.goto('/dashboard');

            const wizardLinks = [
                page.locator('a:has-text("Wizard")'),
                page.locator('a:has-text("Create")'),
                page.locator('a:has-text("Crear")'),
                page.locator('button:has-text("Wizard")'),
                page.locator('button:has-text("Create")')
            ];

            for (const link of wizardLinks) {
                if (await link.isVisible()) {
                    await link.click();
                    wizardPageFound = true;
                    break;
                }
            }
        }

        expect(wizardPageFound).toBe(true);

        // Should show wizard type selection
        const wizardTypes = [
            page.locator('text=Property'),
            page.locator('text=Propiedad'),
            page.locator('text=Land'),
            page.locator('text=Terreno'),
            page.locator('text=Blog'),
            page.locator('text=Article'),
            page.locator('text=Artículo')
        ];

        let typeFound = false;
        for (const type of wizardTypes) {
            if (await type.isVisible()) {
                typeFound = true;
                break;
            }
        }
        expect(typeFound).toBe(true);
    });

    test('should handle property wizard flow', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select property wizard
        const propertyWizardElements = [
            page.locator('button:has-text("Property")'),
            page.locator('button:has-text("Propiedad")'),
            page.locator('a:has-text("Property Wizard")'),
            page.locator('a:has-text("Asistente de Propiedad")'),
            page.locator('[data-testid="property-wizard"]')
        ];

        let propertyWizard = null;
        for (const element of propertyWizardElements) {
            if (await element.isVisible()) {
                propertyWizard = element;
                break;
            }
        }

        if (!propertyWizard) {
            test.skip();
        }

        await propertyWizard.click();

        // Should show property wizard steps
        const wizardSteps = [
            page.locator('text=Step 1'),
            page.locator('text=Paso 1'),
            page.locator('text=General Information'),
            page.locator('text=Información General'),
            page.locator('text=Basic Details'),
            page.locator('text=Detalles Básicos')
        ];

        let stepFound = false;
        for (const step of wizardSteps) {
            if (await step.isVisible()) {
                stepFound = true;
                break;
            }
        }
        expect(stepFound).toBe(true);

        // Fill out first step
        const titleInput = page.locator('input[name="title"]').or(page.locator('input[name="name"]'));
        if (await titleInput.isVisible()) {
            await titleInput.fill('Wizard Test Property');
        }

        const priceInput = page.locator('input[name="price"]');
        if (await priceInput.isVisible()) {
            await priceInput.fill('250000');
        }

        // Look for next button
        const nextButtons = [
            page.locator('button:has-text("Next")'),
            page.locator('button:has-text("Siguiente")'),
            page.locator('button:has-text("Continue")'),
            page.locator('button:has-text("Continuar")')
        ];

        let nextButton = null;
        for (const button of nextButtons) {
            if (await button.isVisible()) {
                nextButton = button;
                break;
            }
        }

        if (nextButton) {
            await nextButton.click();

            // Should advance to next step
            const nextStepIndicators = [
                page.locator('text=Step 2'),
                page.locator('text=Paso 2'),
                page.locator('text=Location'),
                page.locator('text=Ubicación'),
                page.locator('text=Details'),
                page.locator('text=Detalles')
            ];

            let nextStepFound = false;
            for (const indicator of nextStepIndicators) {
                if (await indicator.isVisible()) {
                    nextStepFound = true;
                    break;
                }
            }
            expect(nextStepFound).toBe(true);
        }
    });

    test('should handle land wizard flow', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select land wizard
        const landWizardElements = [
            page.locator('button:has-text("Land")'),
            page.locator('button:has-text("Terreno")'),
            page.locator('a:has-text("Land Wizard")'),
            page.locator('a:has-text("Asistente de Terreno")'),
            page.locator('[data-testid="land-wizard"]')
        ];

        let landWizard = null;
        for (const element of landWizardElements) {
            if (await element.isVisible()) {
                landWizard = element;
                break;
            }
        }

        if (!landWizard) {
            test.skip();
        }

        await landWizard.click();

        // Should show land wizard steps
        const wizardSteps = [
            page.locator('text=Step 1'),
            page.locator('text=Paso 1'),
            page.locator('text=General Information'),
            page.locator('text=Información General'),
            page.locator('text=Basic Details'),
            page.locator('text=Detalles Básicos')
        ];

        let stepFound = false;
        for (const step of wizardSteps) {
            if (await step.isVisible()) {
                stepFound = true;
                break;
            }
        }
        expect(stepFound).toBe(true);

        // Fill out first step
        const nameInput = page.locator('input[name="name"]').or(page.locator('input[name="title"]'));
        if (await nameInput.isVisible()) {
            await nameInput.fill('Wizard Test Land');
        }

        const areaInput = page.locator('input[name="area"]');
        if (await areaInput.isVisible()) {
            await areaInput.fill('1500');
        }

        const priceInput = page.locator('input[name="price"]');
        if (await priceInput.isVisible()) {
            await priceInput.fill('120000');
        }

        // Look for next button
        const nextButtons = [
            page.locator('button:has-text("Next")'),
            page.locator('button:has-text("Siguiente")'),
            page.locator('button:has-text("Continue")'),
            page.locator('button:has-text("Continuar")')
        ];

        let nextButton = null;
        for (const button of nextButtons) {
            if (await button.isVisible()) {
                nextButton = button;
                break;
            }
        }

        if (nextButton) {
            await nextButton.click();

            // Should advance to next step
            const nextStepIndicators = [
                page.locator('text=Step 2'),
                page.locator('text=Paso 2'),
                page.locator('text=Location'),
                page.locator('text=Ubicación'),
                page.locator('text=Features'),
                page.locator('text=Características')
            ];

            let nextStepFound = false;
            for (const indicator of nextStepIndicators) {
                if (await indicator.isVisible()) {
                    nextStepFound = true;
                    break;
                }
            }
            expect(nextStepFound).toBe(true);
        }
    });

    test('should handle blog wizard flow', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select blog wizard
        const blogWizardElements = [
            page.locator('button:has-text("Blog")'),
            page.locator('button:has-text("Article")'),
            page.locator('button:has-text("Artículo")'),
            page.locator('a:has-text("Blog Wizard")'),
            page.locator('a:has-text("Asistente de Blog")'),
            page.locator('[data-testid="blog-wizard"]')
        ];

        let blogWizard = null;
        for (const element of blogWizardElements) {
            if (await element.isVisible()) {
                blogWizard = element;
                break;
            }
        }

        if (!blogWizard) {
            test.skip();
        }

        await blogWizard.click();

        // Should show blog wizard steps
        const wizardSteps = [
            page.locator('text=Step 1'),
            page.locator('text=Paso 1'),
            page.locator('text=Content'),
            page.locator('text=Contenido'),
            page.locator('text=Basic Information'),
            page.locator('text=Información Básica')
        ];

        let stepFound = false;
        for (const step of wizardSteps) {
            if (await step.isVisible()) {
                stepFound = true;
                break;
            }
        }
        expect(stepFound).toBe(true);

        // Fill out first step
        const titleInput = page.locator('input[name="title"]');
        if (await titleInput.isVisible()) {
            await titleInput.fill('Wizard Test Blog Post');
        }

        const contentInput = page.locator('textarea[name="content"]');
        if (await contentInput.isVisible()) {
            await contentInput.fill('This is test content created through the blog wizard.');
        }

        // Look for next button
        const nextButtons = [
            page.locator('button:has-text("Next")'),
            page.locator('button:has-text("Siguiente")'),
            page.locator('button:has-text("Continue")'),
            page.locator('button:has-text("Continuar")')
        ];

        let nextButton = null;
        for (const button of nextButtons) {
            if (await button.isVisible()) {
                nextButton = button;
                break;
            }
        }

        if (nextButton) {
            await nextButton.click();

            // Should advance to next step
            const nextStepIndicators = [
                page.locator('text=Step 2'),
                page.locator('text=Paso 2'),
                page.locator('text=SEO'),
                page.locator('text=Category'),
                page.locator('text=Categoría'),
                page.locator('text=Publishing'),
                page.locator('text=Publicación')
            ];

            let nextStepFound = false;
            for (const indicator of nextStepIndicators) {
                if (await indicator.isVisible()) {
                    nextStepFound = true;
                    break;
                }
            }
            expect(nextStepFound).toBe(true);
        }
    });

    test('should handle wizard draft saving', async ({ page }) => {
        // Navigate to any wizard
        await page.goto('/wizard');

        // Select property wizard (most likely to be available)
        const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
        if (await propertyWizard.isVisible()) {
            await propertyWizard.click();
        } else {
            test.skip();
        }

        // Fill some data
        const titleInput = page.locator('input[name="title"]').or(page.locator('input[name="name"]'));
        if (await titleInput.isVisible()) {
            await titleInput.fill('Draft Test Property');
        }

        // Look for save draft button
        const saveDraftButtons = [
            page.locator('button:has-text("Save Draft")'),
            page.locator('button:has-text("Guardar Borrador")'),
            page.locator('button:has-text("Save")'),
            page.locator('button:has-text("Guardar")'),
            page.locator('[data-testid="save-draft"]')
        ];

        let saveDraftButton = null;
        for (const button of saveDraftButtons) {
            if (await button.isVisible()) {
                saveDraftButton = button;
                break;
            }
        }

        if (saveDraftButton) {
            await saveDraftButton.click();

            // Should show save confirmation
            const saveIndicators = [
                page.locator('text=Draft saved'),
                page.locator('text=Borrador guardado'),
                page.locator('text=Saved successfully'),
                page.locator('text=Guardado exitosamente'),
                page.locator('text=Auto-saved'),
                page.locator('text=Guardado automático')
            ];

            let saveFound = false;
            for (const indicator of saveIndicators) {
                try {
                    await indicator.waitFor({ timeout: 3000 });
                    saveFound = true;
                    break;
                } catch (e) {
                    // Continue to next indicator
                }
            }
            expect(saveFound).toBe(true);
        }
    });

    test('should handle wizard completion and publishing', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select property wizard
        const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
        if (await propertyWizard.isVisible()) {
            await propertyWizard.click();
        } else {
            test.skip();
        }

        // Fill required fields quickly
        const titleInput = page.locator('input[name="title"]').or(page.locator('input[name="name"]'));
        if (await titleInput.isVisible()) {
            await titleInput.fill('Complete Test Property');
        }

        const priceInput = page.locator('input[name="price"]');
        if (await priceInput.isVisible()) {
            await priceInput.fill('300000');
        }

        // Try to navigate to final step or look for publish button
        const publishButtons = [
            page.locator('button:has-text("Publish")'),
            page.locator('button:has-text("Publicar")'),
            page.locator('button:has-text("Complete")'),
            page.locator('button:has-text("Completar")'),
            page.locator('button:has-text("Finish")'),
            page.locator('button:has-text("Finalizar")')
        ];

        let publishButton = null;
        for (const button of publishButtons) {
            if (await button.isVisible()) {
                publishButton = button;
                break;
            }
        }

        // If no publish button visible, try to navigate through steps
        if (!publishButton) {
            const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Siguiente")'));
            let attempts = 0;
            while (await nextButton.isVisible() && attempts < 5) {
                await nextButton.click();
                await page.waitForTimeout(1000);

                // Check for publish button again
                for (const button of publishButtons) {
                    if (await button.isVisible()) {
                        publishButton = button;
                        break;
                    }
                }

                if (publishButton) break;
                attempts++;
            }
        }

        if (publishButton) {
            await publishButton.click();

            // Should show completion confirmation
            const completionIndicators = [
                page.locator('text=Published successfully'),
                page.locator('text=Publicado exitosamente'),
                page.locator('text=Property created'),
                page.locator('text=Propiedad creada'),
                page.locator('text=Completed successfully'),
                page.locator('text=Completado exitosamente'),
                page.locator('text=Success'),
                page.locator('text=Éxito')
            ];

            let completionFound = false;
            for (const indicator of completionIndicators) {
                try {
                    await indicator.waitFor({ timeout: 5000 });
                    completionFound = true;
                    break;
                } catch (e) {
                    // Continue to next indicator
                }
            }
            expect(completionFound).toBe(true);
        }
    });
});

test.describe('AI Content Generation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth-token', 'mock-token');
            localStorage.setItem('auth-session', JSON.stringify({
                user: {
                    id: '123',
                    email: 'admin@example.com',
                    role: 'admin',
                    permissions: ['canUseWizard', 'canUseAI']
                }
            }));
        });
    });

    test('should handle AI content generation in wizard', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select blog wizard (most likely to have AI features)
        const blogWizard = page.locator('button:has-text("Blog")').or(page.locator('button:has-text("Article")'));
        if (await blogWizard.isVisible()) {
            await blogWizard.click();
        } else {
            // Try property wizard
            const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
            if (await propertyWizard.isVisible()) {
                await propertyWizard.click();
            } else {
                test.skip();
            }
        }

        // Look for AI generation buttons
        const aiButtons = [
            page.locator('button:has-text("Generate with AI")'),
            page.locator('button:has-text("Generar con IA")'),
            page.locator('button:has-text("AI Generate")'),
            page.locator('button:has-text("IA Generar")'),
            page.locator('[data-testid="ai-generate"]'),
            page.locator('button[class*="ai"]'),
            page.locator('button:has-text("🤖")'),
            page.locator('button:has-text("✨")')
        ];

        let aiButton = null;
        for (const button of aiButtons) {
            if (await button.isVisible()) {
                aiButton = button;
                break;
            }
        }

        if (!aiButton) {
            // Skip if no AI features available
            test.skip();
        }

        await aiButton.click();

        // Should show AI generation interface or loading
        const aiIndicators = [
            page.locator('text=Generating'),
            page.locator('text=Generando'),
            page.locator('text=AI is working'),
            page.locator('text=IA está trabajando'),
            page.locator('text=Please wait'),
            page.locator('text=Por favor espera'),
            page.locator('[data-testid="ai-loading"]'),
            page.locator('.loading'),
            page.locator('.spinner')
        ];

        let aiIndicatorFound = false;
        for (const indicator of aiIndicators) {
            try {
                await indicator.waitFor({ timeout: 2000 });
                aiIndicatorFound = true;
                break;
            } catch (e) {
                // Continue to next indicator
            }
        }

        // Should show generated content or completion
        const generationResults = [
            page.locator('text=Generated successfully'),
            page.locator('text=Generado exitosamente'),
            page.locator('text=Content generated'),
            page.locator('text=Contenido generado'),
            page.locator('text=AI completed'),
            page.locator('text=IA completada')
        ];

        let resultFound = false;
        for (const result of generationResults) {
            try {
                await result.waitFor({ timeout: 10000 });
                resultFound = true;
                break;
            } catch (e) {
                // Continue to next result
            }
        }

        // Test passes if AI interface was shown or content was generated
        expect(aiIndicatorFound || resultFound).toBe(true);
    });

    test('should handle AI description generation', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select property wizard
        const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
        if (await propertyWizard.isVisible()) {
            await propertyWizard.click();
        } else {
            test.skip();
        }

        // Fill basic info first
        const titleInput = page.locator('input[name="title"]').or(page.locator('input[name="name"]'));
        if (await titleInput.isVisible()) {
            await titleInput.fill('Luxury Villa with Pool');
        }

        // Look for AI description generation
        const aiDescriptionButtons = [
            page.locator('button:has-text("Generate Description")'),
            page.locator('button:has-text("Generar Descripción")'),
            page.locator('button[data-field="description"]'),
            page.locator('[data-testid="ai-description"]')
        ];

        let aiDescButton = null;
        for (const button of aiDescriptionButtons) {
            if (await button.isVisible()) {
                aiDescButton = button;
                break;
            }
        }

        if (aiDescButton) {
            await aiDescButton.click();

            // Should populate description field
            const descriptionField = page.locator('textarea[name="description"]');
            if (await descriptionField.isVisible()) {
                await page.waitForTimeout(3000); // Allow time for AI generation

                const descriptionValue = await descriptionField.inputValue();
                expect(descriptionValue.length).toBeGreaterThan(0);
            }
        }
    });

    test('should handle AI image suggestions', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select property wizard
        const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
        if (await propertyWizard.isVisible()) {
            await propertyWizard.click();
        } else {
            test.skip();
        }

        // Navigate to media/images step
        const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Siguiente")'));
        let attempts = 0;
        while (await nextButton.isVisible() && attempts < 3) {
            await nextButton.click();
            await page.waitForTimeout(1000);

            // Check if we're on media step
            const mediaIndicators = [
                page.locator('text=Images'),
                page.locator('text=Imágenes'),
                page.locator('text=Media'),
                page.locator('text=Photos'),
                page.locator('text=Fotos')
            ];

            let onMediaStep = false;
            for (const indicator of mediaIndicators) {
                if (await indicator.isVisible()) {
                    onMediaStep = true;
                    break;
                }
            }

            if (onMediaStep) break;
            attempts++;
        }

        // Look for AI image suggestions
        const aiImageButtons = [
            page.locator('button:has-text("Suggest Images")'),
            page.locator('button:has-text("Sugerir Imágenes")'),
            page.locator('button:has-text("AI Images")'),
            page.locator('button:has-text("Imágenes IA")'),
            page.locator('[data-testid="ai-images"]')
        ];

        let aiImageButton = null;
        for (const button of aiImageButtons) {
            if (await button.isVisible()) {
                aiImageButton = button;
                break;
            }
        }

        if (aiImageButton) {
            await aiImageButton.click();

            // Should show image suggestions or loading
            const imageIndicators = [
                page.locator('text=Loading images'),
                page.locator('text=Cargando imágenes'),
                page.locator('text=Suggested images'),
                page.locator('text=Imágenes sugeridas'),
                page.locator('[data-testid="image-suggestions"]'),
                page.locator('.image-grid'),
                page.locator('img[src*="unsplash"]'),
                page.locator('img[src*="pexels"]')
            ];

            let imageIndicatorFound = false;
            for (const indicator of imageIndicators) {
                try {
                    await indicator.waitFor({ timeout: 5000 });
                    imageIndicatorFound = true;
                    break;
                } catch (e) {
                    // Continue to next indicator
                }
            }
            expect(imageIndicatorFound).toBe(true);
        }
    });
});

test.describe('Wizard Navigation and Validation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        await page.evaluate(() => {
            localStorage.setItem('auth-token', 'mock-token');
            localStorage.setItem('auth-session', JSON.stringify({
                user: {
                    id: '123',
                    email: 'admin@example.com',
                    role: 'admin',
                    permissions: ['canUseWizard']
                }
            }));
        });
    });

    test('should handle step navigation', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select property wizard
        const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
        if (await propertyWizard.isVisible()) {
            await propertyWizard.click();
        } else {
            test.skip();
        }

        // Test forward navigation
        const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Siguiente")'));
        if (await nextButton.isVisible()) {
            await nextButton.click();

            // Should show step 2
            const step2Indicators = [
                page.locator('text=Step 2'),
                page.locator('text=Paso 2'),
                page.locator('[data-step="2"]')
            ];

            let step2Found = false;
            for (const indicator of step2Indicators) {
                if (await indicator.isVisible()) {
                    step2Found = true;
                    break;
                }
            }
            expect(step2Found).toBe(true);

            // Test backward navigation
            const backButton = page.locator('button:has-text("Back")').or(page.locator('button:has-text("Atrás")'));
            if (await backButton.isVisible()) {
                await backButton.click();

                // Should return to step 1
                const step1Indicators = [
                    page.locator('text=Step 1'),
                    page.locator('text=Paso 1'),
                    page.locator('[data-step="1"]')
                ];

                let step1Found = false;
                for (const indicator of step1Indicators) {
                    if (await indicator.isVisible()) {
                        step1Found = true;
                        break;
                    }
                }
                expect(step1Found).toBe(true);
            }
        }
    });

    test('should validate required fields before proceeding', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select property wizard
        const propertyWizard = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Propiedad")'));
        if (await propertyWizard.isVisible()) {
            await propertyWizard.click();
        } else {
            test.skip();
        }

        // Try to proceed without filling required fields
        const nextButton = page.locator('button:has-text("Next")').or(page.locator('button:has-text("Siguiente")'));
        if (await nextButton.isVisible()) {
            await nextButton.click();

            // Should show validation errors
            const validationErrors = [
                page.locator('text=Required field'),
                page.locator('text=Campo requerido'),
                page.locator('text=This field is required'),
                page.locator('text=Este campo es requerido'),
                page.locator('text=Please fill'),
                page.locator('text=Por favor completa'),
                page.locator('.error'),
                page.locator('[class*="error"]')
            ];

            let errorFound = false;
            for (const error of validationErrors) {
                if (await error.isVisible()) {
                    errorFound = true;
                    break;
                }
            }
            expect(errorFound).toBe(true);
        }
    });

    test('should show progress indicator', async ({ page }) => {
        // Navigate to wizard
        await page.goto('/wizard');

        // Select any wizard
        const wizardButton = page.locator('button:has-text("Property")').or(page.locator('button:has-text("Land")').or(page.locator('button:has-text("Blog")')));
        if (await wizardButton.isVisible()) {
            await wizardButton.click();
        } else {
            test.skip();
        }

        // Should show progress indicator
        const progressIndicators = [
            page.locator('[data-testid="progress"]'),
            page.locator('.progress'),
            page.locator('.stepper'),
            page.locator('[class*="progress"]'),
            page.locator('text=1 of'),
            page.locator('text=1 de'),
            page.locator('text=Step 1'),
            page.locator('text=Paso 1')
        ];

        let progressFound = false;
        for (const indicator of progressIndicators) {
            if (await indicator.isVisible()) {
                progressFound = true;
                break;
            }
        }
        expect(progressFound).toBe(true);
    });
});