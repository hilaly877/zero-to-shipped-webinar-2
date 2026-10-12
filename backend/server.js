const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/zero-to-shipped";

const jobSkillCatalog = [
  "JavaScript",
  "React",
  "Node.js",
  "MongoDB",
  "Express",
  "TypeScript",
  "SQL",
  "REST APIs",
  "Testing",
  "CI / CD",
  "Git",
  "Agile",
];

const analysisSchema = new mongoose.Schema(
  {
    resumeFileName: String,
    jobDescription: String,
    score: Number,
    presentSkills: [String],
    missingSkills: [String],
  },
  { timestamps: true },
);

const ResumeAnalysis = mongoose.models.ResumeAnalysis || mongoose.model("ResumeAnalysis", analysisSchema);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "5mb" }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

function normalizeSkill(skill) {
  return skill.toLowerCase().replace(/\s+/g, " ").trim();
}

function scoreResume(resumeText, jobDescription) {
  const safeResumeText = (resumeText || "").toLowerCase();
  const safeJobDescription = (jobDescription || "").toLowerCase();

  const presentSkills = jobSkillCatalog.filter((skill) => {
    const normalizedSkill = normalizeSkill(skill);
    return safeResumeText.includes(normalizedSkill) || safeJobDescription.includes(normalizedSkill);
  });

  const missingSkills = jobSkillCatalog.filter((skill) => !presentSkills.includes(skill));
  const score = Math.min(98, Math.max(55, 68 + presentSkills.length * 4 - missingSkills.length * 3));

  const summary = presentSkills.length >= 7 ? "Strong foundation." : "Promising fit.";

  return {
    score: Math.round(score),
    summary,
    presentSkills,
    missingSkills,
  };
}

async function connectMongo() {
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

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "Resume parser backend is running.",
    mongodbConnected: mongoose.connection.readyState === 1,
  });
});

app.post("/api/compare", upload.single("resume"), async (req, res) => {
  try {
    const jobDescription = req.body.jobDescription || "";
    const resumeText =
      req.body.resumeText ||
      `Experienced product-minded engineer with JavaScript, React, Node.js, SQL and REST APIs. Built frontend workflows, integrated APIs, and collaborated across design and engineering teams.`;

    const result = scoreResume(resumeText, jobDescription);

    const payload = {
      ...result,
      fileName: req.file ? req.file.originalname : "resume.pdf",
    };

    if (mongoose.connection.readyState === 1) {
      try {
        await ResumeAnalysis.create({
          resumeFileName: payload.fileName,
          jobDescription,
          score: payload.score,
          presentSkills: payload.presentSkills,
          missingSkills: payload.missingSkills,
        });
      } catch (dbError) {
        console.warn("Unable to save analysis to MongoDB.");
        console.warn(dbError.message);
      }
    }

    res.json(payload);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Unable to compare the resume and job description right now.",
    });
  }
});

connectMongo();

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
