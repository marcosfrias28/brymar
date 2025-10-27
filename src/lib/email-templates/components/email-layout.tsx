import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Tailwind,
} from "@react-email/components";
import type { ReactNode } from "react";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

interface EmailLayoutProps {
  children: ReactNode;
  preview: string;
  title?: string;
}

export const EmailLayout = ({ children, preview, title }: EmailLayoutProps) => {
  return (
    <Html>
      <Head>
        <title>{title || "ARBRY"}</title>
      </Head>
      <Preview>{preview}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto py-8 px-4 max-w-2xl">
            <Section className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
              <EmailHeader />
              <Section className="px-8 py-6">
                {children}
              </Section>
              <EmailFooter />
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};