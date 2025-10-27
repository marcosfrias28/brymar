import { Text, Button, Link, Section } from "@react-email/components";
import { EmailLayout } from "./components/email-layout";

interface ForgotPasswordEmailProps {
  userName?: string;
  resetUrl: string;
}

export const ForgotPasswordEmail = ({
  userName = "Usuario",
  resetUrl,
}: ForgotPasswordEmailProps) => {
  return (
    <EmailLayout
      preview="Restablece tu contraseña de ARBRY"
      title="Recuperación de Contraseña - ARBRY"
    >
      <Text className="text-lg font-semibold text-slate-900 mb-4">
        ¡Hola {userName}!
      </Text>

      <Text className="text-slate-700 mb-6 leading-relaxed">
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
        Si fuiste tú quien realizó esta solicitud, haz clic en el botón de abajo 
        para crear una nueva contraseña.
      </Text>

      <Section className="text-center my-8">
        <Button
          href={resetUrl}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg font-semibold no-underline inline-block"
        >
          Restablecer Contraseña
        </Button>
      </Section>

      <Section className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg my-6">
        <Text className="text-amber-800 font-semibold text-sm mb-2">
          🔒 Aviso de Seguridad
        </Text>
        <Text className="text-amber-700 text-sm m-0">
          Este enlace expirará en 24 horas por tu seguridad. Si no solicitaste 
          este cambio, puedes ignorar este correo de forma segura.
        </Text>
      </Section>

      <Text className="text-slate-600 text-sm mb-3">
        Si tienes problemas con el botón, también puedes copiar y pegar el 
        siguiente enlace en tu navegador:
      </Text>

      <Section className="bg-slate-50 p-3 rounded border text-xs text-slate-600 break-all">
        <Link href={resetUrl} className="text-blue-600 no-underline">
          {resetUrl}
        </Link>
      </Section>
    </EmailLayout>
  );
};

export default ForgotPasswordEmail;
