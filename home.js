document.addEventListener("DOMContentLoaded", () => {
  // Profile dropdown toggle
  const profileBtn = document.getElementById("profileBtn")
  const profileDropdown = document.getElementById("profileDropdown")

  if (profileBtn && profileDropdown) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      profileDropdown.classList.toggle("active")
    })

    document.addEventListener("click", (e) => {
      if (!profileDropdown.contains(e.target) && e.target !== profileBtn) {
        profileDropdown.classList.remove("active")
      }
    })
  }



  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobileMenuBtn")
  const closeMenuBtn = document.getElementById("closeMenuBtn")
  const mobileMenu = document.getElementById("mobileMenu")

  if (mobileMenuBtn && closeMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.add("active")
      document.body.style.overflow = "hidden"
    })

    closeMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.remove("active")
      document.body.style.overflow = ""
    })
  }

  // Sticky header
  const header = document.querySelector(".header")
  let lastScrollTop = 0

  window.addEventListener("scroll", () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop

    if (scrollTop > 50) {
      header.style.boxShadow = "var(--shadow-md)"
    } else {
      header.style.boxShadow = "none"
    }

    lastScrollTop = scrollTop
  })

  // Project cards hover effect
  const projectCards = document.querySelectorAll(".project-card")

  projectCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)"
      this.style.boxShadow = "var(--shadow-md)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = ""
      this.style.boxShadow = ""
    })
  })

  // Model cards hover effect
  const modelCards = document.querySelectorAll(".model-card")

  modelCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-5px)"
      this.style.boxShadow = "var(--shadow-md)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = ""
      this.style.boxShadow = ""
    })
  })

  // Animate stats on scroll
  const statNumbers = document.querySelectorAll(".stat-info h3")
  let animated = false

  function animateStats() {
    if (animated) return

    const statsSection = document.querySelector(".quick-stats")
    const statsSectionTop = statsSection.getBoundingClientRect().top
    const windowHeight = window.innerHeight

    if (statsSectionTop < windowHeight * 0.75) {
      statNumbers.forEach((stat) => {
        const targetValue = stat.textContent
        const suffix = targetValue.replace(/[0-9.]/g, "")
        const value = Number.parseFloat(targetValue.replace(/[^0-9.]/g, ""))

        const startValue = 0
        const duration = 2000
        const startTime = performance.now()

        function updateNumber(currentTime) {
          const elapsedTime = currentTime - startTime

          if (elapsedTime < duration) {
            const progress = elapsedTime / duration
            const currentValue = Math.floor(progress * value)

            stat.textContent = currentValue + suffix
            requestAnimationFrame(updateNumber)
          } else {
            stat.textContent = targetValue
          }
        }

        requestAnimationFrame(updateNumber)
      })

      animated = true
    }
  }

  window.addEventListener("scroll", animateStats)
  animateStats() // Check on page load

  // Notifications dropdown (placeholder)
  const notificationsBtn = document.querySelector(".notifications-btn")

  if (notificationsBtn) {
    notificationsBtn.addEventListener("click", () => {
      alert("Notifications feature coming soon!")
    })
  }
})

