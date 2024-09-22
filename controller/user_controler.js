const Uschema = require('../model/user_scema')
const nodemailer = require("nodemailer");
require('dotenv').config()

const getotp = async (email, otp) => {
    try {
        
        
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }
        const trancport = nodemailer.createTransport(config)
        
        const x = await trancport.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: 'OTP',
            text: `OTP is ${otp}`,
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; background-color: #f4f4f9;">
            <h2 style="color: #007bff; text-align: center;">Your OTP Code</h2>
            
            <p style="text-align: center;">Use the following OTP to complete your login process:</p>
            
            <h1 style="color: #28a745; text-align: center; font-size: 48px; letter-spacing: 5px;">${otp}</h1>
            
            <p style="text-align: center;">This OTP is valid for the next 10 minutes.</p>
            
            <div style="text-align: center;">
            <a href="#" style="display: inline-block; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Now</a>
            </div>
            
            <hr style="border-top: 1px solid #ddd;">
            
            <div style="text-align: center; padding-top: 10px;">
            <img src="https://cdn.pixabay.com/photo/2016/11/14/03/16/qr-code-1820325_1280.png" alt="QR Code" style="width: 150px; height: 150px;"/>
            </div>
            
            <p style="text-align: center; color: #6c757d;">If you did not request this, please ignore this email.</p>
            </div>
            `
        })
        
    }
    
    
    catch (error) {
        console.log(error);
        
    }
}
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
            req.session.register = "User name or password already exist";
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
                req.session.username=username
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
