const express = require("express");

const { currentUser, login, logout, register } = require("../controller/authController");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, currentUser);

module.exports = router;
