import nodemailer from 'nodemailer';

const getTransporter = () => {
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  return null;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  const transporter = getTransporter();
  
  if (!transporter) {
    console.log(`\n================= [EMAIL MOCK NOTIFICATION] =================`);
    console.log(`TO: ${to}`);
    console.log(`SUBJECT: ${subject}`);
    console.log(`BODY: ${text || 'HTML Content Sent'}`);
    console.log(`=============================================================\n`);
    return { mock: true, success: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"Piercing Jewelry Store" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text: text || 'Please open email in HTML viewer',
      html,
    });
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmationEmail = async (order, userEmail) => {
  const subject = `Order Confirmation #${order.orderNumber} - Strict Policy Notice`;
  const html = `
    <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FAF8F5; padding: 30px; border: 1px solid #E2D9CC;">
      <h2 style="color: #111111; font-family: Georgia, serif; text-align: center; letter-spacing: 1px;">PIERCING JEWELRY STORE</h2>
      <hr style="border: 0; border-top: 1px solid #C9A96E; margin: 20px 0;" />
      <h3 style="color: #111111;">Thank you for your order!</h3>
      <p style="color: #444;">Order Number: <strong>${order.orderNumber}</strong></p>
      <p style="color: #444;">Total Amount: <strong>₹${order.totalAmount.toFixed(2)}</strong></p>
      
      <div style="background: #111111; color: #FAF8F5; padding: 15px; border-radius: 4px; margin: 25px 0;">
        <h4 style="color: #C9A96E; margin-top: 0;">NO RETURN & NO REFUND POLICY NOTICE</h4>
        <p style="font-size: 13px; line-height: 1.5; margin-bottom: 0;">
          All purchases are final. Piercing products cannot be returned, exchanged, or refunded after order placement, except where required by law or approved by admin as an exceptional case.
        </p>
      </div>

      <p style="font-size: 12px; color: #777; text-align: center;">Accepted Policy Version: ${order.policyVersion} at ${new Date(order.policyAcceptedAt).toLocaleString()}</p>
    </div>
  `;
  return sendEmail({ to: userEmail, subject, html });
};
