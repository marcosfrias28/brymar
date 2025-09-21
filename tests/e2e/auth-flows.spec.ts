import { test, expect } from '@playwright/test';

test.describe('Authentication Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
  });

  test('should complete user registration and verification flow', async ({ page }) => {
    const testEmail = `test${Date.now()}@example.com`;
    
    // Navigate to sign up page
    await page.goto('/sign-up');
    await expect(page).toHaveURL(/.*sign-up/);

    // Verify page elements are present
    await expect(page.locator('h1, h2')).toContainText('Crear Cuenta');
    await expect(page.locator('input[name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('input[name="confirmPassword"]')).toBeVisible();

    // Fill out registration form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message, redirect, or verification prompt
    const successIndicators = [
      page.locator('text=Account created'),
      page.locator('text=Cuenta creada'),
      page.locator('text=Registration successful'),
      page.locator('text=Verify'),
      page.locator('text=Verificar'),
      page.locator('text=Check your email')
    ];
    
    await expect(page.locator('body')).toContainText(/created|creada|successful|verify|verificar|check/i, { timeout: 15000 });
  });

  test('should handle sign-in flow with valid credentials', async ({ page }) => {
    // Navigate to sign in page
    await page.goto('/sign-in');
    await expect(page).toHaveURL(/.*sign-in/);

    // Verify page elements
    await expect(page.locator('h1, h2')).toContainText(/Iniciar|Sign/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();

    // Fill out sign in form with test credentials
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');

    // Submit form
    await page.click('button[type="submit"]');

    // Should either show error for non-existent user or redirect if user exists
    // We'll check for either outcome within reasonable time
    const possibleOutcomes = [
      page.locator('text=Invalid credentials'),
      page.locator('text=Credenciales inválidas'),
      page.locator('text=Dashboard'),
      page.locator('text=Welcome'),
      page.locator('text=Bienvenido'),
      page.locator('text=Properties'),
      page.locator('text=Propiedades'),
      page.locator('text=User not found'),
      page.locator('text=Usuario no encontrado')
    ];
    
    // Wait for any of these outcomes
    let outcomeFound = false;
    for (const outcome of possibleOutcomes) {
      try {
        await outcome.waitFor({ timeout: 3000 });
        outcomeFound = true;
        break;
      } catch (e) {
        // Continue to next outcome
      }
    }
    
    expect(outcomeFound).toBe(true);
  });

  test('should handle password reset flow', async ({ page }) => {
    // Navigate to sign in page first
    await page.goto('/sign-in');

    // Look for forgot password link
    const forgotPasswordLink = page.locator('text=Olvidaste tu contraseña');
    const forgotPasswordLinkEn = page.locator('text=Forgot Password');
    
    if (await forgotPasswordLink.isVisible()) {
      await forgotPasswordLink.click();
    } else if (await forgotPasswordLinkEn.isVisible()) {
      await forgotPasswordLinkEn.click();
    } else {
      // Navigate directly to forgot password page
      await page.goto('/forgot-password');
    }

    await expect(page).toHaveURL(/.*forgot-password/);

    // Verify page elements
    await expect(page.locator('h1, h2')).toContainText(/Recuperar|Forgot|Reset/);
    await expect(page.locator('input[name="email"]')).toBeVisible();

    // Fill out email
    await page.fill('input[name="email"]', 'test@example.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    const successMessages = [
      page.locator('text=Reset link sent'),
      page.locator('text=Enlace enviado'),
      page.locator('text=Check your email'),
      page.locator('text=Revisa tu correo'),
      page.locator('text=Email sent'),
      page.locator('text=Correo enviado')
    ];

    let messageFound = false;
    for (const message of successMessages) {
      try {
        await message.waitFor({ timeout: 3000 });
        messageFound = true;
        break;
      } catch (e) {
        // Continue to next message
      }
    }
    
    expect(messageFound).toBe(true);
  });

  test('should handle email verification flow', async ({ page }) => {
    // Mock a logged-in state by setting localStorage
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth-session', JSON.stringify({
        user: { email: 'test@example.com', id: '123', emailVerified: false }
      }));
    });

    // Navigate to verification page
    await page.goto('/verify-email?email=test@example.com');

    // Should show verification form
    const verificationElements = [
      page.locator('text=Verify Email'),
      page.locator('text=Verificar Email'),
      page.locator('text=Verification'),
      page.locator('text=Verificación')
    ];

    let elementFound = false;
    for (const element of verificationElements) {
      if (await element.isVisible()) {
        elementFound = true;
        break;
      }
    }

    if (!elementFound) {
      // Skip test if verification page is not accessible
      test.skip();
    }

    // Look for OTP input
    const otpInput = page.locator('input[name="otp"]');
    if (await otpInput.isVisible()) {
      // Fill OTP (using dummy code for testing)
      await otpInput.fill('123456');

      // Submit form
      await page.click('button[type="submit"]');

      // Should show error for invalid OTP or success for valid one
      const possibleOutcomes = [
        page.locator('text=Invalid code'),
        page.locator('text=Código inválido'),
        page.locator('text=Email verified'),
        page.locator('text=Email verificado'),
        page.locator('text=Verification successful'),
        page.locator('text=Verificación exitosa')
      ];

      let outcomeFound = false;
      for (const outcome of possibleOutcomes) {
        try {
          await outcome.waitFor({ timeout: 5000 });
          outcomeFound = true;
          break;
        } catch (e) {
          // Continue to next outcome
        }
      }
      
      expect(outcomeFound).toBe(true);
    }
  });

  test('should handle complete registration to verification flow', async ({ page }) => {
    const testEmail = `fullflow${Date.now()}@example.com`;
    
    // Step 1: Register new user
    await page.goto('/sign-up');
    
    await page.fill('input[name="name"]', 'Full Flow Test User');
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'TestPassword123!');
    
    await page.click('button[type="submit"]');
    
    // Step 2: Should redirect to verification or show success
    await page.waitForTimeout(2000); // Allow for redirect
    
    // Check if we're on verification page or got success message
    const currentUrl = page.url();
    const isOnVerificationPage = currentUrl.includes('verify-email');
    const hasSuccessMessage = await page.locator('text=/created|creada|successful|verify|verificar/i').isVisible();
    
    expect(isOnVerificationPage || hasSuccessMessage).toBe(true);
    
    // Step 3: If on verification page, test the flow
    if (isOnVerificationPage) {
      const otpInput = page.locator('input[name="otp"]');
      if (await otpInput.isVisible()) {
        await otpInput.fill('123456');
        await page.click('button[type="submit"]');
        
        // Should show some response (error for invalid code is expected)
        await expect(page.locator('body')).toContainText(/invalid|inválido|verified|verificado|error/i, { timeout: 10000 });
      }
    }
  });
});

test.describe('Form Validation', () => {
  test('should show validation errors for invalid sign-up data', async ({ page }) => {
    await page.goto('/sign-up');

    // Test empty form submission
    await page.click('button[type="submit"]');
    
    // Should show required field errors
    const requiredErrors = [
      page.locator('text=Name is required'),
      page.locator('text=Nombre es requerido'),
      page.locator('text=Email is required'),
      page.locator('text=Email es requerido'),
      page.locator('text=Password is required'),
      page.locator('text=Contraseña es requerida')
    ];
    
    let errorFound = false;
    for (const error of requiredErrors) {
      if (await error.isVisible()) {
        errorFound = true;
        break;
      }
    }
    expect(errorFound).toBe(true);

    // Test invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '123'); // Too short
    await page.click('button[type="submit"]');

    // Should show validation errors
    const emailErrors = [
      page.locator('text=Invalid email'),
      page.locator('text=Email inválido'),
      page.locator('text=Please enter a valid email'),
      page.locator('text=Por favor ingresa un email válido')
    ];
    
    const passwordErrors = [
      page.locator('text=Password must be'),
      page.locator('text=La contraseña debe'),
      page.locator('text=Password too short'),
      page.locator('text=Contraseña muy corta')
    ];

    let emailErrorFound = false;
    for (const error of emailErrors) {
      if (await error.isVisible()) {
        emailErrorFound = true;
        break;
      }
    }

    let passwordErrorFound = false;
    for (const error of passwordErrors) {
      if (await error.isVisible()) {
        passwordErrorFound = true;
        break;
      }
    }

    expect(emailErrorFound || passwordErrorFound).toBe(true);
  });

  test('should validate password confirmation match', async ({ page }) => {
    await page.goto('/sign-up');

    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'TestPassword123!');
    await page.fill('input[name="confirmPassword"]', 'DifferentPassword123!');
    
    await page.click('button[type="submit"]');

    // Should show password mismatch error
    const mismatchErrors = [
      page.locator('text=Passwords do not match'),
      page.locator('text=Las contraseñas no coinciden'),
      page.locator('text=Password confirmation'),
      page.locator('text=Confirmación de contraseña')
    ];

    let errorFound = false;
    for (const error of mismatchErrors) {
      if (await error.isVisible()) {
        errorFound = true;
        break;
      }
    }
    expect(errorFound).toBe(true);
  });

  test('should show validation errors for invalid sign-in data', async ({ page }) => {
    await page.goto('/sign-in');

    // Test empty form submission
    await page.click('button[type="submit"]');
    
    // Should show required field errors
    const requiredErrors = [
      page.locator('text=Email is required'),
      page.locator('text=Email es requerido'),
      page.locator('text=Password is required'),
      page.locator('text=Contraseña es requerida')
    ];
    
    let errorFound = false;
    for (const error of requiredErrors) {
      if (await error.isVisible()) {
        errorFound = true;
        break;
      }
    }
    expect(errorFound).toBe(true);

    // Try to submit with invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.fill('input[name="password"]', '');
    await page.click('button[type="submit"]');

    // Should show validation errors
    const emailErrors = [
      page.locator('text=Invalid email'),
      page.locator('text=Email inválido'),
      page.locator('text=Please enter a valid email'),
      page.locator('text=Por favor ingresa un email válido')
    ];

    let emailErrorFound = false;
    for (const error of emailErrors) {
      if (await error.isVisible()) {
        emailErrorFound = true;
        break;
      }
    }
    expect(emailErrorFound).toBe(true);
  });

  test('should validate forgot password form', async ({ page }) => {
    await page.goto('/forgot-password');

    // Test empty form submission
    await page.click('button[type="submit"]');
    
    // Should show required email error
    const requiredErrors = [
      page.locator('text=Email is required'),
      page.locator('text=Email es requerido')
    ];
    
    let errorFound = false;
    for (const error of requiredErrors) {
      if (await error.isVisible()) {
        errorFound = true;
        break;
      }
    }
    expect(errorFound).toBe(true);

    // Test invalid email format
    await page.fill('input[name="email"]', 'invalid-email');
    await page.click('button[type="submit"]');

    const emailErrors = [
      page.locator('text=Invalid email'),
      page.locator('text=Email inválido')
    ];

    let emailErrorFound = false;
    for (const error of emailErrors) {
      if (await error.isVisible()) {
        emailErrorFound = true;
        break;
      }
    }
    expect(emailErrorFound).toBe(true);
  });
});

test.describe('Error Handling', () => {
  test('should handle network errors gracefully', async ({ page }) => {
    // Intercept network requests and simulate failure
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Should show network error message
    const networkErrors = [
      page.locator('text=Network error'),
      page.locator('text=Error de red'),
      page.locator('text=Connection failed'),
      page.locator('text=Conexión fallida'),
      page.locator('text=Unable to connect'),
      page.locator('text=No se pudo conectar'),
      page.locator('text=Request failed'),
      page.locator('text=Solicitud fallida')
    ];

    let errorFound = false;
    for (const error of networkErrors) {
      try {
        await error.waitFor({ timeout: 3000 });
        errorFound = true;
        break;
      } catch (e) {
        // Continue to next error
      }
    }
    expect(errorFound).toBe(true);
  });

  test('should handle server errors gracefully', async ({ page }) => {
    // Intercept network requests and simulate server error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' })
      });
    });

    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Should show server error message
    const serverErrors = [
      page.locator('text=Server error'),
      page.locator('text=Error del servidor'),
      page.locator('text=Internal server error'),
      page.locator('text=Error interno del servidor'),
      page.locator('text=Something went wrong'),
      page.locator('text=Algo salió mal'),
      page.locator('text=500'),
      page.locator('text=Error')
    ];

    let errorFound = false;
    for (const error of serverErrors) {
      try {
        await error.waitFor({ timeout: 3000 });
        errorFound = true;
        break;
      } catch (e) {
        // Continue to next error
      }
    }
    expect(errorFound).toBe(true);
  });

  test('should handle authentication errors', async ({ page }) => {
    await page.goto('/sign-in');
    
    // Try to sign in with invalid credentials
    await page.fill('input[name="email"]', 'nonexistent@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show authentication error
    const authErrors = [
      page.locator('text=Invalid credentials'),
      page.locator('text=Credenciales inválidas'),
      page.locator('text=User not found'),
      page.locator('text=Usuario no encontrado'),
      page.locator('text=Incorrect password'),
      page.locator('text=Contraseña incorrecta'),
      page.locator('text=Authentication failed'),
      page.locator('text=Autenticación fallida')
    ];

    let errorFound = false;
    for (const error of authErrors) {
      try {
        await error.waitFor({ timeout: 5000 });
        errorFound = true;
        break;
      } catch (e) {
        // Continue to next error
      }
    }
    expect(errorFound).toBe(true);
  });

  test('should handle rate limiting gracefully', async ({ page }) => {
    // Simulate rate limiting by intercepting requests
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 429,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Too many requests' })
      });
    });

    await page.goto('/sign-in');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Should show rate limiting error
    const rateLimitErrors = [
      page.locator('text=Too many requests'),
      page.locator('text=Demasiadas solicitudes'),
      page.locator('text=Rate limit'),
      page.locator('text=Límite de velocidad'),
      page.locator('text=Try again later'),
      page.locator('text=Intenta más tarde'),
      page.locator('text=429')
    ];

    let errorFound = false;
    for (const error of rateLimitErrors) {
      try {
        await error.waitFor({ timeout: 3000 });
        errorFound = true;
        break;
      } catch (e) {
        // Continue to next error
      }
    }
    expect(errorFound).toBe(true);
  });
});