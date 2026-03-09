import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import { connectDB } from "./lib/db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server running on port: " + PORT);
    });
}).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});