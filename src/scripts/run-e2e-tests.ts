#!/usr/bin/env node

/**
 * End-to-End Test Runner
 * Runs comprehensive tests for Task 7 verification
 */

import { verifyDeployment } from "@/scripts/verify-deployment";
import { runEndToEndTests } from "@/tests/e2e-functionality.test";
import { runMockEndToEndTests } from "@/tests/e2e-functionality-mock.test";

interface TestSuite {
	name: string;
	description: string;
	runner: () => Promise<void>;
}

const testSuites: TestSuite[] = [
	{
		name: "deployment",
		description: "Verify deployment readiness and configuration",
		runner: verifyDeployment,
	},
	{
		name: "e2e",
		description: "Run end-to-end functionality tests (requires database)",
		runner: runEndToEndTests,
	},
	{
		name: "e2e-mock",
		description: "Run end-to-end functionality tests with mocks",
		runner: runMockEndToEndTests,
	},
];

/**
 * Print usage information
 */
function printUsage(): void {
	console.log("🧪 End-to-End Test Runner");
	console.log("=".repeat(30));
	console.log("");
	console.log("Usage: npm run test:e2e [suite]");
	console.log("");
	console.log("Available test suites:");
	testSuites.forEach((suite) => {
		console.log(`  ${suite.name.padEnd(12)} - ${suite.description}`);
	});
	console.log("");
	console.log("Examples:");
	console.log("  npm run test:e2e              # Run all test suites");
	console.log("  npm run test:e2e deployment   # Run only deployment tests");
	console.log(
		"  npm run test:e2e e2e           # Run only E2E functionality tests",
	);
}

/**
 * Run a specific test suite
 */
async function runTestSuite(suiteName: string): Promise<boolean> {
	const suite = testSuites.find((s) => s.name === suiteName);

	if (!suite) {
		console.error(`❌ Unknown test suite: ${suiteName}`);
		return false;
	}

	console.log(`🚀 Running ${suite.name} tests...`);
	console.log(`📝 ${suite.description}`);
	console.log("");

	try {
		await suite.runner();
		console.log(`\n✅ ${suite.name} tests completed successfully`);
		return true;
	} catch (error) {
		console.error(`\n❌ ${suite.name} tests failed:`, error);
		return false;
	}
}

/**
 * Run all test suites
 */
async function runAllTestSuites(): Promise<void> {
	console.log("🧪 Running All End-to-End Tests");
	console.log("=".repeat(40));
	console.log("");

	const results: { suite: string; passed: boolean }[] = [];

	for (const suite of testSuites) {
		console.log(`\n${"=".repeat(50)}`);
		const passed = await runTestSuite(suite.name);
		results.push({ suite: suite.name, passed });
		console.log(`${"=".repeat(50)}\n`);
	}

	// Print summary
	console.log("📊 Test Suite Summary:");
	console.log("=".repeat(25));

	const passedSuites = results.filter((r) => r.passed).length;
	const totalSuites = results.length;

	results.forEach((result) => {
		const status = result.passed ? "✅" : "❌";
		console.log(`${status} ${result.suite}`);
	});

	console.log(
		`\n📈 Overall Results: ${passedSuites}/${totalSuites} test suites passed`,
	);

	if (passedSuites === totalSuites) {
		console.log("\n🎉 All end-to-end tests passed!");
		console.log("✅ Task 7 requirements have been successfully verified");
		console.log("🚀 Application is ready for production deployment");
	} else {
		console.log("\n⚠️  Some test suites failed");
		console.log("❌ Review the failed tests above");
		throw new Error("End-to-end tests failed");
	}
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
	const args = process.argv.slice(2);

	if (args.includes("--help") || args.includes("-h")) {
		printUsage();
		return;
	}

	const suiteName = args[0];

	if (!suiteName) {
		// Run all test suites
		await runAllTestSuites();
	} else {
		// Run specific test suite
		const success = await runTestSuite(suiteName);
		if (!success) {
			process.exit(1);
		}
	}
}

// Execute if run directly
if (require.main === module) {
	main()
		.then(() => {
			console.log("\n🏆 Test execution completed successfully!");
			process.exit(0);
		})
		.catch((error) => {
			console.error("\n💥 Test execution failed:", error);
			process.exit(1);
		});
}

export { runTestSuite, runAllTestSuites };
