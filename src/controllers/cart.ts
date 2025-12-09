import { Request, Response } from "express";
import { ReqWithUser } from "../middlewares/verifyJWT.js";
import { prisma } from "../config/connectDB.js";
import { CartItemPayload } from "../utils/types.js";



export const getCart = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;
    if (!userId) return res.status(400).json({ message: "User Id is required!" });

    try {
        let cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: { include: { food: true } }
            }
        });

        if (!cart) return res.status(200).json([]);

        return res.status(200).json(cart.items);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error: Unable to fetch cart!" });
    }
};


export const addToCart = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;
    const { foodId, quantity = 1 } = req.body;

    if (!userId) return res.status(400).json({ message: "User Id is required!" });
    if (!foodId) return res.status(400).json({ message: "Food Id is required!" });

    try {
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) {
            cart = await prisma.cart.create({ data: { userId } });
        }

        const existingItem = await prisma.cartItem.findUnique({
            where: { cartId_foodId: { cartId: cart.id, foodId } }
        });

        if (existingItem) {
            const updatedItem = await prisma.cartItem.update({
                where: { cartId_foodId: { cartId: cart.id, foodId } },
                data: { quantity: existingItem.quantity + Number(quantity) }
            });
            return res.status(200).json(updatedItem);
        }

        const newItem = await prisma.cartItem.create({
            data: {
                cartId: cart.id,
                foodId,
                quantity: Number(quantity)
            },
            include: { food: true }
        });

        return res.status(200).json(newItem);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error: Unable to add to cart!" });
    }
};



export const removeFromCart = async (req: Request, res: Response) => {
    const { id: cartItemId } = req.params;
    if (!cartItemId) return res.status(400).json({ message: "CartItem Id is required!" });

    try {
        await prisma.cartItem.delete({ where: { id: cartItemId } });
        return res.status(200).json({ message: "Successfully removed!" });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error: Unable to remove item!" });
    }
};



export const updateCartItemQuantity = async (req: Request, res: Response) => {
    const { id: cartItemId } = req.params;
    const { type, quantity = 1 } = req.body;

    if (!cartItemId) return res.status(400).json({ message: "CartItem Id is required!" });
    if (!type || !["add", "minus"].includes(type)) return res.status(400).json({ message: "Invalid type!" });

    try {
        const cartItem = await prisma.cartItem.findUnique({ where: { id: cartItemId } });
        if (!cartItem) return res.status(404).json({ message: "CartItem not found!" });

        let newQuantity = cartItem.quantity;
        if (type === "add") newQuantity += Number(quantity);
        if (type === "minus") newQuantity = Math.max(1, newQuantity - Number(quantity));

        const updatedItem = await prisma.cartItem.update({
            where: { id: cartItemId },
            data: { quantity: newQuantity },
            include: { food: true }
        });

        return res.status(200).json(updatedItem);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error: Unable to update quantity!" });
    }
};


export const syncCart = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;
    const frontendItems: CartItemPayload[] = req.body.cart;

    if (!userId) return res.status(400).json({ message: "User Id is required!" });
    if (!frontendItems || !Array.isArray(frontendItems))
        return res.status(400).json({ message: "Cart items are required!" });

    try {
        let cart = await prisma.cart.findUnique({ where: { userId } });
        if (!cart) { 
            cart = await prisma.cart.create({ data: { userId } }); 
        }


        const existingItems = await prisma.cartItem.findMany({
            where: { cartId: cart.id }
        });

        
        const frontendMap = new Map(frontendItems.map(item => [item.foodId, item.quantity]));

        
        for (const item of existingItems) {
            const frontendQty = frontendMap.get(item.foodId);
            if (frontendQty != null) {
                if (item.quantity !== frontendQty) {
                    await prisma.cartItem.update({
                        where: { id: item.id },
                        data: { quantity: frontendQty }
                    });
                }
                frontendMap.delete(item.foodId);
            } else {
                await prisma.cartItem.delete({ where: { id: item.id } });
            }
        }

        
        const newItems = Array.from(frontendMap.entries());
        for (const [foodId, quantity] of newItems) {
            await prisma.cartItem.create({
                data: {
                    cartId: cart.id,
                    foodId,
                    quantity
                }
            });
        }

        
        const updatedCart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: { items: { include: { food: true } } }
        });

        return res.status(200).json(updatedCart);

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Server error: Unable to sync cart!" });
    }
};