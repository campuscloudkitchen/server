import { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";
import bcrypt from "bcryptjs";
import { sendDispatchVerificationEmail } from "../utils/emails.js";
import { generateStrongPassword } from "../utils/generatePwd.js";

export const assignDispatchRider = async (req: Request, res: Response) => {
    const { orderId } = req.params;
    const { riderId } = req.body;

    if (!orderId) return res.status(400).json({ message: "Order ID is required" });
    if (!riderId) return res.status(400).json({ message: "Rider ID is required" });
    console.log(riderId)

    try {

        const order = await prisma.order.findUnique({ where: { id: orderId } });
        if (!order) return res.status(404).json({ message: "Order not found!" });

        const rider = await prisma.user.findUnique({ where: { id: riderId } });
        if (!rider) return res.status(404).json({ message: "Rider not found!" });
        if (rider.role !== "DISPATCH")
            return res.status(400).json({ message: "User is not a dispatch rider!" });

        
        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                dispatchRiderId: riderId,
                dispatchedAt: new Date(),
                status: "CONFIRMED"
            },
            include: {
                items: { include: { food: true } },
                dispatchRider: true
            }
        });

        return res.status(200).json({
            message: "Dispatch rider assigned successfully",
            order: updatedOrder
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error assigning dispatch rider" });
    }
};

export const addDispatchRider = async (req: Request, res: Response) => {
    const { firstname, lastname, email } = req.body;
    if (!firstname) return res.status(400).json({ message: "First name is required!" });
    if (!lastname) return res.status(400).json({ message: "Last name is required!" });
    if (!email) return res.status(400).json({ message: "Email is required!" });
    const duplicateEmail = await prisma.user.findUnique({ where: { email } });
    if(duplicateEmail) return res.status(409).json({ message: "User with email already exists!" });
    const password = generateStrongPassword();
    const hashPwd = await bcrypt.hash(password, 10);
    try{ await sendDispatchVerificationEmail(email, password); }catch(err){ console.log(err); return res.status(500).json({ message: "Unable to send email!" }); }
    const newUser = await prisma.user.create({ data: { firstname, lastname, email, password: hashPwd, role: "DISPATCH" } });
    if(!newUser) return res.status(500).json({ message: "Unable to create your account!" });
    return res.status(200).json({ message: "We've sent a verification link to your email!" });}

export const getDispatchRiders = async (req: Request, res: Response) => {
    const riders = await prisma.user.findMany({ where: { role: "DISPATCH" } });
    return res.status(200).json(riders);
};
