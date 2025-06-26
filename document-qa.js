document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const uploadArea = document.getElementById("uploadArea")
  const uploadContent = document.getElementById("uploadContent")
  const documentUpload = document.getElementById("documentUpload")
  const browseLink = document.getElementById("browseLink")
  const documentPreview = document.getElementById("documentPreview")
  const documentViewer = document.getElementById("documentViewer")
  const documentInfo = document.getElementById("documentInfo")
  const prevPageBtn = document.getElementById("prevPageBtn")
  const nextPageBtn = document.getElementById("nextPageBtn")
  const pageInfo = document.getElementById("pageInfo")
  const questionInput = document.getElementById("questionInput")
  const askBtn = document.getElementById("askBtn")
  const answersPlaceholder = document.getElementById("answersPlaceholder")
  const answersLoading = document.getElementById("answersLoading")
  const answersList = document.getElementById("answersList")
  const uploadDocBtn = document.getElementById("uploadDocBtn")
  const clearBtn = document.getElementById("clearBtn")
  const useSampleQuestionBtns = document.querySelectorAll(".use-question-btn")
  const menuToggle = document.getElementById("menuToggle")
  const sidebar = document.querySelector(".sidebar")
  const helpBtn = document.getElementById("helpBtn")
  const helpModal = document.getElementById("helpModal")
  const closeModal = document.getElementById("closeModal")

  // Hugging Face API Configuration
  const HF_API_TOKEN = "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"
  const HF_API_URL = "https://api-inference.huggingface.co/models"
  const QA_MODEL = "deepset/roberta-base-squad2"

  // PDF.js configuration
  const pdfjsLib = window["pdfjs-dist/build/pdf"]
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.7.107/pdf.worker.min.js"

  // State variables
  let currentDocument = null
  let currentDocumentText = ""
  let pdfDocument = null
  let currentPage = 1
  let totalPages = 1
  const questionHistory = []

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

  // Handle file selection via button
  if (uploadDocBtn) {
    uploadDocBtn.addEventListener("click", () => {
      documentUpload.click()
    })
  }

  // Handle file selection via browse link
  if (browseLink) {
    browseLink.addEventListener("click", () => {
      documentUpload.click()
    })
  }

  // Handle file selection
  if (documentUpload) {
    documentUpload.addEventListener("change", (e) => {
      if (e.target.files.length > 0) {
        handleFileSelect(e.target.files[0])
      }
    })
  }



  
  // Clear document and reset UI
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      resetUI()
    })
  }

  // Use sample questions
  useSampleQuestionBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const questionText = btn.previousElementSibling.textContent.trim()
      questionInput.value = questionText.replace(/^"|"$/g, "") // Remove quotes if present

      // Scroll to question input
      questionInput.scrollIntoView({ behavior: "smooth" })

      // Focus on question input
      questionInput.focus()
    })
  })

  // Ask question
  if (askBtn) {
    askBtn.addEventListener("click", async () => {
      const question = questionInput.value.trim()

      if (!question) {
        alert("Please enter a question.")
        return
      }

      if (!currentDocumentText) {
        alert("Please upload a document first.")
        return
      }

      // Show loading state
      answersPlaceholder.style.display = "none"
      answersList.style.display = "none"
      answersLoading.style.display = "flex"

      try {
        // Get answer from Hugging Face API
        const answer = await getAnswerFromHuggingFace(question, currentDocumentText)

        // Display answer
        displayAnswer(question, answer)
      } catch (error) {
        console.error("Error getting answer:", error)

        // Display fallback answer
        const fallbackAnswer = {
          answer:
            "I couldn't find a specific answer to your question in the document. Please try rephrasing your question or ask something else about the document content.",
          score: 0,
          start: 0,
          end: 0,
          context: "No specific context found.",
        }

        displayAnswer(question, fallbackAnswer)
      } finally {
        // Hide loading state
        answersLoading.style.display = "none"
        answersList.style.display = "block"
      }
    })
  }

  // Handle file select
  async function handleFileSelect(file) {
    if (!file) return

    // Update document info
    documentInfo.textContent = `${file.name} (${formatFileSize(file.size)})`

    // Store current document
    currentDocument = file

    try {
      // Process document based on file type
      if (file.type === "application/pdf") {
        await processPdfDocument(file)
      } else if (file.type === "text/plain") {
        await processTextDocument(file)
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        // For DOCX files, we'll just show a message that we're extracting text
        // In a real app, you'd use a library like mammoth.js to extract text from DOCX
        documentViewer.innerHTML = "<p>Extracting text from DOCX file...</p>"

        // Simulate text extraction
        setTimeout(() => {
          documentViewer.innerHTML =
            "<p>This is simulated text extracted from the DOCX file. In a real application, you would use a library like mammoth.js to extract the actual text content.</p>"
          currentDocumentText =
            "This is simulated text extracted from the DOCX file. In a real application, you would use a library like mammoth.js to extract the actual text content."

          // Enable question input and ask button
          questionInput.disabled = false
          askBtn.disabled = false
        }, 1500)
      } else {
        throw new Error("Unsupported file type")
      }

      // Show document preview
      uploadArea.style.display = "none"
      documentPreview.style.display = "flex"
    } catch (error) {
      console.error("Error processing document:", error)
      alert(`Error processing document: ${error.message}`)

      // Reset UI
      resetUI()
    }
  }

  // Process PDF document
  async function processPdfDocument(file) {
    try {
      // Read file as array buffer
      const arrayBuffer = await readFileAsArrayBuffer(file)

      // Load PDF document
      pdfDocument = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      // Update total pages
      totalPages = pdfDocument.numPages

      // Update page info
      pageInfo.textContent = `Page ${currentPage} of ${totalPages}`

      // Render first page
      await renderPdfPage(currentPage)

      // Extract text from all pages
      currentDocumentText = await extractTextFromPdf(pdfDocument)

      // Enable question input and ask button
      questionInput.disabled = false
      askBtn.disabled = false
    } catch (error) {
      console.error("Error processing PDF:", error)
      throw new Error("Failed to process PDF document")
    }
  }

  // Process text document
  async function processTextDocument(file) {
    try {
      // Read file as text
      const text = await readFileAsText(file)

      // Display text in viewer
      documentViewer.innerHTML = `<pre style="white-space: pre-wrap; font-family: inherit;">${escapeHtml(text)}</pre>`

      // Store document text
      currentDocumentText = text

      // Set total pages to 1
      totalPages = 1

      // Update page info
      pageInfo.textContent = `Page 1 of 1`

      // Disable pagination buttons
      prevPageBtn.disabled = true
      nextPageBtn.disabled = true

      // Enable question input and ask button
      questionInput.disabled = false
      askBtn.disabled = false
    } catch (error) {
      console.error("Error processing text document:", error)
      throw new Error("Failed to process text document")
    }
  }

  // Render PDF page
  async function renderPdfPage(pageNumber) {
    if (!pdfDocument) return

    try {
      // Get page
      const page = await pdfDocument.getPage(pageNumber)

      // Calculate scale to fit page in viewer
      const viewport = page.getViewport({ scale: 1 })
      const viewerWidth = documentViewer.clientWidth - 40 // Subtract padding
      const scale = viewerWidth / viewport.width
      const scaledViewport = page.getViewport({ scale })

      // Create canvas
      const canvas = document.createElement("canvas")
      const context = canvas.getContext("2d")
      canvas.width = scaledViewport.width
      canvas.height = scaledViewport.height

      // Clear viewer
      documentViewer.innerHTML = ""
      documentViewer.appendChild(canvas)

      // Render page
      await page.render({
        canvasContext: context,
        viewport: scaledViewport,
      }).promise

      // Update pagination buttons
      prevPageBtn.disabled = pageNumber <= 1
      nextPageBtn.disabled = pageNumber >= totalPages

      // Add event listeners to pagination buttons
      prevPageBtn.onclick = () => {
        if (currentPage > 1) {
          currentPage--
          renderPdfPage(currentPage)
          pageInfo.textContent = `Page ${currentPage} of ${totalPages}`
        }
      }

      nextPageBtn.onclick = () => {
        if (currentPage < totalPages) {
          currentPage++
          renderPdfPage(currentPage)
          pageInfo.textContent = `Page ${currentPage} of ${totalPages}`
        }
      }
    } catch (error) {
      console.error("Error rendering PDF page:", error)
      documentViewer.innerHTML = "<p>Error rendering PDF page. Please try again.</p>"
    }
  }

  // Extract text from PDF
  async function extractTextFromPdf(pdfDoc) {
    let fullText = ""

    // Loop through all pages
    for (let i = 1; i <= pdfDoc.numPages; i++) {
      // Get page
      const page = await pdfDoc.getPage(i)

      // Get text content
      const textContent = await page.getTextContent()

      // Extract text
      const pageText = textContent.items.map((item) => item.str).join(" ")

      // Add page number and text to full text
      fullText += `[Page ${i}] ${pageText}\n\n`
    }

    return fullText
  }

  // Get answer from Hugging Face API
  async function getAnswerFromHuggingFace(question, context) {
    try {
      // Prepare request
      const response = await fetch(`${HF_API_URL}/${QA_MODEL}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HF_API_TOKEN}`,
        },
        body: JSON.stringify({
          inputs: {
            question: question,
            context: context.substring(0, 10000), // Limit context to 10,000 characters to avoid API limits
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      // Parse response
      const data = await response.json()

      // If API returns an error or unexpected format, throw error
      if (!data || !data.answer) {
        throw new Error("Invalid response from API")
      }

      return data
    } catch (error) {
      console.error("Error calling Hugging Face API:", error)

      // Try fallback approach with local processing
      return processQuestionLocally(question, context)
    }
  }

  // Process question locally (fallback)
  function processQuestionLocally(question, context) {
    // Simple keyword matching approach
    const keywords = question
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !isStopWord(word))

    // Find paragraph with most keyword matches
    const paragraphs = context.split(/\n\n+/)
    let bestParagraph = ""
    let bestScore = 0

    paragraphs.forEach((paragraph) => {
      const paraLower = paragraph.toLowerCase()
      let score = 0

      keywords.forEach((keyword) => {
        if (paraLower.includes(keyword)) {
          score += 1
        }
      })

      if (score > bestScore) {
        bestScore = score
        bestParagraph = paragraph
      }
    })

    // Extract a sentence that might contain the answer
    const sentences = bestParagraph.split(/[.!?]+/)
    let bestSentence = ""
    let bestSentenceScore = 0

    sentences.forEach((sentence) => {
      if (sentence.trim().length === 0) return

      const sentenceLower = sentence.toLowerCase()
      let score = 0

      keywords.forEach((keyword) => {
        if (sentenceLower.includes(keyword)) {
          score += 1
        }
      })

      if (score > bestSentenceScore) {
        bestSentenceScore = score
        bestSentence = sentence.trim()
      }
    })

    // Construct a response
    return {
      answer: bestSentence || "I couldn't find a specific answer to your question in the document.",
      score: bestScore / keywords.length,
      context: bestParagraph,
    }
  }

  // Display answer
  function displayAnswer(question, answer) {
    // Create answer item
    const answerItem = document.createElement("div")
    answerItem.className = "answer-item"

    // Extract page number from context if available
    const pageMatch = answer.context ? answer.context.match(/\[Page (\d+)\]/) : null
    const pageNumber = pageMatch ? pageMatch[1] : "unknown"

    // Format answer HTML
    answerItem.innerHTML = `
      <div class="answer-question">
        <div class="answer-question-icon">Q</div>
        <div class="answer-question-text">${escapeHtml(question)}</div>
      </div>
      <div class="answer-response">
        <div class="answer-response-icon">A</div>
        <div class="answer-response-text">
          <p>${escapeHtml(answer.answer)}</p>
        </div>
      </div>
      <div class="answer-references">
        <h4>References</h4>
        <div class="reference-item">
          <div class="reference-page">Page ${pageNumber}</div>
          <div class="reference-text">${escapeHtml(truncateText(answer.context, 200))}</div>
        </div>
      </div>
    `

    // Add to answers list
    answersList.insertBefore(answerItem, answersList.firstChild)

    // Hide placeholder
    answersPlaceholder.style.display = "none"

    // Add to question history
    questionHistory.push({
      question,
      answer,
      timestamp: new Date(),
    })

    // Clear question input
    questionInput.value = ""
  }

  // Reset UI
  function resetUI() {
    // Reset file input
    documentUpload.value = ""

    // Reset document info
    documentInfo.textContent = "No document uploaded"

    // Show upload area
    uploadArea.style.display = "flex"

    // Hide document preview
    documentPreview.style.display = "none"

    // Clear document viewer
    documentViewer.innerHTML = ""

    // Reset pagination
    currentPage = 1
    totalPages = 1
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`

    // Reset document variables
    currentDocument = null
    currentDocumentText = ""
    pdfDocument = null

    // Disable question input and ask button
    questionInput.disabled = true
    askBtn.disabled = true

    // Clear question input
    questionInput.value = ""

    // Show answers placeholder
    answersPlaceholder.style.display = "flex"

    // Hide answers loading
    answersLoading.style.display = "none"

    // Clear answers list
    answersList.innerHTML = ""
    answersList.style.display = "none"
  }

  // Utility functions
  function readFileAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
    })
  }

  function readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " bytes"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  function escapeHtml(text) {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  function truncateText(text, maxLength) {
    if (!text) return ""
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  function isStopWord(word) {
    const stopWords = [
      "the",
      "and",
      "that",
      "have",
      "for",
      "not",
      "with",
      "you",
      "this",
      "but",
      "his",
      "her",
      "she",
      "they",
      "their",
      "them",
      "some",
      "will",
      "what",
      "when",
      "why",
      "how",
      "all",
      "any",
      "both",
      "each",
      "few",
      "more",
      "most",
      "other",
      "some",
      "such",
      "than",
      "too",
      "very",
      "can",
      "just",
      "should",
      "now",
    ]
    return stopWords.includes(word)
  }

  // Drag and drop functionality
  if (uploadArea) {
    // Prevent default behavior to allow drop
    ;["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, preventDefaults, false)
      document.body.addEventListener(eventName, preventDefaults, false)
    })

    function preventDefaults(e) {
      e.preventDefault()
      e.stopPropagation()
    }
    // Highlight drop area when item is dragged over it
    ;["dragenter", "dragover"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, highlight, false)
    })
    ;["dragleave", "drop"].forEach((eventName) => {
      uploadArea.addEventListener(eventName, unhighlight, false)
    })

    function highlight() {
      uploadArea.classList.add("drag-over")
    }

    function unhighlight() {
      uploadArea.classList.remove("drag-over")
    }

    // Handle dropped files
    uploadArea.addEventListener("drop", handleDrop, false)

    function handleDrop(e) {
      const dt = e.dataTransfer
      const files = dt.files

      if (files.length > 0) {
        handleFileSelect(files[0])
      }
    }
  }

  // Initialize UI
  resetUI()
})

