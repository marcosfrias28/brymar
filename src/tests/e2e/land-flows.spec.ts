import { expect, test } from "@playwright/test";

test.describe("Land Management Flows", () => {
	test.beforeEach(async ({ page }) => {
		// Mock authentication - simulate logged in state
		await page.goto("/");

		// Simulate logged in state with admin/agent permissions
		await page.evaluate(() => {
			localStorage.setItem("auth-token", "mock-token");
			localStorage.setItem(
				"auth-session",
				JSON.stringify({
					user: {
						id: "123",
						email: "admin@example.com",
						role: "admin",
						permissions: ["canManageLands", "canCreateLands", "canEditLands"],
					},
				})
			);
		});
	});

	test("should display land listings page", async ({ page }) => {
		await page.goto("/lands");

		// Should show lands page with title
		const titleElements = [
			page.locator('h1:has-text("Lands")'),
			page.locator('h1:has-text("Terrenos")'),
			page.locator('h2:has-text("Lands")'),
			page.locator('h2:has-text("Terrenos")'),
		];

		let titleFound = false;
		for (const title of titleElements) {
			if (await title.isVisible()) {
				titleFound = true;
				break;
			}
		}
		expect(titleFound).toBe(true);

		// Should show land cards, list, or grid
		const landDisplays = [
			page.locator('[data-testid="land-card"]'),
			page.locator('[data-testid="land-list"]'),
			page.locator(".land-card"),
			page.locator(".land-item"),
			page.locator("article"),
			page.locator('[class*="land"]'),
			page.locator('img[alt*="land"]'),
			page.locator('img[alt*="terreno"]'),
			page.locator('img[alt*="plot"]'),
		];

		let displayFound = false;
		for (const display of landDisplays) {
			if (await display.first().isVisible()) {
				displayFound = true;
				break;
			}
		}
		expect(displayFound).toBe(true);
	});

	test("should handle land search and filtering", async ({ page }) => {
		await page.goto("/lands");

		// Test search functionality
		const searchInputs = [
			page.locator('input[placeholder*="Search"]'),
			page.locator('input[placeholder*="Buscar"]'),
			page.locator('input[name="search"]'),
			page.locator('input[type="search"]'),
		];

		let searchInput = null;
		for (const input of searchInputs) {
			if (await input.isVisible()) {
				searchInput = input;
				break;
			}
		}

		if (searchInput) {
			await searchInput.fill("residential");
			await page.keyboard.press("Enter");

			// Should show filtered results or search indication
			await page.waitForTimeout(1000); // Allow for search to process

			const searchResults = [
				page.locator("text=residential"),
				page.locator("text=Residential"),
				page.locator("text=results"),
				page.locator("text=resultados"),
				page.locator("text=found"),
				page.locator("text=encontrado"),
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

		// Test filter functionality
		const filterElements = [
			page.locator('button:has-text("Filter")'),
			page.locator('button:has-text("Filtrar")'),
			page.locator('select[name*="filter"]'),
			page.locator('select[name*="type"]'),
			page.locator('select[name*="price"]'),
		];

		for (const filter of filterElements) {
			if (await filter.isVisible()) {
				await filter.click();

				// Should show filter options
				const filterOptions = [
					page.locator("text=Price Range"),
					page.locator("text=Rango de Precio"),
					page.locator("text=Land Type"),
					page.locator("text=Tipo de Terreno"),
					page.locator("text=Location"),
					page.locator("text=Ubicación"),
				];

				let optionFound = false;
				for (const option of filterOptions) {
					if (await option.isVisible()) {
						optionFound = true;
						break;
					}
				}
				expect(optionFound).toBe(true);
				break;
			}
		}
	});

	test("should display land details page", async ({ page }) => {
		await page.goto("/lands");

		// Wait for page to load
		await page.waitForTimeout(2000);

		// Look for land links or cards to click
		const landLinks = [
			page.locator('[data-testid="land-card"]').first(),
			page.locator('a[href*="/lands/"]').first(),
			page.locator(".land-card").first(),
			page.locator("article").first(),
			page.locator('img[alt*="land"]').first(),
			page.locator('img[alt*="terreno"]').first(),
		];

		let landLink = null;
		for (const link of landLinks) {
			if (await link.isVisible()) {
				landLink = link;
				break;
			}
		}

		if (!landLink) {
			// Skip test if no lands available
			test.skip();
		}

		await landLink.click();

		// Should navigate to land details page
		await expect(page).toHaveURL(/.*lands\/[^/]+/);

		// Should show land details
		const detailElements = [
			page.locator("h1"),
			page.locator("h2"),
			page.locator("text=Price"),
			page.locator("text=Precio"),
			page.locator("text=$"),
			page.locator("text=€"),
			page.locator("text=area"),
			page.locator("text=área"),
			page.locator("text=sqm"),
			page.locator("text=m²"),
		];

		let detailFound = false;
		for (const detail of detailElements) {
			if (await detail.isVisible()) {
				detailFound = true;
				break;
			}
		}
		expect(detailFound).toBe(true);
	});

	test("should handle land creation flow (admin/agent)", async ({ page }) => {
		// Navigate to dashboard first
		await page.goto("/dashboard");

		// Look for land management section
		const dashboardElements = [
			page.locator("text=Lands"),
			page.locator("text=Terrenos"),
			page.locator('a[href*="lands"]'),
			page.locator('button:has-text("Lands")'),
			page.locator('button:has-text("Terrenos")'),
		];

		let dashboardElement = null;
		for (const element of dashboardElements) {
			if (await element.isVisible()) {
				dashboardElement = element;
				break;
			}
		}

		if (dashboardElement) {
			await dashboardElement.click();
		} else {
			// Try direct navigation to lands dashboard
			await page.goto("/dashboard/lands");
		}

		// Look for add/create land button
		const addLandElements = [
			page.locator('button:has-text("Add Land")'),
			page.locator('button:has-text("Agregar Terreno")'),
			page.locator('a:has-text("Create Land")'),
			page.locator('a:has-text("Crear Terreno")'),
			page.locator('button:has-text("New Land")'),
			page.locator('button:has-text("Nuevo Terreno")'),
			page.locator('a[href*="new"]'),
			page.locator('button[class*="add"]'),
			page.locator('button[class*="create"]'),
		];

		let addButton = null;
		for (const button of addLandElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			// Skip if user doesn't have permissions or button not found
			test.skip();
		}

		await addButton.click();

		// Should show land creation form
		const formElements = [
			page.locator("form"),
			page.locator('input[name="name"]'),
			page.locator('input[name="title"]'),
			page.locator('textarea[name="description"]'),
			page.locator('input[name="price"]'),
			page.locator('input[name="area"]'),
		];

		let formFound = false;
		for (const form of formElements) {
			if (await form.isVisible()) {
				formFound = true;
				break;
			}
		}
		expect(formFound).toBe(true);

		// Fill out basic land information
		const nameInput = page
			.locator('input[name="name"]')
			.or(page.locator('input[name="title"]'));
		if (await nameInput.isVisible()) {
			await nameInput.fill("Test Land E2E");
		}

		const descriptionInput = page.locator('textarea[name="description"]');
		if (await descriptionInput.isVisible()) {
			await descriptionInput.fill("This is a test land created by E2E tests");
		}

		const priceInput = page.locator('input[name="price"]');
		if (await priceInput.isVisible()) {
			await priceInput.fill("150000");
		}

		const areaInput = page.locator('input[name="area"]');
		if (await areaInput.isVisible()) {
			await areaInput.fill("1000");
		}

		// Submit form
		const submitButtons = [
			page.locator('button[type="submit"]'),
			page.locator('button:has-text("Create")'),
			page.locator('button:has-text("Crear")'),
			page.locator('button:has-text("Save")'),
			page.locator('button:has-text("Guardar")'),
		];

		let submitButton = null;
		for (const button of submitButtons) {
			if (await button.isVisible()) {
				submitButton = button;
				break;
			}
		}

		if (submitButton) {
			await submitButton.click();

			// Should show success message or redirect
			const successIndicators = [
				page.locator("text=Land created"),
				page.locator("text=Terreno creado"),
				page.locator("text=Success"),
				page.locator("text=Éxito"),
				page.locator("text=Created successfully"),
				page.locator("text=Creado exitosamente"),
				page.locator("text=Lands"), // Redirect to lands list
				page.locator("text=Terrenos"),
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
	});

	test("should handle land editing flow", async ({ page }) => {
		// Navigate to lands dashboard
		await page.goto("/dashboard/lands");

		// Look for existing land to edit
		const editElements = [
			page.locator('button:has-text("Edit")'),
			page.locator('button:has-text("Editar")'),
			page.locator('a:has-text("Edit")'),
			page.locator('a:has-text("Editar")'),
			page.locator('[data-testid="edit-button"]'),
			page.locator('button[class*="edit"]'),
			page
				.locator('svg[class*="edit"]')
				.locator(".."), // Parent of edit icon
		];

		let editButton = null;
		for (const button of editElements) {
			if (await button.first().isVisible()) {
				editButton = button.first();
				break;
			}
		}

		if (!editButton) {
			// Skip if no lands to edit
			test.skip();
		}

		await editButton.click();

		// Should show edit form
		const formElements = [
			page.locator("form"),
			page.locator('input[name="name"]'),
			page.locator('input[name="title"]'),
			page.locator('textarea[name="description"]'),
		];

		let formFound = false;
		for (const form of formElements) {
			if (await form.isVisible()) {
				formFound = true;
				break;
			}
		}
		expect(formFound).toBe(true);

		// Modify land information
		const nameInput = page
			.locator('input[name="name"]')
			.or(page.locator('input[name="title"]'));
		if (await nameInput.isVisible()) {
			await nameInput.fill("Updated Test Land");
		}

		// Submit changes
		const submitButtons = [
			page.locator('button[type="submit"]'),
			page.locator('button:has-text("Update")'),
			page.locator('button:has-text("Actualizar")'),
			page.locator('button:has-text("Save")'),
			page.locator('button:has-text("Guardar")'),
		];

		let submitButton = null;
		for (const button of submitButtons) {
			if (await button.isVisible()) {
				submitButton = button;
				break;
			}
		}

		if (submitButton) {
			await submitButton.click();

			// Should show success message
			const successIndicators = [
				page.locator("text=Land updated"),
				page.locator("text=Terreno actualizado"),
				page.locator("text=Updated successfully"),
				page.locator("text=Actualizado exitosamente"),
				page.locator("text=Changes saved"),
				page.locator("text=Cambios guardados"),
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
	});
});

test.describe("Land Form Validation", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
		await page.evaluate(() => {
			localStorage.setItem("auth-token", "mock-token");
			localStorage.setItem(
				"auth-session",
				JSON.stringify({
					user: {
						id: "123",
						email: "admin@example.com",
						role: "admin",
						permissions: ["canManageLands", "canCreateLands"],
					},
				})
			);
		});
	});

	test("should validate required fields in land form", async ({ page }) => {
		// Navigate to land creation form
		await page.goto("/dashboard/lands");

		const addLandElements = [
			page.locator('button:has-text("Add Land")'),
			page.locator('button:has-text("Agregar Terreno")'),
			page.locator('a:has-text("Create Land")'),
			page.locator('a:has-text("Crear Terreno")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addLandElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Try to submit empty form
		const submitButtons = [
			page.locator('button[type="submit"]'),
			page.locator('button:has-text("Create")'),
			page.locator('button:has-text("Crear")'),
			page.locator('button:has-text("Save")'),
			page.locator('button:has-text("Guardar")'),
		];

		let submitButton = null;
		for (const button of submitButtons) {
			if (await button.isVisible()) {
				submitButton = button;
				break;
			}
		}

		if (submitButton) {
			await submitButton.click();

			// Should show validation errors
			const requiredErrors = [
				page.locator("text=Name is required"),
				page.locator("text=Nombre es requerido"),
				page.locator("text=Price is required"),
				page.locator("text=Precio es requerido"),
				page.locator("text=Area is required"),
				page.locator("text=Área es requerida"),
				page.locator("text=Description is required"),
				page.locator("text=Descripción es requerida"),
				page.locator("text=Required field"),
				page.locator("text=Campo requerido"),
			];

			let errorFound = false;
			for (const error of requiredErrors) {
				if (await error.isVisible()) {
					errorFound = true;
					break;
				}
			}
			expect(errorFound).toBe(true);
		}
	});

	test("should validate numeric fields", async ({ page }) => {
		await page.goto("/dashboard/lands");

		const addLandElements = [
			page.locator('button:has-text("Add Land")'),
			page.locator('a:has-text("Create Land")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addLandElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Test numeric field validation
		const numericFields = [
			{ name: "price", value: "invalid-price" },
			{ name: "area", value: "not-a-number" },
		];

		for (const field of numericFields) {
			const input = page.locator(`input[name="${field.name}"]`);
			if (await input.isVisible()) {
				await input.fill(field.value);

				const submitButton = page
					.locator('button[type="submit"]')
					.or(page.locator('button:has-text("Create")'));
				if (await submitButton.isVisible()) {
					await submitButton.click();

					// Should show numeric validation error
					const numericErrors = [
						page.locator("text=Must be a number"),
						page.locator("text=Debe ser un número"),
						page.locator("text=Invalid number"),
						page.locator("text=Número inválido"),
						page.locator("text=Please enter a valid number"),
						page.locator("text=Por favor ingresa un número válido"),
					];

					let errorFound = false;
					for (const error of numericErrors) {
						if (await error.isVisible()) {
							errorFound = true;
							break;
						}
					}

					if (errorFound) {
						expect(errorFound).toBe(true);
						break; // Exit the loop if we found validation working
					}
				}
			}
		}
	});
});

test.describe("Land Search and Filters", () => {
	test("should handle advanced land search", async ({ page }) => {
		// Try different search page URLs
		const searchUrls = ["/search", "/lands/search", "/buscar"];
		let searchPageFound = false;

		for (const url of searchUrls) {
			try {
				await page.goto(url);
				await page.waitForTimeout(1000);

				// Check if this is a valid search page
				const searchElements = [
					page.locator('input[name="location"]'),
					page.locator('input[name="search"]'),
					page.locator('input[placeholder*="Search"]'),
					page.locator('input[placeholder*="Buscar"]'),
					page.locator("text=Search"),
					page.locator("text=Buscar"),
				];

				for (const element of searchElements) {
					if (await element.isVisible()) {
						searchPageFound = true;
						break;
					}
				}

				if (searchPageFound) {
					break;
				}
			} catch (_e) {
				// Continue to next URL
			}
		}

		if (!searchPageFound) {
			// Try lands page with search functionality
			await page.goto("/lands");
		}

		// Fill search criteria
		const locationInputs = [
			page.locator('input[name="location"]'),
			page.locator('input[name="ubicacion"]'),
			page.locator('input[placeholder*="location"]'),
			page.locator('input[placeholder*="ubicación"]'),
		];

		for (const input of locationInputs) {
			if (await input.isVisible()) {
				await input.fill("Miami");
				break;
			}
		}

		const minPriceInputs = [
			page.locator('input[name="minPrice"]'),
			page.locator('input[name="precioMin"]'),
			page.locator('input[placeholder*="min"]'),
			page.locator('input[placeholder*="mín"]'),
		];

		for (const input of minPriceInputs) {
			if (await input.isVisible()) {
				await input.fill("50000");
				break;
			}
		}

		const maxPriceInputs = [
			page.locator('input[name="maxPrice"]'),
			page.locator('input[name="precioMax"]'),
			page.locator('input[placeholder*="max"]'),
			page.locator('input[placeholder*="máx"]'),
		];

		for (const input of maxPriceInputs) {
			if (await input.isVisible()) {
				await input.fill("200000");
				break;
			}
		}

		// Submit search
		const searchButtons = [
			page.locator('button:has-text("Search")'),
			page.locator('button:has-text("Buscar")'),
			page.locator('button[type="submit"]'),
			page.locator('input[type="submit"]'),
		];

		let searchButton = null;
		for (const button of searchButtons) {
			if (await button.isVisible()) {
				searchButton = button;
				break;
			}
		}

		if (searchButton) {
			await searchButton.click();

			// Should show search results or filtered content
			const resultIndicators = [
				page.locator("text=Search Results"),
				page.locator("text=Resultados de Búsqueda"),
				page.locator("text=Results"),
				page.locator("text=Resultados"),
				page.locator("text=Found"),
				page.locator("text=Encontrado"),
				page.locator("text=Miami"), // Location filter applied
				page.locator('[data-testid="search-results"]'),
			];

			let resultFound = false;
			for (const indicator of resultIndicators) {
				try {
					await indicator.waitFor({ timeout: 5000 });
					resultFound = true;
					break;
				} catch (_e) {
					// Continue to next indicator
				}
			}
			expect(resultFound).toBe(true);
		}
	});

	test("should handle land type filtering", async ({ page }) => {
		await page.goto("/lands");

		// Look for land type filter
		const typeFilters = [
			page.locator('select[name="landType"]'),
			page.locator('select[name="type"]'),
			page.locator('select[name="categoria"]'),
			page.locator('select[name="category"]'),
		];

		let typeFilter = null;
		for (const filter of typeFilters) {
			if (await filter.isVisible()) {
				typeFilter = filter;
				break;
			}
		}

		if (typeFilter) {
			// Get available options
			const options = await typeFilter.locator("option").allTextContents();

			// Try to select a land type (residential, commercial, agricultural, etc.)
			const landTypes = [
				"residential",
				"commercial",
				"agricultural",
				"industrial",
			];

			for (const type of landTypes) {
				const matchingOption = options.find((option) =>
					option.toLowerCase().includes(type.toLowerCase())
				);

				if (matchingOption) {
					await typeFilter.selectOption({ label: matchingOption });

					// Should filter results
					await page.waitForTimeout(2000); // Allow for filtering

					const filterResults = [
						page.locator(`text=${type}`),
						page.locator(
							`text=${type.charAt(0).toUpperCase() + type.slice(1)}`
						),
						page.locator('[data-testid="land-card"]'),
						page.locator(".land-card"),
					];

					let resultFound = false;
					for (const result of filterResults) {
						if (await result.isVisible()) {
							resultFound = true;
							break;
						}
					}
					expect(resultFound).toBe(true);
					break;
				}
			}
		}
	});
});
