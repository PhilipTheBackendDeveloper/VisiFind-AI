document.addEventListener("DOMContentLoaded", () => {
  // Typewriter effect
  const typewriterElement = document.getElementById("typewriter")
  if (!typewriterElement) return

  const words = [
    "Computer Vision",
    "Natural Language Processing",
    "Generative AI",
    "Multi-Modal Models",
    "Enterprise Teams",
  ]

  let wordIndex = 0
  let charIndex = 0
  let isDeleting = false
  let typingSpeed = 100

  function type() {
    const currentWord = words[wordIndex]

    if (isDeleting) {
      // Deleting characters
      typewriterElement.textContent = currentWord.substring(0, charIndex - 1)
      charIndex--
      typingSpeed = 50 // Faster when deleting
    } else {
      // Typing characters
      typewriterElement.textContent = currentWord.substring(0, charIndex + 1)
      charIndex++
      typingSpeed = 100 // Normal typing speed
    }

    // If word is complete, pause then start deleting
    if (!isDeleting && charIndex === currentWord.length) {
      isDeleting = true
      typingSpeed = 1500 // Pause at the end of the word
    }
    // If deletion is complete, move to next word
    else if (isDeleting && charIndex === 0) {
      isDeleting = false
      wordIndex = (wordIndex + 1) % words.length
      typingSpeed = 500 // Pause before starting new word
    }

    setTimeout(type, typingSpeed)
  }

  // Start the typewriter effect
  setTimeout(type, 1000)
})

