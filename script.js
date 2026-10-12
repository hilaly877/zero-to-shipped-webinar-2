const fileInput = document.querySelector("#resume-file");
const dropzone = document.querySelector("#dropzone");
const fileName = document.querySelector("#file-name");
const uploadTitle = document.querySelector("#upload-title");
const uploadSubtitle = document.querySelector("#upload-subtitle");
const analyzeButton = document.querySelector("#analyze-button");
const analyzedFile = document.querySelector("#analyzed-file");
const dismissTip = document.querySelector("#dismiss-tip");

function setSelectedFile(file) {
  if (!file) return;

  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    fileName.textContent = "Please choose a PDF file";
    fileName.style.color = "#c55f49";
    return;
  }

  fileName.textContent = file.name;
  fileName.style.color = "";
  uploadTitle.textContent = "Resume ready to analyze";
  uploadSubtitle.textContent = "Click the button below to continue";
  dropzone.classList.remove("dragging");
}

fileInput.addEventListener("change", (event) => setSelectedFile(event.target.files[0]));

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("dragging");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("dragging");
  });
});

dropzone.addEventListener("drop", (event) => setSelectedFile(event.dataTransfer.files[0]));

analyzeButton.addEventListener("click", () => {
  const selectedFile = fileInput.files[0];
  const displayName = selectedFile ? selectedFile.name.toUpperCase() : "SAMPLE_RESUME.PDF";

  analyzeButton.disabled = true;
  analyzeButton.querySelector("span:first-child").textContent = "Reading your resume...";

  window.setTimeout(() => {
    analyzedFile.innerHTML = `${displayName} <span>•</span> JUST NOW`;
    analyzeButton.disabled = false;
    analyzeButton.querySelector("span:first-child").textContent = "Analysis complete";
    document.querySelector("#results").scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      analyzeButton.querySelector("span:first-child").textContent = "Analyze again";
    }, 1800);
  }, 900);
});

dismissTip.addEventListener("click", () => {
  dismissTip.closest(".tip-banner").remove();
});
