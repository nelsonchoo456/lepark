// emailUtility.ts
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import VisitorDao from '../dao/VisitorDao';
import AttractionTicketDao from '../dao/AttractionTicketDao';
import AttractionDao from '../dao/AttractionDao';
import EventDao from '../dao/EventDao';
import EventTicketDao from '../dao/EventTicketDao';

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
    const doc = new PDFDocument({ size: 'A4' });
    const pdfDirectory = path.join(__dirname, '..', '..', '..', '..', 'temp', 'pdfs', 'attraction-tickets');
    const pdfPath = path.join(pdfDirectory, `AttractionTicket-${transaction.id}.pdf`);

    const visitor = await VisitorDao.getVisitorById(transaction.visitorId);

    // Ensure the directory exists
    await fs.promises.mkdir(pdfDirectory, { recursive: true });

    doc.pipe(fs.createWriteStream(pdfPath));

    for (let i = 0; i < transaction.attractionTickets.length; i++) {
      if (i > 0) {
        doc.addPage();
      }

      const ticketData = transaction.attractionTickets[i];
      const ticket = await AttractionTicketDao.getAttractionTicketById(ticketData.id);
      const listing = await AttractionDao.getAttractionTicketListingById(ticket.attractionTicketListingId);
      const attraction = await AttractionDao.getAttractionById(listing.attractionId);

      const leftMargin = 50;
      const pageWidth = 500;
      const halfWidth = pageWidth / 2;

      // Header
      doc.font('Helvetica-Bold').fontSize(18).text('Lepark Attraction Ticket', leftMargin, 30, { width: pageWidth, align: 'center' });

      // Visitor and order information
      doc
        .fontSize(10)
        .text(`Purchased by: ${visitor.firstName} ${visitor.lastName}`, leftMargin, 70, { width: halfWidth })
        .text(`Purchase Date: ${new Date(transaction.purchaseDate).toDateString()}`, leftMargin + halfWidth, 70, {
          width: halfWidth,
          align: 'right',
        })
        .text(`Order Number: ${transaction.id}`, leftMargin, 85, { width: halfWidth })
        .text(`VALID ON ${new Date(transaction.attractionDate).toDateString()}`, leftMargin + halfWidth, 85, {
          width: halfWidth,
          align: 'right',
        });

      // Increased gap before "Valid on the specified date" line
      doc
        .moveDown(4) // Increased from 2 to 4 for a bigger gap
        .fontSize(12)
        .text('Valid on the specified date above. VALID FOR ONE GUEST ONLY', leftMargin, 120, { width: pageWidth });

      // Green box for the ticket
      const greenBoxHeight = 120; // Increased height
      doc.rect(leftMargin, 140, pageWidth, greenBoxHeight).fillColor('darkgreen').fill();

      // Ticket details (centered in green box)
      doc
        .fillColor('white')
        .fontSize(16)
        .text('THIS IS YOUR E-TICKET', leftMargin, 155, { width: pageWidth, align: 'center' }) // Moved down by 5 units
        .moveDown(0.5)
        .fontSize(14)
        .text(`${attraction.title} -  ${listing.nationality} ${listing.category}`, leftMargin, null, { width: pageWidth, align: 'center' })
        .moveDown(0.5)
        .fontSize(10)
        .text('PLEASE APPROACH THE STAFF TO SCAN THE QR CODE.', leftMargin, null, { width: pageWidth, align: 'center' })
        .moveDown(0.5)
        .text('THE TICKET IS NON-TRANSFERABLE, NON-REFUNDABLE AND VOID IF ALTERED', leftMargin, null, {
          width: pageWidth,
          align: 'center',
        });

      // QR Code
      const qrCodePath = await this.generateQRCode(`http://localhost:4200/verify-ticket/${ticket.id}`);
      doc.image(qrCodePath, 245, 270, { fit: [115, 115] });

      // Increased gap before "How to use this e-ticket"
      doc.fillColor('black').fontSize(11).text('HOW TO USE THIS E-TICKET:', leftMargin, 410);

      // How to use this e-ticket
      doc
        .fontSize(9)
        .text('1. SCAN THIS ORIGINAL E-TICKET AT THE ATTRACTION ENTRANCE', leftMargin, 430)
        .text('2. PHOTO ID VERIFICATION - May be required for verification.', leftMargin, 445)
        .text('3. THIS TICKET IS ONLY APPLICABLE DURING REGULAR OPERATING HOURS', leftMargin, 460);

      // Add terms and conditions at the bottom
      doc
        .fontSize(9)
        .text('TERMS AND CONDITIONS:', leftMargin, 495, { underline: true })
        .text(
          'VALID FOR ONE (1) GUEST ONLY • TICKETS UTILISED ARE NON-TRANSFERABLE • NOT FOR SALE OR EXCHANGE • NO REVALIDATION, NON-CANCELLABLE, NON-REFUNDABLE, EVEN IN CASES OF INCLEMENT WEATHER • VOID IF ALTERED • STRICTLY NO OUTSIDE FOOD OR BEVERAGES PERMITTED • HAND STAMP AND TICKET REQUIRED FOR SAME DAY RE-ENTRY • NOT TO BE USED FOR PROMOTIONAL PURPOSES UNLESS APPROVED IN WRITING BY NATIONAL PARKS BOARD (NPARKS) • ATTRACTION OPERATING HOURS ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE. GUEST MAY VISIT LEPARK WEBSITE FOR UPDATES PRIOR TO VISIT • ONLY PROGRAMMES AND/OR SERVICES AUTHORIZED BY NPARKS ARE PERMITTED IN NPARKS • NPARKS RESERVES THE RIGHT TO VARY OR AMEND ANY TERMS AND CONDITIONS WITHOUT PRIOR NOTICE',
          leftMargin,
          510,
          { width: pageWidth, align: 'justify' },
        )
        .moveDown(1.5) // Add space between paragraphs
        .text(
          'Any resale of tickets/vouchers is strictly prohibited. NParks reserves the right to invalidate tickets/vouchers in connection with any fraudulent/unauthorized resale transaction, without refund or other compensation. Tickets/Vouchers allow for a one (1) - time use only. If it is determined by NParks that there are multiple copies/usages of the ticket, usage of the ticket will be denied. In the event of any dispute, a final decision shall be made based on our electronic record',
          { width: pageWidth, align: 'justify' },
        );
    }

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

  async generateEventTicketPDF(transaction: any): Promise<string> {
    const doc = new PDFDocument({ size: 'A4' });
    const pdfDirectory = path.join(__dirname, '..', '..', '..', '..', 'temp', 'pdfs', 'event-tickets');
    const pdfPath = path.join(pdfDirectory, `EventTicket-${transaction.id}.pdf`);

    const visitor = await VisitorDao.getVisitorById(transaction.visitorId);
    const event = await EventDao.getEventById(transaction.eventId);

    // Ensure the directory exists
    await fs.promises.mkdir(pdfDirectory, { recursive: true });

    doc.pipe(fs.createWriteStream(pdfPath));

    const eventTickets = await EventTicketDao.getEventTicketsByTransactionId(transaction.id);

    for (let i = 0; i < eventTickets.length; i++) {
      if (i > 0) {
        doc.addPage();
      }

      const ticket = eventTickets[i];
      const listing = await EventDao.getEventTicketListingById(ticket.eventTicketListingId);

      const leftMargin = 50;
      const pageWidth = 500;
      const halfWidth = pageWidth / 2;

      // Header
      doc.font('Helvetica-Bold').fontSize(18).text('Lepark Event Ticket', leftMargin, 30, { width: pageWidth, align: 'center' });

      // Visitor and order information
      doc
        .fontSize(10)
        .text(`Purchased by: ${visitor.firstName} ${visitor.lastName}`, leftMargin, 70, { width: halfWidth })
        .text(`Purchase Date: ${new Date(transaction.purchaseDate).toDateString()}`, leftMargin + halfWidth, 70, {
          width: halfWidth,
          align: 'right',
        })
        .text(`Order Number: ${transaction.id}`, leftMargin, 85, { width: halfWidth })
        .text(`Event Date: ${new Date(transaction.eventDate).toDateString()}`, leftMargin + halfWidth, 85, {
          width: halfWidth,
          align: 'right',
        });

      // Increased gap before "Valid on the specified date" line
      doc
        .moveDown(4)
        .fontSize(12)
        .text('Valid on the specified date above. VALID FOR ONE GUEST ONLY', leftMargin, 120, { width: pageWidth });

      // Green box for the ticket
      const greenBoxHeight = 120;
      doc.rect(leftMargin, 140, pageWidth, greenBoxHeight).fillColor('darkgreen').fill();

      // Ticket details (centered in green box)
      doc
        .fillColor('white')
        .fontSize(16)
        .text('THIS IS YOUR E-TICKET', leftMargin, 155, { width: pageWidth, align: 'center' })
        .moveDown(0.5)
        .fontSize(14)
        .text(`${event.title} - ${listing.category}`, leftMargin, null, { width: pageWidth, align: 'center' })
        .moveDown(0.5)
        .fontSize(10)
        .text('PLEASE APPROACH THE STAFF TO SCAN THE QR CODE.', leftMargin, null, { width: pageWidth, align: 'center' })
        .moveDown(0.5)
        .text('THE TICKET IS NON-TRANSFERABLE, NON-REFUNDABLE AND VOID IF ALTERED', leftMargin, null, {
          width: pageWidth,
          align: 'center',
        });

      // QR Code
      const qrCodePath = await this.generateQRCode(`http://localhost:4200/verify-event-ticket/${ticket.id}`);
      doc.image(qrCodePath, 245, 270, { fit: [115, 115] });

      // Increased gap before "How to use this e-ticket"
      doc.fillColor('black').fontSize(11).text('HOW TO USE THIS E-TICKET:', leftMargin, 410);

      // How to use this e-ticket
      doc
        .fontSize(9)
        .text('1. SCAN THIS ORIGINAL E-TICKET AT THE EVENT ENTRANCE', leftMargin, 430)
        .text('2. PHOTO ID VERIFICATION - May be required for verification.', leftMargin, 445)
        .text('3. THIS TICKET IS ONLY APPLICABLE DURING THE SPECIFIED EVENT DATE AND TIME', leftMargin, 460);

      // Add terms and conditions at the bottom
      doc
        .fontSize(9)
        .text('TERMS AND CONDITIONS:', leftMargin, 495, { underline: true })
        .text(
          'VALID FOR ONE (1) GUEST ONLY • TICKETS UTILISED ARE NON-TRANSFERABLE • NOT FOR SALE OR EXCHANGE • NO REVALIDATION, NON-CANCELLABLE, NON-REFUNDABLE, EVEN IN CASES OF INCLEMENT WEATHER • VOID IF ALTERED • STRICTLY NO OUTSIDE FOOD OR BEVERAGES PERMITTED • NOT TO BE USED FOR PROMOTIONAL PURPOSES UNLESS APPROVED IN WRITING BY EVENT ORGANIZERS • EVENT DETAILS ARE SUBJECT TO CHANGE WITHOUT PRIOR NOTICE. GUEST MAY VISIT LEPARK WEBSITE FOR UPDATES PRIOR TO THE EVENT • ONLY PROGRAMMES AND/OR SERVICES AUTHORIZED BY EVENT ORGANIZERS ARE PERMITTED AT THE EVENT • EVENT ORGANIZERS RESERVE THE RIGHT TO VARY OR AMEND ANY TERMS AND CONDITIONS WITHOUT PRIOR NOTICE',
          leftMargin,
          510,
          { width: pageWidth, align: 'justify' },
        )
        .moveDown(1.5)
        .text(
          'Any resale of tickets/vouchers is strictly prohibited. Event organizers reserve the right to invalidate tickets/vouchers in connection with any fraudulent/unauthorized resale transaction, without refund or other compensation. Tickets/Vouchers allow for a one (1) - time use only. If it is determined by event organizers that there are multiple copies/usages of the ticket, usage of the ticket will be denied. In the event of any dispute, a final decision shall be made based on our electronic record',
          { width: pageWidth, align: 'justify' },
        );
    }

    doc.end();
    return pdfPath;
  }

  async sendEventTicketEmail(recipientEmail: string, transaction: any) {
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

    const pdfPath = await this.generateEventTicketPDF(transaction);

    // Email message options
    const mailOptions = {
      to: recipientEmail, // recipient
      subject: 'Your Lepark Event Tickets',
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Your event tickets are attached to this email. Please present them at the event entrance.</p>
        <p>Order details:</p>
        <ul>
          <li>Order ID: ${transaction.id}</li>
          <li>Event Date: ${new Date(transaction.eventDate).toDateString()}</li>
          <li>Total Amount: $${transaction.totalAmount.toFixed(2)}</li>
        </ul>
      `,
      attachments: [
        {
          filename: `Lepark-EventTickets-${transaction.id}.pdf`,
          path: pdfPath,
        },
      ],
    };

    // Send email
    await transporter.sendMail(mailOptions);
  }
}

export default new EmailUtility();
