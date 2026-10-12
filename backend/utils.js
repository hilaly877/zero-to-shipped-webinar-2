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

function normalizeSkill(skill) {
  return skill.toLowerCase().replace(/\s+/g, " ").trim();
}

module.exports = { jobSkillCatalog, normalizeSkill };
