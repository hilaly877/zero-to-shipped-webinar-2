const mongoose = require("mongoose");

const ResumeAnalysis = require("../models/analysisModel");
const { jobSkillCatalog, normalizeSkill } = require("../utils");

const fallbackResumeText =
  "Experienced product-minded engineer with JavaScript, React, Node.js, SQL and REST APIs. Built frontend workflows, integrated APIs, and collaborated across design and engineering teams.";

function scoreResume(resumeText, jobDescription) {
  const safeResumeText = (resumeText || "").toLowerCase();
  const safeJobDescription = (jobDescription || "").toLowerCase();

  const presentSkills = jobSkillCatalog.filter((skill) => {
    const normalizedSkill = normalizeSkill(skill);
    return safeResumeText.includes(normalizedSkill) || safeJobDescription.includes(normalizedSkill);
  });
  const missingSkills = jobSkillCatalog.filter((skill) => !presentSkills.includes(skill));
  const score = Math.min(98, Math.max(55, 68 + presentSkills.length * 4 - missingSkills.length * 3));

  return {
    score: Math.round(score),
    summary: presentSkills.length >= 7 ? "Strong foundation." : "Promising fit.",
    presentSkills,
    missingSkills,
  };
}

async function compareResume({ file, jobDescription, resumeText }) {
  const result = scoreResume(resumeText || fallbackResumeText, jobDescription);
  const payload = {
    ...result,
    fileName: file ? file.originalname : "resume.pdf",
  };

  if (mongoose.connection.readyState === 1) {
    await ResumeAnalysis.create({
      resumeFileName: payload.fileName,
      jobDescription,
      score: payload.score,
      presentSkills: payload.presentSkills,
      missingSkills: payload.missingSkills,
    });
  }

  return payload;
}

module.exports = { compareResume };
