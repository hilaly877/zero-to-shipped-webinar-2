const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

function getJwtSecret() {
  if (!process.env.JWT_SECRET) {
    const error = new Error("JWT_SECRET is not configured.");
    error.statusCode = 500;
    throw error;
  }

  return process.env.JWT_SECRET;
}

async function requireAuth(req, res, next) {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ message: "Please log in to continue." });
    }

    const payload = jwt.verify(token, getJwtSecret());
    const user = await User.findById(payload.sub).select("_id name email");

    if (!user) {
      return res.status(401).json({ message: "Your session is no longer valid." });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Your session has expired. Please log in again." });
    }

    next(error);
  }
}

module.exports = { getJwtSecret, requireAuth };
