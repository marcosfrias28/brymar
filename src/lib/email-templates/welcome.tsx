import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

interface WelcomeEmailProps {
  userName: string;
  dashboardUrl?: string;
}

export const WelcomeEmail = ({
  userName,
  dashboardUrl = "https://arbry.com/dashboard",
}: WelcomeEmailProps) => {
  return (
    <EmailLayout
      preview={`¡Bienvenido a ARBRY, ${userName}!`}
      title="Bienvenido a ARBRY"
    >
      <Text className="text-lg font-semibold text-slate-900 mb-4">
        ¡Bienvenido a ARBRY, {userName}!
      </Text>

      <Text className="text-slate-700 mb-6 leading-relaxed">
        Nos complace darte la bienvenida a nuestra plataforma. Tu cuenta ha sido 
        creada exitosamente y ya puedes comenzar a explorar todas las funcionalidades 
        que tenemos para ofrecerte.
      </Text>

      <Section className="text-center my-8">
        <Button
          href={dashboardUrl}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
        >
          Ir al Dashboard
        </Button>
      </Section>

      <Section className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg my-6">
        <Text className="text-blue-800 font-semibold text-sm mb-2">
          💡 Próximos pasos
        </Text>
        <Text className="text-blue-700 text-sm m-0">
          Te recomendamos completar tu perfil y explorar las diferentes secciones 
          de la plataforma para aprovechar al máximo todas las herramientas disponibles.
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm">
        Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. 
        ¡Estamos aquí para ayudarte!
      </Text>
    </EmailLayout>
  );
};

export default WelcomeEmail;