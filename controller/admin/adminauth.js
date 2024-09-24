const User=require('../../model/user_scema')

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
        req.session.ladmin=true
        if(exsist.isadmin){
           return res.redirect('/admin/dashbord')
        }
        else {
        req.session.admin='The entered usename and password not a admin'
        return res.redirect('/admin')
        }
    }
    
    } catch (error) {
        console.log(error);
        
    }
    

}


module.exports=auth