// emailUtility.ts
import nodemailer from 'nodemailer';

class EmailUtility {
  async sendPasswordResetEmail(recipientEmail: string, resetLink: string) {
    // Create a transporter using Gmail's SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'no.reply.lepark@gmail.com', // replace with your Gmail email
        pass: 'ezcr eqfz dxtn vbtr', // replace with your App Password
      },
      tls: {
        rejectUnauthorized: false, // Disable certificate validation
      },
    });

    // Email message options
    const mailOptions = {
      to: recipientEmail, // recipient
      subject: 'Password Reset Request',
      html: `<p>You have requested to reset your password. Please click on the link below to reset your password:</p><a href="${resetLink}">Reset Password</a><p>If you did not request this, please ignore this email.</p>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }

  async sendLoginDetailsEmail(recipientEmail: string, password: string) {
    // Create a transporter using Gmail's SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'no.reply.lepark@gmail.com', // replace with your Gmail email
        pass: 'ezcr eqfz dxtn vbtr', // replace with your App Password
      },
      tls: {
        rejectUnauthorized: false, // Disable certificate validation
      },
    });

    // Email message options
    const mailOptions = {
      to: recipientEmail, // recipient
      subject: 'Login Details',
      html: `<p>Dear User,</p>
             <p>Your account has been created. Below are your login credentials:</p>
             <p><strong>Email:</strong> ${recipientEmail}</p>
             <p><strong>Password:</strong> ${password}</p>
             <p>Please log in using these credentials. You will be prompted to change your password once you log in.</p>
             <p>If you did not request this, please contact support.</p>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }

  async sendVerificationEmail(visitorEmail: string, verificationLink: string) {
    // Create a transporter using Gmail's SMTP settings
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'no.reply.lepark@gmail.com', // replace with your Gmail email
        pass: 'ezcr eqfz dxtn vbtr', // replace with your App Password
      },
      tls: {
        rejectUnauthorized: false, // Disable certificate validation
      },
    });

    // Email message options
    const mailOptions = {
      to: visitorEmail, // recipient
      subject: 'Verify Your Email Address',
      html: `<p>Welcome to Lepark! Please verify your email address by clicking the link below:</p><a href="${verificationLink}">Verify Email</a><p>The link expires in 15 minutes.</p><p>If you did not sign up, please ignore this email.</p>`,
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }
}

export default new EmailUtility();
