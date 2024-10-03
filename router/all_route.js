const {signup,otpvarify,resent,varifylogin,logout,viewproduct}=require("../controller/user/user")
const{register,login,otp,userhome,productlist}=require('../middleware/render')
// const plogin=require('../controller/user/ulogin')
const {pregister}=require('../middleware/redirect')
const {allproducts}=require('../controller/finding_all_admin')
const passport = require('passport');
const gauth = require('../controller/gauth'); 
const express=require('express')
const router=express.Router()


router.get('/signup',register)
router.post('/signup',signup,pregister)
router.get('/signin',login)
router.post('/signin',varifylogin)


// otp 
router.get('/otp',otp)
router.post('/otp',otpvarify)



// resendotp 
router.post('/resendotp',resent)

// user side 

router.get('/home',allproducts,userhome)

router.get('/product/:ids',viewproduct)

router.get('/allproduct',allproducts,productlist)

//google validation
router.get('/glogin', 
    passport.authenticate('google', { scope: ['email', 'profile'] })
);


router.get('/glogin/callback', (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            return res.redirect('/signin'); 
        }
        req.logIn(user, (err) => {
            if (err) { 
                return next(err); 
            }
            
            req.session.ulogin = true; // or any value you want
            return res.redirect('/home');
        });
    })(req, res, next);
});


//logout

router.get('/logout',logout)







module.exports=router