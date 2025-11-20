import { CorsOptions } from "cors";
import allowedOrigins from "./allowedOrigins.js";

const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        if(allowedOrigins.includes(origin as string) || !origin) {
            callback(null, true);
        }else {
            callback(Error("Not allowed by CORS!"));
        }
    },
    optionsSuccessStatus: 200,
    credentials: true,
}

export default corsOptions;