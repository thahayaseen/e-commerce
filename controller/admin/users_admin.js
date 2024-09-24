const User=require('../../model/user_scema')


const alluser= async (req,res,next)=>{
try {
    const user=await User.find()
    req.session.users=user
    next()
} catch (error) {
    console.log(error);
    
}
}

module.exports=alluser