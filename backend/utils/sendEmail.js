const nodemailer = require('nodemailer');

const isEmailConfigured = () => {
  return !!(process.env.EMAIL_USER && process.env.EMAIL_PASS);
};

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 10000, // 10 second timeout
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
};

const sendVerificationEmail = async (email, name, code) => {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL NOT CONFIGURED] Verification code for ${email}: ${code}`);
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"PeReview" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your PeReview Account',
    html: `
      <div style="max-width: 500px; margin: 0 auto; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #d63384; margin: 0; font-size: 28px;">✨ PeReview</h1>
          <p style="color: #888; margin-top: 5px;">Perfume Review & Discovery</p>
        </div>
        <h2 style="color: #333; text-align: center;">Email Verification</h2>
        <p style="color: #555; font-size: 15px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555; font-size: 15px;">Welcome to PeReview! Please use the code below to verify your email address:</p>
        <div style="text-align: center; margin: 25px 0;">
          <div style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #d63384, #e91e8c); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 10px;">
            ${code}
          </div>
        </div>
        <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #aaa; font-size: 12px; text-align: center;">If you didn't create a PeReview account, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send verification email to ${email}:`, err.message);
    console.log(`[FALLBACK] Verification code for ${email}: ${code}`);
  }
};

const sendLoginCodeEmail = async (email, name, code) => {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL NOT CONFIGURED] Login code for ${email}: ${code}`);
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"PeReview" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your PeReview Login Code',
    html: `
      <div style="max-width: 500px; margin: 0 auto; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #d63384; margin: 0; font-size: 28px;">✨ PeReview</h1>
          <p style="color: #888; margin-top: 5px;">Perfume Review & Discovery</p>
        </div>
        <h2 style="color: #333; text-align: center;">Login Verification</h2>
        <p style="color: #555; font-size: 15px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555; font-size: 15px;">Enter this code to complete your sign-in:</p>
        <div style="text-align: center; margin: 25px 0;">
          <div style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #4285f4, #1a73e8); color: white; font-size: 32px; font-weight: bold; letter-spacing: 8px; border-radius: 10px;">
            ${code}
          </div>
        </div>
        <p style="color: #888; font-size: 13px; text-align: center;">This code expires in <strong>10 minutes</strong>.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #aaa; font-size: 12px; text-align: center;">If you didn't try to log in, please change your password immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send login code to ${email}:`, err.message);
    console.log(`[FALLBACK] Login code for ${email}: ${code}`);
  }
};

const sendPasswordResetEmail = async (email, name, resetUrl) => {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL NOT CONFIGURED] Password reset URL for ${email}: ${resetUrl}`);
    return;
  }

  const transporter = createTransporter();

  const mailOptions = {
    from: `"PeReview" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your PeReview Password',
    html: `
      <div style="max-width: 500px; margin: 0 auto; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; border: 1px solid #eee;">
        <div style="text-align: center; margin-bottom: 25px;">
          <h1 style="color: #d63384; margin: 0; font-size: 28px;">✨ PeReview</h1>
          <p style="color: #888; margin-top: 5px;">Perfume Review & Discovery</p>
        </div>
        <h2 style="color: #333; text-align: center;">Password Reset</h2>
        <p style="color: #555; font-size: 15px;">Hi <strong>${name}</strong>,</p>
        <p style="color: #555; font-size: 15px;">We received a request to reset your password. Click the button below:</p>
        <div style="text-align: center; margin: 25px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #d63384, #e91e8c); color: white; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
            Reset Password
          </a>
        </div>
        <p style="color: #888; font-size: 13px; text-align: center;">This link expires in <strong>30 minutes</strong>.</p>
        <p style="color: #888; font-size: 12px;">If the button doesn't work, copy and paste this URL:<br>
        <a href="${resetUrl}" style="color: #d63384; word-break: break-all;">${resetUrl}</a></p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #aaa; font-size: 12px; text-align: center;">If you didn't request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}:`, err.message);
    console.log(`[FALLBACK] Reset URL for ${email}: ${resetUrl}`);
  }
};

module.exports = { sendVerificationEmail, sendLoginCodeEmail, sendPasswordResetEmail };
