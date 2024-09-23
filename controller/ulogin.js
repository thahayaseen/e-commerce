
const User=require('../model/user_scema')
const varifylogin=async (req,res,next)=>{
   try{
    const {username,password}=req.body
    console.log(username,password);
    
    const check=await User.find({user_name:username,password:password})
    console.log(check);
    
    if(check.length>0){
        res.redirect('/dashbord')
    }
    else{
        req.session.login="invalid username or password"
        res.redirect('/signin')
    }

   }
   catch(error){
    console.log(error+'gdsg');
    
   }
}
module.exports=varifylogin