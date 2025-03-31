// Import TensorFlow.js models
// Note: We're not using import statements anymore since we're loading the models via script tags

// Global variables
let mobilenet
let cocoSsd
let classifier
let currentImage = null
const isProcessing = false

// Pexels API Key
const PEXELS_API_KEY = "1aq2AHMemKlIJNTzIeMkE6tWmBGd6CxxbVGibbiKhPTLrPZlQlp61GGV"

// DOM Elements
document.addEventListener("DOMContentLoaded", () => {
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
      // Show loading
      showLoading("Loading AI models...")

      // Load the models
      mobilenet = await mobilenetModel.load()
      console.log("MobileNet model loaded successfully")

      // Try to load COCO-SSD model if available
      try {
        cocoSsd = await cocoSsdModel.load()
        console.log("COCO-SSD model loaded successfully")
      } catch (e) {
        console.warn("COCO-SSD model not available:", e)
      }

      // Hide loading
      hideLoading()
    } catch (error) {
      console.error("Error loading model:", error)
      hideLoading()
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

    // Create canvas if it doesn't exist
    if (!cameraCanvas) {
      cameraCanvas = document.createElement("canvas")
      cameraCanvas.id = "cameraCanvas"
      cameraCanvas.hidden = true
      document.body.appendChild(cameraCanvas)
    }

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

    if (!url.match(/^https?:\/\/.+/i)) {
      alert("Please enter a valid image URL starting with http:// or https://")
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
    if (!mobilenet || !currentImage) {
      loadingOverlay.hidden = true
      return
    }

    try {
      const startTime = performance.now()

      // Classify image
      const predictions = await mobilenet.classify(currentImage)

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

  // Show loading overlay
  function showLoading(message = "Loading...") {
    loadingOverlay.hidden = false
    const loadingText = loadingOverlay.querySelector("p")
    if (loadingText) {
      loadingText.textContent = message
    }
  }

  // Hide loading overlay
  function hideLoading() {
    loadingOverlay.hidden = true
  }
})

// Handle errors for placeholder images
document.addEventListener(
  "error",
  (e) => {
    if (e.target.tagName === "IMG") {
      e.target.src =
        "data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22200%22%20height%3D%22150%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20150%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_18b3023ff7e%20text%20%7B%20fill%3A%23999%3Bfont-weight%3Anormal%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A10pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_18b3023ff7e%22%3E%3Crect%20width%3D%22200%22%20height%3D%22150%22%20fill%3D%22%23373940%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2256.1953125%22%20y%3D%2279.5%22%3EImage%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E"
    }
  },
  true,
)

