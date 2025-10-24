"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
// TODO: Migrate updateUserRole and syncUserRoleFromDatabase to lib/actions/auth
// import { updateUserRole, syncUserRoleFromDatabase } from "@/lib/actions/auth";
import { useUser } from "@/hooks/use-user";

export default function SyncRolePage() {
	const userIdInputId = useId();
	const newRoleInputId = useId();
	const [userId, setUserId] = useState("DUgmSzJDzEgsMc2y3bK9zJMz9dIAhmMC");
	const [newRole, setNewRole] = useState("admin");
	const [result, setResult] = useState<{
		success: boolean;
		error?: string;
	} | null>(null);
	const [loading, setLoading] = useState(false);
	const { refetch, user } = useUser();

	const handleUpdateRole = async () => {
		setLoading(true);
		try {
			const result = await updateUserRole(userId, newRole);
			setResult(result);

			// Forzar refresh de la sesión después de actualizar
			if (result.success) {
				setTimeout(() => {
					refetch();
				}, 1000);
			}
		} catch (error) {
			setResult({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleSyncRole = async () => {
		setLoading(true);
		try {
			const result = await syncUserRoleFromDatabase(userId);
			setResult(result);
		} catch (error) {
			setResult({
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="container mx-auto p-8">
			<Card className="max-w-md mx-auto">
				<CardHeader>
					<CardTitle>Sync User Role</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<label
							htmlFor={userIdInputId}
							className="block text-sm font-medium mb-2"
						>
							User ID
						</label>
						<Input
							id={userIdInputId}
							value={userId}
							onChange={(e) => setUserId(e.target.value)}
							placeholder="User ID"
						/>
					</div>

					<div>
						<label
							htmlFor={newRoleInputId}
							className="block text-sm font-medium mb-2"
						>
							New Role
						</label>
						<Input
							id={newRoleInputId}
							value={newRole}
							onChange={(e) => setNewRole(e.target.value)}
							placeholder="admin, user, agent"
						/>
					</div>

					<div className="space-y-2">
						<Button
							onClick={handleUpdateRole}
							disabled={loading}
							className="w-full"
						>
							{loading ? "Updating..." : "Update Role"}
						</Button>

						<Button
							onClick={handleSyncRole}
							disabled={loading}
							variant="outline"
							className="w-full"
						>
							{loading ? "Syncing..." : "Sync Role from DB"}
						</Button>

						<Button
							onClick={() => refetch()}
							disabled={loading}
							variant="secondary"
							className="w-full"
						>
							Force Refresh Session
						</Button>
					</div>

					<div className="mt-4 p-3 bg-blue-100 text-blue-800 rounded">
						<h3 className="font-semibold">Current User Info:</h3>
						<pre className="text-sm mt-2">
							{JSON.stringify(
								{
									id: user?.id,
									role: user?.role,
									email: user?.email,
									firstName: user?.firstName,
									lastName: user?.lastName,
								},
								null,
								2,
							)}
						</pre>
					</div>

					{result && (
						<div
							className={`p-3 rounded ${
								result.success
									? "bg-green-100 text-green-800"
									: "bg-red-100 text-red-800"
							}`}
						>
							<pre>{JSON.stringify(result, null, 2)}</pre>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
