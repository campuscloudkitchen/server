import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});



export const sendVerificationEmail = async (email: string) => {
    const token = jwt.sign(
        { email },
        process.env.EMAIL_VERIFICATION_TOKEN!,
        { expiresIn: "1h" }
    );
    const mailOptions = {
        from: `"CampusCloudKitchen" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your CampusCloudKitchen Email!",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafc; padding: 30px; margin: 0 auto; max-width: 420px; border-radius: 10px; border: 1px solid #e5e7eb;">
                <div style="text-align: center;">
                    <h1 style="margin: 0; font-size: 1.4rem; color: #1f2937; font-weight: 800;">Welcome!</h1>
                    <p style="margin: 0px; color: #4b5563; font-size: 0.95rem;">Let's get your email verified.</p>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:5173/signin?token=${token}"
                    style="display: inline-block; background-color: #F28C28; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 900; font-size: 0.95rem; transition: background-color 0.3s; cursor: pointer;">
                    Verify Email
                    </a>
                </div>

                <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; text-align: center; margin: 10px 0;">
                    If you didn’t request this, you can safely ignore this email or let us know.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">

                <div style="text-align: center;">
                    <p style="margin: 0; font-size: 0.85rem; color: #374151;">Thanks,</p>
                    <p style="margin: 5px 0 0; font-weight: 600; font-size: 0.85rem; color: #111827;">CampusCloudKitchen</p>
                </div>
            </div>
        `,
    }
    return await transporter.sendMail(mailOptions);
}



export const sendDispatchVerificationEmail = async (email: string, password: string) => {
    const token = jwt.sign(
        { email },
        process.env.EMAIL_VERIFICATION_TOKEN!,
        { expiresIn: "1h" }
    );
    const mailOptions = {
        from: `"CampusCloudKitchen" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Verify Your CampusCloudKitchen Email!",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafc; padding: 30px; margin: 0 auto; max-width: 420px; border: 1px solid #e5e7eb;">
                <div style="text-align: center;">
                    <h1 style="margin: 0; font-size: 1.4rem; color: #1f2937; font-weight: 800;">Welcome!</h1>
                    <p style="margin: 0px; color: #4b5563; font-size: 0.95rem;"><span style="font-weight: 700">You've been added as a dispatch rider. </span>Let's get your email verified.</p>
                    <p style="margin: 0px; color: #4b5563; font-size: 0.95rem;">Your password is <span style="font-weight: 700">${password}</span></p>
                    
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:5173/signin?token=${token}"
                    style="display: inline-block; background-color: #F28C28; color: #ffffff; text-decoration: none; padding: 12px; font-weight: 900; font-size: 0.95rem; transition: background-color 0.3s; cursor: pointer;">
                        Verify Email
                    </a>
                </div>

                <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; text-align: center; margin: 10px 0;">
                    If you didn’t request this, you can safely ignore this email or let us know.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">

                <div style="text-align: center;">
                    <p style="margin: 0; font-size: 0.85rem; color: #374151;">Thanks,</p>
                    <p style="margin: 5px 0 0; font-weight: 600; font-size: 0.85rem; color: #111827;">CampusCloudKitchen</p>
                </div>
            </div>
        `,
    }
    return await transporter.sendMail(mailOptions);
}


export const sendPasswordResetEmail = async (email: string) => {
    const token = jwt.sign(
        { email },
        process.env.PASSWORD_RESET_TOKEN!,
        { expiresIn: "1h" }
    );
    const mailOptions = {
        from: `"CampusCloudKitchen" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Reset Your CampusCloudKitchen Password!",
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f9fafc; padding: 30px; margin: 0 auto; max-width: 420px; border-radius: 10px; border: 1px solid #e5e7eb;">
                <div style="text-align: center;">
                    <h1 style="margin: 0; font-size: 1.4rem; color: #1f2937; font-weight: 800;">Welcome!</h1>
                    <p style="margin: 0px; color: #4b5563; font-size: 0.95rem;">Let's reset your password.</p>
                </div>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="http://localhost:5173/resetpassword?token=${token}"
                    style="display: inline-block; background-color: #F28C28; color: #ffffff; text-decoration: none; padding: 12px; border-radius: 8px; font-weight: 900; font-size: 0.95rem; transition: background-color 0.3s; cursor: pointer;">
                    Reset Password
                    </a>
                </div>

                <p style="color: #6b7280; font-size: 0.85rem; line-height: 1.5; text-align: center; margin: 10px 0;">
                    If you didn’t request this, you can safely ignore this email or let us know.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 15px 0;">

                <div style="text-align: center;">
                    <p style="margin: 0; font-size: 0.85rem; color: #374151;">Thanks,</p>
                    <p style="margin: 5px 0 0; font-weight: 600; font-size: 0.85rem; color: #111827;">CampusCloudKitchen</p>
                </div>
            </div>
        `,
    }
    return await transporter.sendMail(mailOptions);
}