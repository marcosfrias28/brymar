"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

import { useAvoidRoutes } from "@/hooks/useAvoidRoutes";

export function Footer() {
  const shouldAvoid = useAvoidRoutes();
  const [cookiesDialogOpen, setCookiesDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);
  const t = {
    companyName: "Brymar Inmobiliaria",
    rights: "Todos los derechos reservados",
    cookies: "Política de Cookies",
    privacy: "Política de Privacidad",
    followUs: "Síguenos",
    cookiesTitle: "Política de Cookies",
    cookiesContent: "Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Al continuar navegando, aceptas nuestro uso de cookies.",
    privacyTitle: "Política de Privacidad",
    privacyContent: "Tu privacidad es importante para nosotros. Esta política describe cómo recopilamos, usamos y protegemos tu información personal.",
    close: "Cerrar"
  };

  if (shouldAvoid) return null;

  return (
    <footer className="bg-zinc-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Brymar Inmobiliaria</h2>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Brymar Inmobiliaria. Todos los derechos reservados.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0"
                  onClick={() => setCookiesDialogOpen(true)}
                >
                  Cookies
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0"
                  onClick={() => setPrivacyDialogOpen(true)}
                >
                  Privacidad
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0"
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
                className="text-gray-400 hover:text-white"
                aria-label="Facebook"
              >
                <Facebook />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Instagram"
              >
                <Instagram />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
                aria-label="Twitter"
              >
                <Twitter />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white"
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
