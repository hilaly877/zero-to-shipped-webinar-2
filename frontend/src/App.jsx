import { useEffect, useRef, useState } from "react";

const defaultSkills = {
  presentSkills: ["JavaScript", "React", "Node.js", "SQL", "Git", "REST APIs", "Agile", "Figma"],
  missingSkills: ["TypeScript", "Testing", "CI / CD"],
};

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
      <span>{missing ? "+" : "✓"}</span>
      {children}
    </span>
  );
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Unable to sign in.");
      }

      onAuthenticated(payload.user);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-intro">
          <p className="eyebrow">YOUR WORKSPACE / 00</p>
          <h1 id="auth-title">
            Make your next move <em>count.</em>
          </h1>
          <p>Sign in to save your resume readouts and keep your job search moving forward.</p>
        </div>

        <div className="auth-panel">
          <div className="auth-tabs" role="tablist" aria-label="Account access">
            <button
              className={mode === "login" ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Log in
            </button>
            <button
              className={mode === "register" ? "active" : ""}
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              onClick={() => { setMode("register"); setError(""); }}
            >
              Create account
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {mode === "register" && (
              <label>
                <span>Your name</span>
                <input name="name" value={form.name} onChange={updateField} autoComplete="name" required />
              </label>
            )}
            <label>
              <span>Email address</span>
              <input name="email" type="email" value={form.email} onChange={updateField} autoComplete="email" required />
            </label>
            <label>
              <span>Password</span>
              <input name="password" type="password" value={form.password} onChange={updateField} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required />
            </label>
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Connecting..." : mode === "login" ? "Log in to your workspace" : "Create your workspace"}
              <span aria-hidden="true">↗</span>
            </button>
          </form>
          <p className="auth-note">Your account keeps your analysis history private.</p>
        </div>
      </section>
    </main>
  );
}

function App() {
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jobDescription, setJobDescription] = useState(
    "We are looking for a frontend engineer with React, JavaScript, TypeScript, Node.js, testing experience, and strong product thinking. Experience with CI/CD is a plus.",
  );
  const [results, setResults] = useState({
    score: 82,
    summary: "Solid foundation.",
    presentSkills: defaultSkills.presentSkills,
    missingSkills: defaultSkills.missingSkills,
    fileName: "SAMPLE_RESUME.PDF",
  });
  const [showTip, setShowTip] = useState(true);
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setUser(payload?.user || null))
      .catch(() => setUser(null))
      .finally(() => setIsCheckingSession(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  if (isCheckingSession) {
    return <div className="auth-loading">Opening your workspace...</div>;
  }

  if (!user) {
    return (
      <>
        <header className="site-header">
          <a className="brand" href="#" aria-label="0 to shipped home">
            <span className="brand-mark" aria-hidden="true">0→</span>
            <span>to shipped</span>
          </a>
          <div className="header-note"><span className="status-dot" /> Private resume intelligence</div>
        </header>
        <AuthScreen onAuthenticated={setUser} />
      </>
    );
  }

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

  async function handleAnalyze() {
    if (!selectedFile || !jobDescription.trim()) {
      setFileError("Upload a PDF and add a job description to compare.");
      return;
    }

    setIsAnalyzing(true);
    setFileError("");

    try {
      const formData = new FormData();

      if (selectedFile) {
        formData.append("resume", selectedFile);
      }

      formData.append("jobDescription", jobDescription);
      const response = await fetch("/api/compare", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Analysis request failed");
      }

      setResults({
        score: payload.score,
        summary: payload.summary,
        presentSkills: payload.presentSkills,
        missingSkills: payload.missingSkills,
        fileName: selectedFile ? selectedFile.name.toUpperCase() : "UPLOADED_RESUME.PDF",
      });
    } catch (error) {
      setFileError(error instanceof Error ? error.message : "Unable to analyze the resume right now.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const uploadTitle = selectedFile ? "Resume ready to analyze" : "Drop your PDF here";
  const uploadSubtitle = selectedFile ? "Click the button below to continue" : "or browse your files";
  const buttonLabel = isAnalyzing
    ? "Reading your resume..."
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
        <div className="header-actions">
          <div className="header-note"><span className="status-dot" /> {user.name}</div>
          <button className="logout-button" type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">RESUME PARSER / 01</p>
            <h1>
              Turn your resume into your <em>next move.</em>
            </h1>
            <p className="hero-description">
              Drop in a resume and a job description to compare fit, spot the right skills,
              and surface the gaps worth filling next.
            </p>
            <div className="hero-meta">
              <span>● Built for momentum</span>
              <span>↗ AI-powered analysis</span>
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
              onDragEnter={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
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
              <span>
                {uploadSubtitle === "or browse your files" ? (
                  <>
                    or <u>browse your files</u>
                  </>
                ) : (
                  uploadSubtitle
                )}
              </span>
              <span className="file-name" style={fileError ? { color: "#c55f49" } : undefined}>
                {fileError || selectedFile?.name || "No file selected"}
              </span>
            </label>

            <label className="job-description">
              <span>JOB DESCRIPTION</span>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={6}
                placeholder="Paste or type a job description here..."
              />
            </label>

            <button
              className="analyze-button"
              type="button"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <span>{buttonLabel}</span>
              <span className="button-arrow" aria-hidden="true">
                ↗
              </span>
            </button>

            <p className="privacy-note">
              <span aria-hidden="true">✦</span> Your PDF is read on the server and never sent to the browser.
            </p>
          </div>
        </section>

        <section className="results" id="results" aria-live="polite">
          <div className="section-heading">
            <div>
              <p className="eyebrow">YOUR READOUT / 02</p>
              <h2>
                The signal is <span>{results.score >= 80 ? "strong." : "promising."}</span>
              </h2>
            </div>
            <div className="analyzed-file">
              {results.fileName} <span>•</span> JUST NOW
            </div>
          </div>

          <div className="results-grid">
            <article className="score-card">
              <div className="card-label">
                OVERALL SCORE <span>ⓘ</span>
              </div>
              <div className="score-content">
                <div className="score-ring">
                  <svg viewBox="0 0 120 120" aria-hidden="true">
                    <circle className="ring-track" cx="60" cy="60" r="51" />
                    <circle className="ring-value" cx="60" cy="60" r="51" />
                  </svg>
                  <div className="score-number">
                    <strong>{results.score}</strong>
                    <span>/ 100</span>
                  </div>
                </div>
                <div className="score-copy">
                  <strong>{results.summary}</strong>
                  <p>
                    Your experience is clear. A few targeted skills could unlock the next tier.
                  </p>
                </div>
              </div>
              <div className="score-footer">
                <span>▲ 12 pts</span> above the average resume
              </div>
            </article>

            <article className="skills-card present-card">
              <div className="card-label">
                SKILLS DETECTED <span className="count-pill">{results.presentSkills.length}</span>
              </div>
              <div className="skill-list">
                {results.presentSkills.map((skill) => (
                  <SkillChip key={skill}>{skill}</SkillChip>
                ))}
              </div>
              <p className="card-footnote">
                Your toolkit reads as <strong>product-minded</strong>.
              </p>
            </article>

            <article className="skills-card missing-card">
              <div className="card-label">
                OPPORTUNITIES <span className="count-pill light">{results.missingSkills.length}</span>
              </div>
              <div className="skill-list">
                {results.missingSkills.map((skill) => (
                  <SkillChip key={skill} missing>
                    {skill}
                  </SkillChip>
                ))}
              </div>
              <p className="card-footnote">
                Add these to match <strong>more job descriptions</strong>.
              </p>
            </article>
          </div>

          {showTip && (
            <div className="tip-banner">
              <span className="tip-icon">✦</span>
              <p>
                <strong>Quick win:</strong> Mention the measurable impact of your React projects to make your strongest skill even louder.
              </p>
              <button type="button" aria-label="Dismiss quick win" onClick={() => setShowTip(false)}>
                ×
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <span>
          0 to shipped <span className="muted">/ Resume intelligence</span>
        </span>
        <span>Made for people going from idea → impact</span>
      </footer>
    </>
  );
}

export default App;
