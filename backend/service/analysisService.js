const mongoose = require("mongoose");
const pdfParse = require("pdf-parse");

const ResumeAnalysis = require("../models/analysisModel");
const { analyzeWithOpenAI } = require("./openaiService");

async function compareResume({ file, jobDescription, resumeText }) {
  let extractedText;

  if (file) {
    try {
      extractedText = (await pdfParse(file.buffer)).text.trim();
    } catch (error) {
      const parseError = new Error("The uploaded file could not be read as a PDF.");
      parseError.statusCode = 422;
      parseError.cause = error;
      throw parseError;
    }
  } else {
    extractedText = (resumeText || "").trim();
  }

  if (!extractedText) {
    const error = new Error("The uploaded PDF does not contain readable text.");
    error.statusCode = 422;
    throw error;
  }

  const result = await analyzeWithOpenAI({ resumeText: extractedText, jobDescription });
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
