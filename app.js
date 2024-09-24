const express = require('express');
const app = express();
const session = require('express-session')
const mongoose = require('mongoose')
const nodemailer=require('nodemailer')
require('dotenv').config()
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
const adminrout = require('./router/adminrout')
const router = require('./router/all_route')
//sessrion
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
//clear catch
const noCacheMiddleware = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate'); // HTTP 1.1.
    res.setHeader('Pragma', 'no-cache'); // HTTP 1.0.
    res.setHeader('Expires', '0'); // Proxies.
    next();
};
app.use(noCacheMiddleware)

module.exports = noCacheMiddleware;

// mongodb connect 
mongoose.connect('mongodb://localhost:27017/ecommewrs').then((dat) => {
    console.log('mongo connected sucsses fully');
})
.catch((err) => {
    console.log(err);
})

//connect routes


const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log('port running', PORT)
})






app.use('/admin', adminrout)

app.use('/', router)

