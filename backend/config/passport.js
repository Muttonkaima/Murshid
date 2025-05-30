const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const AppError = require('../utils/appError');

// Serialize user into the sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the sessions
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper function to split full name into first and last name
const splitName = (fullName) => {
  if (!fullName) return { firstName: '', lastName: '' };
  const names = fullName.trim().split(' ');
  const firstName = names[0] || '';
  const lastName = names.length > 1 ? names.slice(1).join(' ') : '';
  return { firstName, lastName };
};

// Google OAuth Strategy
passport.use(
  'google',
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      proxy: true, // Required for production with proxy/load balancer
      passReqToCallback: true // Allows us to access the request in the callback
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value?.toLowerCase();
        if (!email) {
          return done(new AppError('No email found in Google profile', 400));
        }
      
        const state = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {};
        const action = state?.action || 'login';
      
        const existingUser = await User.findOne({ email });
      
        // CASE 1: Existing user with local auth and trying to login with Google
        if (existingUser && existingUser.authProvider === 'local' && existingUser.isEmailVerified && action === 'login') {
          return done(new AppError('Email registered with password. Use email & password to sign in.', 400));
        }
      
        // CASE 2: Existing user with Google auth trying to sign up again
        if (existingUser && existingUser.authProvider === 'google' && action === 'signup') {
          return done(new AppError('Already signed up with Google. Please sign in.', 400));
        }
      
        // ✅ CASE 3: Upgrade unverified local user to Google user
        if (
          existingUser &&
          existingUser.authProvider === 'local' &&
          existingUser.isEmailVerified === false &&
          action === 'signup'
        ) {
          existingUser.authProvider = 'google';
          existingUser.googleId = profile.id;
          existingUser.isEmailVerified = true;
          existingUser.lastLogin = Date.now();
      
          await existingUser.save({ validateBeforeSave: false });
          return done(null, existingUser);
        }
      
        // CASE 4: Existing Google user logging in
        if (existingUser && existingUser.authProvider === 'google' && action === 'login') {
          existingUser.lastLogin = Date.now();
          await existingUser.save({ validateBeforeSave: false });
          return done(null, existingUser);
        }
      
        // CASE 5: Verified local user trying to sign up again with Google
        if (existingUser && existingUser.authProvider === 'local' && existingUser.isEmailVerified && action === 'signup') {
          return done(new AppError('Email registered with password. Use email & password to sign in.', 400));
        }
      
        // CASE 6: New user via Google signup
        if (!existingUser && action === 'signup') {
          const { firstName, lastName } = splitName(profile.displayName);
      
          const newUser = await User.create({
            firstName,
            lastName,
            email,
            googleId: profile.id,
            authProvider: 'google',
            isEmailVerified: true,
            password: require('crypto').randomBytes(16).toString('hex'),
            lastLogin: Date.now()
          });
      
          return done(null, newUser);
        }
      
        // CASE 7: Login attempt but no user found
        if (action === 'login') {
          return done(new AppError('No account found with this Google account. Please sign up first.', 404));
        }
      
        return done(new AppError('Authentication failed. Please try again.', 401));
        
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, false, { message: error.message });
      }
      
    }
  )
);

module.exports = passport;