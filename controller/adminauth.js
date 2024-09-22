const User=require('../model/user_scema')

const auth=async (req,res,next)=>{
    try {
        const { username,password }= req.body
    console.log(username+ password);
    
    const exsist=await User.findOne({
        $and:[
            {user_name:username},
            {password:password},
        ]
    })
    if(exsist){
        req.session.admin=true
        if(exsist.isadmin){
            res.redirect('/admin/dashbord')
        }
        else 
        req.session.admin='The entered usename and password not a admin'
       res.redirect('/admin')
    }
    else 
    res.redirect('/admin')
    } catch (error) {
        console.log(error);
        
    }
    

}


module.exports=auth