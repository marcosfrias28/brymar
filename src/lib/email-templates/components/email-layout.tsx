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
import { EmailFooter } from "./email-footer";
import { EmailHeader } from "./email-header";

type EmailLayoutProps = {
	children: ReactNode;
	preview: string;
	title?: string;
};

export const EmailLayout = ({ children, preview, title }: EmailLayoutProps) => (
	<Html>
		<Head>
			<title>{title || "ARBRY"}</title>
		</Head>
		<Preview>{preview}</Preview>
		<Tailwind>
			<Body className="bg-slate-50 font-sans">
				<Container className="mx-auto max-w-2xl px-4 py-8">
					<Section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
						<EmailHeader />
						<Section className="px-8 py-6">{children}</Section>
						<EmailFooter />
					</Section>
				</Container>
			</Body>
		</Tailwind>
	</Html>
);
