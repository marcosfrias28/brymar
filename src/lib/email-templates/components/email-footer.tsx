import { Section, Text, Link, Hr } from "@react-email/components";

export const EmailFooter = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <Section className="bg-slate-50 px-8 py-6">
      <Hr className="border-slate-200 my-4" />
      <Text className="text-sm text-slate-600 text-center mb-2">
        Este correo fue enviado por ARBRY. Si tienes alguna pregunta,{" "}
        <Link
          href="mailto:support@arbry.com"
          className="text-blue-600 no-underline"
        >
          contáctanos
        </Link>
        .
      </Text>
      <Text className="text-xs text-slate-500 text-center m-0">
        © {currentYear} ARBRY. Todos los derechos reservados.
      </Text>
    </Section>
  );
};