const nodemailer = require("nodemailer");
require('dotenv').config()
const getotp = async (email, otp,userid) => {
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
            <h3>your username is ${userid}</h3>
            <p style="text-align: center;">This OTP is valid for the next 10 minutes.</p>
            
            <div style="text-align: center;">
            <a href="#" style="display: inline-block; padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Verify Now</a>
            </div>
            
            <hr style="border-top: 1px solid #ddd;">
            
            
            
            <p style="text-align: center; color: #6c757d;">If you did not request this, please ignore this email.</p>
            </div>
            `
        })

    }


    catch (error) {
        console.log(error);

    }
}
module.exports = getotp