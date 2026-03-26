// Main JavaScript for smooth scrolling and progress bars
document.addEventListener("DOMContentLoaded", () => {
    // Smooth scrolling for navigation links
    const navLinks = document.querySelectorAll("nav ul li a[href^=\"#\"]");
    navLinks.forEach(link => {
        link.addEventListener("click", function(e) {
            e.preventDefault();
            const targetId = this.getAttribute("href");
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Adjust for fixed header height
                    behavior: "smooth"
                });
            }
        });
    });

    // Intersection Observer for animating progress bars
    const animateProgressBars = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target;
                const percentage = progressBar.dataset.percentage;
                progressBar.style.width = percentage + "%";
                observer.unobserve(progressBar); // Animate only once
            }
        });
    };

    const progressBarObserver = new IntersectionObserver(animateProgressBars, {
        root: null, // viewport
        threshold: 0.5 // Trigger when 50% of the element is visible
    });

    const progressBars = document.querySelectorAll(".progress-bar");
    progressBars.forEach(bar => {
        progressBarObserver.observe(bar);
    });

    // Star rating hover (CSS handles basic hover, JS could enhance if needed)
    // For now, relying on CSS for star hover effects as per current implementation.
    // If more complex JS-driven animation is needed for stars, it can be added here.
});
