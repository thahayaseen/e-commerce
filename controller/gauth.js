    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth20').Strategy;
    const User = require('../model/user_scema'); 


    passport.use(new GoogleStrategy({
      clientID: "1085020479396-efpdp6e3crilkcgauk7qutddailrjoi5.apps.googleusercontent.com",
      clientSecret: "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",
      callbackURL: 'http://localhost:1000/glogin/callback',
      passReqToCallback: true
    },
    async function(request, accessToken, refreshToken, profile, cb) {
      try {
        request.session.glogin='okk'
          console.log( request.session.glogin+'gsdfsh');
        // Check if user already exists in the database
        let user = await User.findOne({ googleId: profile.id,email:profile.emails[0].value });

        if (!user) {
          // If not, create a new user
          console.log('new user');
          
          user = new User({
            googleId: profile.id,
            user_name: profile.displayName,    // Get the user's name
            email: profile.emails[0].value // Get the user's email (Google returns an array)
          });
        
          
          await user.save(); // Save the user in the database
        }
      
       

        
        // Pass the user object to be stored in the session
        return cb(null, user);
      } catch (err) {
        return cb(err, null);
      }
    }
    ));


    passport.serializeUser((user, done) => {
        done(null, user);
    });

    passport.deserializeUser((user, done) => {
        done(null, user);
    });
