const User = require('../../model/user_scema')


const block = async (req, res, next) => {
    try {
        const user_id = req.params.id
        console.log(user_id+'userid');
        
        const detials = await User.findById(user_id)

        detials.status = false
        await detials.save()
        
        return res.redirect('/admin/users')

    }
    catch (error) {
        console.log(error);

    }
}




const unblock=async (req,res,next)=>{
    try {
        user_id=req.params.id
    const detials=await User.findById(user_id)

    detials.status=true
    await detials.save()


    return  res.redirect('/admin/users')

    } catch (error) {
       console.log(error);
        
    }
   
}
module.exports = { block, unblock }