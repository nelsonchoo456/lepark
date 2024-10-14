// emailUtility.ts
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

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

  async generateQRCode(id: string): Promise<string> {
    return await QRCode.toDataURL(id);
  }

  async generatePDF(transaction: any): Promise<string> {
    const doc = new PDFDocument();
    const pdfDirectory = path.join(__dirname, '..', '..', '..', '..', 'temp', 'pdfs', 'attraction-tickets');
    const pdfPath = path.join(pdfDirectory, `AttractionTicket-${transaction.id}.pdf`);

    // Ensure the directory exists
    await fs.promises.mkdir(pdfDirectory, { recursive: true });

    doc.pipe(fs.createWriteStream(pdfPath));

    // Add logo
    // doc.image('path/to/logo.png', 25, 30, { fit: [80, 50] });

    // Add transaction details
    doc.font('Helvetica-Bold').fontSize(12).text('Lepark', 25, 100);
    doc.fontSize(12).text(`Customer: ${transaction.visitorId}`, 320, 100);
    doc.fontSize(12).text(`Order #: ${transaction.id}`, 320, 115);
    doc.fontSize(12).text('Attraction Ticket', 25, 115);
    doc.fontSize(12).text(`VALID ON ${new Date(transaction.attractionDate).toDateString()}`);

    // Add tickets
    let yPosition = 180;
    for (const ticket of transaction.attractionTickets) {
      const qrCodePath = await this.generateQRCode(`http://localhost:4200/verify-ticket/${ticket.id}`);

      doc.rect(25, yPosition, 560, 115).fillColor('darkgreen').fill();
      doc
        .fillColor('white')
        .fontSize(14)
        .text(ticket.listingId, 230, yPosition + 15);
      doc.fontSize(10).text('PLEASE APPROACH THE STAFF TO SCAN THE QR CODE.', 165, yPosition + 40);
      doc.image(qrCodePath, 260, yPosition + 60, { fit: [80, 80] });

      yPosition += 130;
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
    }

    // Add terms and conditions
    doc.fillColor('black').fontSize(8).text('Terms and conditions...', 25, yPosition);

    doc.end();
    return pdfPath;
  }

  async sendAttractionTicketEmail(recipientEmail: string, transaction: any) {
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

    const pdfPath = await this.generatePDF(transaction);

    // Email message options
    const mailOptions = {
      to: recipientEmail, // recipient
      subject: 'Your Lepark Attraction Tickets',
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Your tickets are attached to this email. Please present them at the entrance.</p>
        <p>Order details:</p>
        <ul>
          <li>Order ID: ${transaction.id}</li>
          <li>Date: ${new Date(transaction.attractionDate).toDateString()}</li>
          <li>Total Amount: $${transaction.totalAmount.toFixed(2)}</li>
        </ul>
      `,
      attachments: [
        {
          filename: `Lepark-AttractionTickets-${transaction.id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }

  async sendRequestedAttractionTicketEmail(recipientEmail: string, transaction: any) {
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

    const pdfPath = await this.generatePDF(transaction);

    // Email message options
    const mailOptions = {
      to: recipientEmail, // recipient
      subject: 'Your Lepark Attraction Tickets',
      html: `
      <h1>Your requested attraction tickets are ready!</h1>
      <p>Your tickets are attached to this email. Please present them at the entrance.</p>
      <p>Order details:</p>
      <ul>
        <li>Order ID: ${transaction.id}</li>
        <li>Date: ${new Date(transaction.attractionDate).toDateString()}</li>
        <li>Total Amount: $${transaction.totalAmount.toFixed(2)}</li>
      </ul>
    `,
      attachments: [
        {
          filename: `Lepark-AttractionTickets-${transaction.id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }
}

export default new EmailUtility();
