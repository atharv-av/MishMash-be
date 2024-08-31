import express from "express";
import dotenv from "dotenv";
import connectDb from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import connectCloudinary from "./config/cloudinary.js";

const app = express();

dotenv.config();

app.use(express.json());
app.use("/api/v1", userRoutes);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  connectDb();
  connectCloudinary()
});
