"use server"
import { Resend } from 'resend';

const resend = new Resend(process?.env?.RESEND_API_KEY);

export const sendVerificationEmail = async ({ to, subject, url }: { to: string; subject: string; url: string }) => {

    try {
        const res = await resend.emails.send({
            from: 'Marbry Inmobiliaria <send@marbry.vip>',
            to,
            subject,
            html: `<!DOCTYPE html>
<html lang="it">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verifica il tuo indirizzo email</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
        }
        table {
            width: 100%;
            border-spacing: 0;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background-color: #0073e6;
            color: white;
            padding: 20px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .body {
            padding: 20px;
            color: #333333;
            font-size: 16px;
            line-height: 1.5;
        }
        .body p {
            margin: 10px 0;
        }
        .cta-button {
            display: block;
            margin: 20px auto;
            padding: 15px 30px;
            background-color: #0073e6;
            color: white;
            text-decoration: none;
            text-align: center;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
        }
        .footer {
            background-color: #f1f1f1;
            color: #777777;
            padding: 10px 20px;
            text-align: center;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <table>
        <tr>
            <td>
                <div class="container">
                    <!-- Header -->
                    <div class="header">
                        <h1>Verifica il tuo indirizzo email</h1>
                    </div>

                    <!-- Body -->
                    <div class="body">
                        <p>Ciao,</p>
                        <p>Grazie per esserti registrato/a al nostro servizio! Per completare la registrazione e attivare il tuo account, ti chiediamo di verificare il tuo indirizzo email cliccando sul pulsante qui sotto:</p>
                        <!-- CTA Button -->
                        <a href="${url}" class="cta-button" target="_blank">Verifica la tua email</a>
                        <p>Se il pulsante non funziona, copia e incolla il seguente link nel tuo browser:</p>
                        <p><a href="${url}" target="_blank">${url}</a></p>

                        <p>Grazie per aver scelto i nostri servizi!</p>
                        <p>Il Team</p>
                    </div>

                    <!-- Footer -->
                    <div class="footer">
                        <p>Questo messaggio è stato inviato automaticamente. Per assistenza, contattaci al nostro supporto.</p>
                        <p>&copy; ${new Date().getFullYear()} La tua azienda. Tutti i diritti riservati.</p>
                    </div>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`
        });
        if (res.error) {
            console.log(res.error)
            throw new Error('Errore durante l\'invio dell\'email')
        } else {
            console.log('Success Mail')
        }
    } catch (error) {
        console.error('Errore durante l\'invio dell\'email:', error);
        throw new Error('Impossibile inviare l\'email.');
    }
};
