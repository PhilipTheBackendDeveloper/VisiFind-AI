document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const video = document.getElementById("video")
  const videoPlaceholder = document.getElementById("videoPlaceholder")
  const canvas = document.getElementById("output")
  const toggleBtn = document.getElementById("toggleBtn")
  const screenshotBtn = document.getElementById("screenshotBtn")
  const clearResultsBtn = document.getElementById("clearResultsBtn")
  const clearScreenshotsBtn = document.getElementById("clearScreenshotsBtn")
  const resultsList = document.getElementById("resultsList")
  const resultsPlaceholder = document.getElementById("resultsPlaceholder")
  const screenshotsGrid = document.getElementById("screenshotsGrid")
  const screenshotsPlaceholder = document.getElementById("screenshotsPlaceholder")
  const confidenceThreshold = document.getElementById("confidenceThreshold")
  const confidenceValue = document.getElementById("confidenceValue")
  const maxDetections = document.getElementById("maxDetections")
  const modelStatus = document.getElementById("modelStatus")
  const totalDetections = document.getElementById("totalDetections")
  const avgConfidence = document.getElementById("avgConfidence")
  const uniqueObjects = document.getElementById("uniqueObjects")
  const processingTime = document.getElementById("processingTime")
  const menuToggle = document.getElementById("menuToggle")
  const sidebar = document.querySelector(".sidebar")
  const helpBtn = document.getElementById("helpBtn")
  const helpModal = document.getElementById("helpModal")
  const closeModal = document.getElementById("closeModal")

  // State variables
  let isDetecting = false
  let model = null
  let detectionInterval = null
  let detectionCount = 0
  let confidenceSum = 0
  const uniqueObjectsSet = new Set()
  let lastProcessingTime = 0
  let screenshots = []

  // Toggle sidebar on mobile
  if (menuToggle) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })
  }

  // Help modal
  if (helpBtn && helpModal && closeModal) {
    helpBtn.addEventListener("click", () => {
      helpModal.classList.add("active")
    })

    closeModal.addEventListener("click", () => {
      helpModal.classList.remove("active")
    })

    // Close modal when clicking outside
    helpModal.addEventListener("click", (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove("active")
      }
    })
  }

  // Update confidence threshold value display
  confidenceThreshold.addEventListener("input", () => {
    confidenceValue.textContent = `${confidenceThreshold.value}%`
  })

  // Load COCO-SSD model
  async function loadModel() {
    try {
      modelStatus.textContent = "Loading model..."
      // Load the cocoSsd model from the global scope (loaded via script tag)
      model = await cocoSsd.load()
      modelStatus.textContent = "Model loaded successfully"
      toggleBtn.disabled = false
      toggleBtn.innerHTML = `
       <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
       Start Detection
     `
    } catch (error) {
      console.error("Error loading model:", error)
      modelStatus.textContent = "Error loading model: " + error.message
    }
  }

  // Initialize webcam
  async function setupCamera() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Your browser doesn't support webcam access")
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })

      video.srcObject = stream

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          resolve(true)
        }
      })
    } catch (error) {
      console.error("Error accessing webcam:", error)
      alert("Error accessing webcam: " + error.message)
      return false
    }
  }

  // Start detection
  async function startDetection() {
    if (!model) {
      alert("Model not loaded yet. Please wait.")
      return
    }

    // Setup camera
    const cameraReady = await setupCamera()
    if (!cameraReady) return

    // Show video and canvas
    videoPlaceholder.style.display = "none"
    video.style.display = "block"
    canvas.style.display = "block"

    // Set canvas dimensions
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    // Update button text
    toggleBtn.innerHTML = `
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><rect x="9" y="9" width="6" height="6"></rect></svg>
     Stop Detection
   `

    // Start detection loop
    isDetecting = true
    detectObjects()
  }

  // Stop detection
  function stopDetection() {
    isDetecting = false

    if (detectionInterval) {
      clearInterval(detectionInterval)
      detectionInterval = null
    }

    // Stop webcam
    if (video.srcObject) {
      const tracks = video.srcObject.getTracks()
      tracks.forEach((track) => track.stop())
      video.srcObject = null
    }

    // Hide video and canvas
    video.style.display = "none"
    canvas.style.display = "none"
    videoPlaceholder.style.display = "flex"

    // Update button text
    toggleBtn.innerHTML = `
     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
     Start Detection
   `
  }

  // Detect objects in video
  async function detectObjects() {
    if (!isDetecting) return

    const startTime = performance.now()

    try {
      // Get predictions
      const predictions = await model.detect(video, maxDetections.value)

      // Filter predictions by confidence threshold
      const threshold = confidenceThreshold.value / 100
      const filteredPredictions = predictions.filter((pred) => pred.score >= threshold)

      // Draw predictions on canvas
      drawPredictions(filteredPredictions)

      // Update results list
      updateResultsList(filteredPredictions)

      // Update stats
      updateStats(filteredPredictions, performance.now() - startTime)

      // Continue detection loop
      if (isDetecting) {
        requestAnimationFrame(detectObjects)
      }
    } catch (error) {
      console.error("Error during detection:", error)
      if (isDetecting) {
        requestAnimationFrame(detectObjects)
      }
    }
  }

  // Draw predictions on canvas
  function drawPredictions(predictions) {
    const ctx = canvas.getContext("2d")
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    // Draw each prediction
    predictions.forEach((prediction) => {
      // Get prediction data
      const [x, y, width, height] = prediction.bbox
      const label = prediction.class
      const score = Math.round(prediction.score * 100)

      // Draw bounding box
      ctx.strokeStyle = "#04afff"
      ctx.lineWidth = 4
      ctx.strokeRect(x, y, width, height)

      // Draw background for label
      ctx.fillStyle = "rgba(4, 175, 255, 0.7)"
      const textWidth = ctx.measureText(`${label} ${score}%`).width + 10
      ctx.fillRect(x, y - 30, textWidth, 30)

      // Draw label text
      ctx.fillStyle = "#ffffff"
      ctx.font = "16px Poppins"
      ctx.fillText(`${label} ${score}%`, x + 5, y - 10)
    })
  }

  // Update results list
  function updateResultsList(predictions) {
    // Clear previous results if no predictions
    if (predictions.length === 0) {
      if (resultsList.innerHTML === "") {
        resultsPlaceholder.style.display = "flex"
      }
      return
    }

    // Hide placeholder
    resultsPlaceholder.style.display = "none"

    // Clear previous results
    resultsList.innerHTML = ""

    // Add new results
    predictions.forEach((prediction) => {
      const resultItem = document.createElement("div")
      resultItem.className = "result-item"

      // Get icon based on object class
      const icon = getObjectIcon(prediction.class)

      // Format result item
      resultItem.innerHTML = `
       <div class="result-icon">
         ${icon}
       </div>
       <div class="result-details">
         <h4>${prediction.class}</h4>
         <p>Detected with high confidence</p>
       </div>
       <div class="result-confidence">
         ${Math.round(prediction.score * 100)}%
       </div>
     `

      resultsList.appendChild(resultItem)
    })
  }

  // Update stats
  function updateStats(predictions, processingTimeMs) {
    // Update total detections
    detectionCount += predictions.length
    totalDetections.textContent = detectionCount

    // Update confidence average
    if (predictions.length > 0) {
      const confidenceTotal = predictions.reduce((sum, pred) => sum + pred.score, 0)
      confidenceSum += confidenceTotal
      const avgConfidenceValue = Math.round((confidenceSum / detectionCount) * 100)
      avgConfidence.textContent = `${avgConfidenceValue}%`
    }

    // Update unique objects
    predictions.forEach((pred) => uniqueObjectsSet.add(pred.class))
    uniqueObjects.textContent = uniqueObjectsSet.size

    // Update processing time
    lastProcessingTime = processingTimeMs.toFixed(0)
    processingTime.textContent = `${lastProcessingTime}ms`
  }

  // Get icon for object class
  function getObjectIcon(objectClass) {
    // Map common object classes to icons
    const iconMap = {
      person:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
      car: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L16 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg>',
      dog: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"></path><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path><path d="M8 14v.5"></path><path d="M16 14v.5"></path><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"></path></svg>',
      cat: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"></path><path d="M8 14v.5"></path><path d="M16 14v.5"></path><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path></svg>',
      bottle:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2v3.5c0 1.33-.8 2.5-2 3l-3 1.5c-1.2.5-2 1.67-2 3V20a2 2 0 0 0 2 2h5a2 2 0 0 0 2-2v-7c0-1.33-.8-2.5-2-3l-3-1.5c-1.2-.5-2-1.67-2-3V2"></path><path d="M9 2h6"></path></svg>',
      chair:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v2"></path><path d="M6 10v12"></path><path d="M18 10v12"></path><path d="M5 10h14"></path><path d="M5 14h14"></path></svg>',
      laptop:
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"></path></svg>',
      "cell phone":
        '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2"></rect><path d="M12 18h.01"></path></svg>',
    }

    return (
      iconMap[objectClass] ||
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="14.31" y1="8" x2="20.05" y2="17.94"></line><line x1="9.69" y1="8" x2="21.17" y2="8"></line><line x1="7.38" y1="12" x2="13.12" y2="2.06"></line><line x1="9.69" y1="16" x2="3.95" y2="6.06"></line><line x1="14.31" y1="16" x2="2.83" y2="16"></line><line x1="16.62" y1="12" x2="10.88" y2="21.94"></line></svg>'
    )
  }

  // Take screenshot
  function takeScreenshot() {
    if (!isDetecting) {
      alert("Please start detection first")
      return
    }

    // Create a new canvas for the screenshot
    const screenshotCanvas = document.createElement("canvas")
    screenshotCanvas.width = canvas.width
    screenshotCanvas.height = canvas.height

    // Draw current canvas content to screenshot canvas
    const ctx = screenshotCanvas.getContext("2d")
    ctx.drawImage(canvas, 0, 0)

    // Convert to data URL
    const dataUrl = screenshotCanvas.toDataURL("image/png")

    // Add to screenshots array
    const timestamp = new Date().toLocaleString()
    screenshots.push({
      id: Date.now(),
      dataUrl,
      timestamp,
    })

    // Update screenshots grid
    updateScreenshotsGrid()
  }

  // Update screenshots grid
  function updateScreenshotsGrid() {
    // Hide placeholder if we have screenshots
    if (screenshots.length > 0) {
      screenshotsPlaceholder.style.display = "none"
    } else {
      screenshotsPlaceholder.style.display = "flex"
      screenshotsGrid.innerHTML = ""
      return
    }

    // Clear grid
    screenshotsGrid.innerHTML = ""

    // Add screenshots
    screenshots.forEach((screenshot) => {
      const screenshotItem = document.createElement("div")
      screenshotItem.className = "screenshot-item"
      screenshotItem.innerHTML = `
       <img src="${screenshot.dataUrl}" alt="Screenshot" class="screenshot-image">
       <div class="screenshot-overlay">
         <button class="download-screenshot-btn" data-id="${screenshot.id}">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
         </button>
         <button class="delete-screenshot-btn" data-id="${screenshot.id}">
           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
         </button>
       </div>
       <div class="screenshot-info">
         ${screenshot.timestamp}
       </div>
     `

      screenshotsGrid.appendChild(screenshotItem)
    })

    // Add event listeners to download buttons
    document.querySelectorAll(".download-screenshot-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number.parseInt(e.currentTarget.getAttribute("data-id"))
        const screenshot = screenshots.find((s) => s.id === id)
        if (screenshot) {
          downloadScreenshot(screenshot)
        }
      })
    })

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-screenshot-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = Number.parseInt(e.currentTarget.getAttribute("data-id"))
        deleteScreenshot(id)
      })
    })
  }

  // Download screenshot
  function downloadScreenshot(screenshot) {
    const link = document.createElement("a")
    link.href = screenshot.dataUrl
    link.download = `detection-${screenshot.id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Delete screenshot
  function deleteScreenshot(id) {
    screenshots = screenshots.filter((s) => s.id !== id)
    updateScreenshotsGrid()
  }

  // Clear results
  function clearResults() {
    resultsList.innerHTML = ""
    resultsPlaceholder.style.display = "flex"
  }

  // Clear screenshots
  function clearScreenshots() {
    screenshots = []
    updateScreenshotsGrid()
  }

  // Event listeners
  toggleBtn.addEventListener("click", () => {
    if (isDetecting) {
      stopDetection()
    } else {
      startDetection()
    }
  })

  screenshotBtn.addEventListener("click", takeScreenshot)
  clearResultsBtn.addEventListener("click", clearResults)
  clearScreenshotsBtn.addEventListener("click", clearScreenshots)

  // Initialize
  // Disable the button until model loads
  toggleBtn.disabled = true
  toggleBtn.innerHTML = `
   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="10 8 16 12 10 16 10 8"></polygon></svg>
   Loading...
 `

  // Load model
  loadModel()
})

