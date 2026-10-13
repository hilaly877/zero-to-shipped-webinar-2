const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/userModel");
const { getJwtSecret } = require("../middleware/authMiddleware");

const COOKIE_NAME = "auth_token";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7,
};

function createToken(userId) {
  return jwt.sign({}, getJwtSecret(), { subject: userId, expiresIn: "7d" });
}

function setAuthCookie(res, user) {
  res.cookie(COOKIE_NAME, createToken(user._id.toString()), COOKIE_OPTIONS);
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email };
}

async function register(req, res, next) {
  try {
    const name = (req.body.name || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Enter a valid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "An account with that email already exists." });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, passwordHash });
    setAuthCookie(res, user);
    res.status(201).json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const user = await User.findOne({ email }).select("+passwordHash");

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    setAuthCookie(res, user);
    res.json({ user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

function currentUser(req, res) {
  res.json({ user: publicUser(req.user) });
}

function logout(req, res) {
  res.clearCookie(COOKIE_NAME, { ...COOKIE_OPTIONS, maxAge: undefined });
  res.status(204).end();
}

module.exports = { currentUser, login, logout, register };
