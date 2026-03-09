import mongoose from "mongoose";
import dotenv from "dotenv";

export const connectDB = async () => {
    try {
        const { MONGO_URI } = process.env;
        if (!MONGO_URI) 
            throw new Error("MONGO_URI is not set");
        
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("MongoDB Connected: ", conn.connection.host)
    } catch (error) {
        console.log("Error connection to MongoDB: ", error);
        process.exit(1);

    }
};