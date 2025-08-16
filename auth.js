// document.addEventListener("DOMContentLoaded", () => {
//   // Toggle password visibility
//   const togglePasswordButtons = document.querySelectorAll(".toggle-password")
//   togglePasswordButtons.forEach((button) => {
//     button.addEventListener("click", function () {
//       const passwordInput = this.previousElementSibling
//       const type = passwordInput.getAttribute("type") === "password" ? "text" : "password"
//       passwordInput.setAttribute("type", type)

//       // Toggle eye icon (open/closed)
//       const eyeIcon = this.querySelector("svg")
//       if (type === "text") {
//         eyeIcon.innerHTML =
//           '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
//       } else {
//         eyeIcon.innerHTML =
//           '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>'
//       }
//     })
//   })

//   // Password strength meter
//   const passwordInput = document.getElementById("password")
//   if (passwordInput) {
//     passwordInput.addEventListener("input", function () {
//       updatePasswordStrength(this.value)
//     })
//   }

//   // Form validation
//   const signupForm = document.getElementById("signup-form")
//   if (signupForm) {
//     signupForm.addEventListener("submit", function (e) {
//       e.preventDefault()

//       let isValid = true

//       // Validate full name
//       const fullname = document.getElementById("fullname")
//       if (fullname.value.trim() === "") {
//         showError(fullname, "Full name is required")
//         isValid = false
//       } else {
//         showSuccess(fullname)
//       }

//       // Validate email
//       const email = document.getElementById("email")
//       if (email.value.trim() === "") {
//         showError(email, "Email is required")
//         isValid = false
//       } else if (!isValidEmail(email.value)) {
//         showError(email, "Please enter a valid email address")
//         isValid = false
//       } else {
//         showSuccess(email)
//       }

//       // Validate password
//       const password = document.getElementById("password")
//       if (password.value.trim() === "") {
//         showError(password, "Password is required")
//         isValid = false
//       } else if (password.value.length < 8) {
//         showError(password, "Password must be at least 8 characters")
//         isValid = false
//       } else {
//         showSuccess(password)
//       }

//       // Validate terms
//       const terms = document.getElementById("terms")
//       if (!terms.checked) {
//         document.getElementById("terms-error").textContent = "You must agree to the Terms of Service and Privacy Policy"
//         isValid = false
//       } else {
//         document.getElementById("terms-error").textContent = ""
//       }

//       // If form is valid, submit
//       if (isValid) {
//         // Show loading state on button
//         const submitBtn = this.querySelector(".auth-submit-btn")
//         submitBtn.innerHTML = "Creating Account..."
//         submitBtn.disabled = true

//         // Simulate API call
//         setTimeout(() => {
//           window.location.href = "home.html"
//         }, 1500)
//       }
//     })
//   }

//   // Login form validation
//   const loginForm = document.getElementById("login-form")
//   if (loginForm) {
//     loginForm.addEventListener("submit", function (e) {
//       e.preventDefault()

//       let isValid = true

//       // Validate email
//       const email = document.getElementById("email")
//       if (email.value.trim() === "") {
//         showError(email, "Email is required")
//         isValid = false
//       } else if (!isValidEmail(email.value)) {
//         showError(email, "Please enter a valid email address")
//         isValid = false
//       } else {
//         showSuccess(email)
//       }

//       // Validate password
//       const password = document.getElementById("password")
//       if (password.value.trim() === "") {
//         showError(password, "Password is required")
//         isValid = false
//       } else {
//         showSuccess(password)
//       }

//       // If form is valid, submit
//       if (isValid) {
//         // Show loading state on button
//         const submitBtn = this.querySelector(".auth-submit-btn")
//         submitBtn.innerHTML = "Logging in..."
//         submitBtn.disabled = true

//         // Simulate API call
//         setTimeout(() => {
//           window.location.href = "home.html"
//         }, 1500)
//       }
//     })
//   }

//   // Helper functions
//   function showError(input, message) {
//     const formGroup = input.parentElement.parentElement
//     formGroup.classList.add("error")
//     formGroup.classList.remove("success")

//     const errorElement = document.getElementById(`${input.id}-error`)
//     if (errorElement) {
//       errorElement.textContent = message
//     }
//   }

//   function showSuccess(input) {
//     const formGroup = input.parentElement.parentElement
//     formGroup.classList.remove("error")
//     formGroup.classList.add("success")

//     const errorElement = document.getElementById(`${input.id}-error`)
//     if (errorElement) {
//       errorElement.textContent = ""
//     }
//   }

//   function isValidEmail(email) {
//     const re =
//       /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
//     return re.test(String(email).toLowerCase())
//   }

//   function updatePasswordStrength(password) {
//     if (!password) {
//       resetStrengthMeter()
//       return
//     }

//     // Calculate password strength
//     let strength = 0

//     // Length check
//     if (password.length >= 8) strength += 1
//     if (password.length >= 12) strength += 1

//     // Complexity checks
//     if (/[A-Z]/.test(password)) strength += 1
//     if (/[a-z]/.test(password)) strength += 1
//     if (/[0-9]/.test(password)) strength += 1
//     if (/[^A-Za-z0-9]/.test(password)) strength += 1

//     const segments = document.querySelectorAll(".strength-segment")
//     const strengthText = document.querySelector(".strength-text")

//     // Reset all segments
//     segments.forEach((segment) => {
//       segment.className = "strength-segment"
//     })

//     // Update strength meter based on score
//     if (strength >= 1) {
//       segments[0].classList.add("weak")
//     }
//     if (strength >= 3) {
//       segments[0].classList.add("fair")
//       segments[1].classList.add("fair")
//     }
//     if (strength >= 4) {
//       segments[0].classList.add("good")
//       segments[1].classList.add("good")
//       segments[2].classList.add("good")
//     }
//     if (strength >= 5) {
//       segments[0].classList.add("strong")
//       segments[1].classList.add("strong")
//       segments[2].classList.add("strong")
//       segments[3].classList.add("strong")
//     }

//     // Update strength text
//     if (strength < 3) {
//       strengthText.textContent = "Weak password"
//       strengthText.style.color = "var(--strength-weak)"
//     } else if (strength < 4) {
//       strengthText.textContent = "Fair password"
//       strengthText.style.color = "var(--strength-fair)"
//     } else if (strength < 5) {
//       strengthText.textContent = "Good password"
//       strengthText.style.color = "var(--strength-good)"
//     } else {
//       strengthText.textContent = "Strong password"
//       strengthText.style.color = "var(--strength-strong)"
//     }
//   }

//   function resetStrengthMeter() {
//     const segments = document.querySelectorAll(".strength-segment")
//     segments.forEach((segment) => {
//       segment.className = "strength-segment"
//     })

//     const strengthText = document.querySelector(".strength-text")
//     if (strengthText) {
//       strengthText.textContent = "Password strength"
//       strengthText.style.color = "var(--text-muted)"
//     }
//   }
// })

