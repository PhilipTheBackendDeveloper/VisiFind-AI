document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const promptInput = document.getElementById("promptInput")
  const promptLength = document.getElementById("promptLength")
  const generateBtn = document.getElementById("generateBtn")
  const clearBtn = document.getElementById("clearBtn")
  const randomPromptBtn = document.getElementById("randomPromptBtn")
  const historyBtn = document.getElementById("historyBtn")
  const resultPlaceholder = document.getElementById("resultPlaceholder")
  const resultLoading = document.getElementById("resultLoading")
  const resultGrid = document.getElementById("resultGrid")
  const progressFill = document.getElementById("progressFill")
  const progressText = document.getElementById("progressText")
  const downloadAllBtn = document.getElementById("downloadAllBtn")
  const shareBtn = document.getElementById("shareBtn")
  const startGeneratingBtn = document.getElementById("startGeneratingBtn")
  const styleOptions = document.querySelectorAll(".style-option")
  const creativitySlider = document.getElementById("creativitySlider")
  const creativityValue = document.getElementById("creativityValue")
  const detailSlider = document.getElementById("detailSlider")
  const detailValue = document.getElementById("detailValue")
  const sizeSelect = document.getElementById("sizeSelect")
  const countSelect = document.getElementById("countSelect")
  const refreshSuggestionsBtn = document.getElementById("refreshSuggestionsBtn")
  const useSuggestionBtns = document.querySelectorAll(".use-suggestion-btn")
  const menuToggle = document.getElementById("menuToggle")
  const sidebar = document.querySelector(".sidebar")
  const helpBtn = document.getElementById("helpBtn")
  const helpModal = document.getElementById("helpModal")
  const closeModal = document.getElementById("closeModal")
  const historyModal = document.getElementById("historyModal")
  const closeHistoryModal = document.getElementById("closeHistoryModal")

  // Replace the DeepAI API configuration with Unsplash API configuration
  const UNSPLASH_ACCESS_KEY = "1mk_cAU_OJjDdSHNye5NThF0vBC0ubSmYTG4A-dLpZQ"
  const UNSPLASH_API_URL = "https://api.unsplash.com"

  // Store generated images for download
  let generatedImages = []

  // Prompt history storage
  let promptHistory = []

  // Load history from localStorage if available
  try {
    const savedHistory = localStorage.getItem("promptHistory")
    if (savedHistory) {
      promptHistory = JSON.parse(savedHistory)
      updateHistoryUI()
    }
  } catch (e) {
    console.error("Error loading history:", e)
  }

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

  // History modal
  if (historyBtn && historyModal && closeHistoryModal) {
    historyBtn.addEventListener("click", () => {
      updateHistoryUI()
      historyModal.classList.add("active")
    })

    closeHistoryModal.addEventListener("click", () => {
      historyModal.classList.remove("active")
    })

    // Close modal when clicking outside
    historyModal.addEventListener("click", (e) => {
      if (e.target === historyModal) {
        historyModal.classList.remove("active")
      }
    })
  }

  // Update prompt character count
  promptInput.addEventListener("input", updatePromptLength)

  function updatePromptLength() {
    const length = promptInput.value.length
    promptLength.textContent = `${length}/500 characters`

    // Change color if approaching limit
    if (length > 450) {
      promptLength.style.color = "#ef4444"
    } else {
      promptLength.style.color = ""
    }
  }

  // Style selector
  styleOptions.forEach((option) => {
    option.addEventListener("click", () => {
      // Remove active class from all options
      styleOptions.forEach((opt) => opt.classList.remove("active"))
      // Add active class to clicked option
      option.classList.add("active")
    })
  })

  // Sliders
  creativitySlider.addEventListener("input", () => {
    creativityValue.textContent = creativitySlider.value
  })

  detailSlider.addEventListener("input", () => {
    detailValue.textContent = detailSlider.value
  })

  // Sample prompts for random generation
  const samplePrompts = [
    "Japanese garden with cherry blossoms",
    "Futuristic cityscape at night",
    "Mystical forest with glowing mushrooms",
    "Underwater scene with coral reefs",
    "Steampunk mechanical owl",
    "Cozy cabin in the mountains during winter",
    "Vibrant market scene in Marrakech",
    "Surreal dreamscape with floating islands",
    "Cyberpunk character in a rainy night",
    "Fantasy castle on a cliff",
  ]

  // Random prompt
  randomPromptBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * samplePrompts.length)
    promptInput.value = samplePrompts[randomIndex]
    updatePromptLength()
  })

  // Use suggestion buttons
  useSuggestionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const suggestionCard = btn.closest(".suggestion-card")
      const suggestionText = suggestionCard.querySelector("p").textContent
      promptInput.value = suggestionText
      updatePromptLength()

      // Scroll to prompt input
      promptInput.scrollIntoView({ behavior: "smooth" })
    })
  })

  // Refresh suggestions
  refreshSuggestionsBtn.addEventListener("click", () => {
    // This would typically fetch new suggestions from an API
    // For demo purposes, we'll just show a loading state
    refreshSuggestionsBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
        Refreshing...
    `

    setTimeout(() => {
      refreshSuggestionsBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M1 20v-6h6"></path><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
            Refresh
        `
    }, 1500)
  })

  // Clear prompt
  clearBtn.addEventListener("click", () => {
    promptInput.value = ""
    updatePromptLength()
  })

  // Start generating from placeholder
  startGeneratingBtn.addEventListener("click", () => {
    // Show a random prompt
    const randomIndex = Math.floor(Math.random() * samplePrompts.length)
    promptInput.value = samplePrompts[randomIndex]
    updatePromptLength()

    // Scroll to prompt input
    promptInput.scrollIntoView({ behavior: "smooth" })
  })

  // Generate images
  generateBtn.addEventListener("click", async () => {
    const prompt = promptInput.value.trim()

    if (!prompt) {
      alert("Please enter a prompt to generate images.")
      return
    }

    // Get selected options
    const style = document.querySelector(".style-option.active").getAttribute("data-style")
    const count = Number.parseInt(countSelect.value)

    // Show loading state
    resultPlaceholder.style.display = "none"
    resultGrid.style.display = "none"
    resultLoading.style.display = "flex"

    // Reset progress
    progressFill.style.width = "0%"
    progressText.textContent = "Initializing..."

    try {
      // Generate images with Unsplash API
      await generateImagesWithUnsplash(prompt, style, count)
    } catch (error) {
      console.error("Error generating images:", error)
      alert("An error occurred while generating images. Please try again.")

      // Hide loading state
      resultLoading.style.display = "none"
      resultPlaceholder.style.display = "flex"
    }
  })

  // Generate images with Unsplash API
  async function generateImagesWithUnsplash(prompt, style, count) {
    // Reset generated images array
    generatedImages = []

    // Update progress
    progressFill.style.width = "20%"
    progressText.textContent = "Searching for images..."

    // Prepare search query based on prompt and style
    let searchQuery = prompt

    // Add style keywords to enhance search results
    switch (style) {
      case "realistic":
        searchQuery += " realistic photo"
        break
      case "artistic":
        searchQuery += " artistic"
        break
      case "anime":
        searchQuery += " illustration"
        break
      case "3d":
        searchQuery += " 3D render"
        break
      case "sketch":
        searchQuery += " sketch drawing"
        break
    }

    try {
      // Update progress
      progressFill.style.width = "40%"
      progressText.textContent = "Fetching images..."

      // Fetch images from Unsplash
      const response = await fetch(
        `${UNSPLASH_API_URL}/search/photos?query=${encodeURIComponent(searchQuery)}&per_page=${count}&orientation=squarish`,
        {
          headers: {
            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error(`Unsplash API error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Update progress
      progressFill.style.width = "70%"
      progressText.textContent = "Processing results..."

      // Check if we got any results
      if (data.results.length === 0) {
        throw new Error("No images found for your query. Please try a different prompt.")
      }

      // Store image data
      generatedImages = data.results.map((photo) => ({
        url: photo.urls.regular,
        downloadUrl: photo.urls.full,
        prompt: prompt,
        user: {
          name: photo.user.name,
          username: photo.user.username,
          link: photo.user.links.html,
        },
      }))

      // Display results
      displayResults(generatedImages)

      // Update progress
      progressFill.style.width = "100%"
      progressText.textContent = "Complete!"
    } catch (error) {
      console.error("Error fetching images from Unsplash:", error)
      throw error
    }
  }

  // Display generated results
  function displayResults(images) {
    // Clear previous results
    resultGrid.innerHTML = ""

    // If no images were generated successfully
    if (images.length === 0) {
      resultLoading.style.display = "none"
      resultPlaceholder.style.display = "flex"
      alert("Failed to find images. Please try again with a different prompt.")
      return
    }

    // Set grid columns based on count
    if (images.length >= 4) {
      resultGrid.style.gridTemplateColumns = "repeat(2, 1fr)"
    } else {
      resultGrid.style.gridTemplateColumns = `repeat(${images.length}, 1fr)`
    }

    // Create result items
    images.forEach((image, index) => {
      const resultItem = document.createElement("div")
      resultItem.className = "result-item"
      resultItem.innerHTML = `
            <img src="${image.url}" alt="Generated image ${index + 1}" class="result-image">
            <div class="result-overlay">
                <button class="btn-icon download-btn" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                </button>
                <button class="btn-icon share-single-btn" data-index="${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                </button>
            </div>
            <div class="image-attribution">
                Photo by <a href="${image.user.link}?utm_source=clarifai&utm_medium=referral" target="_blank">${image.user.name}</a> on <a href="https://unsplash.com/?utm_source=clarifai&utm_medium=referral" target="_blank">Unsplash</a>
            </div>
        `

      resultGrid.appendChild(resultItem)
    })

    // Add event listeners to download buttons
    document.querySelectorAll(".download-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number.parseInt(e.currentTarget.getAttribute("data-index"))
        downloadImage(images[index].downloadUrl, `unsplash-image-${index + 1}.jpg`)
      })
    })

    // Add event listeners to share buttons
    document.querySelectorAll(".share-single-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number.parseInt(e.currentTarget.getAttribute("data-index"))
        shareImage(images[index].url, images[index].user)
      })
    })

    // Show results
    resultLoading.style.display = "none"
    resultGrid.style.display = "grid"

    // Enable action buttons
    downloadAllBtn.disabled = false
    shareBtn.disabled = false

    // Add to history
    addToHistory(promptInput.value)
  }

  // Download a single image
  function downloadImage(url, filename) {
    // Create a canvas to convert the image
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    const img = new Image()

    img.crossOrigin = "Anonymous" // This enables CORS
    img.onload = () => {
      // Set canvas dimensions to match the image
      canvas.width = img.width
      canvas.height = img.height

      // Draw image on canvas
      ctx.drawImage(img, 0, 0)

      // Convert canvas to blob and download
      canvas.toBlob(
        (blob) => {
          // Create a download link
          const link = document.createElement("a")
          link.href = URL.createObjectURL(blob)
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        },
        "image/jpeg",
        0.9,
      )
    }

    // Add a cache-busting parameter to avoid CORS issues with cached images
    img.src = url + "?t=" + new Date().getTime()
  }

  // Share a single image
  function shareImage(url, user) {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator
        .share({
          title: "Image from Unsplash",
          text: `Photo by ${user.name} on Unsplash`,
          url: url,
        })
        .catch((error) => {
          console.error("Error sharing:", error)
          alert("Couldn't share the image. You can right-click and copy the image instead.")
        })
    } else {
      // Fallback for browsers that don't support Web Share API
      alert("Sharing is not supported in your browser. You can right-click and copy the image instead.")
    }
  }

  // Add prompt to history
  function addToHistory(prompt) {
    // Create history item with timestamp
    const historyItem = {
      prompt: prompt,
      timestamp: new Date().toISOString(),
    }

    // Add to history array
    promptHistory.unshift(historyItem)

    // Keep only the last 20 items
    if (promptHistory.length > 20) {
      promptHistory = promptHistory.slice(0, 20)
    }

    // Save to localStorage
    try {
      localStorage.setItem("promptHistory", JSON.stringify(promptHistory))
    } catch (e) {
      console.error("Error saving history:", e)
    }

    // Update UI if history modal is open
    updateHistoryUI()
  }

  // Update history UI
  function updateHistoryUI() {
    const historyList = document.querySelector(".history-list")
    if (!historyList) return

    // Clear current history
    historyList.innerHTML = ""

    // Add history items
    promptHistory.forEach((item, index) => {
      const date = new Date(item.timestamp)
      const timeAgo = getTimeAgo(date)

      const historyItem = document.createElement("div")
      historyItem.className = "history-item"
      historyItem.innerHTML = `
      <div class="history-content">
          <p>${item.prompt}</p>
          <span class="history-time">${timeAgo}</span>
      </div>
      <button class="btn-icon copy-history-btn" data-index="${index}">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
      </button>
    `

      historyList.appendChild(historyItem)
    })

    // Add event listeners to copy buttons
    document.querySelectorAll(".copy-history-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number.parseInt(e.currentTarget.getAttribute("data-index"))
        promptInput.value = promptHistory[index].prompt
        updatePromptLength()
        historyModal.classList.remove("active")
      })
    })
  }

  // Get time ago string
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000)

    let interval = Math.floor(seconds / 31536000)
    if (interval >= 1) {
      return interval === 1 ? "1 year ago" : `${interval} years ago`
    }

    interval = Math.floor(seconds / 2592000)
    if (interval >= 1) {
      return interval === 1 ? "1 month ago" : `${interval} months ago`
    }

    interval = Math.floor(seconds / 86400)
    if (interval >= 1) {
      return interval === 1 ? "1 day ago" : `${interval} days ago`
    }

    interval = Math.floor(seconds / 3600)
    if (interval >= 1) {
      return interval === 1 ? "1 hour ago" : `${interval} hours ago`
    }

    interval = Math.floor(seconds / 60)
    if (interval >= 1) {
      return interval === 1 ? "1 minute ago" : `${interval} minutes ago`
    }

    return "Just now"
  }

  // Download all images
  downloadAllBtn.addEventListener("click", () => {
    if (generatedImages.length === 0) {
      alert("No images to download.")
      return
    }

    // Download each image
    generatedImages.forEach((image, index) => {
      // Add a small delay between downloads to avoid browser issues
      setTimeout(() => {
        downloadImage(image.downloadUrl, `unsplash-image-${index + 1}.jpg`)
      }, 300 * index)
    })
  })

  // Share images
  shareBtn.addEventListener("click", () => {
    if (generatedImages.length === 0) {
      alert("No images to share.")
      return
    }

    // Share the first image
    shareImage(generatedImages[0].url, generatedImages[0].user)
  })
})

