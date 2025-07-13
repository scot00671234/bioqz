import nodemailer from 'nodemailer';

// Create transporter for email
const createTransporter = async () => {
  // For development: Use Ethereal Email (creates test emails viewable in browser)
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('📧 Using Ethereal Email for development');
      console.log('📧 View emails at: https://ethereal.email/login');
      console.log(`📧 Username: ${testAccount.user}`);
      console.log(`📧 Password: ${testAccount.pass}`);
      
      return nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (error) {
      console.warn('Failed to create Ethereal test account:', error);
      return null;
    }
  }
  
  // Production: Use configured SMTP (Gmail, SendGrid, etc.)
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  console.warn('Email credentials not configured. Email functionality will be disabled.');
  return null;
};

export async function sendVerificationEmail(
  email: string, 
  firstName: string, 
  verificationToken: string
): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email not configured, skipping verification email');
    return false;
  }

  const verificationUrl = `${process.env.BASE_URL || 'http://localhost:5000'}/api/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"bioqz" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify your bioqz account',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Verify your bioqz account</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .logo { font-size: 32px; font-weight: bold; color: #ea580c; }
          .content { padding: 30px 0; }
          .button { 
            display: inline-block; 
            background-color: #ea580c; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">bioqz</div>
          </div>
          
          <div class="content">
            <h2>Welcome to bioqz, ${firstName}!</h2>
            
            <p>Thank you for signing up! To complete your registration and start creating your bio page, please verify your email address by clicking the button below:</p>
            
            <div style="text-align: center;">
              <a href="${verificationUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            
            <p>This verification link will expire in 24 hours.</p>
            
            <p>If you didn't create an account with bioqz, you can safely ignore this email.</p>
          </div>
          
          <div class="footer">
            <p>© 2025 bioqz. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const transporter = createTransporter();
  
  if (!transporter) {
    return false;
  }

  const mailOptions = {
    from: `"bioqz" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Welcome to bioqz!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to bioqz!</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; padding: 20px 0; border-bottom: 1px solid #eee; }
          .logo { font-size: 32px; font-weight: bold; color: #ea580c; }
          .content { padding: 30px 0; }
          .button { 
            display: inline-block; 
            background-color: #ea580c; 
            color: white; 
            padding: 12px 30px; 
            text-decoration: none; 
            border-radius: 6px; 
            font-weight: bold;
            margin: 20px 0;
          }
          .footer { text-align: center; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">bioqz</div>
          </div>
          
          <div class="content">
            <h2>Your account is verified, ${firstName}!</h2>
            
            <p>Congratulations! Your email has been verified and your bioqz account is now active.</p>
            
            <p>You can now:</p>
            <ul>
              <li>Create your personalized bio page</li>
              <li>Add links to your social profiles</li>
              <li>Customize your page design</li>
              <li>Track your page analytics</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="${process.env.BASE_URL || 'http://localhost:5000'}" class="button">Start Building Your Bio</a>
            </div>
          </div>
          
          <div class="footer">
            <p>© 2025 bioqz. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}