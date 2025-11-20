import { Request, Response } from "express";
import handleUpload, { deleteExistingFile } from "../config/cloudinary.js";
import { prisma } from "../config/connectDB.js";

export const addFood = async (req: Request, res: Response) => {
    const { name, price, quantity, } = req.body;
    const photo = req.file;
    if(!name) return res.status(400).json({ message: "Name is required!" });
    if(!price) return res.status(400).json({ message: "Price is required!" });
    if(!quantity) return res.status(400).json({ message: "Quantity is required!" });
    if(photo) {
        try{
            const result = await handleUpload(photo.buffer, "food_images", null);
            if(result?.secure_url && result.public_id){
                const newFood = await prisma.food.create({ data: { name, price: parseFloat(price), quantity: parseInt(quantity), photoUrl: result.secure_url, photoId: result.public_id } });
                if(newFood) return res.status(200).json(newFood);
            }
        } catch (error) { console.log(error); } 
    }
    try{
        const newFood = await prisma.food.create({ data: { name, price: parseFloat(price), quantity: parseInt(quantity) } });
        if(newFood) return res.status(200).json(newFood);
    } catch (error) { console.log(error); }    
}

export const updateFood = async (req: Request, res: Response) => {
    const { name, price, quantity, } = req.body;
    const photo = req.file;
    const { id } = req.params;
    const foundFood = await prisma.food.findUnique({ where: { id } });
    if(!foundFood) return res.status(404).json({ message: "Food not found!" });
    try{
        if(name) {
            await prisma.food.update({ where: { id }, data: { name } }) }
        if(price) {
            await prisma.food.update({ where: { id }, data: { price: parseFloat(price) } }) }
        if(quantity) {
            await prisma.food.update({ where: { id }, data: { quantity: parseFloat(quantity) } }) }
        if(photo) {
            let result;
            if(foundFood.photoId) {
                result = await handleUpload(photo.buffer, "food_images", foundFood.photoId);
            } else { result = await handleUpload(photo.buffer, "food_images", null); }
            if(result?.secure_url && result.public_id){
                const newFood = await prisma.food.update({where: { id }, data: {photoUrl: result.secure_url, photoId: result.public_id } });
                if(newFood) return res.status(200).json(newFood);
                } 
            }
        const updatedFood = await prisma.food.findUnique({ where: { id } });
        return res.status(200).json(updatedFood);
    } catch(error){
        console.log(error)
        return res.status(500).json({ message: "Server encountered an error!" })
    }       
}

export const deleteFood = async (req: Request, res: Response) => {
    const { id } = req.params;
    const foundFood = await prisma.food.findUnique({ where: { id } });
    if(!foundFood) return res.status(404).json({ message: "Food not found!" });
    try{
        await deleteExistingFile(foundFood.photoId!);
        await prisma.food.delete({ where: { id } });
    } catch(error){
        console.log(error)
        return res.status(500).json({ message: "Server encountered an error!" })
    }    
}

export const getFoods = async (req: Request, res: Response) => {
    const foods = await prisma.food.findMany({ orderBy: { createdAt: "desc" } });
    return res.status(200).json(foods);
}

export const getFood = async (req: Request, res: Response) => {
    const { id } = req.params;
    const foundFood = await prisma.food.findUnique({ where: { id } });
    if(!foundFood) return res.status(404).json({ message: "Food not found!" });
    return res.status(200).json(foundFood);
}