const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const { checkenvmode } = require('./db');

module.exports = function() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: checkenvmode() ? process.env.PROD_GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
        clientSecret: checkenvmode() ? process.env.PROD_GOOGLE_CLIENT_SECRET : process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: checkenvmode() ? process.env.PROD_GOOGLE_CALLBACK_URL : process.env.GOOGLE_CALLBACK_URL,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({ googleId: profile.id });
          if (!user) {
            // Set role based on email
            const role = profile.emails[0].value === 'ellipsonic.bangalore@gmail.com' ? 'admin' : 'user';
            // const role = profile.emails[0].value === 'mithun.1504.gowda@gmail.com' ? 'admin' : 'user';
            user = await User.create({
              googleId: profile.id,
              email: profile.emails[0].value,
              firstName: profile.name.givenName || '',
              isVerified: true,
              role: role
            });
          }
          console.log('Google Authenticated User:', user);
          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
};
