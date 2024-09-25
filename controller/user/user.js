const User = require('../../model/user_scema')
// register and send otp 
const signup = async (req, res, next) => {
    try {
        const otp = Math.round(100000 + Math.random() * 90000)
        const { username, email, password } = req.body
        const exsist = await User.find({
            $or: [
                { user_name: username },
                { email: email }
            ]
        })
        console.log(exsist);

        if (exsist.length > 0) {
            req.session.register = "User name or email already exist";
            return res.redirect('/signup')
        }
        else {
            const users = await User({
                user_name: username,
                email: email,
                password: password,
                uotp: otp
            })
            const a = await users.save()
            if (a) {

                getotp(email, otp)
                req.session.username = username
                req.session.status=a.status
                next()
                console.log(a);

                console.log("otp sented");


            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('An error ocupied')
    }

}

// otp varifing 
const otpvarify = async (req, res, next) => {
    try {
        // fetch data from usets
        const email = req.session.username;
        const otp = req.body.otp;
        // find user data
        const data = await User.findOne({ user_name: email });
        // cheking user exist or not
        if (!data) {
            req.session.otperror = "otp not match";
            return res.redirect("/otp");
        }

        //timer
        const created_date = data.updatedAt;
        const now_time = new Date();
        const time = now_time.getTime() - created_date.getTime();
        // otp expaireing
        if (time > 1000000) {
            req.session.otperror = "otp expaired";
            data.uotp = 0;
            await data.save();
            return res.redirect("/otp");
        }
        const rotp = Number(otp);

        if (data.uotp === rotp) {
            // alert('done')
            console.log("done");
            next();
            // delete req.session.username
            // res.send("gdfgsdgsdsjhd")
        } else {
            req.session.otperror = "please enter valid otp";
            return res.redirect("/otp");
        }
    } catch (error) {
        console.error("Error during OTP verification:", error);
        res.status(500).send("Server error during OTP verification");
    }
};
const getotp = require('../../middleware/getotp')

// resend otp 

const resent = async (req, res, next) => {
    const username = req.session.username
    const users = await User.findOne({user_name:username})
    
    if(!users){
        res.redirect('/otp')
    }
    const nwotp= Math.round(100000 + Math.random() * 90000)
      
    users.uotp=nwotp;
    await users.save()
    console.log('resent otp succsesfully');
    

    await getotp(users.email,nwotp)

    console.log(users);
    res.redirect('/otp')
    
}

// login and varifing 
const varifylogin=async (req,res,next)=>{
    try{
     const {username,password}=req.body
     console.log(username,password);
     
     const check=await User.findOne({user_name:username,password:password})
 
     console.log(check);
     // console.log(check.status);
     if (!check) {
         req.session.login = "Invalid username or password";
         res.redirect('/signin');
     } else if (!check.status) {
         req.session.login = "You have been blocked";
         res.redirect('/signin');
     } else {
         res.redirect('/dashboard');
     }
    }
    catch(error){
     console.log(error);
     
    }
 }
 const logout=async(req,res,next)=>{
    req.session.destroy();
    console.log("the user logouted");
    return res.redirect('/signin')
    
}



module.exports={signup,otpvarify,resent,varifylogin,logout}