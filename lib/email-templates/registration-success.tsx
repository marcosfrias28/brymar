import React from 'react';

interface RegistrationSuccessProps {
  userName?: string;
  userEmail: string;
  loginUrl: string;
  companyName?: string;
  dashboardUrl?: string;
}

export const RegistrationSuccessTemplate: React.FC<RegistrationSuccessProps> = ({
  userName = 'Usuario',
  userEmail,
  loginUrl,
  companyName = 'Brymar',
  dashboardUrl
}) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>¡Bienvenido a {companyName}!</title>
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
            position: relative;
          }
          
          .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="%23ffffff" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>') repeat;
            opacity: 0.3;
          }
          
          .header-content {
            position: relative;
            z-index: 1;
          }
          
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            box-shadow: 0 8px 16px rgba(72, 187, 120, 0.3);
          }
          
          .success-icon::before {
            content: '✓';
            color: #ffffff;
            font-size: 36px;
            font-weight: bold;
          }
          
          .header h1 {
            color: #ffffff;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
          }
          
          .header p {
            color: #e2e8f0;
            font-size: 18px;
            margin: 0;
          }
          
          .content {
            padding: 40px 30px;
          }
          
          .greeting {
            font-size: 20px;
            font-weight: 600;
            color: #1a202c;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .message {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
          }
          
          .account-details {
            background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border: 1px solid #e2e8f0;
          }
          
          .account-details h3 {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
          }
          
          .detail-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .detail-item:last-child {
            border-bottom: none;
          }
          
          .detail-label {
            font-weight: 500;
            color: #4a5568;
            font-size: 14px;
          }
          
          .detail-value {
            font-weight: 600;
            color: #2d3748;
            font-size: 14px;
          }
          
          .cta-section {
            text-align: center;
            margin: 40px 0;
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
            margin: 10px;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
          }
          
          .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
          }
          
          .cta-button.secondary {
            background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
            box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
          }
          
          .cta-button.secondary:hover {
            box-shadow: 0 6px 16px rgba(72, 187, 120, 0.4);
          }
          
          .features {
            background-color: #f7fafc;
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
          }
          
          .features h3 {
            color: #2d3748;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .feature-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .feature-item {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            text-align: center;
          }
          
          .feature-icon {
            font-size: 32px;
            margin-bottom: 10px;
          }
          
          .feature-title {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 8px;
            font-size: 16px;
          }
          
          .feature-description {
            color: #4a5568;
            font-size: 14px;
          }
          
          .support-section {
            background: linear-gradient(135deg, #ebf8ff 0%, #bee3f8 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            text-align: center;
          }
          
          .support-section h3 {
            color: #2c5282;
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .support-section p {
            color: #2a4365;
            font-size: 16px;
            margin-bottom: 20px;
          }
          
          .support-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            flex-wrap: wrap;
          }
          
          .support-link {
            color: #3182ce;
            text-decoration: none;
            font-weight: 500;
            padding: 8px 16px;
            border: 1px solid #3182ce;
            border-radius: 6px;
            transition: all 0.2s ease;
          }
          
          .support-link:hover {
            background-color: #3182ce;
            color: #ffffff;
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
              font-size: 28px;
            }
            
            .cta-button {
              display: block;
              width: 100%;
              margin: 10px 0;
            }
            
            .feature-grid {
              grid-template-columns: 1fr;
            }
            
            .support-links {
              flex-direction: column;
              align-items: center;
            }
            
            .support-link {
              width: 100%;
              max-width: 200px;
            }
          }
        `}</style>
      </head>
      <body>
        <div className="container">
          <div className="header">
            <div className="header-content">
              <div className="success-icon"></div>
              <h1>¡Bienvenido!</h1>
              <p>Tu cuenta ha sido creada exitosamente</p>
            </div>
          </div>
          
          <div className="content">
            <div className="greeting">
              ¡Hola {userName}! 🎉
            </div>
            
            <div className="message">
              ¡Felicitaciones! Tu cuenta en {companyName} ha sido verificada y activada 
              exitosamente. Ya puedes comenzar a disfrutar de todos nuestros servicios.
            </div>
            
            <div className="account-details">
              <h3>
                <span className="icon">👤</span>
                Detalles de tu cuenta
              </h3>
              <div className="detail-item">
                <span className="detail-label">Nombre de usuario:</span>
                <span className="detail-value">{userName}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{userEmail}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Estado:</span>
                <span className="detail-value" style={{color: '#48bb78'}}>✓ Verificado</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Fecha de registro:</span>
                <span className="detail-value">{new Date().toLocaleDateString('es-ES')}</span>
              </div>
            </div>
            
            <div className="cta-section">
              <a href={loginUrl} className="cta-button">
                Iniciar Sesión
              </a>
              {dashboardUrl && (
                <a href={dashboardUrl} className="cta-button secondary">
                  Ir al Dashboard
                </a>
              )}
            </div>
            
            <div className="features">
              <h3>¿Qué puedes hacer ahora?</h3>
              <div className="feature-grid">
                <div className="feature-item">
                  <div className="feature-icon">🚀</div>
                  <div className="feature-title">Comenzar a usar</div>
                  <div className="feature-description">
                    Explora todas las funcionalidades disponibles en tu cuenta
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">⚙️</div>
                  <div className="feature-title">Personalizar perfil</div>
                  <div className="feature-description">
                    Configura tu perfil y preferencias según tus necesidades
                  </div>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">🔐</div>
                  <div className="feature-title">Configurar seguridad</div>
                  <div className="feature-description">
                    Activa la autenticación de dos factores para mayor seguridad
                  </div>
                </div>
              </div>
            </div>
            
            <div className="divider"></div>
            
            <div className="support-section">
              <h3>¿Necesitas ayuda?</h3>
              <p>
                Nuestro equipo de soporte está aquí para ayudarte en todo momento.
              </p>
              <div className="support-links">
                <a href="mailto:support@brymar.com" className="support-link">
                  📧 Contactar Soporte
                </a>
                <a href="#" className="support-link">
                  📚 Centro de Ayuda
                </a>
                <a href="#" className="support-link">
                  💬 Chat en Vivo
                </a>
              </div>
            </div>
            
            <div className="message">
              Gracias por unirte a {companyName}. Estamos emocionados de tenerte 
              como parte de nuestra comunidad.
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

export default RegistrationSuccessTemplate;