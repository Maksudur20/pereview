/**
 * Gmail REST API email sender — uses HTTPS (not SMTP) so it works on Render free tier.
 * Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, EMAIL_USER
 */
const { OAuth2Client } = require('google-auth-library');

const isEmailConfigured = () => {
  return !!(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN &&
    process.env.EMAIL_USER
  );
};

let _oauth2Client = null;

const getOAuth2Client = () => {
  if (!_oauth2Client) {
    _oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'https://developers.google.com/oauthplayground'
    );
    _oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }
  return _oauth2Client;
};

/**
 * Send email via Gmail REST API (HTTPS, not SMTP)
 */
const sendRawEmail = async (to, subject, html) => {
  const oauth2Client = getOAuth2Client();
  const { token } = await oauth2Client.getAccessToken();

  if (!token) {
    throw new Error('Failed to obtain Gmail access token');
  }

  // Build RFC 2822 message
  const utf8Subject = `=?utf-8?B?${Buffer.from(subject).toString('base64')}?=`;
  const messageParts = [
    `From: "PeReview" <${process.env.EMAIL_USER}>`,
    `To: ${to}`,
    `Subject: ${utf8Subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ];
  const rawMessage = messageParts.join('\r\n');

  // Base64url encode
  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  // Send via Gmail REST API (HTTPS — no SMTP port needed)
  const response = await oauth2Client.request({
    url: 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
    method: 'POST',
    data: { raw: encodedMessage },
  });

  return response.data;
};

const sendVerificationEmail = async (email, name, code) => {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL NOT CONFIGURED] Verification code for ${email}: ${code}`);
    return;
  }

  const html = `
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
  `;

  try {
    await sendRawEmail(email, 'Verify Your PeReview Account', html);
    console.log(`[EMAIL] Verification email sent to ${email}`);
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

  const html = `
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
  `;

  try {
    await sendRawEmail(email, 'Your PeReview Login Code', html);
    console.log(`[EMAIL] Login code email sent to ${email}`);
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

  const html = `
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
  `;

  try {
    await sendRawEmail(email, 'Reset Your PeReview Password', html);
    console.log(`[EMAIL] Password reset email sent to ${email}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send reset email to ${email}:`, err.message);
    console.log(`[FALLBACK] Reset URL for ${email}: ${resetUrl}`);
  }
};

const sendWelcomeEmail = async (email, name) => {
  if (!isEmailConfigured()) {
    console.log(`[EMAIL NOT CONFIGURED] Welcome email for ${email}`);
    return;
  }

  const html = `
    <div style="max-width: 500px; margin: 0 auto; padding: 30px; font-family: 'Segoe UI', Arial, sans-serif; background: #fff; border-radius: 12px; border: 1px solid #eee;">
      <div style="text-align: center; margin-bottom: 25px;">
        <h1 style="color: #d63384; margin: 0; font-size: 28px;">✨ PeReview</h1>
        <p style="color: #888; margin-top: 5px;">Perfume Review & Discovery</p>
      </div>
      <h2 style="color: #333; text-align: center;">Welcome to PeReview!</h2>
      <p style="color: #555; font-size: 15px;">Hi <strong>${name}</strong>,</p>
      <p style="color: #555; font-size: 15px;">Thank you for joining PeReview! We're thrilled to have you as part of our fragrance community.</p>
      <p style="color: #555; font-size: 15px;">Here's what you can do:</p>
      <ul style="color: #555; font-size: 15px; line-height: 1.8;">
        <li>🔍 Discover new perfumes</li>
        <li>⭐ Write and read reviews</li>
        <li>💬 Join discussions with fragrance enthusiasts</li>
        <li>❤️ Save your favorite perfumes</li>
        <li>🎯 Get personalized recommendations</li>
      </ul>
      <div style="text-align: center; margin: 25px 0;">
        <a href="${process.env.CLIENT_URL || 'http://localhost:3000'}" style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #d63384, #e91e8c); color: white; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px;">
          Start Exploring
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="color: #aaa; font-size: 12px; text-align: center;">Happy fragrance hunting! 🌸</p>
    </div>
  `;

  try {
    await sendRawEmail(email, 'Welcome to PeReview! 🌸', html);
    console.log(`[EMAIL] Welcome email sent to ${email}`);
  } catch (err) {
    console.error(`[EMAIL ERROR] Failed to send welcome email to ${email}:`, err.message);
  }
};

module.exports = { sendVerificationEmail, sendLoginCodeEmail, sendPasswordResetEmail, sendWelcomeEmail, sendRawEmail };
