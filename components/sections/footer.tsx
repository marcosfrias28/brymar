"use client";

import { use, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { useLangStore } from "@/utils/store/lang-store";

export function Footer() {
  const language = useLangStore((prev) => prev.language);
  const [cookiesDialogOpen, setCookiesDialogOpen] = useState(false);
  const [privacyDialogOpen, setPrivacyDialogOpen] = useState(false);

  const translations = {
    en: {
      companyName: "Luxury Real Estate",
      rights: "All rights reserved",
      cookies: "Cookie Policy",
      privacy: "Privacy Policy",
      terms: "Terms of Service",
      cookiesTitle: "Cookie Policy",
      cookiesContent:
        "This website uses cookies to enhance the user experience...",
      privacyTitle: "Privacy Policy",
      privacyContent:
        "At Luxury Real Estate, we take your privacy seriously...",
    },
    es: {
      companyName: "Inmobiliaria de Lujo",
      rights: "Todos los derechos reservados",
      cookies: "Política de Cookies",
      privacy: "Política de Privacidad",
      terms: "Términos de Servicio",
      cookiesTitle: "Política de Cookies",
      cookiesContent:
        "Este sitio web utiliza cookies para mejorar la experiencia del usuario...",
      privacyTitle: "Política de Privacidad",
      privacyContent:
        "En Inmobiliaria de Lujo, nos tomamos su privacidad muy en serio...",
    },
    it: {
      companyName: "Immobiliare di Lusso",
      rights: "Tutti i diritti riservati",
      cookies: "Politica dei Cookie",
      privacy: "Politica sulla Privacy",
      terms: "Termini di Servizio",
      cookiesTitle: "Politica dei Cookie",
      cookiesContent:
        "Questo sito web utilizza i cookie per migliorare l'esperienza dell'utente...",
      privacyTitle: "Politica sulla Privacy",
      privacyContent:
        "In Immobiliare di Lusso, prendiamo molto sul serio la tua privacy...",
    },
  };

  const t = translations[language];

  return (
    <footer className="bg-zinc-900 text-[#f7f7f7] py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">{t.companyName}</h2>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} {t.companyName}. {t.rights}.
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
                  {t.cookies}
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0"
                  onClick={() => setPrivacyDialogOpen(true)}
                >
                  {t.privacy}
                </Button>
              </li>
              <li>
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-white p-0"
                >
                  {t.terms}
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
            <DialogTitle>{t.cookiesTitle}</DialogTitle>
          </DialogHeader>
          <p>{t.cookiesContent}</p>
        </DialogContent>
      </Dialog>

      <Dialog open={privacyDialogOpen} onOpenChange={setPrivacyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.privacyTitle}</DialogTitle>
          </DialogHeader>
          <p>{t.privacyContent}</p>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
