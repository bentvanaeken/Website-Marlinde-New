const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        const children = entry.target.querySelectorAll("[data-animate-child]");
        children.forEach((child, index) => {
          const delay = prefersReducedMotion ? 0 : 90 * index;
          setTimeout(() => child.classList.add("in-view"), delay);
        });
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);

const animateSections = document.querySelectorAll("[data-animate]");

animateSections.forEach((section) => {
  const autoChildren = section.querySelectorAll(
    ".hero-text > *, .gallery-head > *, .filters, .gallery-grid .card, .about > *"
  );
  autoChildren.forEach((child) => {
    if (!child.hasAttribute("data-animate-child")) {
      child.setAttribute("data-animate-child", "");
    }
  });
});

animateSections.forEach((el) => {
  observer.observe(el);
});

const filterButtons = document.querySelectorAll(".chip[data-filter]");
const cards = document.querySelectorAll(".gallery-grid .card[data-category]");

if (filterButtons.length > 0) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((btn) => {
        const isActive = btn === button;
        btn.classList.toggle("is-active", isActive);
        btn.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      cards.forEach((card) => {
        const matches = filter === "all" || card.dataset.category === filter;
        card.classList.toggle("is-hidden", !matches);
      });
    });
  });
}
