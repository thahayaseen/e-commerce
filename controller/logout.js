const logout=async(req,res,next)=>{
    req.session.destroy();
    console.log("the user logouted");
    return res.redirect('/signin')
    
}

module.exports=logout