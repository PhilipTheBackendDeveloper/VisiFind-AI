//import { Chart } from "@/components/ui/chart"
document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const textInput = document.getElementById("textInput")
  const wordCount = document.getElementById("wordCount")
  const charCount = document.getElementById("charCount")
  const analyzeBtn = document.getElementById("analyzeBtn")
  const clearBtn = document.getElementById("clearBtn")
  const pasteBtn = document.getElementById("pasteBtn")
  const sampleBtn = document.getElementById("sampleBtn")
  const resultsLoading = document.getElementById("resultsLoading")
  const resultsContent = document.getElementById("resultsContent")
  const tabButtons = document.querySelectorAll(".tab-btn")
  const tabContents = document.querySelectorAll(".tab-content")
  const menuToggle = document.getElementById("menuToggle")
  const sidebar = document.querySelector(".sidebar")
  const helpBtn = document.getElementById("helpBtn")
  const helpModal = document.getElementById("helpModal")
  const closeModal = document.getElementById("closeModal")

  // RapidAPI Configuration
  const rapidApiKey = "1d8e3cf06bmsh253002a7fce8ce6p1559b5jsn1f776a063c39"
  const rapidApiHost = "rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com"
  const rapidApiUrl = "https://rewriter-paraphraser-text-changer-multi-language.p.rapidapi.com/api/rewrite-light"

  // Sample texts for demo
  const sampleTexts = [
    `Artificial Intelligence (AI) has transformed industries worldwide, revolutionizing how businesses operate and people interact with technology. From healthcare to finance, AI-powered solutions enhance efficiency, accuracy, and decision-making processes. Machine learning algorithms analyze vast datasets to identify patterns and make predictions, while natural language processing enables computers to understand and generate human language. Despite these advancements, ethical concerns about privacy, bias, and job displacement remain significant challenges. As AI continues to evolve, striking a balance between innovation and responsible implementation will be crucial for maximizing its benefits while minimizing potential risks.`,

    `Customer reviews for the new XPhone 15 have been overwhelmingly positive. Users praise its sleek design, impressive battery life, and powerful camera system. The improved processor delivers exceptional performance for gaming and multitasking. However, some customers have expressed frustration with the high price point and the removal of the headphone jack. The facial recognition feature has received mixed feedback, with some users reporting occasional recognition issues in low light conditions. Despite these minor complaints, the XPhone 15 has achieved a 4.7/5 star rating across major retail platforms, solidifying its position as a market leader in premium smartphones.`,

    `Climate change poses an unprecedented threat to global ecosystems and human societies. Rising temperatures have accelerated glacial melting, contributing to sea level rise that endangers coastal communities worldwide. Extreme weather events, including hurricanes, droughts, and wildfires, have increased in frequency and intensity, causing billions in damages and displacing vulnerable populations. Scientists warn that without immediate and substantial reductions in greenhouse gas emissions, we risk triggering irreversible climate tipping points. International cooperation through agreements like the Paris Climate Accord represents a crucial step toward addressing this crisis, but implementation challenges and political resistance continue to impede progress.`,
  ]

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

  // Update word and character count
  textInput.addEventListener("input", updateTextStats)

  function updateTextStats() {
    const text = textInput.value.trim()
    const words = text ? text.split(/\s+/).length : 0
    const chars = text.length

    wordCount.textContent = `${words} word${words !== 1 ? "s" : ""}`
    charCount.textContent = `${chars} character${chars !== 1 ? "s" : ""}`
  }

  // Paste from clipboard
  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText()
      textInput.value = text
      updateTextStats()
    } catch (err) {
      console.error("Failed to read clipboard:", err)
      alert("Unable to access clipboard. Please paste manually.")
    }
  })

  // Load sample text
  sampleBtn.addEventListener("click", () => {
    // Randomly select a sample text
    const randomIndex = Math.floor(Math.random() * sampleTexts.length)
    textInput.value = sampleTexts[randomIndex]
    updateTextStats()
  })

  // Clear text
  clearBtn.addEventListener("click", () => {
    textInput.value = ""
    updateTextStats()
    resultsContent.style.display = "none"
  })

  // Tab switching
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabButtons.forEach((btn) => btn.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked button and corresponding content
      button.classList.add("active")
      const tabId = button.getAttribute("data-tab")
      document.getElementById(`${tabId}Tab`).classList.add("active")
    })
  })

  // Analyze text
  analyzeBtn.addEventListener("click", async () => {
    const text = textInput.value.trim()

    if (!text) {
      alert("Please enter some text to analyze.")
      return
    }

    // Get selected analysis types
    const analyzeTopic = document.getElementById("topicCheckbox").checked
    const analyzeSentiment = document.getElementById("sentimentCheckbox").checked
    const analyzeEntity = document.getElementById("entityCheckbox").checked
    const analyzeKeyword = document.getElementById("keywordCheckbox").checked
    const language = document.getElementById("languageSelect").value

    // Show loading state
    resultsLoading.style.display = "flex"
    resultsContent.style.display = "none"

    try {
      // Analyze text using RapidAPI
      const results = await analyzeWithRapidAPI(text, language)

      // Display results
      displayResults(results)
    } catch (error) {
      console.error("Error analyzing text:", error)
      alert("An error occurred while analyzing the text. Please try again.")
    } finally {
      // Hide loading, show results
      resultsLoading.style.display = "none"
      resultsContent.style.display = "block"
    }
  })

  // Analyze text with RapidAPI
  async function analyzeWithRapidAPI(text, language) {
    try {
      // Call the RapidAPI endpoint for text analysis
      const response = await fetch(rapidApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-RapidAPI-Key": rapidApiKey,
          "X-RapidAPI-Host": rapidApiHost,
        },
        body: JSON.stringify({
          text: text,
          language: language,
          strength: 3,
          uniqueness: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const apiData = await response.json()

      // Process API response into our format
      return processApiResponse(apiData, text)
    } catch (error) {
      console.error("API error:", error)
      // Fallback to local analysis if API fails
      console.log("Falling back to local analysis")
      return performLocalAnalysis(text)
    }
  }

  // Process API response into our format
  function processApiResponse(apiData, originalText) {
    // Extract sentiment from rewritten text
    let sentimentScore = 0
    let sentimentLabel = "neutral"

    // If API returned rewritten content, compare it to original to derive sentiment
    if (apiData && apiData.rewrite) {
      // Count positive and negative words in the rewritten text
      const positivePattern =
        /\b(good|great|excellent|amazing|wonderful|fantastic|happy|pleased|delighted|satisfied|impressive|positive|benefit|beneficial|advantage|success|successful|improve|improvement|enhanced|love|like|enjoy|praise|innovative)\b/gi
      const negativePattern =
        /\b(bad|terrible|awful|horrible|poor|disappointing|unhappy|displeased|dissatisfied|negative|problem|issue|concern|fail|failure|worsen|worse|worst|difficult|challenge|hate|dislike|criticize|criticism)\b/gi

      const positiveMatches = (apiData.rewrite.match(positivePattern) || []).length
      const negativeMatches = (apiData.rewrite.match(negativePattern) || []).length

      // Calculate sentiment score (-1 to 1)
      const totalMatches = positiveMatches + negativeMatches
      if (totalMatches > 0) {
        sentimentScore = (positiveMatches - negativeMatches) / totalMatches
      }

      // Determine sentiment label
      if (sentimentScore > 0.2) sentimentLabel = "positive"
      else if (sentimentScore < -0.2) sentimentLabel = "negative"
    }

    // Extract entities (names, places, etc.) from the text
    const entities = extractEntities(originalText)

    // Extract keywords from rewritten text
    const keywords = extractKeywords(apiData.rewrite || originalText)

    // Extract topics
    const topics = identifyTopics(originalText)

    // Text statistics
    const stats = getTextStatistics(originalText)

    // Create sentiment analysis details
    const sentimentDetails = createSentimentDetails(originalText, sentimentLabel, sentimentScore)

    return {
      topics: topics,
      sentiment: {
        score: sentimentScore,
        label: sentimentLabel,
        highlights: sentimentDetails.highlights,
        emotions: sentimentDetails.emotions,
      },
      entities: entities,
      keywords: keywords,
      stats: stats,
      rewrittenText: apiData.rewrite || "",
    }
  }

  // Create sentiment details
  function createSentimentDetails(text, sentimentLabel, sentimentScore) {
    // Find sentiment highlights (sentences with strong sentiment)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const highlights = []

    // Positive and negative word lists for identifying highlights
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "happy",
      "pleased",
      "delighted",
      "satisfied",
      "impressive",
      "positive",
      "benefit",
      "beneficial",
      "advantage",
      "success",
      "successful",
      "improve",
      "improvement",
      "enhanced",
      "love",
      "like",
      "enjoy",
    ]

    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "poor",
      "disappointing",
      "unhappy",
      "displeased",
      "dissatisfied",
      "negative",
      "problem",
      "issue",
      "concern",
      "fail",
      "failure",
      "worsen",
      "worse",
      "worst",
      "difficult",
      "challenge",
      "hate",
      "dislike",
      "criticize",
      "criticism",
    ]

    sentences.forEach((sentence) => {
      const lowerSentence = sentence.toLowerCase()
      let posCount = 0
      let negCount = 0

      positiveWords.forEach((word) => {
        if (lowerSentence.includes(word)) posCount++
      })

      negativeWords.forEach((word) => {
        if (lowerSentence.includes(word)) negCount++
      })

      if (posCount > 1 && posCount > negCount) {
        highlights.push({
          text: sentence.trim(),
          type: "positive",
        })
      } else if (negCount > 1 && negCount > posCount) {
        highlights.push({
          text: sentence.trim(),
          type: "negative",
        })
      }
    })

    // Limit to top 3 highlights
    highlights.splice(3)

    // Calculate emotion scores
    const emotions = {
      joy: Math.min(100, Math.max(0, Math.floor(50 + sentimentScore * 50 + Math.random() * 20 - 10))),
      sadness: Math.min(100, Math.max(0, Math.floor(50 - sentimentScore * 40 + Math.random() * 20 - 10))),
      anger: Math.min(100, Math.max(0, Math.floor(30 - sentimentScore * 30 + Math.random() * 15 - 7.5))),
      fear: Math.min(100, Math.max(0, Math.floor(20 - sentimentScore * 10 + Math.random() * 15 - 7.5))),
      surprise: Math.min(100, Math.max(0, Math.floor(30 + Math.random() * 20 - 10))),
    }

    return {
      highlights,
      emotions,
    }
  }

  // Extract entities from text
  function extractEntities(text) {
    const entities = []

    // Person names (simplified pattern)
    const personPattern = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g
    let match

    while ((match = personPattern.exec(text)) !== null) {
      // Skip common non-name capitalized phrases
      const skipWords = ["United States", "New York", "Machine Learning", "Artificial Intelligence"]
      if (skipWords.includes(match[0])) continue

      entities.push({
        text: match[0],
        type: "person",
        mentions: 1,
      })
    }

    // Organizations
    const organizations = [
      "Google",
      "Apple",
      "Microsoft",
      "Amazon",
      "Facebook",
      "Twitter",
      "IBM",
      "Intel",
      "Samsung",
      "Sony",
      "NASA",
      "FBI",
      "CIA",
      "WHO",
      "United Nations",
      "World Bank",
      "Tesla",
      "SpaceX",
      "Netflix",
    ]

    organizations.forEach((org) => {
      if (text.includes(org)) {
        entities.push({
          text: org,
          type: "organization",
          mentions: countOccurrences(text, org),
        })
      }
    })

    // Locations
    const locations = [
      "New York",
      "London",
      "Paris",
      "Tokyo",
      "Beijing",
      "Moscow",
      "Berlin",
      "Rome",
      "Madrid",
      "Los Angeles",
      "Chicago",
      "Toronto",
      "Sydney",
      "United States",
      "China",
      "Russia",
      "India",
      "Brazil",
      "Canada",
      "Europe",
      "Asia",
      "Africa",
      "Australia",
    ]

    locations.forEach((location) => {
      if (text.includes(location)) {
        entities.push({
          text: location,
          type: "location",
          mentions: countOccurrences(text, location),
        })
      }
    })

    // Dates (simplified)
    const datePattern =
      /\b(January|February|March|April|May|June|July|August|September|October|November|December) \d{1,2}(st|nd|rd|th)?(,)? \d{4}\b/g
    while ((match = datePattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: "date",
        mentions: 1,
      })
    }

    // Merge duplicate entities and count mentions
    const mergedEntities = []
    entities.forEach((entity) => {
      const existingEntity = mergedEntities.find(
        (e) => e.text.toLowerCase() === entity.text.toLowerCase() && e.type === entity.type,
      )

      if (existingEntity) {
        existingEntity.mentions += entity.mentions
      } else {
        mergedEntities.push(entity)
      }
    })

    // Sort by mentions
    return mergedEntities.sort((a, b) => b.mentions - a.mentions)
  }

  // Extract keywords from text
  function extractKeywords(text) {
    // Split text into words
    const words = text.toLowerCase().match(/\b(\w+)\b/g) || []

    // Count word frequencies
    const wordFreq = {}
    words.forEach((word) => {
      // Skip short words and common stop words
      if (word.length <= 2) return
      if (isStopWord(word)) return

      wordFreq[word] = (wordFreq[word] || 0) + 1
    })

    // Convert to array and sort by frequency
    const keywords = Object.entries(wordFreq)
      .map(([word, count]) => ({
        text: word,
        score: count,
        relevance: 0, // Will be calculated below
      }))
      .sort((a, b) => b.score - a.score)

    // Calculate relevance score (0-100)
    const maxScore = keywords.length > 0 ? keywords[0].score : 1
    keywords.forEach((keyword) => {
      keyword.relevance = Math.floor((keyword.score / maxScore) * 100)
    })

    // Return top 20 keywords
    return keywords.slice(0, 20)
  }

  // Identify topics from text
  function identifyTopics(text) {
    const topics = []

    // Technology-related keywords
    if (
      /\b(AI|artificial intelligence|machine learning|technology|digital|computer|software|hardware|algorithm|data)\b/i.test(
        text,
      )
    ) {
      topics.push({
        name: "Technology",
        confidence: Math.floor(70 + Math.random() * 25),
      })
    }

    // Business-related keywords
    if (/\b(business|company|market|industry|economic|finance|investment|profit|revenue|customer)\b/i.test(text)) {
      topics.push({
        name: "Business",
        confidence: Math.floor(70 + Math.random() * 25),
      })
    }

    // Environment-related keywords
    if (
      /\b(climate|environment|sustainable|green|pollution|carbon|emission|renewable|ecosystem|conservation)\b/i.test(
        text,
      )
    ) {
      topics.push({
        name: "Environment",
        confidence: Math.floor(70 + Math.random() * 25),
      })
    }

    // Health-related keywords
    if (/\b(health|medical|doctor|patient|disease|treatment|hospital|medicine|wellness|healthcare)\b/i.test(text)) {
      topics.push({
        name: "Health",
        confidence: Math.floor(70 + Math.random() * 25),
      })
    }

    // Politics-related keywords
    if (
      /\b(politics|government|policy|election|president|congress|law|legislation|political|democracy)\b/i.test(text)
    ) {
      topics.push({
        name: "Politics",
        confidence: Math.floor(70 + Math.random() * 25),
      })
    }

    // Education-related keywords
    if (/\b(education|school|university|student|teacher|learning|academic|course|study|knowledge)\b/i.test(text)) {
      topics.push({
        name: "Education",
        confidence: Math.floor(70 + Math.random() * 25),
      })
    }

    // If no topics detected, add a generic one
    if (topics.length === 0) {
      topics.push({
        name: "General",
        confidence: Math.floor(60 + Math.random() * 20),
      })
    }

    // Sort by confidence
    return topics.sort((a, b) => b.confidence - a.confidence)
  }

  // Helper function to count occurrences
  function countOccurrences(text, word) {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    return (text.match(regex) || []).length
  }

  // Common English stop words
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

  // Get text statistics
  function getTextStatistics(text) {
    // Word count
    const words = text.trim().split(/\s+/).length

    // Character count
    const chars = text.length

    // Sentence count
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length

    // Average word length
    const wordList = text.match(/\b(\w+)\b/g) || []
    const totalWordLength = wordList.reduce((sum, word) => sum + word.length, 0)
    const avgWordLength = wordList.length > 0 ? (totalWordLength / wordList.length).toFixed(1) : 0

    // Average sentence length
    const avgSentenceLength = sentences > 0 ? Math.round(words / sentences) : 0

    // Reading time (average reading speed: 200 words per minute)
    const readingTimeMinutes = words / 200
    let readingTime
    if (readingTimeMinutes < 1) {
      readingTime = `${Math.ceil(readingTimeMinutes * 60)} seconds`
    } else {
      const minutes = Math.floor(readingTimeMinutes)
      const seconds = Math.ceil((readingTimeMinutes - minutes) * 60)
      readingTime = `${minutes} min${minutes !== 1 ? "s" : ""} ${seconds} sec${seconds !== 1 ? "s" : ""}`
    }

    return {
      wordCount: words,
      charCount: chars,
      sentenceCount: sentences,
      avgWordLength,
      avgSentenceLength,
      readingTime,
    }
  }

  // Fallback local analysis
  function performLocalAnalysis(text) {
    return {
      topics: identifyTopics(text),
      sentiment: analyzeSentiment(text),
      entities: extractEntities(text),
      keywords: extractKeywords(text),
      stats: getTextStatistics(text),
      rewrittenText: "",
    }
  }

  // Local sentiment analysis
  function analyzeSentiment(text) {
    // Positive and negative word lists
    const positiveWords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "fantastic",
      "happy",
      "pleased",
      "delighted",
      "satisfied",
      "impressive",
      "positive",
      "benefit",
      "beneficial",
      "advantage",
      "success",
      "successful",
      "improve",
      "improvement",
      "enhanced",
      "love",
      "like",
      "enjoy",
    ]

    const negativeWords = [
      "bad",
      "terrible",
      "awful",
      "horrible",
      "poor",
      "disappointing",
      "unhappy",
      "displeased",
      "dissatisfied",
      "negative",
      "problem",
      "issue",
      "concern",
      "fail",
      "failure",
      "worsen",
      "worse",
      "worst",
      "difficult",
      "challenge",
      "hate",
      "dislike",
      "criticize",
      "criticism",
    ]

    // Count positive and negative words
    let positiveCount = 0
    let negativeCount = 0

    // Convert text to lowercase and split into words
    const words = text.toLowerCase().match(/\b(\w+)\b/g) || []

    words.forEach((word) => {
      if (positiveWords.includes(word)) positiveCount++
      if (negativeWords.includes(word)) negativeCount++
    })

    // Calculate sentiment score (-1 to 1)
    const totalSentimentWords = positiveCount + negativeCount
    let sentimentScore = 0

    if (totalSentimentWords > 0) {
      sentimentScore = (positiveCount - negativeCount) / totalSentimentWords
    }

    // Determine sentiment label
    let sentiment = "neutral"
    if (sentimentScore > 0.2) sentiment = "positive"
    else if (sentimentScore < -0.2) sentiment = "negative"

    const sentimentDetails = createSentimentDetails(text, sentiment, sentimentScore)

    return {
      score: sentimentScore,
      label: sentiment,
      highlights: sentimentDetails.highlights,
      emotions: sentimentDetails.emotions,
    }
  }

  // Display results
  function displayResults(results) {
    // Summary tab
    displayTopics(results.topics)
    displaySentimentSummary(results.sentiment)
    displayEntitiesSummary(results.entities)
    displayTextStatistics(results.stats)

    // Sentiment tab
    if (results.sentiment) {
      displaySentimentDetails(results.sentiment)
      createEmotionChart(results.sentiment.emotions)
    }

    // Entities tab
    if (results.entities.length > 0) {
      displayEntitiesList(results.entities)
      createEntityTypeChart(results.entities)
    }

    // Keywords tab
    if (results.keywords.length > 0) {
      displayKeywordsList(results.keywords)
      createWordCloud(results.keywords)
    }

    // Display rewritten text if available
    if (results.rewrittenText) {
      displayRewrittenText(results.rewrittenText)
    }
  }

  // Display rewritten text
  function displayRewrittenText(rewrittenText) {
    // Check if rewritten tab exists, if not create it
    if (!document.getElementById("rewrittenTab")) {
      // Create tab button
      const tabBtn = document.createElement("button")
      tabBtn.className = "tab-btn"
      tabBtn.setAttribute("data-tab", "rewritten")
      tabBtn.textContent = "Rewritten Text"

      // Add event listener to the new tab button
      tabBtn.addEventListener("click", () => {
        // Remove active class from all buttons and contents
        tabButtons.forEach((btn) => btn.classList.remove("active"))
        tabContents.forEach((content) => content.classList.remove("active"))

        // Add active class to this button and its content
        tabBtn.classList.add("active")
        document.getElementById("rewrittenTab").classList.add("active")
      })

      // Add the tab button to the tab bar
      document.querySelector(".results-tabs").appendChild(tabBtn)

      // Create tab content
      const tabContent = document.createElement("div")
      tabContent.className = "tab-content"
      tabContent.id = "rewrittenTab"

      // Add the tab content to the results
      document.querySelector(".results-content").appendChild(tabContent)
    }

    // Update the rewritten text tab content
    const rewrittenTab = document.getElementById("rewrittenTab")
    rewrittenTab.innerHTML = `
      <div class="rewritten-text-container">
        <h3>Rewritten Version</h3>
        <div class="rewritten-text">
          <p>${rewrittenText}</p>
        </div>
        <div class="rewritten-actions">
          <button class="btn btn-sm btn-outline copy-btn" id="copyRewrittenBtn">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            Copy to Clipboard
          </button>
        </div>
      </div>
    `

    // Add event listener to the copy button
    document.getElementById("copyRewrittenBtn").addEventListener("click", () => {
      navigator.clipboard
        .writeText(rewrittenText)
        .then(() => {
          // Change button text temporarily
          const copyBtn = document.getElementById("copyRewrittenBtn")
          const originalText = copyBtn.innerHTML
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            Copied!
          `

          // Reset button text after 2 seconds
          setTimeout(() => {
            copyBtn.innerHTML = originalText
          }, 2000)
        })
        .catch((err) => {
          console.error("Failed to copy text:", err)
          alert("Failed to copy text to clipboard. Please copy manually.")
        })
    })
  }

  // Display topics in summary tab
  function displayTopics(topics) {
    const topicsList = document.getElementById("topicsList")
    topicsList.innerHTML = ""

    if (topics.length === 0) {
      topicsList.innerHTML = "<p>No topics detected.</p>"
      return
    }

    topics.forEach((topic) => {
      const topicTag = document.createElement("div")
      topicTag.className = "topic-tag"
      topicTag.innerHTML = `
        ${topic.name}
        <span class="confidence">${topic.confidence}%</span>
      `
      topicsList.appendChild(topicTag)
    })
  }

  // Display sentiment summary
  function displaySentimentSummary(sentiment) {
    const sentimentSummary = document.getElementById("sentimentSummary")

    if (!sentiment) {
      sentimentSummary.innerHTML = "<p>No sentiment analysis performed.</p>"
      return
    }

    const sentimentIcon = {
      positive:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
      negative:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="15" x2="16" y2="15"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
      neutral:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="8" y1="12" x2="16" y2="12"></line><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>',
    }

    // Convert score from -1...1 to 0...100 for display
    const displayScore = Math.round((sentiment.score + 1) * 50)

    sentimentSummary.innerHTML = `
      <div class="sentiment-indicator">
        <div class="sentiment-icon ${sentiment.label}">
          ${sentimentIcon[sentiment.label]}
        </div>
        <div class="sentiment-text ${sentiment.label}">
          ${sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}
        </div>
      </div>
      <div class="sentiment-score-bar">
        <div class="sentiment-score-fill" style="width: ${displayScore}%"></div>
      </div>
      <p>Score: ${displayScore}/100</p>
    `
  }

  // Display entities summary
  function displayEntitiesSummary(entities) {
    const entitiesSummary = document.getElementById("entitiesSummary")

    if (entities.length === 0) {
      entitiesSummary.innerHTML = "<p>No entities detected.</p>"
      return
    }

    // Display top 5 entities
    const topEntities = entities.slice(0, 5)

    entitiesSummary.innerHTML = ""
    topEntities.forEach((entity) => {
      const entityItem = document.createElement("div")
      entityItem.className = "entity-item"
      entityItem.innerHTML = `
        <span class="entity-badge ${entity.type}">${entity.type}</span>
        <span class="entity-name">${entity.text}</span>
      `
      entitiesSummary.appendChild(entityItem)
    })
  }

  // Display text statistics
  function displayTextStatistics(stats) {
    const textStatistics = document.getElementById("textStatistics")

    textStatistics.innerHTML = `
      <div class="stat-item">
        <div class="stat-value">${stats.wordCount}</div>
        <div class="stat-label">Words</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.sentenceCount}</div>
        <div class="stat-label">Sentences</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.avgWordLength}</div>
        <div class="stat-label">Avg. Word Length</div>
      </div>
      <div class="stat-item">
        <div class="stat-value">${stats.avgSentenceLength}</div>
        <div class="stat-label">Avg. Sentence Length</div>
      </div>
      <div class="stat-item" style="grid-column: span 2;">
        <div class="stat-value">${stats.readingTime}</div>
        <div class="stat-label">Reading Time</div>
      </div>
    `
  }

  // Display sentiment details
  function displaySentimentDetails(sentiment) {
    const sentimentMeter = document.getElementById("sentimentMeter")
    const sentimentDetails = document.getElementById("sentimentDetails")

    // Convert score from -1...1 to 0...100 for display
    const displayScore = Math.round((sentiment.score + 1) * 50)

    // Create sentiment gauge
    sentimentMeter.innerHTML = `
      <div class="sentiment-gauge">
        <div class="sentiment-gauge-bg"></div>
        <div class="sentiment-needle" style="transform: translateX(-50%) rotate(${(sentiment.score + 1) * 90 - 90}deg)"></div>
      </div>
      <div class="sentiment-value">${displayScore}/100</div>
      <div class="sentiment-label">${sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}</div>
    `

    // Display sentiment highlights
    sentimentDetails.innerHTML = ""

    if (sentiment.highlights.length === 0) {
      sentimentDetails.innerHTML = "<p>No significant sentiment highlights found.</p>"
      return
    }

    sentiment.highlights.forEach((highlight) => {
      const highlightDiv = document.createElement("div")
      highlightDiv.className = "sentiment-highlight"
      highlightDiv.innerHTML = `
        <p>"${highlight.text}"</p>
        <div class="sentiment-type ${highlight.type}">
          ${highlight.type.charAt(0).toUpperCase() + highlight.type.slice(1)} sentiment
        </div>
      `
      sentimentDetails.appendChild(highlightDiv)
    })
  }

  // Create emotion chart
  function createEmotionChart(emotions) {
    const ctx = document.getElementById("emotionChart").getContext("2d")

    // Destroy existing chart if it exists
    if (window.emotionChart) {
      window.emotionChart.destroy()
    }

    window.emotionChart = new Chart(ctx, {
      type: "radar",
      data: {
        labels: ["Joy", "Sadness", "Anger", "Fear", "Surprise"],
        datasets: [
          {
            label: "Emotion Intensity",
            data: [emotions.joy, emotions.sadness, emotions.anger, emotions.fear, emotions.surprise],
            backgroundColor: "rgba(123, 97, 255, 0.2)",
            borderColor: "rgba(123, 97, 255, 1)",
            pointBackgroundColor: "rgba(123, 97, 255, 1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(123, 97, 255, 1)",
          },
        ],
      },
      options: {
        scales: {
          r: {
            angleLines: {
              display: true,
            },
            suggestedMin: 0,
            suggestedMax: 100,
          },
        },
      },
    })
  }

  // Display entities list
  function displayEntitiesList(entities) {
    const entitiesList = document.getElementById("entitiesList")

    if (entities.length === 0) {
      entitiesList.innerHTML = "<p>No entities detected.</p>"
      return
    }

    entitiesList.innerHTML = ""
    entities.forEach((entity) => {
      const entityIcon = {
        person:
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        organization:
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        location:
          '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>',
        date: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>',
        misc: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>',
      }

      const entityCard = document.createElement("div")
      entityCard.className = "entity-card"
      entityCard.innerHTML = `
        <div class="entity-icon ${entity.type}">
          ${entityIcon[entity.type] || entityIcon.misc}
        </div>
        <div class="entity-info">
          <h5>${entity.text}</h5>
          <p>${entity.type.charAt(0).toUpperCase() + entity.type.slice(1)}</p>
        </div>
        <div class="entity-mentions">
          ${entity.mentions} mention${entity.mentions !== 1 ? "s" : ""}
        </div>
      `
      entitiesList.appendChild(entityCard)
    })
  }

  // Create entity type chart
  function createEntityTypeChart(entities) {
    const ctx = document.getElementById("entityTypeChart").getContext("2d")

    // Count entities by type
    const entityTypes = {}
    entities.forEach((entity) => {
      entityTypes[entity.type] = (entityTypes[entity.type] || 0) + 1
    })

    // Prepare data for chart
    const labels = Object.keys(entityTypes).map((type) => type.charAt(0).toUpperCase() + type.slice(1))
    const data = Object.values(entityTypes)
    const colors = {
      person: "rgba(59, 130, 246, 0.7)",
      organization: "rgba(236, 72, 153, 0.7)",
      location: "rgba(139, 92, 246, 0.7)",
      date: "rgba(245, 158, 11, 0.7)",
      misc: "rgba(100, 116, 139, 0.7)",
    }
    const backgroundColor = Object.keys(entityTypes).map((type) => colors[type] || colors.misc)

    // Destroy existing chart if it exists
    if (window.entityTypeChart) {
      window.entityTypeChart.destroy()
    }

    window.entityTypeChart = new Chart(ctx, {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: data,
            backgroundColor: backgroundColor,
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "bottom",
          },
        },
      },
    })
  }

  // Display keywords list
  function displayKeywordsList(keywords) {
    const keywordsList = document.getElementById("keywordsList")

    if (keywords.length === 0) {
      keywordsList.innerHTML = "<p>No keywords extracted.</p>"
      return
    }

    keywordsList.innerHTML = ""
    keywords.forEach((keyword) => {
      const keywordItem = document.createElement("div")
      keywordItem.className = "keyword-item"
      keywordItem.innerHTML = `
        <div class="keyword-text">${keyword.text}</div>
        <div class="keyword-score">
          <div class="keyword-score-bar">
            <div class="keyword-score-fill" style="width: ${keyword.relevance}%"></div>
          </div>
          <div class="keyword-score-value">${keyword.relevance}%</div>
        </div>
      `
      keywordsList.appendChild(keywordItem)
    })
  }

  // Create word cloud
  function createWordCloud(keywords) {
    const wordCloudContainer = document.getElementById("wordCloud")
    wordCloudContainer.innerHTML = ""

    // Prepare data for word cloud
    const words = keywords.map((keyword) => ({
      text: keyword.text,
      size: 10 + keyword.relevance / 5, // Scale size based on relevance
    }))

    // Set up D3 cloud layout
    const width = wordCloudContainer.offsetWidth
    const height = 300

    // Import D3.js library
    const d3 = window.d3
    if (typeof d3 === "undefined") {
      console.error("D3.js library is required for word cloud visualization.")
      return
    }

    const layout = d3.layout
      .cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .fontSize((d) => d.size)
      .on("end", draw)

    layout.start()

    // Draw the word cloud
    function draw(words) {
      const svg = d3
        .select("#wordCloud")
        .append("svg")
        .attr("width", layout.size()[0])
        .attr("height", layout.size()[1])
        .append("g")
        .attr("transform", `translate(${layout.size()[0] / 2},${layout.size()[1] / 2})`)

      svg
        .selectAll("text")
        .data(words)
        .enter()
        .append("text")
        .style("font-size", (d) => `${d.size}px`)
        .style("font-family", "Poppins, sans-serif")
        .style("fill", () => {
          // Random color from a gradient palette
          const colors = ["#04afff", "#4facfe", "#7b61ff", "#b47dff"]
          return colors[Math.floor(Math.random() * colors.length)]
        })
        .attr("text-anchor", "middle")
        .attr("transform", (d) => `translate(${d.x},${d.y}) rotate(${d.rotate})`)
        .text((d) => d.text)
    }
  }
})

