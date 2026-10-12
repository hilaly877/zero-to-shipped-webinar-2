const mongoose = require("mongoose");

async function connectDatabase() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zero-to-shipped";

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log("MongoDB connected successfully.");
  } catch (error) {
    console.warn("MongoDB connection failed. Continuing without a database connection.");
    console.warn(error.message);
  }
}

module.exports = connectDatabase;
