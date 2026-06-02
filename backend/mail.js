const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');
const db = require('./database');

function getConfig() {
  return db.prepare('SELECT * FROM email_config WHERE id = 1').get() || {};
}

function generateICS({ name, date, time, service }) {
  const [y, m, d] = date.split('-');
  const [hh, mi] = time.split(':');
  const start = new Date(y, m - 1, d, hh, mi);
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const fmt = (dt) => dt.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//EpiCuts//Booking//EN',
    'BEGIN:VEVENT',
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${service} - ${name}`,
    `DESCRIPTION:Appointment at EpiCuts. Service: ${service}. Client: ${name}.`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

async function sendWithSendGrid(config, mailOptions) {
  sgMail.setApiKey(config.sendgrid_api_key);
  const msg = {
    to: mailOptions.to,
    from: config.sendgrid_from_email || config.user || 'noreply@epicuts.com',
    subject: mailOptions.subject,
    html: mailOptions.html,
    attachments: mailOptions.attachments || []
  };
  await sgMail.send(msg);
}

async function sendWithSMTP(config, mailOptions) {
  const transporter = nodemailer.createTransport({
    host: config.host || 'smtp.gmail.com',
    port: config.port || 465,
    secure: (config.port || 465) == 465,
    auth: { user: config.user, pass: config.pass },
    connectionTimeout: 10000
  });
  await transporter.sendMail({ from: config.user, ...mailOptions });
}

async function sendMail(config, mailOptions) {
  const apiKey = config.sendgrid_api_key && config.sendgrid_api_key.trim();
  if (apiKey) {
    await sendWithSendGrid(config, mailOptions);
  } else {
    await sendWithSMTP(config, mailOptions);
  }
}

async function sendBookingNotification(booking, baseUrl) {
  const config = getConfig();
  if (!config.enabled || !config.notify_email) return false;

  const confirmUrl = `${baseUrl}/api/bookings/${booking.confirmation_token}/confirm`;
  const declineUrl = `${baseUrl}/api/bookings/${booking.confirmation_token}/decline`;
  const icsContent = generateICS(booking);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e0e0e0;border:2px solid #d4a843;padding:32px">
      <h1 style="font-family:Oswald,sans-serif;color:#d4a843;text-transform:uppercase;letter-spacing:2px;margin-bottom:24px">New Appointment Request</h1>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Name</td><td style="padding:8px 0;color:#fff">${booking.name}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Email</td><td style="padding:8px 0;color:#fff">${booking.email}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Phone</td><td style="padding:8px 0;color:#fff">${booking.phone}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Service</td><td style="padding:8px 0;color:#fff">${booking.service}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Date</td><td style="padding:8px 0;color:#fff">${booking.date}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Time</td><td style="padding:8px 0;color:#fff">${booking.time}</td></tr>
        ${booking.message ? `<tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Notes</td><td style="padding:8px 0;color:#fff">${booking.message}</td></tr>` : ''}
      </table>
      <div style="margin-top:32px;padding-top:24px;border-top:1px solid #333;text-align:center">
        <a href="${confirmUrl}" style="display:inline-block;background:#27ae60;color:#fff;text-decoration:none;padding:14px 32px;font-family:Oswald,sans-serif;font-size:0.9rem;text-transform:uppercase;letter-spacing:1px;margin-right:12px">Confirm</a>
        <a href="${declineUrl}" style="display:inline-block;background:#c0392b;color:#fff;text-decoration:none;padding:14px 32px;font-family:Oswald,sans-serif;font-size:0.9rem;text-transform:uppercase;letter-spacing:1px">Decline</a>
      </div>
      <p style="text-align:center;margin-top:24px;font-size:0.75rem;color:#666">EpiCuts Booking System</p>
    </div>
  `;

  try {
    await sendMail(config, {
      to: config.notify_email,
      subject: `New Booking: ${booking.service} - ${booking.name}`,
      html,
      attachments: [{ filename: 'appointment.ics', content: icsContent, contentType: 'text/calendar' }]
    });
    return true;
  } catch (err) {
    console.error('Email send failed:', err.message);
    return false;
  }
}

async function sendCustomerConfirmation(booking) {
  const config = getConfig();
  if (!config.enabled || !config.user) return false;

  const icsContent = generateICS(booking);

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e0e0e0;border:2px solid #d4a843;padding:32px">
      <h1 style="font-family:Oswald,sans-serif;color:#27ae60;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">&#10003; Confirmed!</h1>
      <p style="color:#999;margin-bottom:24px">Your appointment at <strong style="color:#d4a843">EpiCuts</strong> is all set.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Service</td><td style="padding:8px 0;color:#fff">${booking.service}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Date</td><td style="padding:8px 0;color:#fff">${booking.date}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Time</td><td style="padding:8px 0;color:#fff">${booking.time}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Address</td><td style="padding:8px 0;color:#fff">123 Main Street, Downtown</td></tr>
      </table>
      <div style="margin-top:24px;padding:16px;background:rgba(212,168,67,0.1);border:1px solid #d4a843;font-size:0.85rem;color:#ccc">
        <p>&#9202; <strong>Walk-ins welcome too!</strong> See you soon.</p>
      </div>
      <p style="margin-top:24px;font-size:0.75rem;color:#666;text-align:center">An .ics file is attached — open it to add to your calendar.</p>
    </div>
  `;

  try {
    await sendMail(config, {
      to: booking.email,
      subject: `Confirmed! Your ${booking.service} on ${booking.date}`,
      html,
      attachments: [{ filename: 'appointment.ics', content: icsContent, contentType: 'text/calendar' }]
    });
    return true;
  } catch (err) {
    console.error('Customer confirm email failed:', err.message);
    return false;
  }
}

async function sendCustomerDecline(booking) {
  const config = getConfig();
  if (!config.enabled || !config.user) return false;

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#e0e0e0;border:2px solid #d4a843;padding:32px">
      <h1 style="font-family:Oswald,sans-serif;color:#c0392b;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px">Sorry, unavailable</h1>
      <p style="color:#999;margin-bottom:24px">We couldn't accommodate your requested time at <strong style="color:#d4a843">EpiCuts</strong>.</p>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Service</td><td style="padding:8px 0;color:#fff">${booking.service}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Date</td><td style="padding:8px 0;color:#fff">${booking.date}</td></tr>
        <tr><td style="padding:8px 0;color:#999;font-size:0.8rem;text-transform:uppercase;letter-spacing:1px">Time</td><td style="padding:8px 0;color:#fff">${booking.time}</td></tr>
      </table>
      <div style="margin-top:24px;padding:16px;background:rgba(255,255,255,0.05);border:1px solid #333;font-size:0.85rem;color:#ccc">
        <p>Please try a different time or date. Walk-ins are always welcome!</p>
      </div>
    </div>
  `;

  try {
    await sendMail(config, {
      to: booking.email,
      subject: `Booking Update: ${booking.service} on ${booking.date}`,
      html
    });
    return true;
  } catch (err) {
    console.error('Customer decline email failed:', err.message);
    return false;
  }
}

module.exports = { sendBookingNotification, sendCustomerConfirmation, sendCustomerDecline, generateICS, getConfig };