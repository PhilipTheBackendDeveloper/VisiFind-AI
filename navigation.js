// Navigation.js - Handles navigation and user menu functionality
document.addEventListener("DOMContentLoaded", () => {
  // User menu dropdown toggle
  const userMenuBtn = document.getElementById("userMenuBtn")
  const userDropdown = document.getElementById("userDropdown")

  if (userMenuBtn && userDropdown) {
    userMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      userDropdown.classList.toggle("active")
    })

    // Close dropdown when clicking outside
    document.addEventListener("click", () => {
      userDropdown.classList.remove("active")
    })

    // Prevent dropdown from closing when clicking inside it
    userDropdown.addEventListener("click", (e) => {
      e.stopPropagation()
    })
  }

  // Logout functionality
  const logoutBtn = document.getElementById("logoutBtn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault()

      // Clear any user session data
      localStorage.removeItem("user")
      localStorage.removeItem("token")

      // Redirect to login page
      window.location.href = "login.html"
    })
  }

  // Active navigation highlighting
  const currentPage = window.location.pathname.split("/").pop()
  const navLinks = document.querySelectorAll("nav a")

  navLinks.forEach((link) => {
    const linkPage = link.getAttribute("href")
    if (linkPage === currentPage) {
      link.classList.add("active")
    } else {
      link.classList.remove("active")
    }
  })
})

