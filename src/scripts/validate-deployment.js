#!/usr/bin/env node

/**
 * AI Property Wizard Deployment Validation Script
 *
 * This script validates the deployment environment and runs comprehensive
 * checks to ensure the wizard is ready for production deployment.
 */

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const _https = require("node:https");
const _http = require("node:http");

// ANSI color codes for console output
const colors = {
	reset: "\x1b[0m",
	bright: "\x1b[1m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	blue: "\x1b[34m",
	magenta: "\x1b[35m",
	cyan: "\x1b[36m",
};

// Validation results
const results = {
	passed: 0,
	failed: 0,
	warnings: 0,
	details: [],
};

// Utility functions
function log(message, color = colors.reset) {
	console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message) {
	log(`✅ ${message}`, colors.green);
	results.passed++;
}

function logError(message) {
	log(`❌ ${message}`, colors.red);
	results.failed++;
	results.details.push({ type: "error", message });
}

function logWarning(message) {
	log(`⚠️  ${message}`, colors.yellow);
	results.warnings++;
	results.details.push({ type: "warning", message });
}

function logInfo(message) {
	log(`ℹ️  ${message}`, colors.blue);
}

function logHeader(message) {
	log(`\n${colors.bright}${colors.cyan}=== ${message} ===${colors.reset}`);
}

// Environment variable validation
function validateEnvironmentVariables() {
	logHeader("Environment Variables Validation");

	const requiredVars = [
		"DATABASE_URL",
		"HUGGINGFACE_API_KEY",
		"BLOB_READ_WRITE_TOKEN",
		"AUTH_SECRET",
	];

	const optionalVars = [
		"SENTRY_DSN",
		"MAPBOX_API_KEY",
		"GOOGLE_MAPS_API_KEY",
		"RESEND_API_KEY",
	];

	const productionRequiredVars = ["CSRF_SECRET", "PRODUCTION_URL"];

	// Check required variables
	requiredVars.forEach((varName) => {
		if (process.env[varName]) {
			logSuccess(`${varName} is set`);
		} else {
			logError(`${varName} is missing (required)`);
		}
	});

	// Check production-specific variables
	if (process.env.NODE_ENV === "production") {
		productionRequiredVars.forEach((varName) => {
			if (process.env[varName]) {
				logSuccess(`${varName} is set (production)`);
			} else {
				logError(`${varName} is missing (required for production)`);
			}
		});
	}

	// Check optional variables
	optionalVars.forEach((varName) => {
		if (process.env[varName]) {
			logSuccess(`${varName} is set (optional)`);
		} else {
			logWarning(`${varName} is not set (optional)`);
		}
	});

	// Validate variable formats
	if (
		process.env.DATABASE_URL &&
		!process.env.DATABASE_URL.startsWith("postgresql://")
	) {
		logError("DATABASE_URL must be a valid PostgreSQL connection string");
	}

	if (
		process.env.HUGGINGFACE_API_KEY &&
		!process.env.HUGGINGFACE_API_KEY.startsWith("hf_")
	) {
		logError('HUGGINGFACE_API_KEY must start with "hf_"');
	}

	if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) {
		logError("AUTH_SECRET must be at least 32 characters long");
	}

	if (process.env.CSRF_SECRET && process.env.CSRF_SECRET.length < 32) {
		logError("CSRF_SECRET must be at least 32 characters long");
	}
}

// Database connectivity test
async function validateDatabaseConnection() {
	logHeader("Database Connection Validation");

	if (!process.env.DATABASE_URL) {
		logError("DATABASE_URL not set, skipping database validation");
		return;
	}

	try {
		// This would require the actual database client
		// For now, we'll do a basic URL validation
		const url = new URL(process.env.DATABASE_URL);

		if (url.protocol !== "postgresql:") {
			logError("Database URL must use postgresql:// protocol");
			return;
		}

		if (!url.hostname || !url.pathname) {
			logError("Database URL must include hostname and database name");
			return;
		}

		logSuccess("Database URL format is valid");
		logInfo(`Database host: ${url.hostname}`);
		logInfo(`Database name: ${url.pathname.slice(1)}`);

		// In a real implementation, you would test the actual connection here
		logWarning(
			"Database connectivity test skipped (requires runtime environment)",
		);
	} catch (error) {
		logError(`Invalid database URL: ${error.message}`);
	}
}

// External service connectivity tests
async function validateExternalServices() {
	logHeader("External Services Validation");

	// Test HuggingFace API
	if (process.env.HUGGINGFACE_API_KEY) {
		try {
			logInfo("Testing HuggingFace API connectivity...");

			const response = await fetch(
				"https://api-inference.huggingface.co/models",
				{
					headers: {
						Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
					},
					signal: AbortSignal.timeout(10000),
				},
			);

			if (response.ok) {
				logSuccess("HuggingFace API is accessible");
			} else {
				logError(`HuggingFace API returned status: ${response.status}`);
			}
		} catch (error) {
			logError(`HuggingFace API test failed: ${error.message}`);
		}
	} else {
		logWarning("HuggingFace API key not set, skipping connectivity test");
	}

	// Test Vercel Blob Storage
	if (process.env.BLOB_READ_WRITE_TOKEN) {
		try {
			logInfo("Testing Vercel Blob Storage connectivity...");

			// This would require the actual Vercel Blob client
			logWarning(
				"Vercel Blob Storage test skipped (requires runtime environment)",
			);
		} catch (error) {
			logError(`Vercel Blob Storage test failed: ${error.message}`);
		}
	} else {
		logWarning("Blob storage token not set, skipping connectivity test");
	}

	// Test Sentry (if configured)
	if (process.env.SENTRY_DSN) {
		try {
			logInfo("Validating Sentry DSN format...");

			const url = new URL(process.env.SENTRY_DSN);
			if (url.protocol === "https:" && url.hostname.includes("sentry.io")) {
				logSuccess("Sentry DSN format is valid");
			} else {
				logWarning("Sentry DSN format may be invalid");
			}
		} catch (error) {
			logError(`Invalid Sentry DSN: ${error.message}`);
		}
	}
}

// File system and permissions validation
function validateFileSystem() {
	logHeader("File System Validation");

	const requiredDirectories = [
		"components/wizard",
		"lib/services",
		"lib/actions",
		"hooks",
		"app/api",
		"deployment",
	];

	const requiredFiles = [
		"components/wizard/property-wizard.tsx",
		"lib/services/wizard-analytics-service.ts",
		"lib/actions/wizard-actions.ts",
		"hooks/use-wizard-state-manager.ts",
		"app/api/analytics/wizard/route.ts",
		"deployment/wizard-deployment-config.ts",
	];

	// Check directories
	requiredDirectories.forEach((dir) => {
		if (fs.existsSync(dir)) {
			logSuccess(`Directory exists: ${dir}`);
		} else {
			logError(`Missing directory: ${dir}`);
		}
	});

	// Check files
	requiredFiles.forEach((file) => {
		if (fs.existsSync(file)) {
			logSuccess(`File exists: ${file}`);
		} else {
			logError(`Missing file: ${file}`);
		}
	});

	// Check write permissions for upload directories
	const uploadDirs = ["public", "tmp"];
	uploadDirs.forEach((dir) => {
		try {
			if (fs.existsSync(dir)) {
				fs.accessSync(dir, fs.constants.W_OK);
				logSuccess(`Write permission OK: ${dir}`);
			} else {
				logWarning(`Directory does not exist: ${dir}`);
			}
		} catch (_error) {
			logError(`No write permission: ${dir}`);
		}
	});
}

// Build and dependency validation
function validateBuildAndDependencies() {
	logHeader("Build and Dependencies Validation");

	// Check package.json
	try {
		const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

		logSuccess("package.json is valid JSON");
		logInfo(`Project name: ${packageJson.name}`);
		logInfo(`Version: ${packageJson.version}`);

		// Check critical dependencies
		const criticalDeps = [
			"next",
			"react",
			"typescript",
			"@tanstack/react-query",
			"zod",
			"react-hook-form",
		];

		criticalDeps.forEach((dep) => {
			if (
				packageJson.dependencies?.[dep] ||
				packageJson.devDependencies?.[dep]
			) {
				logSuccess(`Dependency found: ${dep}`);
			} else {
				logError(`Missing critical dependency: ${dep}`);
			}
		});
	} catch (error) {
		logError(`Failed to read package.json: ${error.message}`);
	}

	// Check TypeScript configuration
	try {
		const tsConfig = JSON.parse(fs.readFileSync("tsconfig.json", "utf8"));
		logSuccess("tsconfig.json is valid");

		if (tsConfig.compilerOptions?.strict) {
			logSuccess("TypeScript strict mode is enabled");
		} else {
			logWarning("TypeScript strict mode is not enabled");
		}
	} catch (error) {
		logError(`Failed to read tsconfig.json: ${error.message}`);
	}

	// Check Next.js configuration
	try {
		if (fs.existsSync("next.config.ts") || fs.existsSync("next.config.js")) {
			logSuccess("Next.js configuration file exists");
		} else {
			logWarning("No Next.js configuration file found");
		}
	} catch (error) {
		logError(`Failed to check Next.js config: ${error.message}`);
	}

	// Test build process (if not in CI)
	if (!process.env.CI) {
		try {
			logInfo("Testing build process...");
			execSync("npm run build", { stdio: "pipe", timeout: 120000 });
			logSuccess("Build process completed successfully");
		} catch (error) {
			logError(`Build process failed: ${error.message}`);
		}
	} else {
		logInfo("Skipping build test in CI environment");
	}
}

// Security validation
function validateSecurity() {
	logHeader("Security Validation");

	// Check for sensitive files that shouldn't be committed
	const sensitiveFiles = [
		".env",
		".env.local",
		".env.production",
		"secrets.json",
	];

	sensitiveFiles.forEach((file) => {
		if (fs.existsSync(file)) {
			logWarning(`Sensitive file found: ${file} (ensure it's in .gitignore)`);
		}
	});

	// Check .gitignore
	try {
		const gitignore = fs.readFileSync(".gitignore", "utf8");

		const requiredIgnores = [".env", ".env.local", "node_modules", ".next"];

		requiredIgnores.forEach((pattern) => {
			if (gitignore.includes(pattern)) {
				logSuccess(`Gitignore includes: ${pattern}`);
			} else {
				logError(`Gitignore missing: ${pattern}`);
			}
		});
	} catch (_error) {
		logError("Failed to read .gitignore file");
	}

	// Check environment-specific security settings
	if (process.env.NODE_ENV === "production") {
		if (process.env.RATE_LIMIT_ENABLED !== "false") {
			logSuccess("Rate limiting is enabled for production");
		} else {
			logError("Rate limiting should be enabled in production");
		}

		if (process.env.CSRF_SECRET) {
			logSuccess("CSRF protection is configured");
		} else {
			logError("CSRF protection should be enabled in production");
		}
	}
}

// Performance validation
function validatePerformance() {
	logHeader("Performance Validation");

	// Check bundle size (if build exists)
	try {
		const buildDir = ".next";
		if (fs.existsSync(buildDir)) {
			logSuccess("Build directory exists");

			// Check for code splitting
			const chunksDir = path.join(buildDir, "static", "chunks");
			if (fs.existsSync(chunksDir)) {
				const chunks = fs.readdirSync(chunksDir);
				if (chunks.length > 1) {
					logSuccess(`Code splitting detected (${chunks.length} chunks)`);
				} else {
					logWarning("Limited code splitting detected");
				}
			}
		} else {
			logWarning("No build directory found (run npm run build first)");
		}
	} catch (error) {
		logWarning(`Could not analyze build: ${error.message}`);
	}

	// Check for performance optimizations in config
	try {
		const nextConfigPath = fs.existsSync("next.config.ts")
			? "next.config.ts"
			: "next.config.js";
		if (fs.existsSync(nextConfigPath)) {
			const configContent = fs.readFileSync(nextConfigPath, "utf8");

			if (
				configContent.includes("compress") ||
				configContent.includes("gzip")
			) {
				logSuccess("Compression configuration found");
			} else {
				logWarning("No compression configuration found");
			}

			if (configContent.includes("images")) {
				logSuccess("Image optimization configuration found");
			} else {
				logWarning("No image optimization configuration found");
			}
		}
	} catch (error) {
		logWarning(`Could not analyze Next.js config: ${error.message}`);
	}
}

// Test suite validation
async function validateTestSuite() {
	logHeader("Test Suite Validation");

	// Check test files exist
	const testDirectories = [
		"components/wizard/__tests__",
		"lib/__tests__",
		"hooks/__tests__",
	];

	testDirectories.forEach((dir) => {
		if (fs.existsSync(dir)) {
			const testFiles = fs
				.readdirSync(dir)
				.filter(
					(file) => file.endsWith(".test.tsx") || file.endsWith(".test.ts"),
				);
			if (testFiles.length > 0) {
				logSuccess(`Test files found in ${dir} (${testFiles.length} files)`);
			} else {
				logWarning(`No test files found in ${dir}`);
			}
		} else {
			logWarning(`Test directory not found: ${dir}`);
		}
	});

	// Check Jest configuration
	const jestConfigs = ["jest.config.js"];

	jestConfigs.forEach((config) => {
		if (fs.existsSync(config)) {
			logSuccess(`Jest configuration found: ${config}`);
		} else {
			logWarning(`Jest configuration not found: ${config}`);
		}
	});

	// Run tests (if not in CI and tests exist)
	if (!process.env.CI && fs.existsSync("components/wizard/__tests__")) {
		try {
			logInfo("Running wizard test suite...");
			execSync("npm run test:wizard", { stdio: "pipe", timeout: 60000 });
			logSuccess("All wizard tests passed");
		} catch (_error) {
			logError("Some wizard tests failed");
		}
	} else {
		logInfo("Skipping test execution");
	}
}

// Health check validation
async function validateHealthChecks() {
	logHeader("Health Check Validation");

	const healthEndpoints = ["/api/health-check", "/api/analytics/wizard/health"];

	// Check if health check files exist
	healthEndpoints.forEach((endpoint) => {
		const filePath = `app${endpoint}/route.ts`;
		if (fs.existsSync(filePath)) {
			logSuccess(`Health check endpoint exists: ${endpoint}`);
		} else {
			logError(`Health check endpoint missing: ${endpoint}`);
		}
	});

	// If running locally, test the endpoints
	if (
		process.env.NODE_ENV === "development" &&
		process.env.NEXT_PUBLIC_APP_URL
	) {
		for (const endpoint of healthEndpoints) {
			try {
				logInfo(`Testing health endpoint: ${endpoint}`);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_APP_URL}${endpoint}`,
					{
						signal: AbortSignal.timeout(5000),
					},
				);

				if (response.ok) {
					logSuccess(`Health endpoint responding: ${endpoint}`);
				} else {
					logError(`Health endpoint error: ${endpoint} (${response.status})`);
				}
			} catch (error) {
				logWarning(
					`Could not test health endpoint: ${endpoint} (${error.message})`,
				);
			}
		}
	}
}

// Main validation function
async function runValidation() {
	log(
		`${colors.bright}${colors.magenta}AI Property Wizard Deployment Validation${colors.reset}`,
	);
	log(`Environment: ${process.env.NODE_ENV || "development"}`);
	log(`Timestamp: ${new Date().toISOString()}\n`);

	try {
		validateEnvironmentVariables();
		await validateDatabaseConnection();
		await validateExternalServices();
		validateFileSystem();
		validateBuildAndDependencies();
		validateSecurity();
		validatePerformance();
		await validateTestSuite();
		await validateHealthChecks();

		// Summary
		logHeader("Validation Summary");

		if (results.failed === 0) {
			logSuccess(`All validations passed! (${results.passed} checks)`);
			if (results.warnings > 0) {
				logWarning(`${results.warnings} warnings found - review recommended`);
			}
			process.exit(0);
		} else {
			logError(`${results.failed} validation(s) failed`);
			logInfo(`${results.passed} validation(s) passed`);
			if (results.warnings > 0) {
				logWarning(`${results.warnings} warning(s) found`);
			}

			// Show failed validations
			log("\nFailed validations:");
			results.details
				.filter((detail) => detail.type === "error")
				.forEach((detail) => logError(detail.message));

			process.exit(1);
		}
	} catch (error) {
		logError(`Validation script failed: ${error.message}`);
		process.exit(1);
	}
}

// Handle command line arguments
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
	console.log(`
AI Property Wizard Deployment Validation Script

Usage: node scripts/validate-deployment.js [options]

Options:
  --help, -h     Show this help message
  --verbose, -v  Enable verbose output
  --skip-build   Skip build validation
  --skip-tests   Skip test execution

Environment Variables:
  NODE_ENV       Set environment (development, staging, production)
  CI             Set to true to skip interactive tests

Examples:
  node scripts/validate-deployment.js
  NODE_ENV=production node scripts/validate-deployment.js
  node scripts/validate-deployment.js --skip-build --skip-tests
  `);
	process.exit(0);
}

// Run the validation
runValidation().catch((error) => {
	logError(`Unexpected error: ${error.message}`);
	process.exit(1);
});
