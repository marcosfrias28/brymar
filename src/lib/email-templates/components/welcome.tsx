import { Button, Heading, Text } from "@react-email/components";
import EmailFooter from "./email-footer";
import EmailHeader from "./email-header";
import EmailLayout from "./email-layout";

interface WelcomeEmailProps {
	username: string;
	loginUrl: string;
}

const WelcomeEmail: React.FC<WelcomeEmailProps> = ({ username, loginUrl }) => (
	<EmailLayout>
		<EmailHeader />
		<Heading style={heading}>
			Welcome to MARBRY INMOBILIARIA, {username}!
		</Heading>
		<Text style={text}>
			We are excited to have you on board. You can now log in to your account
			and start exploring.
		</Text>
		<Button href={loginUrl} style={button}>
			Log In
		</Button>
		<EmailFooter />
	</EmailLayout>
);

export default WelcomeEmail;

const heading = {
	fontSize: "24px",
	fontWeight: "bold",
	marginBottom: "20px",
	textAlign: "center" as const,
};

const text = {
	fontSize: "16px",
	lineHeight: "24px",
	marginBottom: "20px",
	textAlign: "center" as const,
};

const button = {
	backgroundColor: "#007bff",
	borderRadius: "5px",
	color: "#ffffff",
	display: "block",
	fontSize: "16px",
	fontWeight: "bold",
	margin: "0 auto",
	padding: "12px 20px",
	textAlign: "center" as const,
	textDecoration: "none",
	width: "200px",
};
