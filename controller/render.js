

//register-------------------------------------------------------
const register= (req,res)=>{
    const registerMessage =  req.session.register || '';
    delete req.session.register
    res.render('signup.ejs',{msg:registerMessage})
}


//login---------------------------------------------------------------
const login=async(req,res)=>{
    res.render('ulogin')
}
//adminlogin
const adminlogin=(req,res)=>{
   const notadmin=  req.session.admin||''
   delete req.session.admin
   res.render('admin',{ans:notadmin})
}
//otp
const otp=(req,res)=>{
    const signin= req.session.username
    const errorotp=req.session.otperror||''
    delete req.session.otperror
    
    signin?res.render('otp',{error:errorotp}):res.redirect('/signup')
}

module.exports={register,login,adminlogin,otp}