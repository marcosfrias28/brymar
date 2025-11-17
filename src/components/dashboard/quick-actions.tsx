"use client";

import { Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const quickActions: any[] = [];

export function QuickActions() {
	return (
		<div className="space-y-4">
			<Card className="transition-all duration-200 hover:border-secondary/20 hover:shadow-md">
				<CardHeader className="border-secondary/10 border-b">
					<CardTitle className="flex items-center gap-2">
						<Zap className="h-5 w-5 text-secondary" />
						Acciones Rápidas
					</CardTitle>
				</CardHeader>
                <CardContent className="space-y-3 pt-6" />
			</Card>

            
		</div>
	);
}
