import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const mailOptions = {
      from: `"TableBliss" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
};

export const sendWelcomeEmail = async (user) => {
  await sendEmail({
    to: user.email,
    subject: 'Welcome to TableBliss!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d4a574;">Welcome to TableBliss!</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for joining TableBliss! We're excited to help you discover and reserve the best tables at your favorite restaurants.</p>
        <p>With TableBliss you can:</p>
        <ul>
          <li>Browse restaurants and menus</li>
          <li>Book tables in real-time</li>
          <li>Manage your reservations</li>
          <li>Read and write reviews</li>
        </ul>
        <p>Start exploring restaurants near you!</p>
        <a href="${process.env.CLIENT_URL}/restaurants" 
           style="display: inline-block; padding: 12px 24px; background-color: #d4a574; color: white; text-decoration: none; border-radius: 5px;">
          Explore Restaurants
        </a>
      </div>
    `,
  });
};

export const sendReservationConfirmation = async (reservation, user) => {
  const date = new Date(reservation.reservationDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  await sendEmail({
    to: user.email,
    subject: 'Reservation Confirmed - TableBliss',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d4a574;">Reservation Confirmed!</h1>
        <p>Hi ${user.name},</p>
        <p>Your reservation has been confirmed. Here are the details:</p>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="margin: 0 0 10px; color: #333;">${reservation.restaurant.name}</h2>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Time:</strong> ${reservation.timeSlot}</p>
          <p><strong>Guests:</strong> ${reservation.guestCount}</p>
          <p><strong>Reservation ID:</strong> ${reservation._id}</p>
        </div>
        <p>To manage or cancel your reservation, visit your dashboard.</p>
        <a href="${process.env.CLIENT_URL}/dashboard/reservations" 
           style="display: inline-block; padding: 12px 24px; background-color: #d4a574; color: white; text-decoration: none; border-radius: 5px;">
          Manage Reservation
        </a>
      </div>
    `,
  });
};

export const sendResetPasswordEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Password Reset Request - TableBliss',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #d4a574;">Reset Your Password</h1>
        <p>Hi ${user.name},</p>
        <p>You requested a password reset. Click the button below to reset your password:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; padding: 12px 24px; background-color: #d4a574; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p style="margin-top: 20px;">This link will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
};