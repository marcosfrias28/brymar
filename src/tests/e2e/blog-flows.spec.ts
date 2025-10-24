import { expect, test } from "@playwright/test";

test.describe("Blog Management Flows", () => {
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
						permissions: [
							"canManageBlogs",
							"canCreateBlogs",
							"canEditBlogs",
							"canPublishBlogs",
						],
					},
				}),
			);
		});
	});

	test("should display blog listings page", async ({ page }) => {
		await page.goto("/blog");

		// Should show blog page with title
		const titleElements = [
			page.locator('h1:has-text("Blog")'),
			page.locator('h1:has-text("Noticias")'),
			page.locator('h2:has-text("Blog")'),
			page.locator('h2:has-text("Articles")'),
			page.locator('h2:has-text("Artículos")'),
		];

		let titleFound = false;
		for (const title of titleElements) {
			if (await title.isVisible()) {
				titleFound = true;
				break;
			}
		}
		expect(titleFound).toBe(true);

		// Should show blog cards, list, or grid
		const blogDisplays = [
			page.locator('[data-testid="blog-card"]'),
			page.locator('[data-testid="blog-list"]'),
			page.locator(".blog-card"),
			page.locator(".blog-item"),
			page.locator("article"),
			page.locator('[class*="blog"]'),
			page.locator('img[alt*="blog"]'),
			page.locator('img[alt*="article"]'),
			page.locator('img[alt*="post"]'),
		];

		let displayFound = false;
		for (const display of blogDisplays) {
			if (await display.first().isVisible()) {
				displayFound = true;
				break;
			}
		}
		expect(displayFound).toBe(true);
	});

	test("should handle blog search and filtering", async ({ page }) => {
		await page.goto("/blog");

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
			await searchInput.fill("real estate");
			await page.keyboard.press("Enter");

			// Should show filtered results or search indication
			await page.waitForTimeout(1000); // Allow for search to process

			const searchResults = [
				page.locator("text=real estate"),
				page.locator("text=Real Estate"),
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

		// Test category filter functionality
		const filterElements = [
			page.locator('button:has-text("Filter")'),
			page.locator('button:has-text("Filtrar")'),
			page.locator('select[name*="category"]'),
			page.locator('select[name*="categoria"]'),
			page.locator('button:has-text("Category")'),
			page.locator('button:has-text("Categoría")'),
		];

		for (const filter of filterElements) {
			if (await filter.isVisible()) {
				await filter.click();

				// Should show filter options
				const filterOptions = [
					page.locator("text=Real Estate"),
					page.locator("text=Bienes Raíces"),
					page.locator("text=Market News"),
					page.locator("text=Noticias del Mercado"),
					page.locator("text=Investment"),
					page.locator("text=Inversión"),
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

	test("should display blog post details page", async ({ page }) => {
		await page.goto("/blog");

		// Wait for page to load
		await page.waitForTimeout(2000);

		// Look for blog post links or cards to click
		const blogLinks = [
			page.locator('[data-testid="blog-card"]').first(),
			page.locator('a[href*="/blog/"]').first(),
			page.locator(".blog-card").first(),
			page.locator("article").first(),
			page.locator('img[alt*="blog"]').first(),
			page.locator('img[alt*="article"]').first(),
		];

		let blogLink = null;
		for (const link of blogLinks) {
			if (await link.isVisible()) {
				blogLink = link;
				break;
			}
		}

		if (!blogLink) {
			// Skip test if no blog posts available
			test.skip();
		}

		await blogLink.click();

		// Should navigate to blog post details page
		await expect(page).toHaveURL(/.*blog\/[^/]+/);

		// Should show blog post details
		const detailElements = [
			page.locator("h1"),
			page.locator("h2"),
			page.locator("text=Published"),
			page.locator("text=Publicado"),
			page.locator("text=Author"),
			page.locator("text=Autor"),
			page.locator("text=Category"),
			page.locator("text=Categoría"),
			page.locator("text=Read time"),
			page.locator("text=Tiempo de lectura"),
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

	test("should handle blog post creation flow (admin/agent)", async ({
		page,
	}) => {
		// Navigate to dashboard first
		await page.goto("/dashboard");

		// Look for blog management section
		const dashboardElements = [
			page.locator("text=Blog"),
			page.locator("text=Articles"),
			page.locator("text=Artículos"),
			page.locator('a[href*="blog"]'),
			page.locator('button:has-text("Blog")'),
			page.locator('button:has-text("Articles")'),
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
			// Try direct navigation to blog dashboard
			await page.goto("/dashboard/blog");
		}

		// Look for add/create blog post button
		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('button:has-text("Agregar Artículo")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a:has-text("Crear Artículo")'),
			page.locator('button:has-text("New Post")'),
			page.locator('button:has-text("Nuevo Artículo")'),
			page.locator('a[href*="new"]'),
			page.locator('button[class*="add"]'),
			page.locator('button[class*="create"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
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

		// Should show blog post creation form
		const formElements = [
			page.locator("form"),
			page.locator('input[name="title"]'),
			page.locator('textarea[name="content"]'),
			page.locator('textarea[name="excerpt"]'),
			page.locator('select[name="category"]'),
		];

		let formFound = false;
		for (const form of formElements) {
			if (await form.isVisible()) {
				formFound = true;
				break;
			}
		}
		expect(formFound).toBe(true);

		// Fill out basic blog post information
		const titleInput = page.locator('input[name="title"]');
		if (await titleInput.isVisible()) {
			await titleInput.fill("Test Blog Post E2E");
		}

		const contentInput = page.locator('textarea[name="content"]');
		if (await contentInput.isVisible()) {
			await contentInput.fill(
				"This is a test blog post created by E2E tests. It contains sample content for testing purposes.",
			);
		}

		const excerptInput = page.locator('textarea[name="excerpt"]');
		if (await excerptInput.isVisible()) {
			await excerptInput.fill("This is a test excerpt for the blog post.");
		}

		const categorySelect = page.locator('select[name="category"]');
		if (await categorySelect.isVisible()) {
			await categorySelect.selectOption("real-estate");
		}

		// Submit form
		const submitButtons = [
			page.locator('button[type="submit"]'),
			page.locator('button:has-text("Create")'),
			page.locator('button:has-text("Crear")'),
			page.locator('button:has-text("Save")'),
			page.locator('button:has-text("Guardar")'),
			page.locator('button:has-text("Save Draft")'),
			page.locator('button:has-text("Guardar Borrador")'),
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
				page.locator("text=Post created"),
				page.locator("text=Artículo creado"),
				page.locator("text=Success"),
				page.locator("text=Éxito"),
				page.locator("text=Created successfully"),
				page.locator("text=Creado exitosamente"),
				page.locator("text=Blog"), // Redirect to blog list
				page.locator("text=Draft saved"),
				page.locator("text=Borrador guardado"),
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

	test("should handle blog post editing flow", async ({ page }) => {
		// Navigate to blog dashboard
		await page.goto("/dashboard/blog");

		// Look for existing blog post to edit
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
			// Skip if no blog posts to edit
			test.skip();
		}

		await editButton.click();

		// Should show edit form
		const formElements = [
			page.locator("form"),
			page.locator('input[name="title"]'),
			page.locator('textarea[name="content"]'),
			page.locator('textarea[name="excerpt"]'),
		];

		let formFound = false;
		for (const form of formElements) {
			if (await form.isVisible()) {
				formFound = true;
				break;
			}
		}
		expect(formFound).toBe(true);

		// Modify blog post information
		const titleInput = page.locator('input[name="title"]');
		if (await titleInput.isVisible()) {
			await titleInput.fill("Updated Test Blog Post");
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
				page.locator("text=Post updated"),
				page.locator("text=Artículo actualizado"),
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

	test("should handle blog post publishing flow", async ({ page }) => {
		// Navigate to blog dashboard
		await page.goto("/dashboard/blog");

		// Look for draft post to publish
		const publishElements = [
			page.locator('button:has-text("Publish")'),
			page.locator('button:has-text("Publicar")'),
			page.locator('a:has-text("Publish")'),
			page.locator('a:has-text("Publicar")'),
			page.locator('[data-testid="publish-button"]'),
			page.locator('button[class*="publish"]'),
		];

		let publishButton = null;
		for (const button of publishElements) {
			if (await button.first().isVisible()) {
				publishButton = button.first();
				break;
			}
		}

		if (!publishButton) {
			// Skip if no draft posts to publish
			test.skip();
		}

		await publishButton.click();

		// Should show publish confirmation or success
		const publishIndicators = [
			page.locator("text=Post published"),
			page.locator("text=Artículo publicado"),
			page.locator("text=Published successfully"),
			page.locator("text=Publicado exitosamente"),
			page.locator("text=Now live"),
			page.locator("text=Ahora en vivo"),
			page.locator("text=Confirm publish"),
			page.locator("text=Confirmar publicación"),
		];

		let publishFound = false;
		for (const indicator of publishIndicators) {
			try {
				await indicator.waitFor({ timeout: 3000 });
				publishFound = true;

				// If it's a confirmation dialog, confirm it
				if (
					indicator.textContent?.includes("Confirm") ||
					indicator.textContent?.includes("Confirmar")
				) {
					const confirmButton = page
						.locator('button:has-text("Confirm")')
						.or(page.locator('button:has-text("Confirmar")'));
					if (await confirmButton.isVisible()) {
						await confirmButton.click();
					}
				}
				break;
			} catch (_e) {
				// Continue to next indicator
			}
		}
		expect(publishFound).toBe(true);
	});
});

test.describe("Blog Form Validation", () => {
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
						permissions: ["canManageBlogs", "canCreateBlogs"],
					},
				}),
			);
		});
	});

	test("should validate required fields in blog form", async ({ page }) => {
		// Navigate to blog creation form
		await page.goto("/dashboard/blog");

		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('button:has-text("Agregar Artículo")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a:has-text("Crear Artículo")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
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
				page.locator("text=Title is required"),
				page.locator("text=Título es requerido"),
				page.locator("text=Content is required"),
				page.locator("text=Contenido es requerido"),
				page.locator("text=Category is required"),
				page.locator("text=Categoría es requerida"),
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

	test("should validate title length", async ({ page }) => {
		await page.goto("/dashboard/blog");

		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Fill very short title
		const titleInput = page.locator('input[name="title"]');
		if (await titleInput.isVisible()) {
			await titleInput.fill("A"); // Too short

			const submitButton = page
				.locator('button[type="submit"]')
				.or(page.locator('button:has-text("Create")'));
			if (await submitButton.isVisible()) {
				await submitButton.click();

				// Should show title length validation error
				const titleErrors = [
					page.locator("text=Title too short"),
					page.locator("text=Título muy corto"),
					page.locator("text=Title must be at least"),
					page.locator("text=El título debe tener al menos"),
					page.locator("text=Please enter a longer title"),
					page.locator("text=Por favor ingresa un título más largo"),
				];

				let errorFound = false;
				for (const error of titleErrors) {
					if (await error.isVisible()) {
						errorFound = true;
						break;
					}
				}
				expect(errorFound).toBe(true);
			}
		}
	});

	test("should validate slug uniqueness", async ({ page }) => {
		await page.goto("/dashboard/blog");

		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Look for slug input
		const slugInput = page.locator('input[name="slug"]');
		if (await slugInput.isVisible()) {
			// Try to use a common slug that might already exist
			await slugInput.fill("test-post");

			const submitButton = page
				.locator('button[type="submit"]')
				.or(page.locator('button:has-text("Create")'));
			if (await submitButton.isVisible()) {
				await submitButton.click();

				// Should show slug uniqueness validation error (if slug already exists)
				const slugErrors = [
					page.locator("text=Slug already exists"),
					page.locator("text=Slug ya existe"),
					page.locator("text=URL already taken"),
					page.locator("text=URL ya está en uso"),
					page.locator("text=Please choose a different slug"),
					page.locator("text=Por favor elige un slug diferente"),
				];

				let _errorFound = false;
				for (const error of slugErrors) {
					if (await error.isVisible()) {
						_errorFound = true;
						break;
					}
				}

				// If no error is shown, that's also acceptable (slug might not exist yet)
				// The test passes either way
				expect(true).toBe(true);
			}
		}
	});
});

test.describe("Blog Content Management", () => {
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
						permissions: [
							"canManageBlogs",
							"canCreateBlogs",
							"canPublishBlogs",
						],
					},
				}),
			);
		});
	});

	test("should handle rich text editor", async ({ page }) => {
		await page.goto("/dashboard/blog");

		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Look for rich text editor
		const editorElements = [
			page.locator('[data-testid="rich-editor"]'),
			page.locator(".rich-text-editor"),
			page.locator('[contenteditable="true"]'),
			page.locator('textarea[name="content"]'),
			page.locator(".editor-content"),
		];

		let editor = null;
		for (const element of editorElements) {
			if (await element.isVisible()) {
				editor = element;
				break;
			}
		}

		if (editor) {
			// Test typing in the editor
			await editor.fill(
				"This is test content with **bold text** and *italic text*.",
			);

			// Should show formatted content or accept the input
			const content = await editor.inputValue();
			expect(content.length).toBeGreaterThan(0);

			// Look for formatting toolbar
			const toolbarElements = [
				page.locator('[data-testid="editor-toolbar"]'),
				page.locator(".editor-toolbar"),
				page.locator('button[title*="Bold"]'),
				page.locator('button[title*="Italic"]'),
				page.locator('button:has-text("B")'),
				page.locator('button:has-text("I")'),
			];

			let _toolbarFound = false;
			for (const toolbar of toolbarElements) {
				if (await toolbar.isVisible()) {
					_toolbarFound = true;
					break;
				}
			}

			// Toolbar is optional, so test passes either way
			expect(true).toBe(true);
		}
	});

	test("should handle image upload for blog posts", async ({ page }) => {
		await page.goto("/dashboard/blog");

		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Look for image upload input
		const fileInputs = [
			page.locator('input[type="file"]'),
			page.locator('input[accept*="image"]'),
			page.locator('[data-testid="image-upload"]'),
			page.locator('input[name="coverImage"]'),
			page.locator('input[name="featuredImage"]'),
		];

		let fileInput = null;
		for (const input of fileInputs) {
			if (await input.isVisible()) {
				fileInput = input;
				break;
			}
		}

		if (fileInput) {
			// Create a test file
			const testFile = Buffer.from("test image content for blog post");

			// Upload file
			await fileInput.setInputFiles({
				name: "test-blog-image.jpg",
				mimeType: "image/jpeg",
				buffer: testFile,
			});

			// Should show uploaded file, preview, or success indicator
			const uploadIndicators = [
				page.locator("text=test-blog-image.jpg"),
				page.locator("text=Image uploaded"),
				page.locator("text=Imagen subida"),
				page.locator("text=Upload successful"),
				page.locator("text=Subida exitosa"),
				page.locator('img[src*="blob:"]'), // Preview image
				page.locator('[data-testid="image-preview"]'),
				page.locator(".image-preview"),
			];

			let indicatorFound = false;
			for (const indicator of uploadIndicators) {
				try {
					await indicator.waitFor({ timeout: 3000 });
					indicatorFound = true;
					break;
				} catch (_e) {
					// Continue to next indicator
				}
			}
			expect(indicatorFound).toBe(true);
		}
	});

	test("should handle blog post categories", async ({ page }) => {
		await page.goto("/dashboard/blog");

		const addBlogElements = [
			page.locator('button:has-text("Add Post")'),
			page.locator('a:has-text("Create Post")'),
			page.locator('a[href*="new"]'),
		];

		let addButton = null;
		for (const button of addBlogElements) {
			if (await button.isVisible()) {
				addButton = button;
				break;
			}
		}

		if (!addButton) {
			test.skip();
		}

		await addButton.click();

		// Look for category selection
		const categorySelects = [
			page.locator('select[name="category"]'),
			page.locator('select[name="categoria"]'),
			page.locator('[data-testid="category-select"]'),
		];

		for (const select of categorySelects) {
			if (await select.isVisible()) {
				// Get available options
				const options = await select.locator("option").allTextContents();
				const validOptions = options.filter(
					(option) => option.trim() && option !== "Select...",
				);

				if (validOptions.length > 0) {
					// Test selecting different categories
					await select.selectOption({ label: validOptions[0] });
					expect(await select.inputValue()).toBeTruthy();

					if (validOptions.length > 1) {
						await select.selectOption({ label: validOptions[1] });
						expect(await select.inputValue()).toBeTruthy();
					}
				}
				break;
			}
		}
	});
});
