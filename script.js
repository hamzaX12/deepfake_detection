class DeepfakeDetector {
  constructor() {
    this.uploadedVideo = null
    this.isAnalyzing = false
    this.showProcessDetails = false
    this.progress = 0
    this.predictionResult = null

        this.processSteps = [
      {
        id: "extract-frames",
        title: "Extract Frames",
        description: "Extracting individual frames from the video",
        icon: "fas fa-images",
        progress: 0,
        status: "pending",
        details: "Breaking down video into individual frames for analysis...",
        images: [],
        currentFrame: 0,
      },
      {
        id: "detect-faces",
        title: "Detect Faces",
        description: "Identifying and extracting faces from each frame",
        icon: "fas fa-users",
        progress: 0,
        status: "pending",
        details: "Using facial detection algorithms to locate faces in frames...",
        images: [],
        currentFrame: 0,
      },
      {
        id: "final-prediction",
        title: "Generate Prediction",
        description: "Computing final deepfake probability",
        icon: "fas fa-shield-alt",
        progress: 0,
        status: "pending",
        details: "Combining all analysis results to determine authenticity...",
        images: [],
        currentFrame: 0,
      },
    ];

    this.initializeElements();
    this.bindEvents();
    this.createParticles();
    this.sampleFrames = this.generatePlaceholderImages("Frame", 8)
    this.sampleFaces = this.generatePlaceholderImages("Face", 8)
    this.sampleAnalysis = this.generatePlaceholderImages("Analysis", 6)
  }

  initializeElements() {
    this.elements = {
      uploadArea: document.getElementById("uploadArea"),
      fileInput: document.getElementById("fileInput"),
      videoPreview: document.getElementById("videoPreview"),
      videoElement: document.getElementById("videoElement"),
      videoName: document.getElementById("videoName"),
      videoSize: document.getElementById("videoSize"),
      removeBtn: document.getElementById("removeBtn"),
      analysisCard: document.getElementById("analysisCard"),
      loadingSection: document.getElementById("loadingSection"),
      progressFill: document.getElementById("progressFill"),
      progressText: document.getElementById("progressText"),
      processToggle: document.getElementById("processToggle"),
      toggleBtn: document.getElementById("toggleBtn"),
      toggleIcon: document.getElementById("toggleIcon"),
      toggleText: document.getElementById("toggleText"),
      processDetails: document.getElementById("processDetails"),
      processSteps: document.getElementById("processSteps"),
      analyzeSection: document.getElementById("analyzeSection"),
      analyzeBtn: document.getElementById("analyzeBtn"),
      resultsSection: document.getElementById("resultsSection"),
      resultCard: document.getElementById("resultCard"),
      resultIcon: document.getElementById("resultIcon"),
      resultTitle: document.getElementById("resultTitle"),
      resultConfidence: document.getElementById("resultConfidence"),
      analyzeAgainBtn: document.getElementById("analyzeAgainBtn"),
      uploadNewBtn: document.getElementById("uploadNewBtn"),
      modalOverlay: document.getElementById("modalOverlay"),
      modalIcon: document.getElementById("modalIcon"),
      modalResult: document.getElementById("modalResult"),
      modalDetails: document.getElementById("modalDetails"),
      modalCloseBtn: document.getElementById("modalCloseBtn"),
    }
  }

  bindEvents() {
    // File upload events
    this.elements.uploadArea.addEventListener("click", () => this.elements.fileInput.click())
    this.elements.fileInput.addEventListener("change", (e) => this.handleFileUpload(e))

    // Drag and drop events
    this.elements.uploadArea.addEventListener("dragover", (e) => this.handleDragOver(e))
    this.elements.uploadArea.addEventListener("dragleave", (e) => this.handleDragLeave(e))
    this.elements.uploadArea.addEventListener("drop", (e) => this.handleDrop(e))

    // Button events
    this.elements.removeBtn.addEventListener("click", () => this.resetAnalysis())
    this.elements.analyzeBtn.addEventListener("click", () => this.startAnalysis())
    this.elements.toggleBtn.addEventListener("click", () => this.toggleProcessDetails())
    this.elements.analyzeAgainBtn.addEventListener("click", () => this.startAnalysis())
    this.elements.uploadNewBtn.addEventListener("click", () => this.resetAnalysis())
    this.elements.modalCloseBtn.addEventListener("click", () => this.closeModal())
    this.elements.modalOverlay.addEventListener("click", (e) => {
      if (e.target === this.elements.modalOverlay) this.closeModal()
    })
  }

  generatePlaceholderImages(type, count) {
    const images = []
    for (let i = 1; i <= count; i++) {
      images.push(`https://via.placeholder.com/160x120/8b5cf6/ffffff?text=${type}+${i}`)
    }
    return images
  }

  createParticles() {
    const particlesContainer = document.getElementById("particles")
    for (let i = 0; i < 20; i++) {
      const particle = document.createElement("div")
      particle.className = "particle"
      particle.style.width = `${Math.random() * 6 + 2}px`
      particle.style.height = particle.style.width
      particle.style.left = `${Math.random() * 100}%`
      particle.style.animationDuration = `${Math.random() * 10 + 10}s`
      particle.style.animationDelay = `${Math.random() * 5}s`
      particlesContainer.appendChild(particle)
    }
  }

  handleFileUpload(event) {
    const file = event.target.files[0]
    if (file && file.type.startsWith("video/")) {
      this.uploadedVideo = file
      this.showVideoPreview(file)
    }
  }

  handleDragOver(event) {
    event.preventDefault()
    this.elements.uploadArea.classList.add("drag-over")
  }

  handleDragLeave(event) {
    event.preventDefault()
    this.elements.uploadArea.classList.remove("drag-over")
  }

  handleDrop(event) {
    event.preventDefault()
    this.elements.uploadArea.classList.remove("drag-over")
    const file = event.dataTransfer.files[0]
    if (file && file.type.startsWith("video/")) {
      this.uploadedVideo = file
      this.showVideoPreview(file)
    }
  }

  showVideoPreview(file) {
    const url = URL.createObjectURL(file)
    this.elements.videoElement.src = url
    this.elements.videoName.textContent = file.name
    this.elements.videoSize.textContent = this.formatFileSize(file.size)

    this.elements.uploadArea.style.display = "none"
    this.elements.videoPreview.style.display = "block"
    this.elements.analysisCard.style.display = "block"
  }

  formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }
  showError(message) {
      this.isAnalyzing = false
      this.elements.loadingSection.style.display = "none"
      this.elements.analyzeSection.style.display = "block"

      // You can implement a proper error display here
      alert(message)
  }
  async runFinalPrediction(isReal) {
    const step = this.processSteps.find((s) => s.id === "final-prediction")
    step.status = "processing"
    this.renderProcessSteps()

    for (let i = 0; i <= 100; i += 20) {
        step.progress = i
        step.details = `Computing final prediction... ${i}%`
        this.progress = 75 + i * 0.25
        this.updateProgress()
        this.renderProcessSteps()
        await this.delay(80)
    }

    this.predictionResult = {
        isReal,
        // confidence,
        details: isReal
            ? "Analysis shows natural facial movements, consistent lighting, and no signs of digital manipulation."
            : "Detected inconsistencies in facial mapping, unnatural eye movements, and temporal artifacts suggesting deepfake manipulation.",
    }

    step.status = "completed"
    step.details = `Analysis complete. Confidence score: ${confidence}% - ${isReal ? "Authentic" : "Potential deepfake"}`
    this.progress = 100
    this.updateProgress()
    this.renderProcessSteps()
  }

  async startAnalysis() {
    this.isAnalyzing = true;
    this.progress = 0;
    this.showProcessDetails = true;

    // Reset process steps
    this.processSteps.forEach((step) => {
      step.progress = 0;
      step.status = "pending";
      step.images = [];
      step.currentFrame = 0;
    });

    // UI Setup
    this.elements.analyzeSection.style.display = "none";
    this.elements.resultsSection.style.display = "none";
    this.elements.loadingSection.style.display = "block";
    this.elements.processToggle.style.display = "block";
    this.elements.processDetails.style.display = "block";
    this.elements.toggleBtn.classList.add("active");
    this.elements.toggleIcon.className = "fas fa-chevron-up";
    this.elements.toggleText.textContent = "Hide Process Details";

    this.renderProcessSteps();

    try {
      const formData = new FormData();
      formData.append('file', this.uploadedVideo);

      // Start frame extraction visualization
      const extractStep = this.processSteps.find(s => s.id === "extract-frames");
      extractStep.status = "processing";
      this.renderProcessSteps();

      const response = await fetch('http://127.0.0.1:8000/analyze/', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Analysis failed');
      
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Analysis failed');

      // Process extracted frames
      if (result.frames && result.frames.length > 0) {
        await this.processStepWithImages(
          extractStep, 
          result.frames, 
          30,  // weight in progress calculation
          150, // delay between frames
          "Extracted frame"
        );
      }

      // Process detected faces
      const detectStep = this.processSteps.find(s => s.id === "detect-faces");
      detectStep.status = "processing";
      this.renderProcessSteps();

      if (result.faces && result.faces.length > 0) {
        await this.processStepWithImages(
          detectStep,
          result.faces,
          30,  // weight in progress calculation
          150, // delay between frames
          "Detected face"
        );
      }

      // Final prediction
      await this.runFinalPrediction(
        result.result == "Real"?true :false, 
        result.confidence * 100
      );

      this.showResults();
    } catch (error) {
      console.error('Analysis error:', error);
      this.showError(error.message || "Analysis failed. Please try again.");
    }
  }

   async processStepWithImages(step, images, progressWeight, delay, labelPrefix) {
    step.images = [];
    this.renderProcessSteps();

    for (let i = 0; i < images.length; i++) {
      const imageUrl = `data:image/jpeg;base64,${images[i]}`;
      step.images.push(imageUrl);
      step.currentFrame = i;
      step.progress = Math.floor((i + 1) / images.length * 100);
      step.details = `${labelPrefix} ${i + 1}/${images.length} processed...`;

      this.progress = this.calculateTotalProgress();
      this.updateProgress();
      this.renderProcessSteps();

      await this.delay(delay);
    }

    step.status = "completed";
    step.details = `Completed processing ${images.length} ${labelPrefix.toLowerCase()}s`;
    this.renderProcessSteps();
  }

  async runProcessStep(stepId, images, progressWeight, delay) {
    const step = this.processSteps.find((s) => s.id === stepId)
    step.status = "processing"
    step.images = []
    this.renderProcessSteps()

    for (let i = 0; i <= 100; i += 12) {
      const imageIndex = Math.floor((i / 100) * images.length)
      step.images = images.slice(0, imageIndex + 1)
      step.currentFrame = imageIndex
      step.progress = i
      step.details = `Processing ${step.title.toLowerCase()} ${imageIndex + 1}/${images.length}...`

      this.progress = this.calculateTotalProgress()
      this.updateProgress()
      this.renderProcessSteps()

      await this.delay(delay)
    }

    step.status = "completed"
    step.details = `Successfully completed ${step.title.toLowerCase()}. Processed ${images.length} items.`
    this.renderProcessSteps()
  }

  async runFinalPrediction() {
    const step = this.processSteps.find((s) => s.id === "final-prediction")
    step.status = "processing"
    this.renderProcessSteps()

    for (let i = 0; i <= 100; i += 20) {
      step.progress = i
      step.details = `Computing final prediction... ${i}%`
      this.progress = 75 + i * 0.25
      this.updateProgress()
      this.renderProcessSteps()
      await this.delay(80)
    }

    // Generate random result
    const isReal = Math.random() > 0.4
    const confidence = Math.floor(Math.random() * 25) + 75

    this.predictionResult = {
      isReal,
      confidence,
      details: isReal
        ? "Analysis shows natural facial movements, consistent lighting, and no signs of digital manipulation."
        : "Detected inconsistencies in facial mapping, unnatural eye movements, and temporal artifacts suggesting deepfake manipulation.",
    }

    step.status = "completed"
    step.details = `Analysis complete. Confidence score: ${confidence}% - ${isReal ? "Authentic" : "Potential deepfake"}`
    this.progress = 100
    this.updateProgress()
    this.renderProcessSteps()
  }

  calculateTotalProgress() {
    const weights = [25, 25, 25, 25] // Equal weight for each step
    let totalProgress = 0

    this.processSteps.forEach((step, index) => {
      if (step.status === "completed") {
        totalProgress += weights[index]
      } else if (step.status === "processing") {
        totalProgress += (step.progress / 100) * weights[index]
      }
    })

    return totalProgress
  }

  updateProgress() {
    this.elements.progressFill.style.width = `${this.progress}%`
    this.elements.progressText.textContent = `${Math.round(this.progress)}% Complete`
  }

  renderProcessSteps() {
    this.elements.processSteps.innerHTML = ""

    this.processSteps.forEach((step) => {
      const stepElement = document.createElement("div")
      stepElement.className = `process-step ${step.status}`

      stepElement.innerHTML = `
                <div class="step-header">
                    <div class="step-icon">
                        ${
                          step.status === "completed"
                            ? '<i class="fas fa-check-circle" style="color: #10b981;"></i>'
                            : step.status === "processing"
                              ? '<div class="spinner"></div>'
                              : `<i class="${step.icon}" style="color: #ec4899;"></i>`
                        }
                    </div>
                    <div class="step-content">
                        <div class="step-title">${step.title}</div>
                        <div class="step-description">${step.description}</div>
                    </div>
                    <div class="step-progress">${step.progress}%</div>
                </div>
                ${
                  step.status !== "pending"
                    ? `
                    <div class="step-details">
                        <div class="step-progress-bar">
                            <div class="step-progress-fill" style="width: ${step.progress}%"></div>
                        </div>
                        <div class="step-details-text">${step.details}</div>
                        ${step.images.length > 0 ? this.renderImageGallery(step) : ""}
                    </div>
                `
                    : ""
                }
            `

      this.elements.processSteps.appendChild(stepElement)
    })
  }

  renderImageGallery(step) {
    const galleryTitle =
      step.id === "extract-frames"
        ? "Extracted Frames:"
        : step.id === "detect-faces"
          ? "Detected Faces:"
          : "Feature Analysis:"

    const imagesHtml = step.images
      .map(
        (image, index) => `
            <div class="image-item ${index === step.currentFrame ? "active" : ""}">
                <img src="${image}" alt="${step.title} ${index + 1}">
                ${
                  index === step.currentFrame && step.status === "processing"
                    ? '<div class="image-overlay"><div class="spinner"></div></div>'
                    : ""
                }
                <div class="image-number">${index + 1}</div>
            </div>
        `,
      )
      .join("")

    return `
            <div class="image-gallery">
                <div class="gallery-title">${galleryTitle}</div>
                <div class="image-grid">${imagesHtml}</div>
            </div>
        `
  }

  showResults() {
    this.isAnalyzing = false
    this.elements.loadingSection.style.display = "none"
    this.elements.resultsSection.style.display = "block"

    const isAuthentic = this.predictionResult.isReal
    this.elements.resultCard.className = `result-card ${isAuthentic ? "authentic" : "deepfake"}`
    this.elements.resultIcon.className = `result-icon ${isAuthentic ? "authentic" : "deepfake"}`
    this.elements.resultIcon.innerHTML = isAuthentic
      ? '<i class="fas fa-check-circle"></i>'
      : '<i class="fas fa-exclamation-triangle"></i>'

    this.elements.resultTitle.textContent = isAuthentic ? "✅ AUTHENTIC VIDEO" : "⚠️ POTENTIAL DEEPFAKE"

    this.elements.resultConfidence.textContent = `Confidence: ${this.predictionResult.confidence}%`

    // Show modal
    this.showModal()
  }

  showModal() {
    const isAuthentic = this.predictionResult.isReal

    this.elements.modalIcon.className = `modal-icon ${isAuthentic ? "authentic" : "deepfake"}`
    this.elements.modalIcon.innerHTML = isAuthentic
      ? '<i class="fas fa-check-circle"></i>'
      : '<i class="fas fa-exclamation-triangle"></i>'

    this.elements.modalResult.className = `modal-result ${isAuthentic ? "authentic" : "deepfake"}`
    this.elements.modalResult.innerHTML = `
            <div class="modal-result-title">
                ${isAuthentic ? "🎉 AUTHENTIC VIDEO" : "🚨 DEEPFAKE DETECTED"}
            </div>
            <div class="modal-result-confidence">
                Confidence Level: ${this.predictionResult.confidence}%
            </div>
        `

    this.elements.modalDetails.innerHTML = `<p>${this.predictionResult.details}</p>`
    this.elements.modalOverlay.style.display = "flex"
  }

  closeModal() {
    this.elements.modalOverlay.style.display = "none"
  }

  toggleProcessDetails() {
    this.showProcessDetails = !this.showProcessDetails

    if (this.showProcessDetails) {
      this.elements.processDetails.style.display = "block"
      this.elements.toggleBtn.classList.add("active")
      this.elements.toggleIcon.className = "fas fa-chevron-up"
      this.elements.toggleText.textContent = "Hide Process Details"
    } else {
      this.elements.processDetails.style.display = "none"
      this.elements.toggleBtn.classList.remove("active")
      this.elements.toggleIcon.className = "fas fa-chevron-down"
      this.elements.toggleText.textContent = "Show Process Details"
    }
  }

  resetAnalysis() {
    this.uploadedVideo = null
    this.isAnalyzing = false
    this.showProcessDetails = false
    this.progress = 0
    this.predictionResult = null

    // Reset process steps
    this.processSteps.forEach((step) => {
      step.progress = 0
      step.status = "pending"
      step.images = []
      step.currentFrame = 0
    })

    // Reset UI
    this.elements.uploadArea.style.display = "block"
    this.elements.videoPreview.style.display = "none"
    this.elements.analysisCard.style.display = "none"
    this.elements.loadingSection.style.display = "none"
    this.elements.processToggle.style.display = "none"
    this.elements.processDetails.style.display = "none"
    this.elements.analyzeSection.style.display = "block"
    this.elements.resultsSection.style.display = "none"
    this.elements.fileInput.value = ""

    this.closeModal()
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new DeepfakeDetector()
})
