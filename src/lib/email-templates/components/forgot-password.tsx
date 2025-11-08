import { Button, Heading, Text } from "@react-email/components";
import EmailFooter from "./email-footer";
import EmailHeader from "./email-header";
import EmailLayout from "./email-layout";

interface ForgotPasswordEmailProps {
	username: string;
	resetPasswordUrl: string;
}

const ForgotPasswordEmail: React.FC<ForgotPasswordEmailProps> = ({
	username,
	resetPasswordUrl,
}) => (
	<EmailLayout>
		<EmailHeader />
		<Heading style={heading}>Reset your password</Heading>
		<Text style={text}>
			Hi {username}, you recently requested to reset your password. Click the
			button below to continue.
		</Text>
		<Button href={resetPasswordUrl} style={button}>
			Reset Password
		</Button>
		<EmailFooter />
	</EmailLayout>
);

export default ForgotPasswordEmail;

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
