import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();

const connectDB = async () => {
    try{
        await prisma.$connect();
        console.log("Successfully connected to Database!✅");
    } catch(err){
        console.log("Failed to connect to Database!⚠️");
    }
}

export default connectDB;