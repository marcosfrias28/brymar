"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  details?: any;
  duration?: number;
}

/**
 * End-to-End Testing Page
 * Provides a web interface to run comprehensive E2E tests
 */
export default function TestE2EPage() {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string>("");

  const runAllTests = async () => {
    setIsRunning(true);
    setTestResults([]);
    setCurrentTest("Initializing...");

    try {
      // Import the test functions dynamically to avoid SSR issues
      const { runEndToEndTests } = await import(
        "@/tests/e2e-functionality.test"
      );

      // Capture console output for display
      const originalLog = console.log;
      const originalError = console.error;
      const logs: string[] = [];
      const results: TestResult[] = [];

      console.log = (...args) => {
        const message = args
          .map((arg) =>
            typeof arg === "object" ? JSON.stringify(arg) : String(arg)
          )
          .join(" ");
        logs.push(message);
        originalLog(...args);

        // Extract test progress from logs
        if (message.includes("Testing")) {
          setCurrentTest(message.replace(/[🧪👤🏠🌾🧙🗄️]/g, "").trim());
        }
      };

      console.error = (...args) => {
        const message =
          "❌ " +
          args
            .map((arg) =>
              typeof arg === "object" ? JSON.stringify(arg) : String(arg)
            )
            .join(" ");
        logs.push(message);
        originalError(...args);
      };

      // Run the tests
      await runEndToEndTests();

      // Parse results from logs
      const testNames = [
        "Database Connection and Operations",
        "User Registration and Profile Updates",
        "Property Creation and Search",
        "Land Creation and Search",
        "Wizard Functionality with Real Data",
      ];

      testNames.forEach((testName) => {
        const passed = logs.some((log) => log.includes(`✅ ${testName}`));
        const errorLog = logs.find((log) => log.includes(`❌ ${testName}`));

        results.push({
          testName,
          passed,
          error: errorLog
            ? errorLog.split(":").slice(1).join(":").trim()
            : undefined,
        });
      });

      // Restore console
      console.log = originalLog;
      console.error = originalError;

      setTestResults(results);
      setCurrentTest("Completed");
    } catch (error) {
      setTestResults([
        {
          testName: "Test Execution",
          passed: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      ]);
      setCurrentTest("Failed");
    } finally {
      setIsRunning(false);
    }
  };

  const runIndividualTest = async (testName: string, testFunction: string) => {
    setIsRunning(true);
    setCurrentTest(`Running ${testName}...`);

    try {
      const testModule = await import("@/tests/e2e-functionality.test");
      const testFn = (testModule as any)[testFunction];

      if (!testFn) {
        throw new Error(`Test function ${testFunction} not found`);
      }

      const startTime = Date.now();
      const result = await testFn();
      const duration = Date.now() - startTime;

      setTestResults([{ ...result, duration }]);
      setCurrentTest("Completed");
    } catch (error) {
      setTestResults([
        {
          testName,
          passed: false,
          error:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      ]);
      setCurrentTest("Failed");
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"}>
        {passed ? "✅ PASS" : "❌ FAIL"}
      </Badge>
    );
  };

  const passedCount = testResults.filter((r) => r.passed).length;
  const totalCount = testResults.length;

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            🧪 End-to-End Functionality Tests
          </CardTitle>
          <CardDescription>
            Comprehensive testing of all major application features with real
            data
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Test Overview */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg text-blue-800">
                🎯 What These Tests Verify
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">👤</span>
                    <span>User registration and profile updates work</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🏠</span>
                    <span>Property creation and search work</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🌾</span>
                    <span>Land creation and search work</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🧙</span>
                    <span>Wizard functionality works with real data</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-blue-600 mr-2">🗄️</span>
                    <span>Database connections work properly</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Test Controls */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isRunning ? "🔄 Running Tests..." : "🚀 Run All E2E Tests"}
              </Button>
            </div>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Button
                onClick={() =>
                  runIndividualTest(
                    "Database Connection",
                    "testDatabaseConnection"
                  )
                }
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                🗄️ Database Test
              </Button>

              <Button
                onClick={() =>
                  runIndividualTest(
                    "User Profile",
                    "testUserRegistrationAndProfile"
                  )
                }
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                👤 User Test
              </Button>

              <Button
                onClick={() =>
                  runIndividualTest(
                    "Property Features",
                    "testPropertyCreationAndSearch"
                  )
                }
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                🏠 Property Test
              </Button>

              <Button
                onClick={() =>
                  runIndividualTest(
                    "Land Features",
                    "testLandCreationAndSearch"
                  )
                }
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                🌾 Land Test
              </Button>

              <Button
                onClick={() =>
                  runIndividualTest(
                    "Wizard Features",
                    "testWizardFunctionality"
                  )
                }
                disabled={isRunning}
                variant="outline"
                size="sm"
              >
                🧙 Wizard Test
              </Button>
            </div>
          </div>

          {/* Current Test Status */}
          {isRunning && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
                  <span className="text-yellow-800 font-medium">
                    {currentTest}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Test Results */}
          {testResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>📊 Test Results</span>
                  <Badge
                    variant={
                      passedCount === totalCount ? "default" : "destructive"
                    }
                  >
                    {passedCount}/{totalCount} Passed
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <Card
                      key={index}
                      className={
                        result.passed
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }
                    >
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{result.testName}</h4>
                          <div className="flex items-center space-x-2">
                            {result.duration && (
                              <Badge variant="outline" className="text-xs">
                                {result.duration}ms
                              </Badge>
                            )}
                            {getStatusBadge(result.passed)}
                          </div>
                        </div>

                        {result.error && (
                          <div className="text-sm text-red-600 bg-red-100 p-2 rounded">
                            <strong>Error:</strong> {result.error}
                          </div>
                        )}

                        {result.details && (
                          <details className="text-sm text-gray-600 mt-2">
                            <summary className="cursor-pointer font-medium">
                              View Details
                            </summary>
                            <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Requirements Checklist */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">
                📋 Task 7 Requirements Checklist
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        testResults.find((r) => r.testName.includes("User"))
                          ?.passed
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {testResults.find((r) => r.testName.includes("User"))
                        ?.passed
                        ? "✅"
                        : "⏳"}
                    </span>
                    <span>User registration and profile updates work</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        testResults.find((r) => r.testName.includes("Property"))
                          ?.passed
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {testResults.find((r) => r.testName.includes("Property"))
                        ?.passed
                        ? "✅"
                        : "⏳"}
                    </span>
                    <span>Property creation and search work</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        testResults.find((r) => r.testName.includes("Land"))
                          ?.passed
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {testResults.find((r) => r.testName.includes("Land"))
                        ?.passed
                        ? "✅"
                        : "⏳"}
                    </span>
                    <span>Land creation and search work</span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className={`mr-2 ${
                        testResults.find((r) => r.testName.includes("Wizard"))
                          ?.passed
                          ? "text-green-600"
                          : "text-gray-400"
                      }`}
                    >
                      {testResults.find((r) => r.testName.includes("Wizard"))
                        ?.passed
                        ? "✅"
                        : "⏳"}
                    </span>
                    <span>Wizard functionality works with real data</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Success Message */}
          {testResults.length > 0 && passedCount === totalCount && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-4xl mb-2">🎉</div>
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    All End-to-End Tests Passed!
                  </h3>
                  <p className="text-green-700">
                    The application is working properly with real data and is
                    ready for deployment.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
