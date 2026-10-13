const express = require("express");

const { currentUser, login, logout, register } = require("../controller/authController");
const { requireDatabase } = require("../config/database");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", requireDatabase, register);
router.post("/login", requireDatabase, login);
router.post("/logout", logout);
router.get("/me", requireDatabase, requireAuth, currentUser);

module.exports = router;
