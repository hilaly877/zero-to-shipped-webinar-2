const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

function requireDatabase(req, res, next) {
  if (!isDatabaseConnected()) {
    return res.status(503).json({
      message: "The database is unavailable. Check the MongoDB connection and try again.",
    });
  }

  next();
}

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

module.exports = { connectDatabase, isDatabaseConnected, requireDatabase };
