const express = require("express");

const { compare } = require("../controller/analysisController");
const { requireAuth } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/compare", requireAuth, upload.single("resume"), compare);

module.exports = router;
