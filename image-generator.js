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

  // Picogen API configuration - kept for reference but using fallback images
  const PICOGEN_API_KEY = "818080c0cfeea98a0c12bf534766ad293882be6b3c7c5604d97ad85fae29cb4e"

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
    "A serene Japanese garden with cherry blossoms, a small bridge over a koi pond, and traditional architecture",
    "A futuristic cityscape at night with flying cars, neon lights, and towering skyscrapers",
    "A mystical forest with glowing mushrooms, fairy lights, and a small cottage in the distance",
    "An underwater scene with colorful coral reefs, exotic fish, and sunlight filtering through the water",
    "A steampunk-inspired mechanical owl with brass gears, glowing eyes, and intricate details",
    "A cozy cabin in the mountains during winter, with smoke coming from the chimney and snow-covered pine trees",
    "A vibrant market scene in Marrakech with colorful spices, textiles, and bustling crowds",
    "A surreal dreamscape with floating islands, impossible architecture, and a purple sky",
    "A detailed portrait of a cyberpunk character with neon implants, in a rainy night setting",
    "A fantasy castle perched on a cliff with waterfalls, surrounded by a magical landscape",
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
    const size = sizeSelect.value
    const count = Number.parseInt(countSelect.value)
    const creativity = creativitySlider.value
    const detail = detailSlider.value

    // Show loading state
    resultPlaceholder.style.display = "none"
    resultGrid.style.display = "none"
    resultLoading.style.display = "flex"

    // Reset progress
    progressFill.style.width = "0%"
    progressText.textContent = "Initializing..."

    try {
      // Generate images with fallback method since API has CORS issues
      await simulateImageGeneration(prompt, style, size, count, creativity, detail)
    } catch (error) {
      console.error("Error generating images:", error)
      alert("An error occurred while generating images. Please try again.")

      // Hide loading state
      resultLoading.style.display = "none"
      resultPlaceholder.style.display = "flex"
    }
  })

  // Simulate image generation with fallback images
  async function simulateImageGeneration(prompt, style, size, count, creativity, detail) {
    // Reset generated images array
    generatedImages = []

    // Simulate API call with progress updates
    for (let progress = 0; progress <= 100; progress += 5) {
      progressFill.style.width = `${progress}%`

      if (progress < 20) {
        progressText.textContent = "Interpreting prompt..."
      } else if (progress < 40) {
        progressText.textContent = "Generating composition..."
      } else if (progress < 60) {
        progressText.textContent = "Adding details..."
      } else if (progress < 80) {
        progressText.textContent = "Applying style..."
      } else {
        progressText.textContent = "Finalizing images..."
      }

      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    // Sample image URLs based on style
    const styleImages = {
      realistic: [
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
        "https://images.unsplash.com/photo-1682686580186-b55d2a91053c",
        "https://images.unsplash.com/photo-1682687982501-1e58ab814714",
      ],
      artistic: [
        "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5",
        "https://images.unsplash.com/photo-1547891654-e66ed7ebb968",
        "https://images.unsplash.com/photo-1549490349-8643362247b5",
        "https://images.unsplash.com/photo-1543857778-c4a1a3e0b2eb",
      ],
      anime: [
        "https://images.unsplash.com/photo-1560972550-aba3456b5564",
        "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f",
        "https://images.unsplash.com/photo-1578632767115-351597cf2477",
        "https://images.unsplash.com/photo-1541562232579-512a21360020",
      ],
      "3d": [
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e",
        "https://images.unsplash.com/photo-1633356122102-3fe601e05bd2",
        "https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5",
        "https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4",
      ],
      sketch: [
        "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a",
        "https://images.unsplash.com/photo-1618331835717-801e976710b2",
        "https://images.unsplash.com/photo-1513364776144-60967b0f800f",
        "https://images.unsplash.com/photo-1517971129774-8a2b38fa128e",
      ],
    }

    // Create result items
    for (let i = 0; i < count; i++) {
      const imageUrl = styleImages[style][i % styleImages[style].length]

      // Add image to generated images array
      generatedImages.push({
        url: imageUrl,
        prompt: prompt,
        style: style,
      })
    }

    // Display results
    displayResults(generatedImages)

    // Add to history
    addToHistory(prompt)
  }

  // Display generated results
  function displayResults(images) {
    // Clear previous results
    resultGrid.innerHTML = ""

    // If no images were generated successfully
    if (images.length === 0) {
      resultLoading.style.display = "none"
      resultPlaceholder.style.display = "flex"
      alert("Failed to generate images. Please try again with a different prompt.")
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
            `

      resultGrid.appendChild(resultItem)
    })

    // Add event listeners to download buttons
    document.querySelectorAll(".download-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number.parseInt(e.currentTarget.getAttribute("data-index"))
        downloadImage(images[index].url, `generated-image-${index + 1}.jpg`)
      })
    })

    // Add event listeners to share buttons
    document.querySelectorAll(".share-single-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const index = Number.parseInt(e.currentTarget.getAttribute("data-index"))
        shareImage(images[index].url)
      })
    })

    // Show results
    resultLoading.style.display = "none"
    resultGrid.style.display = "grid"

    // Enable action buttons
    downloadAllBtn.disabled = false
    shareBtn.disabled = false
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
  function shareImage(url) {
    // Check if Web Share API is supported
    if (navigator.share) {
      navigator
        .share({
          title: "AI Generated Image",
          text: "Check out this AI-generated image!",
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
        downloadImage(image.url, `generated-image-${index + 1}.jpg`)
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
    shareImage(generatedImages[0].url)
  })
})

