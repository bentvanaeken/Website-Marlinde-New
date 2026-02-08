const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

const revealBlocks = document.querySelectorAll("[data-reveal]");
const mobileRevealViewport = window.matchMedia("(max-width: 620px)");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.classList.add("is-in");
      const children = entry.target.querySelectorAll("[data-reveal-child]");
      children.forEach((child, index) => {
        const delay = prefersReducedMotion ? 0 : index * 70;
        setTimeout(() => child.classList.add("is-in"), delay);
      });

      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.15 }
);

const revealGalleryInstantly = () => {
  const gallerySection = document.getElementById("gallery");
  if (!gallerySection) return;
  gallerySection.classList.add("is-in");
  const children = gallerySection.querySelectorAll("[data-reveal-child]");
  children.forEach((child) => child.classList.add("is-in"));
};

const syncGalleryReveal = () => {
  if (mobileRevealViewport.matches) {
    revealGalleryInstantly();
  }
};

revealBlocks.forEach((block) => revealObserver.observe(block));
syncGalleryReveal();

if (typeof mobileRevealViewport.addEventListener === "function") {
  mobileRevealViewport.addEventListener("change", syncGalleryReveal);
} else if (typeof mobileRevealViewport.addListener === "function") {
  mobileRevealViewport.addListener(syncGalleryReveal);
}

const heroStage = document.getElementById("hero-stage");
const heroWord = document.getElementById("kinetic-word");
const heroDesktopViewport = window.matchMedia("(min-width: 621px)");

const heroSlides = [
  {
    src: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
    alt: "Portret in zacht licht",
    word: "portret",
  },
  {
    src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1400&auto=format&fit=crop",
    alt: "Close-up portret",
    word: "editorial",
  },
  {
    src: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=1400&auto=format&fit=crop",
    alt: "Landschap met nevel",
    word: "travel",
  },
  {
    src: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1400&auto=format&fit=crop",
    alt: "Abstracte fotografiedetail",
    word: "vorm",
  },
];

let heroFront = document.getElementById("hero-photo-front");
let heroBack = document.getElementById("hero-photo-back");
let heroSlideIndex = 0;
let heroRotationTimer = null;

const heroIntervalMs = 5200;

const preloadHeroSlide = (slide) => {
  const preload = new Image();
  preload.src = slide.src;
};

const updateHeroMeta = (slide) => {
  if (heroWord) heroWord.textContent = slide.word;
};

const applyHeroSlide = (node, slide) => {
  if (!node) return;
  node.src = slide.src;
  node.alt = slide.alt;
};

const rotateHeroSlide = () => {
  if (!heroFront || !heroBack || heroSlides.length < 2) return;

  const nextIndex = (heroSlideIndex + 1) % heroSlides.length;
  const nextSlide = heroSlides[nextIndex];

  applyHeroSlide(heroBack, nextSlide);
  heroBack.classList.add("is-visible");
  heroFront.classList.remove("is-visible");

  const previousFront = heroFront;
  heroFront = heroBack;
  heroBack = previousFront;

  heroSlideIndex = nextIndex;
  updateHeroMeta(nextSlide);
};

const stopHeroRotation = () => {
  if (heroRotationTimer) {
    window.clearInterval(heroRotationTimer);
    heroRotationTimer = null;
  }
};

const startHeroRotation = () => {
  if (
    prefersReducedMotion ||
    !heroDesktopViewport.matches ||
    !heroFront ||
    !heroBack ||
    heroSlides.length < 2
  ) {
    stopHeroRotation();
    return;
  }

  if (heroRotationTimer) return;

  heroRotationTimer = window.setInterval(rotateHeroSlide, heroIntervalMs);
};

const syncHeroRotation = () => {
  if (heroDesktopViewport.matches && !prefersReducedMotion) {
    startHeroRotation();
    return;
  }
  stopHeroRotation();
};

if (heroFront && heroBack) {
  applyHeroSlide(heroFront, heroSlides[0]);
  updateHeroMeta(heroSlides[0]);
  heroSlides.slice(1).forEach(preloadHeroSlide);
  syncHeroRotation();

  if (typeof heroDesktopViewport.addEventListener === "function") {
    heroDesktopViewport.addEventListener("change", syncHeroRotation);
  } else if (typeof heroDesktopViewport.addListener === "function") {
    heroDesktopViewport.addListener(syncHeroRotation);
  }
}

if (heroStage && !prefersReducedMotion) {
  heroStage.addEventListener("pointermove", (event) => {
    if (!heroDesktopViewport.matches) return;
    const rect = heroStage.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    heroStage.style.setProperty("--tilt-x", `${x * 3}deg`);
    heroStage.style.setProperty("--tilt-y", `${-y * 2.5}deg`);
  });

  heroStage.addEventListener("pointerleave", () => {
    heroStage.style.setProperty("--tilt-x", "0deg");
    heroStage.style.setProperty("--tilt-y", "0deg");
  });
}

const filterButtons = document.querySelectorAll(".chip[data-filter]");
const filtersContainer = document.querySelector(".filters");
const galleryItems = document.querySelectorAll(".gallery-item[data-category]");
const mobileViewport = window.matchMedia("(max-width: 620px)");
const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxThumbs = document.getElementById("lightbox-thumbs");
const closeButton = document.querySelector(".lightbox-close");
const prevButton = document.querySelector(".lightbox-prev");
const nextButton = document.querySelector(".lightbox-next");
const photoCards = document.querySelectorAll(".photo-card");

let activeCards = [];
let activeIndex = 0;
let lastFocusedElement = null;
let touchStartX = 0;

const isLightboxOpen = () => lightbox?.classList.contains("is-open");
const isMobileViewport = () => mobileViewport.matches;

const toFullSizeUrl = (src) => src.replace(/([?&])w=\d+/, "$1w=2400");

const getVisibleCards = () => {
  return Array.from(photoCards).filter((card) => {
    const item = card.closest(".gallery-item");
    return item && !item.classList.contains("is-hidden");
  });
};

const closeLightbox = () => {
  if (!lightbox || !isLightboxOpen()) return;
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocusedElement instanceof HTMLElement) {
    lastFocusedElement.focus();
  }
};

const buildThumbnails = () => {
  if (!lightboxThumbs) return;
  lightboxThumbs.innerHTML = "";

  activeCards.forEach((card, index) => {
    const img = card.querySelector("img");
    if (!img) return;

    const thumb = document.createElement("button");
    thumb.type = "button";
    thumb.className = "lightbox-thumb";
    thumb.setAttribute("aria-label", `Open foto ${index + 1}`);

    if (index === activeIndex) thumb.classList.add("is-active");

    const thumbImage = document.createElement("img");
    thumbImage.src = img.src;
    thumbImage.alt = "";
    thumbImage.loading = "lazy";
    thumb.appendChild(thumbImage);

    thumb.addEventListener("click", () => {
      activeIndex = index;
      renderActiveImage();
    });

    lightboxThumbs.appendChild(thumb);
  });
};

const renderActiveImage = () => {
  if (!lightboxImage || !lightboxCaption || activeCards.length === 0) return;
  const activeCard = activeCards[activeIndex];
  const img = activeCard.querySelector("img");
  if (!img) return;

  lightboxImage.src = toFullSizeUrl(img.src);
  lightboxImage.alt = img.alt;
  lightboxCaption.textContent =
    activeCard.dataset.title || img.alt || "Portfolio foto";

  buildThumbnails();
};

const openLightbox = (card) => {
  if (isMobileViewport()) return;
  if (!lightbox) return;

  activeCards = getVisibleCards();
  activeIndex = Math.max(0, activeCards.indexOf(card));
  lastFocusedElement = document.activeElement;

  lightbox.classList.add("is-open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  renderActiveImage();
  closeButton?.focus();
};

const stepLightbox = (direction) => {
  if (activeCards.length === 0) return;
  activeIndex = (activeIndex + direction + activeCards.length) % activeCards.length;
  renderActiveImage();
};

const trapFocusInLightbox = (event) => {
  if (!lightbox || !isLightboxOpen() || event.key !== "Tab") return;

  const focusables = Array.from(
    lightbox.querySelectorAll("button:not([disabled]), [tabindex]:not([tabindex='-1'])")
  ).filter((element) => element.offsetParent !== null);

  if (focusables.length === 0) return;

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
};

photoCards.forEach((card) => {
  const img = card.querySelector("img");
  if (img) {
    img.decoding = "async";
    img.draggable = false;
  }

  card.setAttribute("aria-label", `Open foto: ${img?.alt || "portfolio foto"}`);

  card.addEventListener("click", () => openLightbox(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openLightbox(card);
    }
  });
});

const syncMobileGalleryBehavior = () => {
  const mobile = isMobileViewport();

  photoCards.forEach((card) => {
    if (mobile) {
      card.setAttribute("disabled", "");
      card.setAttribute("aria-disabled", "true");
      card.tabIndex = -1;
    } else {
      card.removeAttribute("disabled");
      card.setAttribute("aria-disabled", "false");
      card.tabIndex = 0;
    }
  });

  if (mobile) {
    closeLightbox();
  }
};

syncMobileGalleryBehavior();
if (typeof mobileViewport.addEventListener === "function") {
  mobileViewport.addEventListener("change", syncMobileGalleryBehavior);
} else if (typeof mobileViewport.addListener === "function") {
  mobileViewport.addListener(syncMobileGalleryBehavior);
}

if (filterButtons.length > 0) {
  const getActiveFilterButton = () => {
    return (
      document.querySelector(".chip[data-filter].is-active") ||
      document.querySelector(".chip[data-filter][aria-pressed='true']")
    );
  };

  let indicatorFrame = 0;

  const updateFilterIndicator = (activeButton = getActiveFilterButton()) => {
    if (!filtersContainer || !activeButton) return;

    const containerRect = filtersContainer.getBoundingClientRect();
    const buttonRect = activeButton.getBoundingClientRect();

    if (containerRect.width === 0 || buttonRect.width === 0) return;

    const left = Math.max(
      0,
      buttonRect.left - containerRect.left - filtersContainer.clientLeft
    );

    filtersContainer.style.setProperty("--indicator-left", `${Math.round(left)}px`);
    filtersContainer.style.setProperty("--indicator-width", `${Math.round(buttonRect.width)}px`);
  };

  const scheduleFilterIndicator = (activeButton = getActiveFilterButton()) => {
    window.cancelAnimationFrame(indicatorFrame);
    indicatorFrame = window.requestAnimationFrame(() =>
      updateFilterIndicator(activeButton)
    );
  };

  scheduleFilterIndicator();

  if (typeof ResizeObserver === "function" && filtersContainer) {
    const indicatorObserver = new ResizeObserver(() => scheduleFilterIndicator());
    indicatorObserver.observe(filtersContainer);
    filterButtons.forEach((button) => indicatorObserver.observe(button));
  } else {
    window.addEventListener("resize", () => scheduleFilterIndicator());
  }

  if (document.fonts?.ready) {
    document.fonts.ready.then(() => scheduleFilterIndicator());
  }

  if (typeof mobileViewport.addEventListener === "function") {
    mobileViewport.addEventListener("change", () => scheduleFilterIndicator());
  } else if (typeof mobileViewport.addListener === "function") {
    mobileViewport.addListener(() => scheduleFilterIndicator());
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;

      filterButtons.forEach((chip) => {
        const isActive = chip === button;
        chip.classList.toggle("is-active", isActive);
        chip.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      galleryItems.forEach((item) => {
        const matches = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("is-hidden", !matches);
      });

      scheduleFilterIndicator(button);
      closeLightbox();
    });
  });
}

closeButton?.addEventListener("click", closeLightbox);
prevButton?.addEventListener("click", () => stepLightbox(-1));
nextButton?.addEventListener("click", () => stepLightbox(1));

lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightboxImage?.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].screenX;
});

lightboxImage?.addEventListener("touchend", (event) => {
  const deltaX = event.changedTouches[0].screenX - touchStartX;
  if (Math.abs(deltaX) < 40) return;
  stepLightbox(deltaX < 0 ? 1 : -1);
});

document.addEventListener("keydown", (event) => {
  if (!isLightboxOpen()) return;

  trapFocusInLightbox(event);

  if (event.key === "Escape") closeLightbox();
  if (event.key === "ArrowRight") stepLightbox(1);
  if (event.key === "ArrowLeft") stepLightbox(-1);
});
