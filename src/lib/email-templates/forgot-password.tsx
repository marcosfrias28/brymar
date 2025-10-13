import React from 'react';

interface ForgotPasswordEmailProps {
  userName?: string;
  resetUrl: string;
  companyName?: string;
}

export const ForgotPasswordEmail: React.FC<ForgotPasswordEmailProps> = ({
  userName = 'Usuario',
  resetUrl,
  companyName = 'Brymar'
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Recuperación de Contraseña - {companyName}</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            color: #e2e8f0;
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
          
          .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
          
          .security-notice {
            background-color: #fef5e7;
            border-left: 4px solid #f6ad55;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
          }
          
          .security-notice h3 {
            color: #c05621;
            font-size: 16px;
            font-weight: 600;
            margin-bottom: 8px;
          }
          
          .security-notice p {
            color: #744210;
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
            color: #667eea;
            text-decoration: none;
          }
          
          .divider {
            height: 1px;
            background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
            margin: 30px 0;
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
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <h1>{companyName}</h1>
            <p>Recuperación de Contraseña</p>
          </div>
          
          <div className="content">
            <div className="greeting">
              ¡Hola {userName}!
            </div>
            
            <div className="message">
              Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
              Si fuiste tú quien realizó esta solicitud, haz clic en el botón de abajo para 
              crear una nueva contraseña.
            </div>
            
            <div style={{textAlign: 'center'}}>
              <a href={resetUrl} className="cta-button">
                Restablecer Contraseña
              </a>
            </div>
            
            <div className="divider"></div>
            
            <div className="security-notice">
              <h3>🔒 Aviso de Seguridad</h3>
              <p>
                Este enlace expirará en 24 horas por tu seguridad. Si no solicitaste 
                este cambio, puedes ignorar este correo de forma segura.
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
              {resetUrl}
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

export default ForgotPasswordEmail;