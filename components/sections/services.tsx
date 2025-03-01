"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Globe, Home, Key, Search, Shield, TrendingUp } from "lucide-react";
import { useLangStore } from "@/utils/store/lang-store";
import { translations } from "@/lib/translations";

const services = [
  {
    title: "Global Property Search",
    description:
      "Access our curated portfolio of the world's most prestigious properties, from beachfront villas to urban penthouses.",
    icon: Search,
    color: "bg-blue-500",
  },
  {
    title: "Luxury Property Management",
    description:
      "Comprehensive management services to maintain and enhance the value of your high-end properties.",
    icon: Home,
    color: "bg-green-500",
  },
  {
    title: "VIP Buying Experience",
    description:
      "Personalized guidance throughout your luxury property acquisition, including private viewings and negotiations.",
    icon: Key,
    color: "bg-purple-500",
  },
  {
    title: "Investment Advisory",
    description:
      "Expert advice on prime real estate investment opportunities and portfolio diversification strategies.",
    icon: TrendingUp,
    color: "bg-red-500",
  },
  {
    title: "International Relocation",
    description:
      "Seamless relocation services for global clients, including visa assistance and local orientation.",
    icon: Globe,
    color: "bg-yellow-500",
  },
  {
    title: "Secure Transactions",
    description:
      "Ensure the confidentiality and security of your high-value property transactions with our specialized legal team.",
    icon: Shield,
    color: "bg-indigo-500",
  },
];

export function Services() {
  const language = useLangStore((prev) => prev.language);
  // const { title, subtitle, learnMore, services } = translations[language].;

  return (
    <section className="py-24 px-4 bg-white">
      <div className="container mx-auto">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* {title} */}
        </motion.h2>
        <motion.p
          className="text-xl text-gray-600 text-center mb-16 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* {t("subtitle")} */}
        </motion.p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {services.map(({ title, description, icon: Icon, color }, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 * (index + 1) }}
            >
              <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader>
                  <div
                    className={`${color} w-16 h-16 rounded-full flex items-center justify-center mb-4`}
                  >
                    <Icon />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-800">
                    {title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-6">
                    {description}
                  </CardDescription>
                  <Button
                    variant="outline"
                    className="text-gray-800 border-gray-300 hover:bg-gray-100"
                  >
                    {/* {t("learnMore")} */}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
