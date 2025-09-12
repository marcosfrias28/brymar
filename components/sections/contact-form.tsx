"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";
export function ContactForm() {

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          Contáctanos
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">Estamos aquí para ayudarte a encontrar tu propiedad ideal</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white  border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">Información de Contacto</CardTitle>
              <CardDescription className="text-gray-600">
                Estamos aquí para ayudarte a encontrar tu propiedad ideal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <p>Av. Principal 123, Ciudad, País</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <p>contacto@brymar.com</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">Envíanos un Mensaje</CardTitle>
              <CardDescription className="text-gray-600">
                Completa el formulario y nos pondremos en contacto contigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Input
                    placeholder="Nombre completo"
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Correo electrónico"
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Tu mensaje"
                    rows={4}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                  Enviar Mensaje
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
