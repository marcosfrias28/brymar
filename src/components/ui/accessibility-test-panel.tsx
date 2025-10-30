"use client";

import { AlertTriangle, CheckCircle, Eye, EyeOff, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
	AccessibilityAuditor,
	validateSecondaryColorContrast,
} from "@/lib/utils/accessibility-testing";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle } from "./card";

/**
 * Development-only accessibility testing panel
 * Shows accessibility audit results and color contrast validation
 */
export function AccessibilityTestPanel() {
	const [isVisible, setIsVisible] = useState(false);
	const [auditResults, setAuditResults] = useState<any>(null);
	const [contrastResults, setContrastResults] = useState<any>(null);

	// Only show in development
	if (process.env.NODE_ENV !== "development") {
		return null;
	}

	const runAudit = () => {
		const results = AccessibilityAuditor.auditContainer();
		const contrast = validateSecondaryColorContrast();

		setAuditResults(results);
		setContrastResults(contrast);
	};

	const getScoreColor = (score: number) => {
		if (score >= 90) {
			return "text-green-600";
		}
		if (score >= 70) {
			return "text-yellow-600";
		}
		return "text-red-600";
	};

	const getScoreBadgeVariant = (
		score: number
	): "default" | "secondary" | "destructive" => {
		if (score >= 90) {
			return "default";
		}
		if (score >= 70) {
			return "secondary";
		}
		return "destructive";
	};

	if (!isVisible) {
		return (
			<div className="fixed right-4 bottom-4 z-50">
				<Button
					aria-label="Mostrar panel de accesibilidad"
					className="shadow-lg"
					onClick={() => setIsVisible(true)}
					size="sm"
					variant="outline"
				>
					<Eye className="h-4 w-4" />
					A11y Test
				</Button>
			</div>
		);
	}

	return (
		<div className="fixed right-4 bottom-4 z-50 max-h-[80vh] w-96 overflow-auto">
			<Card className="border-2 shadow-xl">
				<CardHeader className="pb-3">
					<div className="flex items-center justify-between">
						<CardTitle className="text-lg">Accessibility Audit</CardTitle>
						<div className="flex gap-2">
							<Button
								aria-label="Ejecutar auditoría de accesibilidad"
								onClick={runAudit}
								size="sm"
								variant="outline"
							>
								Run Audit
							</Button>
							<Button
								aria-label="Cerrar panel de accesibilidad"
								onClick={() => setIsVisible(false)}
								size="sm"
								variant="ghost"
							>
								<EyeOff className="h-4 w-4" />
							</Button>
						</div>
					</div>
				</CardHeader>

				<CardContent className="space-y-4">
					{/* Overall Score */}
					{auditResults && (
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<span className="font-medium">Overall Score</span>
								<Badge
									className={getScoreColor(auditResults.overallScore)}
									variant={getScoreBadgeVariant(auditResults.overallScore)}
								>
									{auditResults.overallScore.toFixed(1)}%
								</Badge>
							</div>

							<div className="grid grid-cols-3 gap-2 text-sm">
								<div className="text-center">
									<div className="font-medium text-green-600">
										{auditResults.summary.passedElements}
									</div>
									<div className="text-muted-foreground">Passed</div>
								</div>
								<div className="text-center">
									<div className="font-medium text-red-600">
										{auditResults.summary.failedElements}
									</div>
									<div className="text-muted-foreground">Failed</div>
								</div>
								<div className="text-center">
									<div className="font-medium">
										{auditResults.summary.totalElements}
									</div>
									<div className="text-muted-foreground">Total</div>
								</div>
							</div>
						</div>
					)}

					{/* Color Contrast Results */}
					{contrastResults && (
						<div className="space-y-2">
							<h4 className="font-medium">Color Contrast</h4>
							<div className="space-y-1">
								<div className="flex items-center justify-between text-sm">
									<span>Light Mode</span>
									{contrastResults.lightMode ? (
										<CheckCircle className="h-4 w-4 text-green-600" />
									) : (
										<XCircle className="h-4 w-4 text-red-600" />
									)}
								</div>
								<div className="flex items-center justify-between text-sm">
									<span>Dark Mode</span>
									{contrastResults.darkMode ? (
										<CheckCircle className="h-4 w-4 text-green-600" />
									) : (
										<XCircle className="h-4 w-4 text-red-600" />
									)}
								</div>
							</div>
						</div>
					)}

					{/* Common Issues */}
					{auditResults?.summary.commonIssues.length > 0 && (
						<div className="space-y-2">
							<h4 className="flex items-center gap-2 font-medium">
								<AlertTriangle className="h-4 w-4 text-yellow-600" />
								Common Issues
							</h4>
							<ul className="space-y-1 text-sm">
								{auditResults.summary.commonIssues.map(
									(issue: string, index: number) => (
										<li className="text-muted-foreground" key={index}>
											• {issue}
										</li>
									)
								)}
							</ul>
						</div>
					)}

					{/* Failed Elements */}
					{auditResults?.elementAudits.filter((a: any) => a.score < 80).length >
						0 && (
						<div className="space-y-2">
							<h4 className="font-medium">Failed Elements</h4>
							<div className="max-h-40 space-y-2 overflow-auto">
								{auditResults.elementAudits
									.filter((audit: any) => audit.score < 80)
									.slice(0, 5)
									.map((audit: any, index: number) => (
										<div className="rounded bg-muted p-2 text-sm" key={index}>
											<div className="font-medium">
												{audit.tagName} ({audit.score.toFixed(1)}%)
											</div>
											<div className="text-muted-foreground text-xs">
												{audit.issues.join(", ")}
											</div>
										</div>
									))}
							</div>
						</div>
					)}

					{/* Quick Actions */}
					<div className="space-y-2">
						<h4 className="font-medium">Quick Tests</h4>
						<div className="grid grid-cols-2 gap-2">
							<Button
								onClick={() => {
									// Test keyboard navigation
									const _focusableElements = document.querySelectorAll(
										'button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])'
									);
								}}
								size="sm"
								variant="outline"
							>
								Test Focus
							</Button>
							<Button
								onClick={() => {
									// Test ARIA labels
									const _elementsWithoutLabels = document.querySelectorAll(
										"button:not([aria-label]):not([aria-labelledby]), input:not([aria-label]):not([aria-labelledby])"
									);
								}}
								size="sm"
								variant="outline"
							>
								Test ARIA
							</Button>
						</div>
					</div>

					{!auditResults && (
						<div className="py-4 text-center text-muted-foreground text-sm">
							Click &quot;Run Audit&quot; to analyze accessibility
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

/**
 * Keyboard shortcut overlay for accessibility testing
 */
export function AccessibilityKeyboardShortcuts() {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			// Show/hide with Ctrl+Shift+A
			if (event.ctrlKey && event.shiftKey && event.key === "A") {
				event.preventDefault();
				setIsVisible(!isVisible);
			}

			// Hide with Escape
			if (event.key === "Escape" && isVisible) {
				setIsVisible(false);
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isVisible]);

	if (!isVisible || process.env.NODE_ENV !== "development") {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 w-80">
			<Card className="border-2 shadow-xl">
				<CardHeader className="pb-3">
					<CardTitle className="text-lg">Keyboard Shortcuts</CardTitle>
				</CardHeader>
				<CardContent className="space-y-2 text-sm">
					<div className="grid grid-cols-2 gap-2">
						<kbd className="rounded bg-muted px-2 py-1 text-xs">Tab</kbd>
						<span>Navigate forward</span>

						<kbd className="rounded bg-muted px-2 py-1 text-xs">Shift+Tab</kbd>
						<span>Navigate backward</span>

						<kbd className="rounded bg-muted px-2 py-1 text-xs">Enter</kbd>
						<span>Activate button/link</span>

						<kbd className="rounded bg-muted px-2 py-1 text-xs">Space</kbd>
						<span>Activate button</span>

						<kbd className="rounded bg-muted px-2 py-1 text-xs">Escape</kbd>
						<span>Close modal/menu</span>

						<kbd className="rounded bg-muted px-2 py-1 text-xs">Arrows</kbd>
						<span>Navigate menu items</span>
					</div>

					<div className="border-t pt-2">
						<div className="text-muted-foreground text-xs">
							Press <kbd className="rounded bg-muted px-1">Ctrl+Shift+A</kbd> to
							toggle this panel
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
