

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
        return res.redirect('/signup');
    }
};

//admin section----------------------------------------------------------------------------------------
//adminlogin

const adminlogin=(req,res)=>{
    const notadmin=  req.session.admin||''
    const islogin =req.session.ladmin
    delete req.session.admin
    islogin?res.redirect('/admin/dashbord'):res.render('auth/admin',{ans:notadmin})
}

// admin html rendering 
// LADMIN MEANS LOGIN ADMIN 
const admin=(req,res)=>{
    const islogin =req.session.ladmin
    islogin?res.render('admin/dashbord'):res.redirect('/admin')
}



//user 
const user=(req,res)=>{
    req.session.ladmin 
    const islogin =req.session.ladmin 
    const users=req.session.users
    delete req.session.users
    islogin?res.render('admin/users',{Users:users}):res.redirect('/admin')
}
    
//product


const product =(req,res,next)=>{
    const islogin =req.session.ladmin 
    const products=req.session.products
    delete req.session.products
    islogin?res.render('admin/product',{Products:products,categories:products}):res.redirect('/admin')
}
module.exports={register,login,adminlogin,otp,admin,user,product}