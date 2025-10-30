"use client";

import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

import { useAvoidRoutes } from "@/hooks/use-avoid-routes";
import Logo from "../ui/logo";

export function Footer() {
	const shouldAvoid = useAvoidRoutes();
	const [cookiesDialogOpen, setCookiesDialogOpen] = useState(false);
	const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

	if (shouldAvoid) {
		return null;
	}

	return (
		<footer className="border-t bg-background py-12">
			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 gap-8 md:grid-cols-4">
					<div className="col-span-1 md:col-span-2">
						<Logo />
						<p className="text-muted-foreground">
							&copy; {new Date().getFullYear()} Marbry Inmobiliaria. Todos los
							derechos reservados.
						</p>
					</div>
					<div>
						<h3 className="mb-4 font-semibold text-lg">Legal</h3>
						<ul className="space-y-2">
							<li>
								<Button
									className="p-0 text-muted-foreground hover:text-foreground"
									onClick={() => setCookiesDialogOpen(true)}
									variant="link"
								>
									Cookies
								</Button>
							</li>
							<li>
								<Button
									className="p-0 text-muted-foreground hover:text-foreground"
									onClick={() => setPrivacyDialogOpen(true)}
									variant="link"
								>
									Privacidad
								</Button>
							</li>
							<li>
								<Button
									className="p-0 text-muted-foreground hover:text-foreground"
									variant="link"
								>
									Términos
								</Button>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="mb-4 font-semibold text-lg">Follow Us</h3>
						<div className="flex space-x-4">
							<a
								aria-label="Facebook"
								className="text-muted-foreground hover:text-foreground"
								href="#"
							>
								<Facebook />
							</a>
							<a
								aria-label="Instagram"
								className="text-muted-foreground hover:text-foreground"
								href="#"
							>
								<Instagram />
							</a>
							<a
								aria-label="Twitter"
								className="text-muted-foreground hover:text-foreground"
								href="#"
							>
								<Twitter />
							</a>
							<a
								aria-label="LinkedIn"
								className="text-muted-foreground hover:text-foreground"
								href="#"
							>
								<Linkedin />
							</a>
						</div>
					</div>
				</div>
			</div>

			<Dialog onOpenChange={setCookiesDialogOpen} open={cookiesDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Política de Cookies</DialogTitle>
					</DialogHeader>
					<p>
						Utilizamos cookies para mejorar su experiencia en nuestro sitio web.
					</p>
				</DialogContent>
			</Dialog>

			<Dialog onOpenChange={setPrivacyDialogOpen} open={privacyDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Política de Privacidad</DialogTitle>
					</DialogHeader>
					<p>Respetamos su privacidad y protegemos sus datos personales.</p>
				</DialogContent>
			</Dialog>
		</footer>
	);
}
