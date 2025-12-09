import type { Request, Response } from "express";
import { prisma } from "../config/connectDB.js";
import handleUpload, { deleteExistingFile } from "../config/cloudinary.js";

export const deleteUser = async (req: Request, res: Response) => {
    const { id } = req.params;
    const foundUser = await prisma.user.findUnique({ where: { id } });
    if(!foundUser) return res.status(404).json({ message: "User not found!" });
    try{
        foundUser.profileId && await deleteExistingFile(foundUser.profileId);
        const deletedUser = await prisma.user.delete({ where: { id } });
        return res.status(200).json(deleteUser);
    } catch(error){
        console.log(error)
        return res.status(500).json({ message: "Server encountered an error!" })
    }    
}

export const getUsers = async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    return res.status(200).json(users);
}

// export const updateUser = async (req: Request, res: Response) => {
//     const { firstname, lastname } = req.body;
//     const photo = req.file;
//     const { id } = req.params;
//     const foundUser = await prisma.user.findUnique({ where: { id } });
//     if(!foundUser) return res.status(404).json({ message: "User not found!" });
//     try{
//         if(firstname) {
//             await prisma.user.update({ where: { id }, data: { firstname } }) }
//         if(lastname) {
//             await prisma.user.update({ where: { id }, data: { lastname } }) }
//         if(photo) {
//             let result;
//             if(foundUser.profileId) {
//                 result = await handleUpload(photo.buffer, "user_images", foundUser.profileId);
//             } else { result = await handleUpload(photo.buffer, "user_images", null); }
//             if(result?.secure_url && result.public_id){
//                 const newUser = await prisma.user.update({where: { id }, data: {profileUrl: result.secure_url, profileId: result.public_id } });
//                 if(newUser) return res.status(200).json(newUser);
//                 } 
//             }
//         const updatedUser = await prisma.user.findUnique({ where: { id } });
//         return res.status(200).json(updatedUser);
//     } catch(error){
//         console.log(error)
//         return res.status(500).json({ message: "Server encountered an error!" })
//     }       
// }

export const updateUser = async (req: Request, res: Response) => {
    const { firstname, lastname } = req.body;
    const photo = req.file;
    const { id } = req.params;
    const foundUser = await prisma.user.findUnique({ where: { id } });
    if(!foundUser) return res.status(404).json({ message: "User not found!" });
    try{
        if(firstname) {
            await prisma.user.update({ where: { id }, data: { firstname } }) }
        if(lastname) {
            await prisma.user.update({ where: { id }, data: { lastname } }) }
        if(photo) {
            let result;
            if(foundUser.profileId) {
                result = await handleUpload(photo.buffer, "user_images", foundUser.profileId);
            } else { result = await handleUpload(photo.buffer, "user_images", null); }
            if(result?.secure_url && result.public_id){
                const newUser = await prisma.user.update({where: { id }, data: { profileUrl: result.secure_url, profileId: result.public_id } });
                if(newUser) return res.status(200).json(newUser);
                } 
            }
        const updatedUser = await prisma.user.findUnique({ where: { id } });
        return res.status(200).json(updatedUser);
    } catch(error){
        console.log(error)
        return res.status(500).json({ message: "Server encountered an error!" })
    }       
}