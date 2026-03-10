import express from "express";
import { ENV } from "./lib/env.js";
import authRoutes from "./routes/authRoute.js";
import messageRoutes from "./routes/messageRoute.js";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = ENV.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log("Server running on port: " + PORT);
    });
}).catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
});