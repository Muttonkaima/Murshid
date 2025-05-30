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

        // Parse the state to get the original action (login or signup)
        const state = req.query.state ? JSON.parse(Buffer.from(req.query.state, 'base64').toString()) : {};
        const action = state?.action || 'login';

        // Check if user already exists by googleId or email
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email }
          ]
        });

        // Handle new user signup
        if (!user && action === 'signup') {
          const { firstName, lastName } = splitName(profile.displayName);
          
          user = await User.create({
            firstName,
            lastName,
            email,
            googleId: profile.id,
            authProvider: 'google',
            isEmailVerified: true,
            // Generate a random password that won't be used
            password: require('crypto').randomBytes(16).toString('hex')
          });
          
          return done(null, user);
        }
        
        // Handle existing user login
        if (user) {
          // If user exists but doesn't have googleId, link it
          if (!user.googleId) {
            user.googleId = profile.id;
            user.authProvider = 'google';
            user.isEmailVerified = true;
            await user.save({ validateBeforeSave: false });
          }
          
          // Update last login time
          user.lastLogin = Date.now();
          await user.save({ validateBeforeSave: false });
          
          return done(null, user);
        }

        // If we get here, it's a login attempt but no user found
        if (action === 'login') {
          return done(new AppError('No account found with this Google account. Please sign up first.', 404));
        }

        return done(new AppError('Authentication failed', 401));
        
      } catch (error) {
        console.error('Google OAuth Error:', error);
        return done(error, false, { message: error.message });
      }
    }
  )
);

module.exports = passport;