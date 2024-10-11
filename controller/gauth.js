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
          function generateUsername(name) {
            console.log('dfassdgdfgsdfhgs');
            
            const baseUsername = name.toLowerCase().replace(/\s+/g, ''); // Remove spaces and make lowercase
            const randomNumber = Math.floor(Math.random() * 1000); // Add random number to make it more unique
            return `${baseUsername}${randomNumber}`;
          }
      
          console.log('new user'+profile.displayName);
          const uname=generateUsername(profile.displayName);
          console.log(uname);
          
          users = new User({
            googleId: profile.id,
            name:profile.displayName,
            user_name: uname,
            email: profile.emails[0].value,
            varify:true
          
          })
         
          
          const x=await users.save();
          if(x){
          console.log(x);
          }
          else{
            console.log("error saving");
            
          }
        }
    
        return cb(null, user);
      }  catch (err) {
        console.error('Error during authentication:', err);
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
