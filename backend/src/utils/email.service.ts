import nodemailer from 'nodemailer';
import { IVehicle } from '../vehicles/vehicle.model';

let transporter: nodemailer.Transporter | null = null;

/**
 * Initializes the Nodemailer transporter.
 * Uses SMTP settings from environment variables.
 * If SMTP settings are missing, it falls back to creating an Ethereal test account.
 */
async function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;

  const user = SMTP_USER || GMAIL_USER;
  const pass = SMTP_PASS || GMAIL_APP_PASSWORD;
  const host = SMTP_HOST || (GMAIL_USER ? 'smtp.gmail.com' : undefined);
  const port = SMTP_PORT ? Number(SMTP_PORT) : (GMAIL_USER ? 465 : undefined);

  if (host && port && user && pass) {
    transporter = nodemailer.createTransport({
      host: host,
      port: port,
      secure: port === 465, // true for 465, false for other ports
      auth: {
        user: user,
        pass: pass,
      },
    });
    console.log(`[Email Service] Configured SMTP transporter for ${host}`);
  } else {
    console.log('[Email Service] Missing SMTP credentials in .env. Falling back to Ethereal Test Account.');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
}

/**
 * Sends a purchase receipt to the specified email address.
 */
export async function sendPurchaseReceipt(toEmail: string, vehicle: IVehicle) {
  try {
    const t = await getTransporter();
    
    const info = await t.sendMail({
      from: '"CarVault Dealership" <noreply@carvault.com>',
      to: toEmail,
      subject: `Purchase Receipt: ${vehicle.make} ${vehicle.model}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #333;">Thank you for your purchase!</h2>
          <p>Hi there,</p>
          <p>This is a confirmation that you have successfully purchased a vehicle from CarVault Dealership.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Make:</strong> ${vehicle.make}</p>
            <p style="margin: 0;"><strong>Model:</strong> ${vehicle.model}</p>
            <p style="margin: 0;"><strong>Category:</strong> ${vehicle.category}</p>
            <p style="margin: 0;"><strong>Price Paid:</strong> ₹${vehicle.price.toLocaleString('en-IN')}</p>
          </div>
          <p>If you have any questions, please contact our support team.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">© ${new Date().getFullYear()} CarVault Dealership. All rights reserved.</p>
        </div>
      `,
    });

    console.log(`[Email Service] Receipt sent to ${toEmail}`);
    // If using Ethereal, log the preview URL so the developer can see the fake email
    if (info.messageId && nodemailer.getTestMessageUrl(info)) {
      console.log(`[Email Service] Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return info;
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${toEmail}`, error);
    // Rethrow or return false based on how strict we want to be. 
    // We will throw, and the controller will catch it to prevent blocking the HTTP response.
    throw error;
  }
}
