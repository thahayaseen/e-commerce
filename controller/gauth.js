const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cartschema = require('../model/cart')
const User = require('../model/user_scema');
const wishlistschema = require('../model/wishlist');
require('dotenv').config
const Wallet = require('../model/wallet')
console.log(process.env.GOOGLE_CLIENT_ID,
  'enf is', process.env.DOMAIN + '/glogin/callback',
);


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.DOMAIN + '/glogin/callback',
  passReqToCallback: true
},
  async function (request, accessToken, refreshToken, profile, cb) {
    try {
      request.session.glogin = 'okk'
      console.log(request.session.glogin + 'gsdfsh');

      let user = await User.findOne({ googleId: profile.id, email: profile.emails[0].value });

      if (!user) {
        function generateUsername(name) {
          console.log('dfassdgdfgsdfhgs');

          const baseUsername = name.toLowerCase().replace(/\s+/g, '');
          const randomNumber = Math.floor(Math.random() * 1000);
          return `${baseUsername}${randomNumber}`;
        }

        console.log('new user' + profile.displayName);
        const uname = generateUsername(profile.displayName);
        console.log(uname);

        user = new User({
          googleId: profile.id,
          name: profile.displayName,
          user_name: uname,
          email: profile.emails[0].value,
          varify: true

        })


        const x = await user.save();
        if (x) {
          const cwishlist = new wishlistschema({
            userid: x._id,
            productid: []
          })
          await cwishlist.save()
          cart = new cartschema({ userid: x._id, product: [] });
          await cart.save()
          userdata = new Wallet({
            userId: x._id,
            balance: 0,
            transactions: []
          });
          await userdata.save();
          console.log(x);
        }
        else {
          console.log("error saving");

        }
      }

      return cb(null, user);
    } catch (err) {
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
