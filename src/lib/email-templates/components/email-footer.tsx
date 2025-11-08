import { Link, Section, Text } from '@react-email/components'

const EmailFooter = () => {
  return (
    <Section style={footer}>
      <Text style={links}>
        <Link href="https://www.marbryinmobiliaria.com/about" style={link}>
          About Us
        </Link>{' '}
        •
        <Link href="https://www.marbryinmobiliaria.com/contact" style={link}>
          Contact
        </Link>{' '}
        •
        <Link href="https://www.marbryinmobiliaria.com/privacy" style={link}>
          Privacy Policy
        </Link>
      </Text>
      <Text style={copyright}>© 2025 MARBRY INMOBILIARIA. All rights reserved.</Text>
    </Section>
  )
}

export default EmailFooter

const footer = {
  backgroundColor: '#f6f9fc',
  padding: '20px 0',
  textAlign: 'center' as const,
}

const links = {
  marginBottom: '10px',
}

const link = {
  color: '#007bff',
  textDecoration: 'none',
}

const copyright = {
  color: '#6c757d',
  fontSize: '12px',
}
