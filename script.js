document.body.classList.add("js-enabled");

const revealSections = document.querySelectorAll("[data-section]");
const sections = document.querySelectorAll(".entry-card[data-section]");
const navLinks = document.querySelectorAll(".nav-link");
const sidebar = document.getElementById("sidebar");
const toggleButton = document.querySelector(".mobile-nav-toggle");
const sideNav = document.querySelector(".side-nav");
let activeId = null;

const clearActiveLinks = () => {
  navLinks.forEach((link) => {
    link.classList.remove("active");
  });
  activeId = null;
};

const keepActiveLinkVisible = (link) => {
  if (!sideNav || window.innerWidth <= 1080) {
    return;
  }

  const sideNavRect = sideNav.getBoundingClientRect();
  const linkRect = link.getBoundingClientRect();
  const verticalPadding = 24;
  const isAboveVisibleArea = linkRect.top < sideNavRect.top + verticalPadding;
  const isBelowVisibleArea = linkRect.bottom > sideNavRect.bottom - verticalPadding;

  if (isAboveVisibleArea || isBelowVisibleArea) {
    const targetScrollTop =
      sideNav.scrollTop +
      (linkRect.top - sideNavRect.top) -
      sideNav.clientHeight / 2 +
      linkRect.height / 2;

    sideNav.scrollTo({
      top: Math.max(0, targetScrollTop),
      behavior: "auto",
    });
  }
};

const setActiveLink = (id) => {
  if (!id) {
    clearActiveLinks();
    return;
  }

  navLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("active", isActive);

    if (isActive && id !== activeId) {
      activeId = id;
      keepActiveLinkVisible(link);
    }
  });
};

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: "0px 0px -10% 0px",
  }
);

revealSections.forEach((section) => {
  revealObserver.observe(section);
});

const updateActiveSection = () => {
  const firstSection = sections[0];
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const focusLine = viewportHeight * 0.45;
  let currentId = sections[0]?.id || "item-01";
  let crossedSection = null;

  if (firstSection) {
    const firstRect = firstSection.getBoundingClientRect();
    if (firstRect.top > focusLine) {
      clearActiveLinks();

      if (sideNav && window.innerWidth > 1080) {
        sideNav.scrollTop = 0;
      }

      return;
    }
  }

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= focusLine) {
      crossedSection = section;
    }
  });

  if (crossedSection) {
    currentId = crossedSection.id;
  }

  setActiveLink(currentId);
};

let ticking = false;

const onScroll = () => {
  if (ticking) {
    return;
  }

  ticking = true;
  window.requestAnimationFrame(() => {
    updateActiveSection();
    ticking = false;
  });
};

const closeSidebarOnMobile = () => {
  if (window.innerWidth > 1080) {
    return;
  }

  sidebar?.classList.remove("is-open");
  toggleButton?.setAttribute("aria-expanded", "false");
};

navLinks.forEach((link) => {
  link.addEventListener("click", closeSidebarOnMobile);
});

toggleButton?.addEventListener("click", () => {
  const expanded = toggleButton.getAttribute("aria-expanded") === "true";
  toggleButton.setAttribute("aria-expanded", String(!expanded));
  sidebar?.classList.toggle("is-open", !expanded);
});

updateActiveSection();

window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
