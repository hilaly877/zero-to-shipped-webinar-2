import { useRef, useState } from "react";

const presentSkills = ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "Agile", "Figma"];
const missingSkills = ["TypeScript", "Testing", "CI / CD"];

function UploadIcon() {
  return (
    <span className="upload-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14.5v3A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5v-3" />
      </svg>
    </span>
  );
}

function SkillChip({ children, missing = false }) {
  return (
    <span className={`skill-chip${missing ? " missing" : ""}`}>
      <span>{missing ? "+" : "✓"}</span> {children}
    </span>
  );
}

function App() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [analysisState, setAnalysisState] = useState("idle");
  const [analyzedFile, setAnalyzedFile] = useState("SAMPLE_RESUME.PDF");
  const [showTip, setShowTip] = useState(true);

  function handleFile(file) {
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setFileError("Please choose a PDF file");
      return;
    }

    setSelectedFile(file);
    setFileError("");
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragging(false);
    handleFile(event.dataTransfer.files[0]);
  }

  function handleAnalyze() {
    setAnalysisState("reading");

    window.setTimeout(() => {
      setAnalyzedFile(selectedFile ? selectedFile.name.toUpperCase() : "SAMPLE_RESUME.PDF");
      setAnalysisState("complete");
      document.querySelector("#results")?.scrollIntoView({ behavior: "smooth", block: "start" });

      window.setTimeout(() => setAnalysisState("idle"), 1800);
    }, 900);
  }

  const uploadTitle = selectedFile ? "Resume ready to analyze" : "Drop your PDF here";
  const uploadSubtitle = selectedFile ? "Click the button below to continue" : "or browse your files";
  const buttonLabel = analysisState === "reading"
    ? "Reading your resume..."
    : analysisState === "complete"
      ? "Analysis complete"
      : selectedFile
        ? "Analyze again"
        : "Analyze my resume";

  return (
    <>
      <header className="site-header">
        <a className="brand" href="#" aria-label="0 to shipped home">
          <span className="brand-mark" aria-hidden="true">0→</span>
          <span>to shipped</span>
        </a>
        <div className="header-note"><span className="status-dot" /> Resume intelligence, simplified</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">RESUME PARSER / 01</p>
            <h1>Turn your resume into your <em>next move.</em></h1>
            <p className="hero-description">
              Drop in a resume and get a clear read on your signal: what is landing, what is
              missing, and where to focus next.
            </p>
            <div className="hero-meta">
              <span>● Built for momentum</span>
              <span>↗ Instant mock analysis</span>
            </div>
          </div>

          <div className="upload-card">
            <div className="card-topline">
              <span>UPLOAD YOUR RESUME</span>
              <span className="file-type">PDF ONLY</span>
            </div>
            <label
              className={`dropzone${isDragging ? " dragging" : ""}`}
              htmlFor="resume-file"
              onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
              onDragOver={(event) => event.preventDefault()}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                id="resume-file"
                type="file"
                accept=".pdf,application/pdf"
                onChange={(event) => handleFile(event.target.files[0])}
              />
              <UploadIcon />
              <strong>{uploadTitle}</strong>
              <span>{uploadSubtitle === "or browse your files" ? <>or <u>browse your files</u></> : uploadSubtitle}</span>
              <span className="file-name" style={fileError ? { color: "#c55f49" } : undefined}>
                {fileError || selectedFile?.name || "No file selected"}
              </span>
            </label>
            <button className="analyze-button" type="button" onClick={handleAnalyze} disabled={analysisState === "reading"}>
              <span>{buttonLabel}</span>
              <span className="button-arrow" aria-hidden="true">↗</span>
            </button>
            <p className="privacy-note"><span aria-hidden="true">✦</span> Your resume stays yours. This is a front-end demo.</p>
          </div>
        </section>

        <section className="results" id="results" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR READOUT / 02</p>
              <h2>The signal is <span>strong.</span></h2>
            </div>
            <div className="analyzed-file">{analyzedFile} <span>•</span> JUST NOW</div>
          </div>

          <div className="results-grid">
            <article className="score-card">
              <div className="card-label">OVERALL SCORE <span>ⓘ</span></div>
              <div className="score-content">
                <div className="score-ring">
                  <svg viewBox="0 0 120 120" aria-hidden="true">
                    <circle className="ring-track" cx="60" cy="60" r="51" />
                    <circle className="ring-value" cx="60" cy="60" r="51" />
                  </svg>
                  <div className="score-number"><strong>82</strong><span>/ 100</span></div>
                </div>
                <div className="score-copy">
                  <strong>Solid foundation.</strong>
                  <p>Your experience is clear. A few targeted skills could unlock the next tier.</p>
                </div>
              </div>
              <div className="score-footer"><span>▲ 12 pts</span> above the average resume</div>
            </article>

            <article className="skills-card present-card">
              <div className="card-label">SKILLS DETECTED <span className="count-pill">08</span></div>
              <div className="skill-list">
                {presentSkills.map((skill) => <SkillChip key={skill}>{skill}</SkillChip>)}
              </div>
              <p className="card-footnote">Your toolkit reads as <strong>product-minded</strong>.</p>
            </article>

            <article className="skills-card missing-card">
              <div className="card-label">OPPORTUNITIES <span className="count-pill light">03</span></div>
              <div className="skill-list">
                {missingSkills.map((skill) => <SkillChip key={skill} missing>{skill}</SkillChip>)}
              </div>
              <p className="card-footnote">Add these to match <strong>more job descriptions</strong>.</p>
            </article>
          </div>

          {showTip && (
            <div className="tip-banner">
              <span className="tip-icon">✦</span>
              <p><strong>Quick win:</strong> Mention the measurable impact of your React projects to make your strongest skill even louder.</p>
              <button type="button" aria-label="Dismiss quick win" onClick={() => setShowTip(false)}>×</button>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>0 to shipped <span className="muted">/ A mock resume parser</span></span>
        <span>Made for people going from idea → impact</span>
      </footer>
    </>
  );
}

export default App;
