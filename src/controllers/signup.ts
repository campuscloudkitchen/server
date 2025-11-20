import { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";
import { sendVerificationEmail } from "../utils/emails.js";
import bcrypt from "bcryptjs";

const signup = async(req: Request, res: Response) => {
    const { firstname, lastname, email, password } = req.body;
    if(!firstname) return res.status(400).json("Firstname is required!");
    if(!lastname) return res.status(400).json("Lastname is required!");
    if(!email) return res.status(400).json("Email is required!");
    if(!password) return res.status(400).json("Passpassword is required!");
    const duplicateEmail = await prisma.user.findUnique({ where: { email } });
    if(duplicateEmail) return res.status(409).json({ message: "User with email already exists!" });
    const hashPwd = await bcrypt.hash(password, 10);
    try{ await sendVerificationEmail(email); }catch(err){ console.log(err); return res.status(500).json({ message: "Unable to send email!" }); }
    const newUser = await prisma.user.create({ data: { firstname, lastname, email, password: hashPwd } });
    if(!newUser) return res.status(500).json({ message: "Unable to create your account!" });
    return res.status(200).json({ message: "We've sent a verification link to your email!" });}

export default signup;