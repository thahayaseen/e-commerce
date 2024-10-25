const express = require('express');
const passport = require('passport');
const session = require('express-session');
const adminrout = require('./router/adminrout');
const router = require('./router/routes');
const mongoose=require('./router/mongoose')

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.set(mongoose)
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session setup
app.use(session({
  secret: 'thaha',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware to prevent caching
//for cache handling
app.use((req, res, next) => {
  res.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate"
  );
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  res.set("Surrogate-Control", "no-store");
  next();
});


app.use(passport.initialize());
app.use(passport.session());


// Use routes
app.use('/admin', adminrout);
app.use('/', router);

// Start the server
const PORT = 4050;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
