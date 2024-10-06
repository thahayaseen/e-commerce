const User = require('../../model/user_scema')
const passport = require('passport');

const bcrypt = require('bcrypt')
// register and send otp 
const signup = async (req, res, next) => {
    try {
        const otp = Math.round(100000 + Math.random() * 90000)
        const { name, email, password } = req.body
        const exsist = await User.find({
            $or: [
                { user_name: name },
                { email: email }
            ]
        })
        console.log(exsist);

        if (exsist.length > 0) {
            req.session.register = "User name or email already exist";
            return res.redirect('/signup')
        }
        else {
            function generateUsername(name) {
                const baseUsername = name.toLowerCase().replace(/\s+/g, ''); // Remove spaces and make lowercase
                const randomNumber = Math.floor(Math.random() * 1000); // Add random number to make it more unique
                return `${baseUsername}${randomNumber}`;
              }
            const saltRound=10;
            const hashed_pass=await bcrypt.hash(password,saltRound)
            const userid=generateUsername(name)
            const users = new User({
                name:name,
                user_name:userid ,
                email: email,
                password: hashed_pass,
                uotp: otp
            })
            const a = await users.save()
            if (a) {

                getotp(email, otp,userid)
                req.session.username = name
                req.session.blocked=a.blocked
                next()
                console.log(a);

                console.log("otp sented");


            }
        }
    } catch (error) {
        console.log("error in signin"+error);
        res.status(500).send('An error ocupied')
    }

}

const blockuser=async(req,res,next)=>{
    if(req.session.ulogin){
        const userdata=  req.session.ulogin
        const data=await User.findById(userdata)
    if(!data){
        console.log('not'+userdata);
        
        return res.redirect('/signin')
    }
  if (!data.blocked) {
    console.log(data);

   return  next()
  }
  else {
  return  res.redirect('/logout')
  }
  }
  else {
    next()
  }
}

// otp varifing 
const otpvarify = async (req, res, next) => {
    try {
        // fetch data from usets
        const email = req.session.username;
        const otp = req.body.otp;
        // find user data
        const data = await User.findOne({ name: email });
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

        if (check.blocked) {
            req.session.login = "You have been blocked";
            return res.redirect('/signin');
        }

        req.session.ulogin = check._id;
        return res.redirect('/home');
        
    } catch (error) {
        console.error(error);
        res.status(500).send('An error occurred during login');
    }
};

 const logout=async(req,res,next)=>{
   try {
    req.session.destroy();
    console.log("the user logouted");
    return res.redirect('/signin')
   } catch (error) {
    console.log(error);
    
   }
    
}

const viewproduct = async (req, res, next) => {
    try {
      const id = req.params.ids;
      
      // Fetch the product by its ID
      const productdata = await product_schema.findById(id).populate('category_id');
      
      if (!productdata) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
  
      // Get products from the same category, excluding the current product
      const sameProducts = await product_schema.find({
        category_id: productdata.category_id._id,
        _id: { $ne: id } 
      });
  
      res.render('userside/product_over_view', {
        product: productdata,
        sameProducts: sameProducts
      });
  
      console.log('Product:', productdata);
      console.log('Same category products:', sameProducts);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  };
  

const glogincb= (req, res, next) => {
    passport.authenticate('google', (err, user, info) => {
        if (err) { 
            return next(err); 
        }
        if (!user) { 
            // req.session.login=''
            return res.redirect('/signin'); 
        }
        req.logIn(user, (err) => {
            if (err) { 
                return next(err); 
            }
            // console.log(user);
            if(!user.blocked){
                req.session.ulogin=user._id
           
            return res.redirect('/home')
        }
        if(user.blocked){
            console.log('notok');
            
            req.session.login=`your google account ${user.user_name} has been blocked`
            return res.redirect('/signin')
        }
        });
    })(req, res, next);
}


module.exports={signup,otpvarify,resent,varifylogin,viewproduct,logout,blockuser,glogincb}