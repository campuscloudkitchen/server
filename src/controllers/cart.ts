import { Request, Response } from "express";
import { ReqWithUser } from "../middlewares/verifyJWT.js";
import { prisma } from "../config/connectDB.js";


export const getCart = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;
    if(!userId) return res.status(400).json({ message: "User Id is required!" });
    const cart = await prisma.cart.findMany({ where: { userId } });
    if(!cart) return res.status(500).json({ message: "Server error: Unable to fetch cart item!" });
    return res.status(200).json(cart);
}


export const addToCart = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;
    const { foodId } = req.body;
    if(!userId) return res.status(404).json({ message: "User Id is required!" });
    if(!foodId) return res.status(404).json({ message: "Food Id is required!" });
    const duplicate = await prisma.cart.findUnique({ where: { userId, foodId } })
    const newCartItem = await prisma.cart.create({ data: { userId, foodId } });
    if(!newCartItem) return res.status(500).json({ message: "Server error: Unable to add to cart!" });
    return res.status(200).json(newCartItem);
}


export const removeFromCart = async (req: Request, res: Response) => {
    const cartId = req.params.id;
    if(!cartId) return res.status(400).json({ message: "Cart Id is required!" });
    try{
        await prisma.cart.delete({ where: { id: cartId } });
    } catch(err) {
        console.log(err)
        return res.status(500).json({ message: "Server error: Unable to remove item from cart!" });
    }
    return res.status(200).json({ message: "Successfully removed!" });
}


export const updateCartItemQuantity = async (req: Request, res: Response) => {
    const cartId = req.params.id;
    const { type, quantity } = req.body;
    if(!cartId) return res.status(400).json({ message: "Cart Id is required!" });
    if(!type) return res.status(400).json({ message: "Update type is required!" });
    if(!quantity) return res.status(400).json({ message: "Quantity is required!" });
    const foundCart = await prisma.cart.findUnique({ where: { id: cartId } });
    if(!foundCart) return res.status(404).json({ message: "Cart not found!" });
    let updateQuantity;
    if(type === "add") updateQuantity = foundCart.quantity + Number(quantity);
    if(type === "minus") updateQuantity = foundCart.quantity - Number(quantity);
    try{
        await prisma.cart.update({ where: { id: cartId }, data: { quantity: updateQuantity } });
    } catch(err) {
        console.log(err);
        return res.status(500).json({ message: "Server error: Unable to remove item from cart!" });
    }
    return res.status(200).json({ message: "Successfully removed!" });
}

