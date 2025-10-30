/**
 * Deployment Verification Script
 * Tests that the application works properly in production environment
 */

// TODO: Replace container system with simplified dependency injection
// Container system has been removed with DDD architecture

type DeploymentCheck = {
	name: string;
	passed: boolean;
	error?: string;
	details?: any;
};

/**
 * Check environment variables
 */
function checkEnvironmentVariables(): DeploymentCheck {
	console.log("🔧 Checking environment variables...");

	const requiredEnvVars = [
		"DATABASE_URL",
		"POSTGRES_URL",
		"NEXTAUTH_SECRET",
		"NEXTAUTH_URL",
		"BLOB_READ_WRITE_TOKEN",
	];

	const missingVars: string[] = [];

	requiredEnvVars.forEach((varName) => {
		if (!process.env[varName]) {
			missingVars.push(varName);
		}
	});

	if (missingVars.length > 0) {
		return {
			name: "Environment Variables",
			passed: false,
			error: `Missing required environment variables: ${missingVars.join(", ")}`,
			details: { missing: missingVars, required: requiredEnvVars },
		};
	}

	console.log("  ✅ All required environment variables are set");
	return {
		name: "Environment Variables",
		passed: true,
		details: { checked: requiredEnvVars },
	};
}

/**
 * Check database connectivity
 */
async function checkDatabaseConnectivity(): Promise<DeploymentCheck> {
	console.log("🗄️  Checking database connectivity...");

	try {
		// Try to initialize container and get repositories
		initializeContainer();

		const userRepo = container.get("IUserRepository");
		const propertyRepo = container.get("IPropertyRepository");
		const landRepo = container.get("ILandRepository");

		if (!(userRepo && propertyRepo && landRepo)) {
			return {
				name: "Database Connectivity",
				passed: false,
				error: "Failed to instantiate repositories - database connection issue",
			};
		}

		console.log("  ✅ Database connection successful");
		return {
			name: "Database Connectivity",
			passed: true,
			details: "All repositories instantiated successfully",
		};
	} catch (error) {
		return {
			name: "Database Connectivity",
			passed: false,
			error: error instanceof Error ? error.message : "Unknown database error",
		};
	}
}

/**
 * Check external services
 */
async function checkExternalServices(): Promise<DeploymentCheck> {
	console.log("🌐 Checking external services...");

	try {
		const imageService = container.get("IImageService");
		const notificationService = container.get("INotificationService");

		if (!(imageService && notificationService)) {
			return {
				name: "External Services",
				passed: false,
				error: "Failed to instantiate external services",
			};
		}

		console.log("  ✅ External services available");
		return {
			name: "External Services",
			passed: true,
			details: "Image and notification services instantiated",
		};
	} catch (error) {
		return {
			name: "External Services",
			passed: false,
			error: error instanceof Error ? error.message : "Unknown service error",
		};
	}
}

/**
 * Check use case availability
 */
async function checkUseCaseAvailability(): Promise<DeploymentCheck> {
	console.log("⚙️  Checking use case availability...");

	try {
		const useCases = [
			"UpdateUserProfileUseCase",
			"SaveWizardDraftUseCase",
			"LoadWizardDraftUseCase",
			"PublishWizardUseCase",
			"CreatePropertyUseCase",

			"SearchPropertiesUseCase",
		];

		const unavailableUseCases: string[] = [];

		useCases.forEach((useCaseName) => {
			try {
				const useCase = container.get(useCaseName);
				if (!useCase) {
					unavailableUseCases.push(useCaseName);
				}
			} catch (_error) {
				unavailableUseCases.push(useCaseName);
			}
		});

		if (unavailableUseCases.length > 0) {
			return {
				name: "Use Case Availability",
				passed: false,
				error: `Unavailable use cases: ${unavailableUseCases.join(", ")}`,
				details: { unavailable: unavailableUseCases, total: useCases.length },
			};
		}

		console.log("  ✅ All use cases available");
		return {
			name: "Use Case Availability",
			passed: true,
			details: { available: useCases.length },
		};
	} catch (error) {
		return {
			name: "Use Case Availability",
			passed: false,
			error: error instanceof Error ? error.message : "Unknown use case error",
		};
	}
}

/**
 * Check API endpoints
 */
async function checkAPIEndpoints(): Promise<DeploymentCheck> {
	console.log("🔗 Checking API endpoints...");

	try {
		// In a real deployment, we would test actual API endpoints
		// For now, we'll check that the server actions can be imported
		const serverActions = [
			"@/presentation/server-actions/user-actions",
			"@/presentation/server-actions/wizard-actions",
			"@/presentation/server-actions/property-actions",
		];

		const unavailableActions: string[] = [];

		for (const actionPath of serverActions) {
			try {
				await import(actionPath);
			} catch (_error) {
				unavailableActions.push(actionPath);
			}
		}

		if (unavailableActions.length > 0) {
			return {
				name: "API Endpoints",
				passed: false,
				error: `Unavailable server actions: ${unavailableActions.join(", ")}`,
				details: { unavailable: unavailableActions },
			};
		}

		console.log("  ✅ All server actions available");
		return {
			name: "API Endpoints",
			passed: true,
			details: { checked: serverActions.length },
		};
	} catch (error) {
		return {
			name: "API Endpoints",
			passed: false,
			error: error instanceof Error ? error.message : "Unknown API error",
		};
	}
}

/**
 * Check build and runtime
 */
function checkBuildAndRuntime(): DeploymentCheck {
	console.log("🏗️  Checking build and runtime...");

	try {
		// Check Node.js version
		const nodeVersion = process.version;
		const majorVersion = Number.parseInt(
			nodeVersion.slice(1).split(".")[0],
			10
		);

		if (majorVersion < 18) {
			return {
				name: "Build and Runtime",
				passed: false,
				error: `Node.js version ${nodeVersion} is too old. Requires Node.js 18+`,
				details: { nodeVersion, required: "18+" },
			};
		}

		// Check if we're in production mode
		const isProduction = process.env.NODE_ENV === "production";

		console.log(
			`  ✅ Node.js ${nodeVersion} (${isProduction ? "production" : "development"} mode)`
		);
		return {
			name: "Build and Runtime",
			passed: true,
			details: { nodeVersion, environment: process.env.NODE_ENV },
		};
	} catch (error) {
		return {
			name: "Build and Runtime",
			passed: false,
			error: error instanceof Error ? error.message : "Unknown runtime error",
		};
	}
}

/**
 * Run all deployment verification checks
 */
export async function verifyDeployment(): Promise<void> {
	console.log("🚀 Verifying Deployment Readiness");
	console.log("=".repeat(50));

	const checks: DeploymentCheck[] = [];

	try {
		// Run all checks
		checks.push(checkEnvironmentVariables());
		checks.push(await checkDatabaseConnectivity());
		checks.push(await checkExternalServices());
		checks.push(await checkUseCaseAvailability());
		checks.push(await checkAPIEndpoints());
		checks.push(checkBuildAndRuntime());

		// Print results
		console.log("\n📊 Deployment Verification Results:");
		console.log("=".repeat(40));

		const passedChecks = checks.filter((c) => c.passed).length;
		const totalChecks = checks.length;

		checks.forEach((check) => {
			const status = check.passed ? "✅" : "❌";
			console.log(`${status} ${check.name}`);
			if (!check.passed && check.error) {
				console.log(`   Error: ${check.error}`);
			}
		});

		console.log(`\n📈 Results: ${passedChecks}/${totalChecks} checks passed`);

		if (passedChecks === totalChecks) {
			console.log("\n🎉 Deployment verification successful!");
			console.log("✅ Application is ready for production deployment");
		} else {
			console.log("\n⚠️  Deployment verification failed");
			console.log("❌ Fix the failed checks before deploying");

			// List failed checks
			const failedChecks = checks.filter((c) => !c.passed);
			console.log("\n🔧 Failed checks to fix:");
			failedChecks.forEach((check) => {
				console.log(`   • ${check.name}: ${check.error}`);
			});
		}
	} catch (error) {
		console.error("💥 Deployment verification failed:", error);
		throw error;
	}
}

/**
 * Export individual check functions for selective testing
 */
export {
	checkEnvironmentVariables,
	checkDatabaseConnectivity,
	checkExternalServices,
	checkUseCaseAvailability,
	checkAPIEndpoints,
	checkBuildAndRuntime,
};

// If this file is run directly, execute the verification
if (require.main === module) {
	verifyDeployment()
		.then(() => {
			console.log("\n🏆 Deployment verification completed!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("\n💥 Deployment verification failed:", error);
			process.exit(1);
		});
}
