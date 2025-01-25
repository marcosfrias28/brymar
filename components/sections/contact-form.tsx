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
import { useLangStore } from "@/utils/store/lang-store";
import { ContactFormTranslations as translations } from "@/lib/translations";

export function ContactForm() {
  const language = useLangStore((prev) => prev.language);

  const {
    title,
    subtitle,
    name,
    email,
    message,
    send,
    contact,
    address,
    phone,
    emailAddress,
  } = translations[language];

  return (
    <section className="py-16 px-4 bg-gray-50">
      <div className="container mx-auto">
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-800">
          {title}
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12">{subtitle}</p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white  border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">{contact}</CardTitle>
              <CardDescription className="text-gray-600">
                {subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-gray-700">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <p>{address}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-500" />
                <p>{phone}</p>
              </div>
              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-gray-500" />
                <p>{emailAddress}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200 shadow-lg">
            <CardHeader>
              <CardTitle className="text-gray-800">{title}</CardTitle>
              <CardDescription className="text-gray-600">
                {subtitle}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div>
                  <Input
                    placeholder={name}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder={email}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder={message}
                    rows={4}
                    className="border-gray-300 focus:border-gray-500"
                  />
                </div>
                <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white">
                  {send}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
