/**
 * Navigation functionality for mobile menu
 * Handles menu toggling and responsive behavior
 */
import $ from "jquery"

$(document).ready(() => {
  // Mobile menu functionality
  $("#nav-menu").mmenu(
    {
      // Options
      extensions: ["effect-menu-slide", "pagedim-black"],
      navbar: {
        title: "Menu",
      },
      navbars: [
        {
          position: "top",
          content: ["prev", "title"],
        },
      ],
    },
    {
      // Configuration
      classNames: {
        fixedElements: {
          fixed: "fixed",
        },
      },
    },
  )

  // Handle mobile menu toggle
  $(".cst-humburger-icon a").click(() => {
    $("body").addClass("mobile-open")
  })

  $(".mobile-close-icon").click(() => {
    $("body").removeClass("mobile-open")
  })

  // Sticky header
  $(window).scroll(function () {
    if ($(this).scrollTop() > 50) {
      $(".header").addClass("fixed")
    } else {
      $(".header").removeClass("fixed")
    }
  })
})

