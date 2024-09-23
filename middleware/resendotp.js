const User = require('../model/user_scema')
const getotp = require('../middleware/getotp')

const resent = async (req, res, next) => {
    const username = req.session.username
    const users = await User.findOne({user_name:username})
    
    if(!users){
        res.redirect('/otp')
    }
    const nwotp= Math.round(100000 + Math.random() * 90000)
      
    users.uotp=nwotp;
    await users.save()
    console.log('resent otp succsesfully');
    

    await getotp(users.email,nwotp)

    console.log(users);
    res.redirect('/otp')
    
}


module.exports=resent