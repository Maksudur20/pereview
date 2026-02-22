const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const https = require('https');
const crypto = require('crypto');
const { sendVerificationEmail, sendLoginCodeEmail, sendPasswordResetEmail } = require('../utils/sendEmail');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const FRONTEND_URL = process.env.CLIENT_URL || 'http://localhost:3000';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

// @desc    Register user with email/password (sends verification code)
// @route   POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    let user;
    if (existingUser && !existingUser.isVerified) {
      // Update the unverified user with new details
      existingUser.name = name;
      existingUser.password = password;
      user = existingUser;
    } else {
      user = new User({ name, email, password });
    }

    // Generate verification code and send email
    const code = user.generateVerificationCode();
    await user.save();

    // Fire-and-forget: don't await email so the response is sent immediately
    sendVerificationEmail(email, name, code).catch(err => console.error('[EMAIL] Register verification error:', err.message));

    res.status(201).json({
      success: true,
      needsVerification: true,
      email: user.email,
      message: 'Verification code sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email with code (after registration)
// @route   POST /api/auth/verify-email
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Please provide email and verification code' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      verificationCode: hashedCode,
      verificationCodeExpires: { $gt: Date.now() },
    }).select('+verificationCode +verificationCodeExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Resend verification or login code
// @route   POST /api/auth/resend-code
const resendCode = async (req, res, next) => {
  try {
    const { email, type } = req.body; // type: 'verification' or 'login'

    if (!email) {
      return res.status(400).json({ message: 'Please provide email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (type === 'login') {
      const code = user.generateLoginCode();
      await user.save();
      // Fire-and-forget
      sendLoginCodeEmail(email, user.name, code).catch(err => console.error('[EMAIL] Resend login code error:', err.message));
    } else {
      const code = user.generateVerificationCode();
      await user.save();
      // Fire-and-forget
      sendVerificationEmail(email, user.name, code).catch(err => console.error('[EMAIL] Resend verification error:', err.message));
    }

    res.json({ success: true, message: 'Code resent successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user with email/password (sends login code)
// @route   POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      // Resend verification code
      const code = user.generateVerificationCode();
      await user.save();
      // Fire-and-forget
      sendVerificationEmail(email, user.name, code).catch(err => console.error('[EMAIL] Login verification error:', err.message));
      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: user.email,
        message: 'Please verify your email first. Verification code sent.',
      });
    }

    // Send login verification code
    const code = user.generateLoginCode();
    await user.save();
    // Fire-and-forget
    sendLoginCodeEmail(email, user.name, code).catch(err => console.error('[EMAIL] Login code error:', err.message));

    res.json({
      success: true,
      needsLoginCode: true,
      email: user.email,
      message: 'Login code sent to your email',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify login code (2FA)
// @route   POST /api/auth/verify-login
const verifyLogin = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Please provide email and login code' });
    }

    const hashedCode = crypto.createHash('sha256').update(code).digest('hex');

    const user = await User.findOne({
      email,
      loginCode: hashedCode,
      loginCodeExpires: { $gt: Date.now() },
    }).select('+loginCode +loginCodeExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired login code' });
    }

    user.loginCode = undefined;
    user.loginCodeExpires = undefined;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password - send reset email
// @route   POST /api/auth/forgot-password
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Please provide your email' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if user exists
      return res.json({ success: true, message: 'If that email exists, a reset link has been sent' });
    }

    const resetToken = user.generateResetToken();
    await user.save();

    const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
    // Fire-and-forget
    sendPasswordResetEmail(email, user.name, resetUrl).catch(err => console.error('[EMAIL] Reset email error:', err.message));

    res.json({ success: true, message: 'Password reset link sent to your email' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password with token
// @route   POST /api/auth/reset-password/:token
const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ message: 'Please provide a new password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.isVerified = true; // Auto-verify since they confirmed email
    await user.save();

    res.json({ success: true, message: 'Password reset successful. You can now log in.' });
  } catch (error) {
    next(error);
  }
};

// @desc    Redirect user to Google OAuth consent screen
// @route   GET /api/auth/google/redirect
const googleRedirect = (req, res) => {
  const redirectUri = `https://${req.get('host')}/api/auth/google/callback`;
  const url = googleClient.generateAuthUrl({
    access_type: 'offline',
    scope: ['openid', 'email', 'profile'],
    redirect_uri: redirectUri,
    prompt: 'select_account',
  });
  res.redirect(url);
};

// @desc    Handle Google OAuth callback (authorization code exchange)
// @route   GET /api/auth/google/callback
const googleCallback = async (req, res) => {
  try {
    const { code } = req.query;
    if (!code) {
      return res.redirect(`${FRONTEND_URL}/login?error=no_code`);
    }

    const redirectUri = `https://${req.get('host')}/api/auth/google/callback`;
    const { tokens } = await googleClient.getToken({ code, redirect_uri: redirectUri });
    
    // Get user info from the ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name || email.split('@')[0];
    const picture = payload.picture || '';

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
      }
      if (!user.isVerified) user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        isVerified: true,
      });
    }

    const token = generateToken(user._id);
    
    // Redirect to frontend with token and user data
    const userData = encodeURIComponent(JSON.stringify({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
    }));
    
    res.redirect(`${FRONTEND_URL}/auth/google/callback?token=${token}&user=${userData}`);
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    res.redirect(`${FRONTEND_URL}/login?error=google_auth_failed`);
  }
};

// @desc    Google OAuth login/register (legacy POST endpoint)
// @route   POST /api/auth/google
const googleAuth = async (req, res, next) => {
  try {
    const { credential, accessToken } = req.body;
    let googleId, email, name, picture;

    if (accessToken) {
      // OAuth 2.0 access token flow (useGoogleLogin)
      const userInfo = await new Promise((resolve, reject) => {
        https.get(
          `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${accessToken}`,
          (response) => {
            let data = '';
            response.on('data', (chunk) => (data += chunk));
            response.on('end', () => {
              try {
                resolve(JSON.parse(data));
              } catch (e) {
                reject(new Error('Failed to parse Google user info'));
              }
            });
          }
        ).on('error', reject);
      });

      if (!userInfo.sub || !userInfo.email) {
        return res.status(401).json({ message: 'Invalid Google access token' });
      }

      googleId = userInfo.sub;
      email = userInfo.email;
      name = userInfo.name || email.split('@')[0];
      picture = userInfo.picture || '';
    } else if (credential) {
      // ID token flow (GoogleLogin component - legacy)
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      googleId = payload.sub;
      email = payload.email;
      name = payload.name;
      picture = payload.picture;
    } else {
      return res.status(400).json({ message: 'No Google credential provided' });
    }

    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // Update Google ID if user exists but logged in via email before
      if (!user.googleId) {
        user.googleId = googleId;
        user.avatar = picture || user.avatar;
      }
      if (!user.isVerified) user.isVerified = true;
      await user.save();
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        avatar: picture || '',
        isVerified: true,
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites', 'name brand imageUrl');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle favorite perfume
// @route   POST /api/auth/favorites/:perfumeId
const toggleFavorite = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const perfumeId = req.params.perfumeId;

    const index = user.favorites.indexOf(perfumeId);
    if (index > -1) {
      user.favorites.splice(index, 1);
    } else {
      user.favorites.push(perfumeId);
    }

    await user.save();
    res.json({ success: true, favorites: user.favorites });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, verifyEmail, verifyLogin, resendCode, forgotPassword, resetPassword, googleAuth, googleRedirect, googleCallback, getMe, updateProfile, toggleFavorite };
