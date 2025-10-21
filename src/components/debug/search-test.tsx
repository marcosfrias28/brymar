"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchPropertiesAction } from "@/lib/actions/property-actions";
import { searchLands } from "@/lib/actions/lands";

export function SearchTest() {
  const [propertyResult, setPropertyResult] = useState<any>(null);
  const [landResult, setLandResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testPropertySearch = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("query", "");
      formData.append("location", "");
      formData.append("propertyType", "all");
      formData.append("status", "published");
      formData.append("sortBy", "newest");
      formData.append("limit", "5");
      formData.append("offset", "0");

      console.log("🏠 Testing property search...");
      const result = await searchPropertiesAction(formData);
      console.log("🏠 Property search result:", result);
      setPropertyResult(result);
    } catch (error) {
      console.error("❌ Property search error:", error);
      setPropertyResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testLandSearch = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("query", "");
      formData.append("location", "");
      formData.append("landType", "all");
      formData.append("status", "published");
      formData.append("sortBy", "newest");
      formData.append("limit", "5");
      formData.append("offset", "0");

      console.log("🏞️ Testing land search...");
      const result = await searchLandsAction(formData);
      console.log("🏞️ Land search result:", result);
      setLandResult(result);
    } catch (error) {
      console.error("❌ Land search error:", error);
      setLandResult({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Search Actions Test</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Property Search Test */}
        <Card>
          <CardHeader>
            <CardTitle>🏠 Property Search Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testPropertySearch}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test Property Search"}
            </Button>

            {propertyResult && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Result:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(propertyResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Land Search Test */}
        <Card>
          <CardHeader>
            <CardTitle>🏞️ Land Search Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={testLandSearch}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Testing..." : "Test Land Search"}
            </Button>

            {landResult && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Result:</h4>
                <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-64">
                  {JSON.stringify(landResult, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>📊 Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Environment:</strong> {process.env.NODE_ENV}
            </p>
            <p>
              <strong>Database URL:</strong>{" "}
              {process.env.POSTGRES_URL ? "✅ Configured" : "❌ Missing"}
            </p>
            <p>
              <strong>Instructions:</strong>
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Click the buttons to test search actions</li>
              <li>Check browser console for detailed logs</li>
              <li>Check server logs for backend errors</li>
              <li>Results will show success/error status and data</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
