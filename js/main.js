// ============================================================
// Exotic States of Matter
// Main JavaScript
// Part 6
// ============================================================


// ============================================================
// PAGE READY
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

    setupNavigation();
    setupKeyboardNavigation();

});


// ============================================================
// NAVIGATION
// ============================================================

function setupNavigation() {

    const navLinks = document.querySelectorAll(".tabs a");

    navLinks.forEach(function (link) {

        link.addEventListener("click", function () {

            // Remove active class from all links
            navLinks.forEach(function (item) {
                item.classList.remove("active");
            });

            // Add active class to clicked link
            this.classList.add("active");

        });

    });

}


// ============================================================
// KEYBOARD ACCESSIBILITY
// ============================================================

function setupKeyboardNavigation() {

    const navLinks = document.querySelectorAll(".tabs a");

    navLinks.forEach(function (link, index) {

        link.addEventListener("keydown", function (event) {

            // Right Arrow
            if (event.key === "ArrowRight") {

                event.preventDefault();

                const nextIndex =
                    (index + 1) % navLinks.length;

                navLinks[nextIndex].focus();

            }


            // Left Arrow
            if (event.key === "ArrowLeft") {

                event.preventDefault();

                const previousIndex =
                    (index - 1 + navLinks.length)
                    % navLinks.length;

                navLinks[previousIndex].focus();

            }

        });

    });

}


// ============================================================
// REDUCED MOTION SUPPORT
// ============================================================

function prefersReducedMotion() {

    return window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

}


// ============================================================
// SAFE NUMBER FORMATTER
// ============================================================

function formatNumber(value) {

    return Number(value).toLocaleString("en-US");

}


// ============================================================
// SAFE ELEMENT HELPER
// ============================================================

function getElement(id) {

    return document.getElementById(id);

}
