import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      dbName: "padips2",        // ✅ Explicit DB name
    });

    console.log(`✅ PADIPS2 MongoDB connected: ${conn.connection.name}`);
  } catch (error) {
    console.error("❌ PADIPS2 MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
