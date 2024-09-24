

//register-------------------------------------------------------
const register= (req,res)=>{
    const registerMessage =  req.session.register || '';
    delete req.session.register
    res.render('auth/signup.ejs',{msg:registerMessage})
}


//login---------------------------------------------------------------
const login=async(req,res)=>{
    const invalid=req.session.login||''
    delete req.session.login
    res.render('auth/ulogin',{mesasge:invalid})
}
//otp
const otp = (req, res) => {
    const signin = req.session.username;
    const errorotp = req.session.otperror || '';
    delete req.session.otperror;

    if (signin) {
        // User is signed in, render the OTP page
        res.render('auth/otp', { error: errorotp });
        delete req.session.username; // Remove username after rendering
    } else {
        // User is not signed in, redirect to signup
        res.redirect('/signup');
    }
};

//admin section----------------------------------------------------------------------------------------
//adminlogin
const adminlogin=(req,res)=>{
   const notadmin=  req.session.admin||''
   delete req.session.admin
   res.render('auth/admin',{ans:notadmin})
}

// admin html rendering 
const admin=(req,res)=>{
    res.render('admin/dashbord')
}



//user 
const user=(req,res)=>{
    const users=req.session.users
    delete req.session.users
    res.render('admin/users',{Users:users})
}

module.exports={register,login,adminlogin,otp,admin,user}