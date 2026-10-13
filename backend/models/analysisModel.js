const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    resumeFileName: { type: String, required: true },
    jobDescription: { type: String, required: true },
    score: { type: Number, required: true },
    presentSkills: { type: [String], default: [] },
    missingSkills: { type: [String], default: [] },
  },
  { timestamps: true },
);

module.exports =
  mongoose.models.ResumeAnalysis || mongoose.model("ResumeAnalysis", analysisSchema);
