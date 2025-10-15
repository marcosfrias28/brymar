import { User } from '@/domain/user/entities/User';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface SendEmailOptions {
  to: string;
  subject: string;
  htmlContent?: string;
  textContent?: string;
  template?: string;
  templateData?: Record<string, any>;
}

/**
 * Service for sending emails (adapter for external email service)
 */
export class EmailService {
  constructor(
    private readonly _apiKey: string,
    private readonly _fromEmail: string,
    private readonly _fromName: string = 'Brymar Real Estate'
  ) { }

  /**
   * Sends a welcome email to a new user
   */
  async sendWelcomeEmail(user: User): Promise<void> {
    const profile = user.getProfile();
    const displayName = profile.getFullName();

    const template = this.getWelcomeEmailTemplate(displayName);

    await this.sendEmail({
      to: user.getEmail().value,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Sends an email verification email
   */
  async sendEmailVerification(user: User, verificationToken: string): Promise<void> {
    const profile = user.getProfile();
    const displayName = profile.getFullName();
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`;

    const template = this.getEmailVerificationTemplate(displayName, verificationUrl);

    await this.sendEmail({
      to: user.getEmail().value,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Sends a password reset email
   */
  async sendPasswordResetEmail(user: User, resetToken: string): Promise<void> {
    const profile = user.getProfile();
    const displayName = profile.getFullName();
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

    const template = this.getPasswordResetTemplate(displayName, resetUrl);

    await this.sendEmail({
      to: user.getEmail().value,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
    });
  }

  /**
   * Sends a generic email
   */
  async sendEmail(options: SendEmailOptions): Promise<void> {
    try {
      // This would integrate with an actual email service like Resend, SendGrid, etc.
      // For now, we'll simulate the API call

      // Prepare email data for potential future use
      ({
        from: `${this._fromName} <${this._fromEmail}>`,
        to: options.to,
        subject: options.subject,
        html: options.htmlContent,
        text: options.textContent,
      };

      // Simulate API call
      // Note: In production, would send actual email via email service

      // In a real implementation, you would make an HTTP request to your email service
      // Example with Resend:
      // const response = await fetch('https://api.resend.com/emails', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(emailData),
      // });

      // if (!response.ok) {
      //   throw new Error(`Email service error: ${response.statusText}`);
      // }

    } catch (error) {
      // Note: Failed to send email - would be logged in production
      throw new Error(`Failed to send email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Gets the welcome email template
   */
  private getWelcomeEmailTemplate(userName: string): EmailTemplate {
    const subject = '¡Bienvenido a Brymar Real Estate!';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">¡Bienvenido a Brymar Real Estate!</h1>
        <p>Hola ${userName},</p>
        <p>¡Gracias por unirte a nuestra plataforma! Estamos emocionados de tenerte como parte de nuestra comunidad.</p>
        <p>Con tu cuenta puedes:</p>
        <ul>
          <li>Explorar propiedades y terrenos disponibles</li>
          <li>Guardar tus favoritos</li>
          <li>Recibir notificaciones sobre nuevas oportunidades</li>
          <li>Contactar directamente con nuestros agentes</li>
        </ul>
        <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
        <p>¡Bienvenido a bordo!</p>
        <p>El equipo de Brymar Real Estate</p>
      </div>
    `;

    const textContent = `
      ¡Bienvenido a Brymar Real Estate!
      
      Hola ${userName},
      
      ¡Gracias por unirte a nuestra plataforma! Estamos emocionados de tenerte como parte de nuestra comunidad.
      
      Con tu cuenta puedes:
      - Explorar propiedades y terrenos disponibles
      - Guardar tus favoritos
      - Recibir notificaciones sobre nuevas oportunidades
      - Contactar directamente con nuestros agentes
      
      Si tienes alguna pregunta, no dudes en contactarnos.
      
      ¡Bienvenido a bordo!
      El equipo de Brymar Real Estate
    `;

    return { subject, htmlContent, textContent };
  }

  /**
   * Gets the email verification template
   */
  private getEmailVerificationTemplate(userName: string, verificationUrl: string): EmailTemplate {
    const subject = 'Verifica tu dirección de email';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Verifica tu dirección de email</h1>
        <p>Hola ${userName},</p>
        <p>Para completar tu registro en Brymar Real Estate, necesitamos verificar tu dirección de email.</p>
        <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
        <p style="margin: 20px 0;">
          <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Verificar Email
          </a>
        </p>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
        <p>Este enlace expirará en 24 horas.</p>
        <p>Si no creaste esta cuenta, puedes ignorar este email.</p>
        <p>El equipo de Brymar Real Estate</p>
      </div>
    `;

    const textContent = `
      Verifica tu dirección de email
      
      Hola ${userName},
      
      Para completar tu registro en Brymar Real Estate, necesitamos verificar tu dirección de email.
      
      Visita este enlace para verificar tu cuenta:
      ${verificationUrl}
      
      Este enlace expirará en 24 horas.
      
      Si no creaste esta cuenta, puedes ignorar este email.
      
      El equipo de Brymar Real Estate
    `;

    return { subject, htmlContent, textContent };
  }

  /**
   * Gets the password reset template
   */
  private getPasswordResetTemplate(userName: string, resetUrl: string): EmailTemplate {
    const subject = 'Restablece tu contraseña';

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Restablece tu contraseña</h1>
        <p>Hola ${userName},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en Brymar Real Estate.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <p style="margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </p>
        <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
        <p style="word-break: break-all; color: #666;">${resetUrl}</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será modificada.</p>
        <p>El equipo de Brymar Real Estate</p>
      </div>
    `;

    const textContent = `
      Restablece tu contraseña
      
      Hola ${userName},
      
      Recibimos una solicitud para restablecer la contraseña de tu cuenta en Brymar Real Estate.
      
      Visita este enlace para crear una nueva contraseña:
      ${resetUrl}
      
      Este enlace expirará en 1 hora.
      
      Si no solicitaste este cambio, puedes ignorar este email. Tu contraseña no será modificada.
      
      El equipo de Brymar Real Estate
    `;

    return { subject, htmlContent, textContent };
  }
}