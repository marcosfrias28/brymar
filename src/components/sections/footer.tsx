"use client";

import { useState } from "react";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

import { useAvoidRoutes } from '@/hooks/use-avoid-routes';
import Logo from "../ui/logo";

export function Footer() { 
  const shouldAvoid = useAvoidRoutes();
  const [cookiesDialogOpen, setCookiesDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  if (shouldAvoid) return null;

  return (
    <footer className="bg-background border-t py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Logo />
            <p className="text-muted-foreground">
              &copy; {new Date().getFullYear()} Marbry Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground p-0"
                  onClick={() => setCookiesDialogOpen(true)}
                >
                  Cookies
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground p-0"
                  onClick={() => setPrivacyDialogOpen(true)}
                >
                  Privacidad
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-muted-foreground hover:text-foreground p-0"
                >
                  Términos
                </Button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter />
              </a>
              <a
                href="#"
                className="text-muted-foreground hover:text-foreground"
                aria-label="LinkedIn"
              >
                <Linkedin />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={cookiesDialogOpen} onOpenChange={setCookiesDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Política de Cookies</DialogTitle>
          </DialogHeader>
          <p>Utilizamos cookies para mejorar su experiencia en nuestro sitio web.</p>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
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
