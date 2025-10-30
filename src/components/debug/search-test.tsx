"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { searchLandsAction } from "@/lib/actions/land-actions";
import { searchPropertiesAction } from "@/lib/actions/property-actions";

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
			const result = await searchPropertiesAction(
				{ success: false, data: { properties: [] } },
				formData
			);
			setPropertyResult(result);
		} catch (error) {
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
			const result = await searchLandsAction(
				{ success: false, data: { lands: [] } },
				formData
			);
			setLandResult(result);
		} catch (error) {
			setLandResult({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-6 p-6">
			<h1 className="font-bold text-2xl">Search Actions Test</h1>

			<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
				{/* Property Search Test */}
				<Card>
					<CardHeader>
						<CardTitle>🏠 Property Search Test</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<Button
							className="w-full"
							disabled={loading}
							onClick={testPropertySearch}
						>
							{loading ? "Testing..." : "Test Property Search"}
						</Button>

						{propertyResult && (
							<div className="mt-4">
								<h4 className="mb-2 font-semibold">Result:</h4>
								<pre className="max-h-64 overflow-auto rounded bg-gray-100 p-3 text-xs">
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
							className="w-full"
							disabled={loading}
							onClick={testLandSearch}
						>
							{loading ? "Testing..." : "Test Land Search"}
						</Button>

						{landResult && (
							<div className="mt-4">
								<h4 className="mb-2 font-semibold">Result:</h4>
								<pre className="max-h-64 overflow-auto rounded bg-gray-100 p-3 text-xs">
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
						<ul className="ml-4 list-inside list-disc space-y-1">
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
