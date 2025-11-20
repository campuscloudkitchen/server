import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { configDotenv } from "dotenv";
import connectDB from "./config/connectDB.js";
import version1 from "./routers/apiV1.js";
import corsOptions from "./config/corsOptions.js";

configDotenv();
const app = express();
const PORT = process.env.PORT || 4321;

connectDB();
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", version1 );

app.listen(PORT, () => console.log(`Server running on ${PORT}`));