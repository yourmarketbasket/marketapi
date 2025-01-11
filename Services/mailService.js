const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

class MailService {
  constructor() {
    // Initialize the transporter with Gmail configuration
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL,        // Gmail address from environment variables
        pass: process.env.APP_PASSWORD, // Gmail App Password from environment variables
      },
    });
  }

  /**
   * Creates the HTML content for the email by combining header, body, and footer.
   * @param {object} data - An object containing dynamic data for the email.
   *                       { name: 'Recipient Name', message: 'Custom message' }
   * @returns {string} The complete HTML email content.
   */
  createHtmlContent(data) {
    const { name, message, subject } = data;
  
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
          }
          .email-container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border: 1px solid #ddd;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .email-header {
            background-color: #e0e0e0; /* Light grey header */
            color: #333;
            text-align: center;
            padding: 20px;
            font-size: 24px;
            font-weight: bold;
          }
          .email-body {
            padding: 20px;
            text-align: left;
          }
          .email-footer {
            background-color: #f1f1f1;
            color: #777;
            text-align: center;
            padding: 10px;
            font-size: 12px;
            border-top: 1px solid #ddd;
          }
          .disclaimer {
            font-size: 12px;
            color: #555;
            margin-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-header">
            ${subject}
          </div>
          <div class="email-body">
            <p>Dear ${name},</p>
            <p>${message}</p>
            <p class="disclaimer">
              This is an automated email; please do not reply to this message. We will never ask for your personal or sensitive information via email. If you suspect any suspicious activity, please contact our support team directly.
            </p>
            <p class="disclaimer">
              By using our services, you agree to our <a href="https://example.com/terms" target="_blank">Terms and Conditions</a> and acknowledge our <a href="https://example.com/privacy" target="_blank">Privacy Policy</a>.
            </p>
          </div>
          <div class="email-footer">
            &copy; ${new Date().getFullYear()} Nisoko Technologies. All rights reserved.<br>
            Need help? Visit our <a href="https://example.com/support" target="_blank">Support Center</a>.
          </div>
        </div>
      </body>
      </html>
    `;
  }
  

  
  async sendEmail(to, subject, data, attachments = []) {
    const htmlContent = this.createHtmlContent(data);

    const mailOptions = {
      from: "Nisoko Technologies", // Sender's name and email
      to,                                        // Recipient(s)
      subject,                                   // Email subject
      html: htmlContent,                         // HTML content
      attachments,                               // Attachments (optional)
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.response);
      return info.response;
    } catch (error) {
      console.error('Error while sending email:', error);
      throw error;
    }
  }
}

module.exports = MailService;
