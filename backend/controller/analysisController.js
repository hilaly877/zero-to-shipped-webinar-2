const { compareResume } = require("../service/analysisService");

async function compare(req, res, next) {
  try {
    const jobDescription = (req.body.jobDescription || "").trim();

    if (!jobDescription) {
      return res.status(400).json({ message: "A job description is required." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "A PDF resume is required." });
    }

    const result = await compareResume({
      file: req.file,
      jobDescription,
      resumeText: req.body.resumeText,
    });

    res.json(result);
  } catch (error) {
    next(error);
  }
}

module.exports = { compare };
