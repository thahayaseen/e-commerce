const User = require('../../model/user_scema')
const bcrypt = require('bcrypt')
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
            const saltRound=10;
            const hashed_pass=await bcrypt.hash(password,saltRound)
            const users = new User({
                user_name: username,
                email: email,
                password: hashed_pass,
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
        // otp expaire
        if (time > 60000) {
            req.session.otperror = "otp expaired";
            data.uotp = 0;
            await data.save();
            return res.redirect("/otp");
        }
        const rotp = Number(otp);

        if (data.uotp === rotp) {
           
            console.log("done");
            data.varify=true
            data.uotp=null
            await data.save()
            res.redirect('/signin')
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
const product_schema = require('../../model/product_schema')

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

        if (check.status) {
            req.session.login = "You have been blocked";
            return res.redirect('/signin');
        }

        req.session.ulogin = true;
        return res.redirect('/home');
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login');
    }
};

 const logout=async(req,res,next)=>{
    req.session.destroy();
    console.log("the user logouted");
    return res.redirect('/signin')
    
}

const viewproduct=async (req,res,next)=>{
    const id=req.params.ids
    const productdata=await product_schema.findById(id).populate('category_id')
    res.render('userside/product_over_view',{product:productdata})
    console.log(productdata);
    // res.status(200).json({success:true,
    //     data:productdata
    // }).
    
}


module.exports={signup,otpvarify,resent,varifylogin,viewproduct,logout}