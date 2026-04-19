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

  const padding = 40;
  const linkTop = link.offsetTop;
  const linkBottom = linkTop + link.offsetHeight;
  const viewTop = sideNav.scrollTop;
  const viewBottom = viewTop + sideNav.clientHeight;
  const maxScroll = sideNav.scrollHeight - sideNav.clientHeight;

  if (linkTop < viewTop + padding) {
    sideNav.scrollTo({
      top: Math.max(0, linkTop - padding),
      behavior: "auto",
    });
    return;
  }

  if (linkBottom > viewBottom - padding) {
    sideNav.scrollTo({
      top: Math.min(maxScroll, linkBottom - sideNav.clientHeight + padding),
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
  const topOffset = 120;
  const firstSection = sections[0];
  let currentId = sections[0]?.id || "item-01";
  let matchedSection = null;

  if (firstSection) {
    const firstRect = firstSection.getBoundingClientRect();
    if (firstRect.top > topOffset) {
      clearActiveLinks();

      if (sideNav && window.innerWidth > 1080) {
        sideNav.scrollTop = 0;
      }

      return;
    }
  }

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();
    if (rect.top <= topOffset && rect.bottom > topOffset) {
      matchedSection = section;
    }
  });

  if (matchedSection) {
    currentId = matchedSection.id;
  } else {
    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= topOffset) {
        currentId = section.id;
      }
    });
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
