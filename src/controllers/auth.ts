import type { Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import { prisma } from "../config/connectDB.js";
import { sendVerificationEmail } from "../utils/emails.js";
import bcrypt from "bcryptjs";

interface EmailPayload { email: string; }
export interface UserPayload { 
    id: string;
    firstname: string;
    lastname: string;
    email: string; 
    role: string;
    profileUrl: string; }

export const signin = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    if(!email) return res.status(400).json({ message: "Email is required!" });
    if(!password) return res.status(400).json({ message: "Password is required!" });
    const foundUser = await prisma.user.findUnique({ where: { email } });
    if(!foundUser) return res.status(404).json({ message: "User with email doesn't exist!" });
    if(!foundUser.isVerified) {
        await sendVerificationEmail(email)
        return res.status(203).json({ message: "We've sent a verification link to your email!" })};
    const matches = await bcrypt.compare(password, foundUser.password);
    if(!matches) return res.status(401).json({ message: "Password is incorrect!" });

    const payload = {
        id: foundUser.id,
        firstname: foundUser.firstname,
        lastname: foundUser.lastname,
        email: foundUser.email,
        role: foundUser.role,
        profileUrl: foundUser.profileUrl }

    const accessToken = jwt.sign(
        payload,
        process.env.ACCESS_TOKEN!,
        { expiresIn: "30m" });

    const refreshToken = jwt.sign(
        payload,
        process.env.REFRESH_TOKEN!,
        { expiresIn: "1d" });

    try{ await prisma.user.update({ where: { email }, data: { refreshToken } }); }
    catch(err) {return res.status(500).json({ message: "Couldn't save refresh token!" })}
    res.cookie("jwt", refreshToken, { httpOnly: true, secure: false, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    return res.status(200).json({ user: payload, token: accessToken }); }


    
export const verifyEmail = async (req: Request, res: Response) => {
    const { token } = req.params;
    if(!token)return res.status(400).json({ message: "Verification token is required!" });
    jwt.verify(
        token,
        process.env.EMAIL_VERIFICATION_TOKEN!,
        async (err: VerifyErrors | null, decoded: JwtPayload | undefined | string) => {
            if(err) return res.status(401).json({ message: "Couldn't verify token!" });
            const email = (decoded as EmailPayload).email;
            if(!email) return res.status(401).json({ message: "Email is required for verification!" });
            const foundUser = await prisma.user.findUnique({ where: { email } });
            if(!foundUser) return res.status(404).json({ message: "User not found!" });
            await prisma.user.update({ where: { email }, data: { isVerified: true } });
            return res.status(200).json({ message: "Your email has been verified. Signin to your account!" });});}


    
export const refresh = async (req: Request, res: Response) => {
    const { jwt: token } = req.cookies;
    if(!token)return res.status(403).json({ message: "Token is required for refresh!" });
    const foundUser = await prisma.user.findFirst({ where: { refreshToken: token } });
    if(!foundUser)return res.status(403).json({ message: "Couldn't find user with token!" });
    jwt.verify(
        token,
        process.env.REFRESH_TOKEN!,
        async (err: VerifyErrors | null, decoded: JwtPayload | undefined | string) => {
            if(err) return res.status(401).json({ message: "Couldn't verify token!" });
            const payload = {
                id: (decoded as UserPayload).id,
                firstname: (decoded as UserPayload).firstname,
                lastname: (decoded as UserPayload).lastname,
                email: (decoded as UserPayload).email,
                role: (decoded as UserPayload).role,
                profileUrl: (decoded as UserPayload).profileUrl }
            const accessToken = jwt.sign(
                payload,
                process.env.ACCESS_TOKEN!,
                { expiresIn: "30m" });
            return res.status(200).json({ user: payload, token: accessToken });});}


    
export const signout = async (req: Request, res: Response) => {
    const {jwt: token} = req.cookies;
    if(!token)return res.status(403).json({ message: "Token is required for signout!" });
    const foundUser = await prisma.user.findFirst({ where: { refreshToken: token } });
    if(!foundUser)return res.status(403).json({ message: "Couldn't find user with token!" });
    const updatedUser = await prisma.user.update({ where: { id: foundUser.id }, data: { refreshToken: "" } });
    if(!updatedUser) return res.status(500).json({ message: "Couldn't empty refreshToken!" });
    res.clearCookie("jwt", { httpOnly: true, secure: false, sameSite: "lax", maxAge: 24 * 60 * 60 * 1000 });
    return res.status(200).json({ message: "Successfully signed out!" }) }
