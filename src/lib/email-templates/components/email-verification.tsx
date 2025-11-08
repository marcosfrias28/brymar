import { Button, Heading, Text } from '@react-email/components'
import EmailFooter from './email-footer'
import EmailHeader from './email-header'
import EmailLayout from './email-layout'

interface EmailVerificationEmailProps {
  username: string
  verificationUrl: string
}

const EmailVerificationEmail: React.FC<EmailVerificationEmailProps> = ({ username, verificationUrl }) => (
  <EmailLayout>
    <EmailHeader />
    <Heading style={heading}>Verify your email address</Heading>
    <Text style={text}>Hi {username}, please click the button below to verify your email address.</Text>
    <Button href={verificationUrl} style={button}>
      Verify Email
    </Button>
    <EmailFooter />
  </EmailLayout>
)

export default EmailVerificationEmail

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
  marginBottom: '20px',
  textAlign: 'center' as const,
}

const text = {
  fontSize: '16px',
  lineHeight: '24px',
  marginBottom: '20px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#007bff',
  borderRadius: '5px',
  color: '#ffffff',
  display: 'block',
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '0 auto',
  padding: '12px 20px',
  textAlign: 'center' as const,
  textDecoration: 'none',
  width: '200px',
}
