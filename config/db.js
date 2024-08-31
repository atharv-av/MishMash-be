import mongoose from "mongoose";
import { User } from "../models/userModel.js";

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "MishMash",
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Update indexes after successful connection
    await updateUserIndexes();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const updateUserIndexes = async () => {
  try {
    const collection = User.collection;
    try {
      await collection.dropIndex("email_1");
      await collection.dropIndex("phone_1");
    } catch (error) {
      console.log("No existing indexes to drop or drop failed");
    }
    User.schema.index({ email: 1 }, { unique: true, sparse: true });
    User.schema.index({ phone: 1 }, { unique: true, sparse: true });

    await User.syncIndexes();

    console.log("User indexes updated successfully");
  } catch (error) {
    console.error("Error updating indexes:", error);
  }
};

export default connectDb;
