import { sendEmail } from '../../utils/email';
import { jsonError, jsonSuccess } from '../../lib/response';
import { applyCors } from '../../utils';
import { logger } from '../../utils/logger';

/**
 * Contact form endpoint
 * POST /api/contact
 * Body: { "name": "John Doe", "email": "john@example.com" }
 */
export default async function handler(req, res) {
  if (await applyCors(req, res)) return;

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return jsonError(res, 405, `Method ${req.method} not allowed`);
  }

  const { name, email } = req.body || {};

  // Validation
  if (!name || !email) {
    return jsonError(res, 400, 'Name and email are required');
  }

  const emailOk = typeof email === 'string' && /.+@.+\..+/.test(email);
  if (!emailOk) {
    return jsonError(res, 400, 'Invalid email format');
  }

  try {
    const subject = `New Contact Form Submission from ${name}`;
    
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
          <h2 style="color: #333; margin-top: 0;">New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="font-size: 12px; color: #777;">This is an automated message from the contact form on designndev.com</p>
        </div>
      </body>
      </html>
    `;

    const textBody = `
New Contact Form Submission

Name: ${name}
Email: ${email}

---
This is an automated message from the contact form on designndev.com
    `;

    // Send email to at4563323@gmail.com
    const result = await sendEmail({
      to: 'at4563323@gmail.com',
      subject,
      htmlBody,
      textBody,
    });

    logger.info(`Contact form submission received from: ${name} (${email})`);

    return jsonSuccess(res, 200, 'Thank you for contacting us! We will get back to you soon.', {
      messageId: result.messageId,
    });
  } catch (error) {
    logger.error('Contact form submission failed:', error.message);
    return jsonError(res, 500, 'Failed to send message. Please try again later.', {
      error: error.message,
    });
  }
}
