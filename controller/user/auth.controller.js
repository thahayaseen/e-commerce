const User = require('../../model/user_scema')


require('dotenv').config()
const bcrypt = require('bcrypt')



// otp varifing 


const otpvarify = async (req, res, next) => {
    try {
        // fetch data from usets
        const email =req.session.email;
        console.log(email);
        
        const otp = req.body.otp;
        // find user data
        const data = await User.findOne({ email: email });
        // cheking user exist or not
        if (!data) {
            
            return res.status(200).json({success:false,message:'user not found'})

        }

        //timer
        const created_date = data.updatedAt;
        const now_time = new Date();
        console.log(created_date);
        console.log(now_time);
        
        const time = now_time.getTime() - created_date.getTime();
        console.log('time is '+time);
        
        // otp expaire
        if (time > 100000) {
           
            data.uotp = 0;
            await data.save();
            return res.status(200).json({success:false,message:'OTP expaired'})
        }
        const rotp = Number(otp);

        if (data.uotp === rotp) {

            console.log("done");
            data.varify = true
            data.uotp = null
            await data.save()
          return  res.status(200).json({success:true,})
           
        } else {
            req.session.otperror = "please enter valid otp";
            return res.status(200).json({success:false,message:'please enter valid OTP'})

        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).send("Server error during OTP verification");
    }
};
const { getotp, sendPasswordResetOTP } = require('../../middleware/getotp');
const coupon = require('../../model/coupon');


// resend otp 

const resent = async (req, res, next) => {
    const username = req.session.username
    const users = await User.findOne({ name: username })

    if (!users) {
        res.redirect('/otp')
    }
    const nwotp = Math.round(100000 + Math.random() * 90000)

    users.uotp = nwotp;
    await users.save(),
        console.log('resent otp succsesfully');


    await getotp(users.email, nwotp,users.user_name)

    console.log(users);
    res.redirect('/otp')

}

// login and varifing 

const varifylogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        console.log(username, password);

        const check = await User.findOne({ user_name: username, varify: true });

        console.log(check);

        if (!check) {
            req.session.login = "Invalid username or password";
            return res.redirect('/signin');
        }

        const isMatch = await bcrypt.compare(password, check.password);

        if (!isMatch) {
            req.session.login = "Invalid username or password";
            return res.redirect('/signin');
        }

        if (check.blocked) {
            req.session.login = "You have been blocked";
            return res.redirect('/signin');
        }

        req.session.ulogin = check._id;
        return res.redirect('/');

    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login');
    }
};

const logout = async (req, res, next) => {
    try {
        req.session.destroy();
        console.log("the user logouted");
        return res.redirect('/signin')
    } catch (error) {
        console.log(error);

    }

}
const glogincb = (req, res, next) => {
    passport.authenticate('google', { failureRedirect: '/' }),
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

                if (!user.blocked) {
                    req.session.ulogin = user._id
                    return res.redirect('/')
                }
                if (user.blocked) {
                    console.log('notok');

                    req.session.login = `your google account ${user.user_name} has been blocked`
                    return res.redirect('/signin')
                }
            });
        })(req, res, next);
}
module.exports = {  otpvarify, resent, varifylogin,  logout,  glogincb,   }     
