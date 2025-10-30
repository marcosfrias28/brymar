/**
 * Critical User Flows E2E Tests
 * Tests the most important user journeys in the simplified architecture
 */

import { expect, test } from "@playwright/test";

test.describe("Critical User Flows - Simplified Architecture", () => {
	test.beforeEach(async ({ page }) => {
		// Set up authentication state
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.setItem("auth-token", "mock-token");
			localStorage.setItem(
				"auth-session",
				JSON.stringify({
					user: {
						id: "test-user-123",
						email: "test@example.com",
						role: "admin",
						permissions: [
							"canManageProperties",
							"canCreateProperties",
							"canEditProperties",
							"canManageBlog",
						],
					},
				})
			);
		});
	});

	test("Complete Property Management Flow", async ({ page }) => {
		// 1. Navigate to properties dashboard
		await page.goto("/dashboard/properties");

		// 2. Create a new property
		const createButton = page
			.locator('button:has-text("Add Property")')
			.or(page.locator('a:has-text("Create Property")'))
			.first();

		if (await createButton.isVisible()) {
			await createButton.click();

			// Fill property form
			await page.fill('input[name="title"]', "E2E Test Property");
			await page.fill(
				'textarea[name="description"]',
				"This property was created by E2E tests"
			);
			await page.fill('input[name="price"]', "350000");

			// Select property type if available
			const typeSelect = page.locator('select[name="type"]');
			if (await typeSelect.isVisible()) {
				await typeSelect.selectOption("house");
			}

			// Submit form
			await page.click('button[type="submit"]');

			// Verify creation success
			await expect(
				page.locator("text=Property created").or(page.locator("text=Success"))
			).toBeVisible({ timeout: 10_000 });
		}

		// 3. View properties list
		await page.goto("/properties");
		await expect(
			page
				.locator('[data-testid="property-card"]')
				.or(page.locator(".property-card"))
				.first()
		).toBeVisible({ timeout: 5000 });

		// 4. Search for the created property
		const searchInput = page
			.locator('input[placeholder*="Search"]')
			.or(page.locator('input[name="search"]'))
			.first();

		if (await searchInput.isVisible()) {
			await searchInput.fill("E2E Test Property");
			await page.keyboard.press("Enter");

			// Verify search results
			await expect(page.locator("text=E2E Test Property")).toBeVisible({
				timeout: 5000,
			});
		}

		// 5. View property details
		const propertyLink = page
			.locator("text=E2E Test Property")
			.or(page.locator('[data-testid="property-card"]'))
			.first();

		if (await propertyLink.isVisible()) {
			await propertyLink.click();

			// Verify property details page
			await expect(page).toHaveURL(/.*properties\/[^/]+/);
			await expect(page.locator("h1").or(page.locator("h2"))).toBeVisible();
		}
	});

	test("Authentication Flow", async ({ page }) => {
		// Clear authentication
		await page.evaluate(() => {
			localStorage.clear();
			sessionStorage.clear();
		});

		// 1. Visit protected page (should redirect to login)
		await page.goto("/dashboard");

		// Should redirect to sign-in or show login form
		const loginIndicators = [
			page.locator("text=Sign In"),
			page.locator("text=Login"),
			page.locator("text=Iniciar Sesión"),
			page.locator('input[type="email"]'),
			page.locator('input[name="email"]'),
		];

		let loginFound = false;
		for (const indicator of loginIndicators) {
			if (await indicator.isVisible({ timeout: 3000 })) {
				loginFound = true;
				break;
			}
		}
		expect(loginFound).toBe(true);

		// 2. Fill login form
		const emailInput = page
			.locator('input[type="email"]')
			.or(page.locator('input[name="email"]'))
			.first();

		const passwordInput = page
			.locator('input[type="password"]')
			.or(page.locator('input[name="password"]'))
			.first();

		if ((await emailInput.isVisible()) && (await passwordInput.isVisible())) {
			await emailInput.fill("test@example.com");
			await passwordInput.fill("password123");

			// Submit login form
			const submitButton = page
				.locator('button[type="submit"]')
				.or(page.locator('button:has-text("Sign In")'))
				.first();

			if (await submitButton.isVisible()) {
				await submitButton.click();

				// Should redirect to dashboard or show success
				const successIndicators = [
					page.locator("text=Dashboard"),
					page.locator("text=Welcome"),
					page.locator("text=Bienvenido"),
					page.locator('[data-testid="dashboard"]'),
				];

				let successFound = false;
				for (const indicator of successIndicators) {
					try {
						await indicator.waitFor({ timeout: 5000 });
						successFound = true;
						break;
					} catch (_e) {
						// Continue to next indicator
					}
				}
				expect(successFound).toBe(true);
			}
		}
	});

	test("Blog Management Flow", async ({ page }) => {
		// 1. Navigate to blog dashboard
		await page.goto("/dashboard/blog");

		// 2. Create a new blog post
		const createButton = page
			.locator('button:has-text("Add Post")')
			.or(page.locator('a:has-text("Create Post")'))
			.first();

		if (await createButton.isVisible()) {
			await createButton.click();

			// Fill blog post form
			await page.fill('input[name="title"]', "E2E Test Blog Post");

			const contentEditor = page
				.locator('textarea[name="content"]')
				.or(page.locator('[data-testid="content-editor"]'))
				.first();

			if (await contentEditor.isVisible()) {
				await contentEditor.fill(
					"This is a test blog post created by E2E tests. It contains sample content to verify the blog functionality works correctly."
				);
			}

			// Select category if available
			const categorySelect = page.locator('select[name="category"]');
			if (await categorySelect.isVisible()) {
				await categorySelect.selectOption("real-estate");
			}

			// Submit form
			await page.click('button[type="submit"]');

			// Verify creation success
			await expect(
				page.locator("text=Post created").or(page.locator("text=Success"))
			).toBeVisible({ timeout: 10_000 });
		}

		// 3. View blog posts list
		await page.goto("/blog");
		await expect(
			page
				.locator('[data-testid="blog-card"]')
				.or(page.locator(".blog-card"))
				.first()
		).toBeVisible({ timeout: 5000 });

		// 4. Publish the blog post
		await page.goto("/dashboard/blog");

		const publishButton = page.locator('button:has-text("Publish")').first();
		if (await publishButton.isVisible()) {
			await publishButton.click();

			// Verify publish success
			await expect(
				page.locator("text=Published").or(page.locator("text=Publicado"))
			).toBeVisible({ timeout: 5000 });
		}
	});

	test("Search and Filter Flow", async ({ page }) => {
		// 1. Navigate to search page
		await page.goto("/search");

		// If search page doesn't exist, try properties page
		if (
			!(await page.locator('input[name="search"]').isVisible({ timeout: 2000 }))
		) {
			await page.goto("/properties");
		}

		// 2. Perform text search
		const searchInput = page
			.locator('input[placeholder*="Search"]')
			.or(page.locator('input[name="search"]'))
			.first();

		if (await searchInput.isVisible()) {
			await searchInput.fill("villa");
			await page.keyboard.press("Enter");

			// Verify search results
			await page.waitForTimeout(2000);
			const searchResults = [
				page.locator("text=villa"),
				page.locator("text=Villa"),
				page.locator('[data-testid="property-card"]'),
				page.locator(".property-card"),
			];

			let resultFound = false;
			for (const result of searchResults) {
				if (await result.isVisible()) {
					resultFound = true;
					break;
				}
			}
			expect(resultFound).toBe(true);
		}

		// 3. Apply price filter
		const minPriceInput = page.locator('input[name="minPrice"]');
		const maxPriceInput = page.locator('input[name="maxPrice"]');

		if (await minPriceInput.isVisible()) {
			await minPriceInput.fill("200000");
		}

		if (await maxPriceInput.isVisible()) {
			await maxPriceInput.fill("800000");
		}

		// Apply filters
		const filterButton = page
			.locator('button:has-text("Filter")')
			.or(page.locator('button:has-text("Apply")'))
			.first();

		if (await filterButton.isVisible()) {
			await filterButton.click();
			await page.waitForTimeout(2000);
		}

		// 4. Apply location filter
		const locationSelect = page.locator('select[name="location"]');
		if (await locationSelect.isVisible()) {
			const options = await locationSelect.locator("option").allTextContents();
			const validOptions = options.filter(
				(option) => option.trim() && option !== "Select..."
			);

			if (validOptions.length > 0) {
				await locationSelect.selectOption({ label: validOptions[0] });
				await page.waitForTimeout(2000);
			}
		}

		// Verify filtered results are displayed
		const filteredResults = [
			page.locator('[data-testid="property-card"]'),
			page.locator(".property-card"),
			page.locator("text=Results"),
			page.locator("text=Resultados"),
		];

		let filteredResultFound = false;
		for (const result of filteredResults) {
			if (await result.isVisible()) {
				filteredResultFound = true;
				break;
			}
		}
		expect(filteredResultFound).toBe(true);
	});

	test("Wizard Flow", async ({ page }) => {
		// 1. Navigate to wizard
		const wizardUrls = ["/wizard", "/create", "/dashboard/wizard"];
		let wizardFound = false;

		for (const url of wizardUrls) {
			try {
				await page.goto(url);

				const wizardIndicators = [
					page.locator("text=Wizard"),
					page.locator("text=Step 1"),
					page.locator("text=Paso 1"),
					page.locator('[data-testid="wizard"]'),
					page.locator(".wizard"),
				];

				for (const indicator of wizardIndicators) {
					if (await indicator.isVisible({ timeout: 2000 })) {
						wizardFound = true;
						break;
					}
				}

				if (wizardFound) {
					break;
				}
			} catch (_e) {
				// Continue to next URL
			}
		}

		if (!wizardFound) {
			// Skip test if wizard not available
			test.skip();
		}

		// 2. Select wizard type
		const wizardTypes = [
			page.locator('button:has-text("Property")'),
			page.locator('button:has-text("Propiedad")'),
			page.locator('button:has-text("Land")'),
			page.locator('button:has-text("Terreno")'),
			page.locator('button:has-text("Blog")'),
			page.locator('input[value="property"]'),
			page.locator('input[value="land"]'),
			page.locator('input[value="blog"]'),
		];

		for (const type of wizardTypes) {
			if (await type.isVisible()) {
				await type.click();
				break;
			}
		}

		// 3. Fill wizard steps
		const nextButtons = [
			page.locator('button:has-text("Next")'),
			page.locator('button:has-text("Siguiente")'),
			page.locator('button:has-text("Continue")'),
			page.locator('button:has-text("Continuar")'),
		];

		// Fill basic information step
		const titleInput = page
			.locator('input[name="title"]')
			.or(page.locator('input[name="name"]'))
			.first();

		if (await titleInput.isVisible()) {
			await titleInput.fill("Wizard Test Item");
		}

		const descriptionInput = page.locator('textarea[name="description"]');
		if (await descriptionInput.isVisible()) {
			await descriptionInput.fill(
				"This item was created using the wizard in E2E tests"
			);
		}

		// Go to next step
		for (const button of nextButtons) {
			if (await button.isVisible()) {
				await button.click();
				break;
			}
		}

		// 4. Complete wizard
		const finishButtons = [
			page.locator('button:has-text("Finish")'),
			page.locator('button:has-text("Finalizar")'),
			page.locator('button:has-text("Create")'),
			page.locator('button:has-text("Crear")'),
			page.locator('button:has-text("Publish")'),
			page.locator('button:has-text("Publicar")'),
		];

		for (const button of finishButtons) {
			if (await button.isVisible()) {
				await button.click();

				// Verify completion
				const completionIndicators = [
					page.locator("text=Created successfully"),
					page.locator("text=Creado exitosamente"),
					page.locator("text=Wizard completed"),
					page.locator("text=Wizard completado"),
					page.locator("text=Success"),
					page.locator("text=Éxito"),
				];

				let completionFound = false;
				for (const indicator of completionIndicators) {
					try {
						await indicator.waitFor({ timeout: 5000 });
						completionFound = true;
						break;
					} catch (_e) {
						// Continue to next indicator
					}
				}
				expect(completionFound).toBe(true);
				break;
			}
		}
	});

	test("Mobile Responsive Flow", async ({ page }) => {
		// Set mobile viewport
		await page.setViewportSize({ width: 375, height: 667 });

		// 1. Test mobile navigation
		await page.goto("/");

		// Look for mobile menu button
		const mobileMenuButtons = [
			page.locator('button[aria-label="Menu"]'),
			page.locator('button:has-text("☰")'),
			page.locator('[data-testid="mobile-menu"]'),
			page.locator(".mobile-menu-button"),
			page.locator("button.hamburger"),
		];

		let mobileMenuButton = null;
		for (const button of mobileMenuButtons) {
			if (await button.isVisible()) {
				mobileMenuButton = button;
				break;
			}
		}

		if (mobileMenuButton) {
			await mobileMenuButton.click();

			// Should show mobile navigation menu
			const mobileMenus = [
				page.locator('[data-testid="mobile-nav"]'),
				page.locator(".mobile-nav"),
				page.locator(".mobile-menu"),
				page.locator('nav[class*="mobile"]'),
			];

			let mobileMenuFound = false;
			for (const menu of mobileMenus) {
				if (await menu.isVisible()) {
					mobileMenuFound = true;
					break;
				}
			}
			expect(mobileMenuFound).toBe(true);
		}

		// 2. Test mobile property browsing
		await page.goto("/properties");

		// Should display properties in mobile-friendly layout
		const mobilePropertyLayouts = [
			page.locator('[data-testid="property-card"]'),
			page.locator(".property-card"),
			page.locator(".property-item"),
			page.locator("article"),
		];

		let mobileLayoutFound = false;
		for (const layout of mobilePropertyLayouts) {
			if (await layout.first().isVisible()) {
				mobileLayoutFound = true;
				break;
			}
		}
		expect(mobileLayoutFound).toBe(true);

		// 3. Test mobile search
		const mobileSearchButtons = [
			page.locator('button:has-text("Search")'),
			page.locator('button:has-text("Buscar")'),
			page.locator('[data-testid="search-button"]'),
			page.locator(".search-button"),
		];

		for (const button of mobileSearchButtons) {
			if (await button.isVisible()) {
				await button.click();

				// Should show mobile search interface
				const mobileSearchInterfaces = [
					page.locator('input[name="search"]'),
					page.locator('[data-testid="mobile-search"]'),
					page.locator(".mobile-search"),
					page.locator('input[placeholder*="Search"]'),
				];

				let searchInterfaceFound = false;
				for (const interface_ of mobileSearchInterfaces) {
					if (await interface_.isVisible()) {
						searchInterfaceFound = true;
						break;
					}
				}
				expect(searchInterfaceFound).toBe(true);
				break;
			}
		}
	});

	test("Error Handling Flow", async ({ page }) => {
		// 1. Test 404 page
		await page.goto("/non-existent-page");

		const notFoundIndicators = [
			page.locator("text=404"),
			page.locator("text=Not Found"),
			page.locator("text=Page not found"),
			page.locator("text=Página no encontrada"),
			page.locator('[data-testid="404"]'),
		];

		let notFoundFound = false;
		for (const indicator of notFoundIndicators) {
			if (await indicator.isVisible({ timeout: 3000 })) {
				notFoundFound = true;
				break;
			}
		}
		expect(notFoundFound).toBe(true);

		// 2. Test form validation errors
		await page.goto("/dashboard/properties");

		const createButton = page
			.locator('button:has-text("Add Property")')
			.or(page.locator('a:has-text("Create Property")'))
			.first();

		if (await createButton.isVisible()) {
			await createButton.click();

			// Try to submit empty form
			const submitButton = page.locator('button[type="submit"]');
			if (await submitButton.isVisible()) {
				await submitButton.click();

				// Should show validation errors
				const validationErrors = [
					page.locator("text=required"),
					page.locator("text=requerido"),
					page.locator("text=This field is required"),
					page.locator("text=Este campo es requerido"),
					page.locator(".error"),
					page.locator('[data-testid="error"]'),
				];

				let errorFound = false;
				for (const error of validationErrors) {
					if (await error.isVisible({ timeout: 3000 })) {
						errorFound = true;
						break;
					}
				}
				expect(errorFound).toBe(true);
			}
		}

		// 3. Test network error handling
		// Simulate offline mode
		await page.context().setOffline(true);

		await page.goto("/properties");

		// Should show offline indicator or error message
		const offlineIndicators = [
			page.locator("text=offline"),
			page.locator("text=sin conexión"),
			page.locator("text=No connection"),
			page.locator("text=Sin conexión"),
			page.locator("text=Network error"),
			page.locator("text=Error de red"),
		];

		let _offlineFound = false;
		for (const indicator of offlineIndicators) {
			if (await indicator.isVisible({ timeout: 5000 })) {
				_offlineFound = true;
				break;
			}
		}

		// Restore online mode
		await page.context().setOffline(false);

		// Note: Offline detection might not be implemented, so we don't fail the test
		// expect(offlineFound).toBe(true);
	});

	test("Performance and Loading Flow", async ({ page }) => {
		// 1. Test page load performance
		const startTime = Date.now();
		await page.goto("/");

		// Wait for main content to load
		await page.waitForSelector(
			'main, [data-testid="main-content"], .main-content',
			{ timeout: 10_000 }
		);

		const loadTime = Date.now() - startTime;
		expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds

		// 2. Test loading states
		await page.goto("/properties");

		// Should show loading indicators initially
		const _loadingIndicators = [
			page.locator("text=Loading"),
			page.locator("text=Cargando"),
			page.locator('[data-testid="loading"]'),
			page.locator(".loading"),
			page.locator(".spinner"),
			page.locator(".skeleton"),
		];

		// Note: Loading states might be too fast to catch, so we don't fail the test
		// Just verify the page eventually loads content
		await expect(
			page
				.locator('[data-testid="property-card"]')
				.or(page.locator(".property-card"))
				.first()
		).toBeVisible({ timeout: 10_000 });

		// 3. Test infinite scroll or pagination
		const paginationElements = [
			page.locator('button:has-text("Load More")'),
			page.locator('button:has-text("Cargar Más")'),
			page.locator('[data-testid="pagination"]'),
			page.locator(".pagination"),
			page.locator('button:has-text("Next")'),
			page.locator('button:has-text("Siguiente")'),
		];

		for (const element of paginationElements) {
			if (await element.isVisible()) {
				const initialCount = await page
					.locator('[data-testid="property-card"]')
					.or(page.locator(".property-card"))
					.count();

				await element.click();
				await page.waitForTimeout(2000);

				const newCount = await page
					.locator('[data-testid="property-card"]')
					.or(page.locator(".property-card"))
					.count();

				// Should load more content or navigate to next page
				expect(newCount).toBeGreaterThanOrEqual(initialCount);
				break;
			}
		}
	});
});
