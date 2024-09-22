const Users=require('../model/user_scema')
const otpvarify=async(req,res,next)=>{
    try {
        const email=req.session.username
        // delete req.session.username
        const data=await Users.findOne({user_name:email})
        // console.log(data);

        const otp=req.body.otp
        const rotp=Number(otp)
        // console.log(data.uotp===rotp);
        // console.log(typeof otp);
        

        if(data.uotp===rotp){
            // alert('done')
            console.log("done");
            next()
        delete req.session.username
            
            // res.send("gdfgsdgsdsjhd")
            
        }
        else{
            req.session.otperror="otp not match"
            res.redirect('/otp')
        }
        
    } catch (error) {
        
    }
}
module.exports=otpvarify