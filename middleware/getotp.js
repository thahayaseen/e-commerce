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
const sendPasswordResetOTP = async (email, otp, username) => {
    try {
        let config = {
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        }
        const transport = nodemailer.createTransport(config)

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset Request',
            text: `Your password reset OTP is ${otp}`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Password Reset</title>
            </head>
            <body style="margin: 0; padding: 0; background-color: #f4f7fb;">
                <table cellpadding="0" cellspacing="0" border="0" width="100%" style="font-family: 'Arial', sans-serif;">
                    <tr>
                        <td align="center" style="padding: 40px 0;">
                            <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); padding: 40px;">
                                <!-- Logo or Brand Header -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <img src="../public/uploads/logo.png" alt="Company Logo" style="max-width: 150px; height: auto;">
                                    </td>
                                </tr>

                                <!-- Main Heading -->
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <h1 style="color: #1a202c; font-size: 24px; font-weight: bold; margin: 0;">Password Reset Request</h1>
                                    </td>
                                </tr>

                                <!-- Greeting -->
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0;">Hello ${username},</p>
                                    </td>
                                </tr>

                                <!-- Message -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <p style="color: #4a5568; font-size: 16px; line-height: 24px; margin: 0;">
                                            We received a request to reset your password. Please use the following verification code:
                                        </p>
                                    </td>
                                </tr>

                                <!-- OTP Code -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="background-color: #f7fafc; border: 2px solid #e2e8f0; border-radius: 8px; padding: 20px;">
                                            <span style="color: #2d3748; font-size: 32px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Timer Warning -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <div style="background-color: #fff8e6; border: 1px solid #ffd480; border-radius: 6px; padding: 15px;">
                                            <p style="color: #875a18; font-size: 14px; margin: 0;">
                                                ⏰ This code will expire in 60 minutes for security reasons
                                            </p>
                                        </div>
                                    </td>
                                </tr>

                                <!-- Action Button -->
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="${process.env.RESET_PASSWORD_URL || '#'}" 
                                           style="display: inline-block; padding: 15px 30px; background-color: #4299e1; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>

                                <!-- Security Notice -->
                                <tr>
                                    <td style="padding-top: 20px; border-top: 1px solid #e2e8f0;">
                                        <p style="color: #718096; font-size: 14px; line-height: 24px; margin: 0; padding-bottom: 10px;">
                                            🔒 If you didn't request this password reset, please ignore this email or contact our support team if you have concerns.
                                        </p>
                                        <p style="color: #718096; font-size: 14px; line-height: 24px; margin: 0;">
                                            For security reasons, never share this code with anyone. Our team will never ask for your code.
                                        </p>
                                    </td>
                                </tr>

                                <!-- Footer -->
                                <tr>
                                    <td align="center" style="padding-top: 30px;">
                                        <p style="color: #a0aec0; font-size: 12px; margin: 0;">
                                            © ${new Date().getFullYear()} ${process.env.COMPANY_NAME || 'Your Company'}. All rights reserved.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            `
        }

        const result = await transport.sendMail(mailOptions)
        return result

    } catch (error) {
        console.error('Error sending password reset email:', error)
        throw error
    }
}

// module.exports = sendPasswordResetOTP;
module.exports = {getotp,sendPasswordResetOTP}