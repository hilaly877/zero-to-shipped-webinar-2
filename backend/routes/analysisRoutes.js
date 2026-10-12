const express = require("express");

const { compare } = require("../controller/analysisController");
const upload = require("../middleware/uploadMiddleware");

const router = express.Router();

router.post("/compare", upload.single("resume"), compare);

module.exports = router;
