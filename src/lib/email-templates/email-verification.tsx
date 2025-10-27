import { Text, Button, Section } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

interface EmailVerificationProps {
  userName: string;
  verificationUrl: string;
}

export const EmailVerificationEmail = ({
  userName,
  verificationUrl,
}: EmailVerificationProps) => {
  return (
    <EmailLayout
      preview="Verifica tu dirección de correo electrónico"
      title="Verificación de Email - ARBRY"
    >
      <Text className="text-lg font-semibold text-slate-900 mb-4">
        ¡Hola {userName}!
      </Text>

      <Text className="text-slate-700 mb-6 leading-relaxed">
        Gracias por registrarte en ARBRY. Para completar tu registro y activar 
        tu cuenta, necesitamos verificar tu dirección de correo electrónico.
      </Text>

      <Section className="text-center my-8">
        <Button
          href={verificationUrl}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
        >
          Verificar Email
        </Button>
      </Section>

      <Section className="bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg my-6">
        <Text className="text-green-800 font-semibold text-sm mb-2">
          ✅ ¿Por qué verificar?
        </Text>
        <Text className="text-green-700 text-sm m-0">
          La verificación nos ayuda a mantener tu cuenta segura y asegurar que 
          puedas recibir notificaciones importantes sobre tu cuenta.
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm mb-3">
        Este enlace de verificación expirará en 48 horas. Si no puedes hacer clic 
        en el botón, copia y pega el siguiente enlace en tu navegador:
      </Text>

      <Section className="bg-slate-50 p-3 rounded border text-xs text-slate-600 break-all">
        {verificationUrl}
      </Section>
    </EmailLayout>
  );
};

export default EmailVerificationEmail;