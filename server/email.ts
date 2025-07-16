import nodemailer from 'nodemailer';

// Create transporter for email
const createTransporter = async () => {
  // For development: Use Ethereal Email only if no SMTP credentials are provided
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER && !process.env.SMTP_USER) {
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log('📧 Using Ethereal Email for development');
      console.log('📧 View emails at: https://ethereal.email/login');
      console.log(`📧 Username: ${testAccount.user}`);
      console.log(`📧 Password: ${testAccount.pass}`);
      
      return nodemailer.createTransport({
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
  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const emailPass = process.env.SMTP_PASS || process.env.EMAIL_PASSWORD;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587');

  if (emailUser && emailPass) {
    console.log(`📧 Configuring SMTP: ${smtpHost}:${smtpPort} for user: ${emailUser}`);
    return nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass.replace(/\s+/g, ''), // Remove any spaces from app password
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
  const transporter = await createTransporter();
  
  if (!transporter) {
    console.log('Email not configured, skipping verification email');
    return false;
  }

  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  // Always use bioqz.com for email verification links in production
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bioqz.com' : (process.env.BASE_URL || 'http://localhost:5000');
  const verificationUrl = `${baseUrl}/api/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: `"bioqz" <${emailUser}>`,
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
    
    // If using Ethereal Email (test mode), log the preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview email: ' + nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending verification email:', error);
    return false;
  }
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
  const transporter = await createTransporter();
  
  if (!transporter) {
    return false;
  }

  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  const mailOptions = {
    from: `"bioqz" <${emailUser}>`,
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
              <a href="${process.env.NODE_ENV === 'production' ? 'https://bioqz.com' : (process.env.BASE_URL || 'http://localhost:5000')}" class="button">Start Building Your Bio</a>
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}`);
    
    // If using Ethereal Email (test mode), log the preview URL  
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview email: ' + nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

export async function sendPasswordResetEmail(
  email: string, 
  firstName: string, 
  resetToken: string
): Promise<boolean> {
  const transporter = await createTransporter();
  
  if (!transporter) {
    console.log('Email not configured, skipping password reset email');
    return false;
  }

  const emailUser = process.env.SMTP_USER || process.env.EMAIL_USER;
  // Always use bioqz.com for password reset links in production
  const baseUrl = process.env.NODE_ENV === 'production' ? 'https://bioqz.com' : (process.env.BASE_URL || 'http://localhost:5000');
  const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

  const mailOptions = {
    from: `"bioqz" <${emailUser}>`,
    to: email,
    subject: 'Reset your bioqz password',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset your bioqz password</title>
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
            <h2>Reset your password, ${firstName}</h2>
            
            <p>We received a request to reset your password for your bioqz account. If you didn't make this request, you can safely ignore this email.</p>
            
            <p>To reset your password, click the button below:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #666;">${resetUrl}</p>
            
            <p>This password reset link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
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
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
    
    // If using Ethereal Email (test mode), log the preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      console.log('📧 Preview email: ' + nodemailer.getTestMessageUrl(info));
    }
    
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return false;
  }
}