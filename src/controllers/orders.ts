import { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";
import { ReqWithUser } from "../middlewares/verifyJWT.js";

export const createOrder = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;
    console.log(req.body);
    const { deliveryAddress, phoneNumber } = req.body;

    if (!deliveryAddress || !phoneNumber) {
        return res.status(400).json({ message: "Delivery address and phone number are required!" });
    }

    try {
        const cart = await prisma.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: { food: true },
                },
            },
        });

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty!" });
        }

        
        const totalAmount = cart.items.reduce((sum, item) => sum + item.food.price * item.quantity, 0);

        
        const order = await prisma.order.create({
            data: {
                userId,
                totalAmount,
                deliveryAddress,
                phoneNumber,
                items: {
                create: cart.items.map(item => ({
                    foodId: item.foodId,
                    quantity: item.quantity,
                    price: item.food.price,
                })),
                },
            },
            include: {
                items: { include: { food: true } },
            },
        });


        await prisma.cartItem.deleteMany({ where: { cartId: cart.id }, });
        await prisma.cart.delete({ where: { userId }, });

        return res.status(201).json(order);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to create order!" });
    }
};

export const getUserOrders = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;

    try {
        const orders = await prisma.order.findMany({
            where: { userId },
            include: {
                items: { include: { food: true } },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(orders);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to fetch orders!" });
    }
};

export const getDispatchOrders = async (req: Request, res: Response) => {
    const riderId = req.params.id;
    if(!riderId) return res.status(400).json({ message: "Rider Id is required!" })
    console.log(riderId)
    try {
        const orders = await prisma.order.findMany({
            where: { dispatchRiderId: riderId },
            include: {
                items: { include: { food: true } },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(orders);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to fetch orders!" });
    }
};

export const getUserNotifications = async (req: Request, res: Response) => {
    const userId = (req as ReqWithUser).user.id;

    try {
        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: {
                createdAt: "desc",
            },
        });

        
        return res.status(200).json(notifications);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to fetch notifications!" });
    }
};

export const getOrders = async (_req: Request, res: Response) => {

    try {
        const orders = await prisma.order.findMany({
            include: {
                items: { include: { food: true } },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return res.status(200).json(orders);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to fetch orders!" });
    }
};

export const getOrderById = async (req: Request, res: Response) => {
    const { id: orderId } = req.params;

    try {
        const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
                items: { include: { food: true } },
                user: true,
            },
        });

        if (!order) return res.status(404).json({ message: "Order not found!" });

        return res.status(200).json(order);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to fetch order!" });
    }
};

export const deleteNotification = async (req: Request, res: Response) => {
    const { id: notificationId } = req.params;

    try {
        const notification = await prisma.notification.delete({
            where: { id: notificationId },
        });

        if (!notification) return res.status(404).json({ message: "Notinotification not found!" });

        return res.status(200).json(notification);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to delete notification!" });
    }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
    const { id: orderId } = req.params;
    const { status } = req.body;

    const validStatuses = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

    if (!validStatuses.includes(status)) return res.status(400).json({ message: "Invalid order status" });

    try {
        const updated = await prisma.order.update({
            where: { id: orderId },
            data: { status },
            include: { items: {include: { food: true}} }
        });
        if(updated) {
            if(status === "CANCELLED"){
                await prisma.notification.create({
                    data: {
                        title: "Order Cancelled",
                        reason: `Your order for ${updated.items.map((item, index) => ((index + 1 === updated.items.length) && updated.items.length > 1) ? ` and ${item.quantity} ${item.food.name})} has been cancelled!` : `${item.quantity} ${item.food.name},`)} has been cancelled!` ,
                        userId: updated.userId
                    }
                })
            }
            if(status === "DELIVERED"){
                const deliveredUpdate = await prisma.order.update({
                    where: { id: orderId },
                    data: { dispatchRiderId: null },
                });
                return res.status(200).json(deliveredUpdate);
            }
        }

        return res.status(200).json(updated);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error: Unable to update order status" });
    }
};