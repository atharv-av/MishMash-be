import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use("/api/v1", userRoutes);
app.use("/api/v1", postRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
  connectCloudinary();
});
