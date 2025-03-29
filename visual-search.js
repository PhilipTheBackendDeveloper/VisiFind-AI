import * as mobilenetModel from "@tensorflow-models/mobilenet"
import * as cocoSsdModel from "@tensorflow-models/coco-ssd"
import * as knnClassifier from "@tensorflow-models/knn-classifier"

// Global variables
let mobilenet
let cocoSsd
let classifier
let currentImage = null
let isProcessing = false

// Sample data for similar items and recommendations
const sampleData = {
  similar: [
    { id: 1, title: "Red Sneakers", match: "92% match", image: "/assets/samples/similar1.jpg" },
    { id: 2, title: "Blue Running Shoes", match: "87% match", image: "/assets/samples/similar2.jpg" },
    { id: 3, title: "White Canvas Shoes", match: "83% match", image: "/assets/samples/similar3.jpg" },
    { id: 4, title: "Black Leather Boots", match: "78% match", image: "/assets/samples/similar4.jpg" },
    { id: 5, title: "Green Hiking Shoes", match: "75% match", image: "/assets/samples/similar5.jpg" },
    { id: 6, title: "Yellow Sport Shoes", match: "72% match", image: "/assets/samples/similar6.jpg" },
  ],
  recommendations: {
    products: [
      {
        id: 1,
        title: "Premium Running Shoes",
        desc: "Lightweight and durable for long-distance running",
        source: "Nike",
        relevance: "95%",
        image: "/assets/samples/product1.jpg",
      },
      {
        id: 2,
        title: "Casual Sneakers",
        desc: "Comfortable everyday wear with stylish design",
        source: "Adidas",
        relevance: "92%",
        image: "/assets/samples/product2.jpg",
      },
      {
        id: 3,
        title: "Trail Running Shoes",
        desc: "Perfect for off-road adventures and hiking",
        source: "Salomon",
        relevance: "88%",
        image: "/assets/samples/product3.jpg",
      },
    ],
    articles: [
      {
        id: 1,
        title: "How to Choose the Right Running Shoes",
        desc: "Expert guide to finding your perfect fit",
        source: "Runner's World",
        relevance: "90%",
        image: "/assets/samples/article1.jpg",
      },
      {
        id: 2,
        title: "The History of Sneaker Culture",
        desc: "From athletic wear to fashion statement",
        source: "Fashion Magazine",
        relevance: "85%",
        image: "/assets/samples/article2.jpg",
      },
    ],
    videos: [
      {
        id: 1,
        title: "Shoe Maintenance Tips",
        desc: "Keep your shoes looking new for years",
        source: "YouTube",
        relevance: "87%",
        image: "/assets/samples/video1.jpg",
      },
      {
        id: 2,
        title: "Running Form Analysis",
        desc: "Improve your technique with proper footwear",
        source: "Runner's Channel",
        relevance: "82%",
        image: "/assets/samples/video2.jpg",
      },
    ],
  },
}

// DOM Elements
const uploadArea = document.getElementById("upload-area")
const imageUpload = document.getElementById("image-upload")
const cameraBtn = document.getElementById("camera-btn")
const cameraContainer = document.getElementById("camera-container")
const cameraFeed = document.getElementById("camera-feed")
const captureBtn = document.getElementById("capture-btn")
const closeCameraBtn = document.getElementById("close-camera-btn")
const previewCanvas = document.getElementById("preview-canvas")
const loadingOverlay = document.getElementById("loading-overlay")
const sampleImages = document.querySelectorAll(".sample-img")
const tabButtons = document.querySelectorAll(".tab-btn")
const tabPanes = document.querySelectorAll(".tab-pane")
const objectsList = document.getElementById("objects-list")
const detailsContent = document.getElementById("details-content")
const similarItems = document.getElementById("similar-items")
const recommendations = document.getElementById("recommendations")
const saveResultsBtn = document.getElementById("save-results-btn")
const shareResultsBtn = document.getElementById("share-results-btn")
const helpBtn = document.getElementById("help-btn")
const helpModal = document.getElementById("help-modal")
const closeModal = document.querySelector(".close-modal")

// Canvas context
const ctx = previewCanvas.getContext("2d")

// Initialize the application
async function init() {
  try {
    showLoading("Loading AI models...")

    // Load MobileNet model
    console.log("Loading MobileNet model...")
    mobilenet = await mobilenetModel.load()

    // Load COCO-SSD model
    console.log("Loading COCO-SSD model...")
    cocoSsd = await cocoSsdModel.load()

    // Initialize KNN Classifier
    classifier = knnClassifier.create()

    hideLoading()
    console.log("All models loaded successfully")

    // Set up event listeners
    setupEventListeners()
  } catch (error) {
    console.error("Error initializing models:", error)
    hideLoading()
    alert("Failed to load AI models. Please refresh the page and try again.")
  }
}

// Set up event listeners
function setupEventListeners() {
  // Upload area click
  uploadArea.addEventListener("click", () => {
    imageUpload.click()
  })

  // File upload change
  imageUpload.addEventListener("change", handleFileUpload)

  // Drag and drop events
  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault()
    uploadArea.classList.add("drag-over")
  })

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("drag-over")
  })

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault()
    uploadArea.classList.remove("drag-over")

    if (e.dataTransfer.files.length) {
      handleFiles(e.dataTransfer.files)
    }
  })

  // Camera button
  cameraBtn.addEventListener("click", toggleCamera)
  captureBtn.addEventListener("click", capturePhoto)
  closeCameraBtn.addEventListener("click", closeCamera)

  // Sample images
  sampleImages.forEach((img) => {
    img.addEventListener("click", () => {
      if (!isProcessing) {
        loadSampleImage(img.src)
      }
    })
  })

  // Tab switching
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabId = button.getAttribute("data-tab")
      switchTab(tabId)
    })
  })

  // Help modal
  helpBtn.addEventListener("click", () => {
    helpModal.style.display = "flex"
  })

  closeModal.addEventListener("click", () => {
    helpModal.style.display = "none"
  })

  window.addEventListener("click", (e) => {
    if (e.target === helpModal) {
      helpModal.style.display = "none"
    }
  })

  // Save and share buttons
  saveResultsBtn.addEventListener("click", saveResults)
  shareResultsBtn.addEventListener("click", shareResults)
}

// Handle file upload
function handleFileUpload(event) {
  const files = event.target.files
  if (files.length) {
    handleFiles(files)
  }
}

// Handle files (from upload or drag & drop)
function handleFiles(files) {
  const file = files[0]

  if (file.type.startsWith("image/")) {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        processImage(img)
      }
      img.src = e.target.result
    }

    reader.readAsDataURL(file)
  } else {
    alert("Please upload an image file.")
  }
}

// Load sample image
function loadSampleImage(src) {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    processImage(img)
  }
  img.onerror = () => {
    console.error("Error loading sample image:", src)
    alert("Failed to load sample image. Please try another one.")
  }
  img.src = src
}

// Process the image with AI models
async function processImage(img) {
  if (isProcessing) return

  isProcessing = true
  currentImage = img

  // Resize canvas to fit image proportionally
  const maxWidth = previewCanvas.parentElement.clientWidth
  const maxHeight = previewCanvas.parentElement.clientHeight

  const scale = Math.min(maxWidth / img.width, maxHeight / img.height)
  const width = img.width * scale
  const height = img.height * scale

  previewCanvas.width = width
  previewCanvas.height = height

  // Draw image on canvas
  ctx.clearRect(0, 0, width, height)
  ctx.drawImage(img, 0, 0, width, height)

  // Show loading overlay
  showLoading("Analyzing image...")

  try {
    // Run object detection
    const objectDetections = await cocoSsd.detect(img)

    // Run classification
    const activation = await mobilenet.infer(img, true)
    const classification = await mobilenet.classify(img)

    // Process results
    processResults(objectDetections, classification, activation)

    // Draw bounding boxes
    drawDetections(objectDetections, width, height)

    // Enable action buttons
    saveResultsBtn.disabled = false
    shareResultsBtn.disabled = false
  } catch (error) {
    console.error("Error processing image:", error)
    alert("An error occurred while analyzing the image. Please try again.")
  } finally {
    hideLoading()
    isProcessing = false
  }
}

// Process and display results
function processResults(objectDetections, classification, activation) {
  // Process Objects Tab
  displayObjectDetections(objectDetections)

  // Process Details Tab
  displayImageDetails(classification)

  // Process Similar Items Tab (using sample data for demo)
  displaySimilarItems()

  // Process Recommendations Tab (using sample data for demo)
  displayRecommendations()
}

// Display object detections
function displayObjectDetections(detections) {
  if (!detections || detections.length === 0) {
    objectsList.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-search"></i>
                <p>No objects detected in this image</p>
            </div>
        `
    return
  }

  // Sort detections by confidence
  detections.sort((a, b) => b.score - a.score)

  // Generate HTML for each detection
  let html = ""
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8", "#33FFF5", "#FFD133"]

  detections.forEach((detection, index) => {
    const color = colors[index % colors.length]
    const confidence = Math.round(detection.score * 100)

    html += `
            <div class="object-item fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="object-color" style="background-color: ${color}"></div>
                <div class="object-info">
                    <div class="object-name">${capitalizeFirstLetter(detection.class)}</div>
                    <div class="object-confidence">Confidence: ${confidence}%</div>
                    <div class="confidence-bar">
                        <div class="confidence-fill" style="width: ${confidence}%"></div>
                    </div>
                </div>
            </div>
        `
  })

  objectsList.innerHTML = html
}

// Display image details
function displayImageDetails(classification) {
  // Extract top classes and probabilities
  const topClasses = classification.slice(0, 5)

  // Generate tags from classifications
  const tags = [...new Set(topClasses.flatMap((c) => c.className.split(", ")))]

  // Create HTML for details
  const html = `
        <div class="detail-section fade-in">
            <h3>Image Classification</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Primary Category</div>
                    <div class="detail-value">${topClasses[0].className.split(",")[0]}</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Confidence</div>
                    <div class="detail-value">${Math.round(topClasses[0].probability * 100)}%</div>
                </div>
            </div>
        </div>
        
        <div class="detail-section fade-in" style="animation-delay: 0.1s">
            <h3>Tags</h3>
            <div class="tags-list">
                ${tags.map((tag) => `<span class="tag">${tag.trim()}</span>`).join("")}
            </div>
        </div>
        
        <div class="detail-section fade-in" style="animation-delay: 0.2s">
            <h3>All Classifications</h3>
            <div class="detail-grid">
                ${topClasses
                  .map(
                    (cls, index) => `
                    <div class="detail-item">
                        <div class="detail-label">${cls.className}</div>
                        <div class="detail-value">${Math.round(cls.probability * 100)}%</div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        </div>
        
        <div class="detail-section fade-in" style="animation-delay: 0.3s">
            <h3>Image Properties</h3>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="detail-label">Dimensions</div>
                    <div class="detail-value">${currentImage.width} × ${currentImage.height} px</div>
                </div>
                <div class="detail-item">
                    <div class="detail-label">Aspect Ratio</div>
                    <div class="detail-value">${(currentImage.width / currentImage.height).toFixed(2)}</div>
                </div>
            </div>
        </div>
    `

  detailsContent.innerHTML = html
}

// Display similar items (using sample data)
function displaySimilarItems() {
  if (sampleData.similar.length === 0) {
    similarItems.innerHTML = `
            <div class="placeholder-message">
                <i class="fas fa-images"></i>
                <p>No similar items found</p>
            </div>
        `
    return
  }

  let html = `<div class="similar-grid">`

  sampleData.similar.forEach((item, index) => {
    html += `
            <div class="similar-item fade-in" style="animation-delay: ${index * 0.1}s">
                <img src="${item.image}" alt="${item.title}" class="similar-img" onerror="this.src='/placeholder.svg?height=150&width=180'">
                <div class="similar-info">
                    <div class="similar-title">${item.title}</div>
                    <div class="similar-match">${item.match}</div>
                </div>
            </div>
        `
  })

  html += `</div>`
  similarItems.innerHTML = html
}

// Display recommendations (using sample data)
function displayRecommendations() {
  let html = `<div class="recommendation-categories">`

  // Products
  if (sampleData.recommendations.products.length > 0) {
    html += `
            <div class="recommendation-category fade-in">
                <h3><i class="fas fa-shopping-bag"></i> Related Products</h3>
                <div class="recommendation-grid">
                    ${sampleData.recommendations.products
                      .map(
                        (item, index) => `
                        <div class="recommendation-item" style="animation-delay: ${index * 0.1}s">
                            <img src="${item.image}" alt="${item.title}" class="recommendation-img" onerror="this.src='/placeholder.svg?height=160&width=200'">
                            <div class="recommendation-info">
                                <div class="recommendation-title">${item.title}</div>
                                <div class="recommendation-desc">${item.desc}</div>
                                <div class="recommendation-meta">
                                    <div class="recommendation-source">${item.source}</div>
                                    <div class="recommendation-relevance">${item.relevance}</div>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `
  }

  // Articles
  if (sampleData.recommendations.articles.length > 0) {
    html += `
            <div class="recommendation-category fade-in" style="animation-delay: 0.2s">
                <h3><i class="fas fa-newspaper"></i> Related Articles</h3>
                <div class="recommendation-grid">
                    ${sampleData.recommendations.articles
                      .map(
                        (item, index) => `
                        <div class="recommendation-item" style="animation-delay: ${(index + 0.2) * 0.1}s">
                            <img src="${item.image}" alt="${item.title}" class="recommendation-img" onerror="this.src='/placeholder.svg?height=160&width=200'">
                            <div class="recommendation-info">
                                <div class="recommendation-title">${item.title}</div>
                                <div class="recommendation-desc">${item.desc}</div>
                                <div class="recommendation-meta">
                                    <div class="recommendation-source">${item.source}</div>
                                    <div class="recommendation-relevance">${item.relevance}</div>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `
  }

  // Videos
  if (sampleData.recommendations.videos.length > 0) {
    html += `
            <div class="recommendation-category fade-in" style="animation-delay: 0.4s">
                <h3><i class="fas fa-video"></i> Related Videos</h3>
                <div class="recommendation-grid">
                    ${sampleData.recommendations.videos
                      .map(
                        (item, index) => `
                        <div class="recommendation-item" style="animation-delay: ${(index + 0.4) * 0.1}s">
                            <img src="${item.image}" alt="${item.title}" class="recommendation-img" onerror="this.src='/placeholder.svg?height=160&width=200'">
                            <div class="recommendation-info">
                                <div class="recommendation-title">${item.title}</div>
                                <div class="recommendation-desc">${item.desc}</div>
                                <div class="recommendation-meta">
                                    <div class="recommendation-source">${item.source}</div>
                                    <div class="recommendation-relevance">${item.relevance}</div>
                                </div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `
  }

  html += `</div>`
  recommendations.innerHTML = html
}

// Draw bounding boxes on canvas
function drawDetections(detections, width, height) {
  // Clear canvas first (keeping the image)
  const imageData = ctx.getImageData(0, 0, width, height)
  ctx.clearRect(0, 0, width, height)
  ctx.putImageData(imageData, 0, 0)

  // Colors for different objects
  const colors = ["#FF5733", "#33FF57", "#3357FF", "#F033FF", "#FF33A8", "#33FFF5", "#FFD133"]

  // Draw each detection
  detections.forEach((detection, index) => {
    const color = colors[index % colors.length]
    const [x, y, w, h] = detection.bbox

    // Scale coordinates to canvas size
    const scaleX = width / currentImage.width
    const scaleY = height / currentImage.height

    const scaledX = x * scaleX
    const scaledY = y * scaleY
    const scaledWidth = w * scaleX
    const scaledHeight = h * scaleY

    // Draw rectangle
    ctx.strokeStyle = color
    ctx.lineWidth = 3
    ctx.strokeRect(scaledX, scaledY, scaledWidth, scaledHeight)

    // Draw label background
    const label = `${capitalizeFirstLetter(detection.class)} ${Math.round(detection.score * 100)}%`
    const textMetrics = ctx.measureText(label)
    const textWidth = textMetrics.width
    const textHeight = 20

    ctx.fillStyle = color
    ctx.fillRect(scaledX, scaledY - textHeight, textWidth + 10, textHeight)

    // Draw label text
    ctx.fillStyle = "white"
    ctx.font = "14px Arial"
    ctx.fillText(label, scaledX + 5, scaledY - 5)
  })
}

// Toggle camera
async function toggleCamera() {
  if (cameraContainer.hidden) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      cameraFeed.srcObject = stream
      cameraContainer.hidden = false
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access the camera. Please check your permissions and try again.")
    }
  } else {
    closeCamera()
  }
}

// Capture photo from camera
function capturePhoto() {
  const tempCanvas = document.createElement("canvas")
  tempCanvas.width = cameraFeed.videoWidth
  tempCanvas.height = cameraFeed.videoHeight

  const tempCtx = tempCanvas.getContext("2d")
  tempCtx.drawImage(cameraFeed, 0, 0, tempCanvas.width, tempCanvas.height)

  const img = new Image()
  img.onload = () => {
    closeCamera()
    processImage(img)
  }
  img.src = tempCanvas.toDataURL("image/png")
}

// Close camera
function closeCamera() {
  if (cameraFeed.srcObject) {
    const tracks = cameraFeed.srcObject.getTracks()
    tracks.forEach((track) => track.stop())
    cameraFeed.srcObject = null
  }
  cameraContainer.hidden = true
}

// Switch tabs
function switchTab(tabId) {
  // Update tab buttons
  tabButtons.forEach((btn) => {
    if (btn.getAttribute("data-tab") === tabId) {
      btn.classList.add("active")
    } else {
      btn.classList.remove("active")
    }
  })

  // Update tab panes
  tabPanes.forEach((pane) => {
    if (pane.id === `${tabId}-tab`) {
      pane.classList.add("active")
    } else {
      pane.classList.remove("active")
    }
  })
}

// Save results
function saveResults() {
  // Create a new canvas with both the image and detections
  const dataURL = previewCanvas.toDataURL("image/png")

  // Create a temporary link and trigger download
  const link = document.createElement("a")
  link.href = dataURL
  link.download = "visual-search-result.png"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Share results
function shareResults() {
  if (navigator.share) {
    previewCanvas.toBlob(async (blob) => {
      try {
        const file = new File([blob], "visual-search-result.png", { type: "image/png" })

        await navigator.share({
          title: "Visual Search Result",
          text: "Check out what I found with Clarifai Visual Search!",
          files: [file],
        })
      } catch (error) {
        console.error("Error sharing:", error)
        alert("Could not share the results. Try saving the image instead.")
      }
    })
  } else {
    alert("Web Share API is not supported in your browser. Try saving the image instead.")
  }
}

// Show loading overlay
function showLoading(message = "Loading...") {
  const loadingText = loadingOverlay.querySelector("p")
  if (loadingText) {
    loadingText.textContent = message
  }
  loadingOverlay.style.display = "flex"
}

// Hide loading overlay
function hideLoading() {
  loadingOverlay.style.display = "none"
}

// Helper function to capitalize first letter
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  // API Key for Pexels
  const PEXELS_API_KEY = "1aq2AHMemKlIJNTzIeMkE6tWmBGd6CxxbVGibbiKhPTLrPZlQlp61GGV"

  // DOM Elements
  const inputMethods = document.querySelectorAll(".input-method")
  const inputPanels = document.querySelectorAll(".input-panel")
  const uploadArea = document.getElementById("uploadArea")
  const fileInput = document.getElementById("fileInput")
  const startCameraBtn = document.getElementById("startCameraBtn")
  const captureBtn = document.getElementById("captureBtn")
  const retakeBtn = document.getElementById("retakeBtn")
  const cameraFeed = document.getElementById("cameraFeed")
  const cameraCanvas = document.getElementById("cameraCanvas")
  const cameraPlaceholder = document.getElementById("cameraPlaceholder")
  const urlInput = document.getElementById("urlInput")
  const loadUrlBtn = document.getElementById("loadUrlBtn")
  const urlPreview = document.getElementById("urlPreview")
  const previewImage = document.getElementById("previewImage")
  const previewPlaceholder = document.getElementById("previewPlaceholder")
  const previewContainer = document.getElementById("previewContainer")
  const loadingOverlay = document.getElementById("loadingOverlay")
  const previewInfo = document.getElementById("previewInfo")
  const analysisResults = document.getElementById("analysisResults")
  const searchBtn = document.getElementById("searchBtn")
  const clearBtn = document.getElementById("clearBtn")
  const resultsGrid = document.getElementById("resultsGrid")
  const resultsPlaceholder = document.getElementById("resultsPlaceholder")
  const resultsPagination = document.getElementById("resultsPagination")
  const prevPageBtn = document.getElementById("prevPageBtn")
  const nextPageBtn = document.getElementById("nextPageBtn")
  const paginationInfo = document.getElementById("paginationInfo")
  const resultType = document.getElementById("resultType")
  const savedGrid = document.getElementById("savedGrid")
  const savedPlaceholder = document.getElementById("savedPlaceholder")
  const clearSavedBtn = document.getElementById("clearSavedBtn")
  const totalSearches = document.getElementById("totalSearches")
  const recognitionAccuracy = document.getElementById("recognitionAccuracy")
  const totalResults = document.getElementById("totalResults")
  const processingTime = document.getElementById("processingTime")
  const menuToggle = document.getElementById("menuToggle")
  const sidebar = document.querySelector(".sidebar")
  const helpBtn = document.getElementById("helpBtn")
  const helpModal = document.getElementById("helpModal")
  const closeModal = document.getElementById("closeModal")
  const imageModal = document.getElementById("imageModal")
  const closeImageModal = document.getElementById("closeImageModal")
  const modalImage = document.getElementById("modalImage")
  const modalImageTitle = document.getElementById("modalImageTitle")
  const modalImageAuthor = document.getElementById("modalImageAuthor")
  const modalImageDimensions = document.getElementById("modalImageDimensions")
  const modalImageDownload = document.getElementById("modalImageDownload")
  const modalImageSource = document.getElementById("modalImageSource")
  const modalImageTags = document.getElementById("modalImageTags")

  // State variables
  let model = null
  let currentImage = null
  let currentPredictions = []
  let searchResults = []
  let currentPage = 1
  let totalPages = 1
  let savedSearches = JSON.parse(localStorage.getItem("visualSearches")) || []
  let searchCount = Number.parseInt(localStorage.getItem("searchCount")) || 0
  let cameraStream = null
  let isImageCaptured = false

  // Initialize
  init()

  // Initialize the application
  async function init() {
    // Load TensorFlow model
    loadModel()

    // Set up event listeners
    setupEventListeners()

    // Update stats
    updateStats()

    // Load saved searches
    updateSavedSearches()
  }

  // Load MobileNet model
  async function loadModel() {
    try {
      // Load the model
      model = await mobilenet.load()
      console.log("MobileNet model loaded successfully")
    } catch (error) {
      console.error("Error loading model:", error)
      alert("Failed to load AI model. Please refresh the page and try again.")
    }
  }

  // Set up event listeners
  function setupEventListeners() {
    // Input method tabs
    inputMethods.forEach((method) => {
      method.addEventListener("click", () => {
        const methodType = method.getAttribute("data-method")
        switchInputMethod(methodType)
      })
    })

    // Upload area
    uploadArea.addEventListener("click", () => {
      fileInput.click()
    })

    uploadArea.addEventListener("dragover", (e) => {
      e.preventDefault()
      uploadArea.classList.add("drag-over")
    })

    uploadArea.addEventListener("dragleave", () => {
      uploadArea.classList.remove("drag-over")
    })

    uploadArea.addEventListener("drop", (e) => {
      e.preventDefault()
      uploadArea.classList.remove("drag-over")

      if (e.dataTransfer.files.length) {
        handleFileUpload(e.dataTransfer.files[0])
      }
    })

    fileInput.addEventListener("change", (e) => {
      if (e.target.files.length) {
        handleFileUpload(e.target.files[0])
      }
    })

    // Camera controls
    startCameraBtn.addEventListener("click", startCamera)
    captureBtn.addEventListener("click", capturePhoto)
    retakeBtn.addEventListener("click", retakePhoto)

    // URL input
    loadUrlBtn.addEventListener("click", loadImageFromUrl)
    urlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loadImageFromUrl()
      }
    })

    // Search and clear buttons
    searchBtn.addEventListener("click", searchImages)
    clearBtn.addEventListener("click", clearSearch)

    // Pagination
    prevPageBtn.addEventListener("click", () => {
      if (currentPage > 1) {
        currentPage--
        fetchSearchResults()
      }
    })

    nextPageBtn.addEventListener("click", () => {
      if (currentPage < totalPages) {
        currentPage++
        fetchSearchResults()
      }
    })

    // Filter results
    resultType.addEventListener("change", () => {
      fetchSearchResults()
    })

    // Clear saved searches
    clearSavedBtn.addEventListener("click", clearSavedSearches)

    // Toggle sidebar on mobile
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("open")
    })

    // Help modal
    helpBtn.addEventListener("click", () => {
      helpModal.classList.add("active")
    })

    closeModal.addEventListener("click", () => {
      helpModal.classList.remove("active")
    })

    // Image modal
    closeImageModal.addEventListener("click", () => {
      imageModal.classList.remove("active")
    })

    // Close modals when clicking outside
    window.addEventListener("click", (e) => {
      if (e.target === helpModal) {
        helpModal.classList.remove("active")
      }
      if (e.target === imageModal) {
        imageModal.classList.remove("active")
      }
    })
  }

  // Switch input method
  function switchInputMethod(methodType) {
    // Update active tab
    inputMethods.forEach((method) => {
      if (method.getAttribute("data-method") === methodType) {
        method.classList.add("active")
      } else {
        method.classList.remove("active")
      }
    })

    // Show corresponding panel
    inputPanels.forEach((panel) => {
      if (panel.id === `${methodType}-panel`) {
        panel.classList.add("active")
      } else {
        panel.classList.remove("active")
      }
    })

    // If switching away from camera, stop the stream
    if (methodType !== "camera" && cameraStream) {
      stopCamera()
    }
  }

  // Handle file upload
  function handleFileUpload(file) {
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.")
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      loadImageFromDataUrl(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  // Start camera
  async function startCamera() {
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      cameraFeed.srcObject = cameraStream
      cameraFeed.hidden = false
      cameraPlaceholder.hidden = true
      startCameraBtn.hidden = true
      captureBtn.hidden = false

      // Reset capture state
      isImageCaptured = false
      retakeBtn.hidden = true
    } catch (error) {
      console.error("Error accessing camera:", error)
      alert("Could not access the camera. Please check your permissions and try again.")
    }
  }

  // Stop camera
  function stopCamera() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop())
      cameraStream = null
    }

    cameraFeed.srcObject = null
    cameraFeed.hidden = true
    cameraPlaceholder.hidden = false
    startCameraBtn.hidden = false
    captureBtn.hidden = true
    retakeBtn.hidden = true
  }

  // Capture photo
  function capturePhoto() {
    if (!cameraStream) return

    // Set canvas dimensions
    cameraCanvas.width = cameraFeed.videoWidth
    cameraCanvas.height = cameraFeed.videoHeight

    // Draw video frame to canvas
    const ctx = cameraCanvas.getContext("2d")
    ctx.drawImage(cameraFeed, 0, 0, cameraCanvas.width, cameraCanvas.height)

    // Convert to data URL
    const dataUrl = cameraCanvas.toDataURL("image/png")

    // Load the captured image
    loadImageFromDataUrl(dataUrl)

    // Update UI
    isImageCaptured = true
    captureBtn.hidden = true
    retakeBtn.hidden = false
  }

  // Retake photo
  function retakePhoto() {
    isImageCaptured = false
    captureBtn.hidden = false
    retakeBtn.hidden = true

    // Clear preview
    clearPreview()
  }

  // Load image from URL
  function loadImageFromUrl() {
    const url = urlInput.value.trim()

    if (!url) {
      alert("Please enter an image URL.")
      return
    }

    if (!url.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
      alert("Please enter a valid image URL (jpg, png, gif, webp).")
      return
    }

    // Show loading in URL preview
    urlPreview.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>'

    // Create image element
    const img = new Image()
    img.crossOrigin = "anonymous"

    img.onload = () => {
      // Display in URL preview
      urlPreview.innerHTML = ""
      urlPreview.appendChild(img)

      // Load the image for processing
      loadImageFromDataUrl(img.src)
    }

    img.onerror = () => {
      urlPreview.innerHTML =
        '<div class="error-message">Failed to load image. Please check the URL and try again.</div>'
    }

    img.src = url
  }

  // Load image from data URL
  function loadImageFromDataUrl(dataUrl) {
    // Show preview
    previewPlaceholder.hidden = true
    previewImage.src = dataUrl
    previewImage.hidden = false

    // Show loading overlay
    loadingOverlay.hidden = false

    // Store current image
    currentImage = new Image()
    currentImage.onload = () => {
      // Analyze image
      analyzeImage()
    }
    currentImage.src = dataUrl
  }

  // Analyze image with TensorFlow.js
  async function analyzeImage() {
    if (!model || !currentImage) {
      loadingOverlay.hidden = true
      return
    }

    try {
      const startTime = performance.now()

      // Classify image
      const predictions = await model.classify(currentImage)

      // Store predictions
      currentPredictions = predictions

      // Display results
      displayAnalysisResults(predictions)

      // Update processing time
      const endTime = performance.now()
      processingTime.textContent = `${Math.round(endTime - startTime)}ms`

      // Update accuracy
      const topPrediction = predictions[0]
      recognitionAccuracy.textContent = `${Math.round(topPrediction.probability * 100)}%`

      // Show preview info
      previewInfo.hidden = false

      // Hide loading overlay
      loadingOverlay.hidden = true
    } catch (error) {
      console.error("Error analyzing image:", error)
      loadingOverlay.hidden = true
      alert("An error occurred while analyzing the image. Please try again.")
    }
  }

  // Display analysis results
  function displayAnalysisResults(predictions) {
    analysisResults.innerHTML = ""

    predictions.forEach((prediction) => {
      const predictionItem = document.createElement("div")
      predictionItem.className = "prediction-item"

      const probability = Math.round(prediction.probability * 100)

      predictionItem.innerHTML = `
                <div class="prediction-label">${prediction.className}</div>
                <div class="prediction-score">${probability}%</div>
            `

      analysisResults.appendChild(predictionItem)
    })
  }

  // Search for similar images using Pexels API
  function searchImages() {
    if (!currentPredictions || currentPredictions.length === 0) {
      alert("Please upload and analyze an image first.")
      return
    }

    // Get top prediction as search query
    const searchQuery = currentPredictions[0].className.split(",")[0].trim()

    // Increment search count
    searchCount++
    localStorage.setItem("searchCount", searchCount)

    // Update stats
    totalSearches.textContent = searchCount

    // Reset pagination
    currentPage = 1

    // Show loading
    resultsPlaceholder.innerHTML = `
            <div class="spinner"></div>
            <p>Searching for "${searchQuery}"...</p>
        `
    resultsPlaceholder.style.display = "flex"
    resultsGrid.innerHTML = ""

    // Fetch results
    fetchSearchResults(searchQuery)

    // Save search
    saveSearch(searchQuery)
  }

  // Fetch search results from Pexels API
  function fetchSearchResults(query = null) {
    // If no query provided, use the current search query
    if (!query) {
      if (currentPredictions.length === 0) return
      query = currentPredictions[0].className.split(",")[0].trim()
    }

    // Get filter
    const filter = resultType.value

    // Build URL
    let url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&page=${currentPage}&per_page=20`

    // Add filter if not 'all'
    if (filter !== "all") {
      url += `&orientation=${filter}`
    }

    // Fetch results
    fetch(url, {
      headers: {
        Authorization: PEXELS_API_KEY,
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
      .then((data) => {
        // Store results
        searchResults = data.photos

        // Update pagination
        totalPages = Math.ceil(data.total_results / 20)
        updatePagination()

        // Display results
        displaySearchResults(data.photos)

        // Update stats
        totalResults.textContent = data.total_results > 1000 ? "1000+" : data.total_results
      })
      .catch((error) => {
        console.error("Error fetching search results:", error)
        resultsPlaceholder.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p>Error fetching results. Please try again.</p>
            `
      })
  }

  // Display search results
  function displaySearchResults(photos) {
    // Hide placeholder if we have results
    if (photos.length > 0) {
      resultsPlaceholder.style.display = "none"
      resultsPagination.hidden = false
    } else {
      resultsPlaceholder.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <p>No results found. Try a different search term.</p>
            `
      resultsPlaceholder.style.display = "flex"
      resultsPagination.hidden = true
      return
    }

    // Clear grid
    resultsGrid.innerHTML = ""

    // Add photos
    photos.forEach((photo) => {
      const resultItem = document.createElement("div")
      resultItem.className = "result-item"
      resultItem.innerHTML = `
                <img src="${photo.src.medium}" alt="${photo.alt}" class="result-image">
                <div class="result-info">
                    <div class="result-title">${photo.alt || "Untitled"}</div>
                    <div class="result-meta">
                        <div class="result-author">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            ${photo.photographer}
                        </div>
                        <div class="result-dimensions">${photo.width}×${photo.height}</div>
                    </div>
                </div>
            `

      // Add click event to open modal
      resultItem.addEventListener("click", () => {
        openImageModal(photo)
      })

      resultsGrid.appendChild(resultItem)
    })
  }

  // Update pagination
  function updatePagination() {
    paginationInfo.textContent = `Page ${currentPage} of ${totalPages}`

    prevPageBtn.disabled = currentPage <= 1
    nextPageBtn.disabled = currentPage >= totalPages
  }

  // Save search
  function saveSearch(query) {
    // Create search object
    const search = {
      id: Date.now(),
      query: query,
      image: currentImage.src,
      timestamp: new Date().toISOString(),
      predictions: currentPredictions.slice(0, 3),
    }

    // Add to saved searches
    savedSearches.unshift(search)

    // Limit to 20 saved searches
    if (savedSearches.length > 20) {
      savedSearches = savedSearches.slice(0, 20)
    }

    // Save to localStorage
    localStorage.setItem("visualSearches", JSON.stringify(savedSearches))

    // Update UI
    updateSavedSearches()
  }

  // Update saved searches
  function updateSavedSearches() {
    // Hide placeholder if we have saved searches
    if (savedSearches.length > 0) {
      savedPlaceholder.style.display = "none"
    } else {
      savedPlaceholder.style.display = "flex"
      savedGrid.innerHTML = ""
      return
    }

    // Clear grid
    savedGrid.innerHTML = ""

    // Add saved searches
    savedSearches.forEach((search) => {
      const savedItem = document.createElement("div")
      savedItem.className = "saved-item"

      // Format date
      const date = new Date(search.timestamp)
      const formattedDate = date.toLocaleDateString()

      savedItem.innerHTML = `
                <img src="${search.image}" alt="${search.query}" class="saved-image">
                <div class="saved-info">
                    <div class="saved-title">${search.query}</div>
                    <div class="saved-date">${formattedDate}</div>
                </div>
                <div class="saved-actions">
                    <div class="saved-action" data-action="search" data-id="${search.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                    <div class="saved-action" data-action="delete" data-id="${search.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </div>
                </div>
            `

      savedGrid.appendChild(savedItem)
    })

    // Add event listeners to saved search actions
    document.querySelectorAll(".saved-action").forEach((action) => {
      action.addEventListener("click", (e) => {
        const actionType = e.currentTarget.getAttribute("data-action")
        const searchId = Number.parseInt(e.currentTarget.getAttribute("data-id"))

        if (actionType === "search") {
          loadSavedSearch(searchId)
        } else if (actionType === "delete") {
          deleteSavedSearch(searchId)
        }

        e.stopPropagation()
      })
    })

    // Add click event to load saved search
    document.querySelectorAll(".saved-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        if (!e.target.closest(".saved-action")) {
          const searchId = Number.parseInt(item.querySelector(".saved-action").getAttribute("data-id"))
          loadSavedSearch(searchId)
        }
      })
    })
  }

  // Load saved search
  function loadSavedSearch(id) {
    const search = savedSearches.find((s) => s.id === id)

    if (!search) return

    // Load image
    loadImageFromDataUrl(search.image)

    // Set predictions
    currentPredictions = search.predictions

    // Switch to upload tab
    switchInputMethod("upload")
  }

  // Delete saved search
  function deleteSavedSearch(id) {
    savedSearches = savedSearches.filter((s) => s.id !== id)

    // Save to localStorage
    localStorage.setItem("visualSearches", JSON.stringify(savedSearches))

    // Update UI
    updateSavedSearches()
  }

  // Clear saved searches
  function clearSavedSearches() {
    if (confirm("Are you sure you want to clear all saved searches?")) {
      savedSearches = []
      localStorage.setItem("visualSearches", JSON.stringify(savedSearches))
      updateSavedSearches()
    }
  }

  // Clear search
  function clearSearch() {
    // Clear preview
    clearPreview()

    // Clear results
    resultsGrid.innerHTML = ""
    resultsPlaceholder.style.display = "flex"
    resultsPagination.hidden = true

    // Reset camera if active
    if (document.querySelector('.input-method[data-method="camera"]').classList.contains("active")) {
      if (isImageCaptured) {
        retakePhoto()
      }
    }

    // Clear URL input
    urlInput.value = ""
    urlPreview.innerHTML = ""
  }

  // Clear preview
  function clearPreview() {
    previewPlaceholder.hidden = false
    previewImage.hidden = true
    previewImage.src = ""
    previewInfo.hidden = true
    analysisResults.innerHTML = ""
    currentImage = null
    currentPredictions = []
  }

  // Open image modal
  function openImageModal(photo) {
    modalImage.src = photo.src.large
    modalImageTitle.textContent = photo.alt || "Untitled"
    modalImageAuthor.textContent = photo.photographer
    modalImageDimensions.textContent = `${photo.width} × ${photo.height}`
    modalImageDownload.href = photo.src.original
    modalImageSource.href = photo.url

    // Generate tags from the alt text
    const tags = photo.alt
      .split(/\s+/)
      .filter((tag) => tag.length > 3)
      .slice(0, 8)

    modalImageTags.innerHTML = ""
    tags.forEach((tag) => {
      const tagElement = document.createElement("div")
      tagElement.className = "tag"
      tagElement.textContent = tag
      modalImageTags.appendChild(tagElement)
    })

    imageModal.classList.add("active")
  }

  // Update stats
  function updateStats() {
    totalSearches.textContent = searchCount
    recognitionAccuracy.textContent = "0%"
    totalResults.textContent = "0"
    processingTime.textContent = "0ms"
  }
})

// Handle errors for placeholder images
document.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "IMG") {
      e.target.src =
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%22%20viewBox%3D%220%200%20200%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18b3023ff7e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18b3023ff7e%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2256.1953125%22%20y%3D%2279.5%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E"
    }
  },
  true,
)

