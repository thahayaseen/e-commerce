const Uschema = require('../model/user_scema')
const getotp = require('../middleware/getotp')


const signin = async (req, res, next) => {
    try {
        const otp = Math.round(100000 + Math.random() * 90000)
        const { username, email, password } = req.body
        const exsist = await Uschema.find({
            $or: [
                { user_name: username },
                { email: email }
            ]
        })
        console.log(exsist);

        if (exsist.length > 0) {
            req.session.register = "User name or email already exist";
            return res.redirect('/signup')
        }
        else {
            const users = await Uschema({
                user_name: username,
                email: email,
                password: password,
                uotp: otp
            })
            const a = await users.save()
            if (a) {

                getotp(email, otp)
                req.session.username = username
                req.session.status=a.status
                next()
                console.log(a);

                console.log("otp sented");


            }
        }
    } catch (error) {
        console.log(error);
        res.status(500).send('An error ocupied')
    }

}

module.exports = signin
