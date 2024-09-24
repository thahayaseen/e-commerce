
const User=require('../../model/user_scema')
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






    // if(check.status){
    //     res.redirect('/dashbord')
    // }
    // else if(check.length>0){
    //     req.session.login="You have been blocked"
    //     res.redirect('/signin')
    // }
    // else{
    //     req.session.login="invalid username or password"
    //     res.redirect('/signin')
    // }
   }
   catch(error){
    console.log(error+'gdsg');
    
   }
}
module.exports=varifylogin