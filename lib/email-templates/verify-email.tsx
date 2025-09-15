import React from 'react';

interface VerifyEmailProps {
  userName?: string;
  verificationUrl: string;
  otp?: string;
  companyName?: string;
}

export const VerifyEmailTemplate: React.FC<VerifyEmailProps> = ({
  userName = 'Usuario',
  verificationUrl,
  otp,
  companyName = 'Brymar'
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verificación de Email - {companyName}</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f8fafc;
          }
          
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            padding: 40px 30px;
            text-align: center;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .header p {
            color: #c6f6d5;
            font-size: 16px;
            margin: 0;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 18px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
          }
          
          .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
          }
          
          .verification-section {
            text-align: center;
            margin: 30px 0;
          }
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: transform 0.2s ease;
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
          }
          
          .otp-section {
            background: linear-gradient(135deg, #edf2f7 0%, #e2e8f0 100%);
            border: 2px dashed #cbd5e0;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
          }
          
          .otp-label {
            font-size: 14px;
            color: #718096;
            font-weight: 500;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .otp-code {
            font-size: 32px;
            font-weight: 700;
            color: #2d3748;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background-color: #ffffff;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            border: 2px solid #e2e8f0;
            margin: 10px 0;
          }
          
          .steps {
            background-color: #f7fafc;
            border-radius: 8px;
            padding: 25px;
            margin: 30px 0;
          }
          
          .steps h3 {
            color: #2d3748;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
          }
          
          .steps ol {
            margin-left: 20px;
            color: #4a5568;
          }
          
          .steps li {
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .security-notice {
            background-color: #ebf8ff;
            border-left: 4px solid #3182ce;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .security-notice h3 {
            color: #2c5282;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .security-notice p {
            color: #2a4365;
            font-size: 14px;
            margin: 0;
          }
          
          .footer {
            background-color: #f7fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e2e8f0;
          }
          
          .footer p {
            color: #718096;
            font-size: 14px;
            margin-bottom: 10px;
          }
          
          .footer a {
            color: #48bb78;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
          }
          
          .icon {
            font-size: 20px;
            margin-right: 8px;
          }
          
          @media only screen and (max-width: 600px) {
            .container {
              margin: 0;
              border-radius: 0;
            }
            
            .header, .content, .footer {
              padding: 30px 20px;
            }
            
            .header h1 {
              font-size: 24px;
            }
            
            .cta-button {
              display: block;
              width: 100%;
            }
            
            .otp-code {
              font-size: 24px;
              letter-spacing: 4px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>{companyName}</h1>
            <p>Verificación de Email</p>
          </div>
          
          <div className="content">
            <div className="greeting">
              ¡Bienvenido {userName}!
            </div>
            
            <div className="message">
              Gracias por registrarte en {companyName}. Para completar tu registro y 
              activar tu cuenta, necesitamos verificar tu dirección de correo electrónico.
            </div>
            
            {otp && (
              <div className="otp-section">
                <div className="otp-label">Tu código de verificación</div>
                <div className="otp-code">{otp}</div>
                <p style={{color: '#718096', fontSize: '14px', margin: '10px 0 0 0'}}>
                  Ingresa este código en la aplicación
                </p>
              </div>
            )}
            
            <div className="verification-section">
              <a href={verificationUrl} className="cta-button">
                Verificar Email
              </a>
            </div>
            
            <div className="steps">
              <h3>
                <span className="icon">📋</span>
                Pasos para verificar tu cuenta:
              </h3>
              <ol>
                <li>Haz clic en el botón "Verificar Email" de arriba</li>
                {otp && <li>O ingresa el código de verificación en la aplicación</li>}
                <li>Serás redirigido a una página de confirmación</li>
                <li>¡Tu cuenta estará lista para usar!</li>
              </ol>
            </div>
            
            <div className="divider"></div>
            
            <div className="security-notice">
              <h3>🔐 Información Importante</h3>
              <p>
                Este enlace de verificación expirará en 24 horas. 
                {otp && ' El código de verificación expirará en 10 minutos.'}
                Si no completaste el registro, puedes ignorar este correo.
              </p>
            </div>
            
            <div className="message">
              Si tienes problemas con el botón, también puedes copiar y pegar el siguiente 
              enlace en tu navegador:
            </div>
            
            <div style={{
              backgroundColor: '#f7fafc',
              padding: '15px',
              borderRadius: '6px',
              wordBreak: 'break-all',
              fontSize: '14px',
              color: '#4a5568'
            }}>
              {verificationUrl}
            </div>
          </div>
          
          <div className="footer">
            <p>
              Este correo fue enviado por {companyName}. Si tienes alguna pregunta, 
              no dudes en <a href="mailto:support@brymar.com">contactarnos</a>.
            </p>
            <p>
              © 2024 {companyName}. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
};

export default VerifyEmailTemplate;