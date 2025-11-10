import { Html, Body, Container } from "@react-email/components";
import type React from "react";

interface EmailLayoutProps {
	children: React.ReactNode;
}

const EmailLayout: React.FC<EmailLayoutProps> = ({ children }) => (
		<Html>
			<Body style={main}>
				<Container style={container}>{children}</Container>
			</Body>
		</Html>
	);

export default EmailLayout;

const main = {
	backgroundColor: "#f6f9fc",
	fontFamily:
		'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
	backgroundColor: "#ffffff",
	margin: "0 auto",
	padding: "20px 0 48px",
	marginBottom: "64px",
};
