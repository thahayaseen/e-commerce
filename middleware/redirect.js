const pregister=async(req,res,next)=>{
    res.redirect('/otp')
    next()
}



module.exports={pregister}