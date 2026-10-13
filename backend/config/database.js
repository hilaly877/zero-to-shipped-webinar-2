const mongoose = require("mongoose");

mongoose.set("bufferCommands", false);

function isDatabaseConnected() {
  return mongoose.connection.readyState === 1;
}

let connectionPromise;

async function requireDatabase(req, res, next) {
  const connected = await connectDatabase();

  if (!connected) {
    return res.status(503).json({
      message: "The database is unavailable. Check the MongoDB connection and try again.",
    });
  }

  next();
}

async function connectDatabase() {
  if (isDatabaseConnected()) {
    return true;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const mongoUri =
    process.env.MONGODB_URI ||
    (process.env.NODE_ENV === "production"
      ? undefined
      : "mongodb://127.0.0.1:27017/zero-to-shipped");
  if (!mongoUri) {
    console.warn("MongoDB connection failed because MONGODB_URI is not configured.");
    return false;
  }

  connectionPromise = mongoose
    .connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 30000,
    })
    .then(() => {
      console.log("MongoDB connected successfully.");
      return true;
    })
    .catch((error) => {
      console.warn("MongoDB connection failed. Requests will return 503.");
      console.warn(error.message);
      return false;
    })
    .finally(() => {
      connectionPromise = undefined;
    });

  return connectionPromise;
}

module.exports = { connectDatabase, isDatabaseConnected, requireDatabase };
