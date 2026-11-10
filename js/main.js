(() => {
  "use strict";

  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("primary-nav");

  const setNavOpen = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close navigation menu" : "Open navigation menu");
    nav.classList.toggle("is-open", open);
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setNavOpen(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) setNavOpen(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setNavOpen(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (event.target.closest(".site-header")) return;
      setNavOpen(false);
    });

    const desktopQuery = window.matchMedia("(min-width: 880px)");
    const handleBreakpoint = (event) => {
      if (event.matches) {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open navigation menu");
      }
    };

    if (desktopQuery.addEventListener) {
      desktopQuery.addEventListener("change", handleBreakpoint);
    } else {
      desktopQuery.addListener(handleBreakpoint);
    }
  }

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  document.querySelectorAll("[data-year]").forEach((node) => {
    node.textContent = String(new Date().getFullYear());
  });

  const studentStart = document.body.dataset.studentStart;
  if (studentStart) {
    const [startYear, startMonth] = studentStart.split("-").map(Number);
    const programYears = Number(document.body.dataset.programYears) || 4;
    const now = new Date();
    const monthsSinceStart = (now.getFullYear() - startYear) * 12 + (now.getMonth() + 1 - startMonth);
    const elapsedYears = Math.floor(monthsSinceStart / 12);
    const graduationYear = startYear + programYears;
    let level = "Incoming";

    if (monthsSinceStart >= programYears * 12) {
      level = "Graduated";
    } else if (monthsSinceStart >= 0) {
      level = `Year ${elapsedYears + 1}`;
    }

    document.querySelectorAll("[data-student-level]").forEach((node) => {
      node.textContent = level;
    });
    document.querySelectorAll("[data-graduation-year]").forEach((node) => {
      node.textContent = String(graduationYear);
    });
    document.querySelectorAll("[data-graduation-class]").forEach((node) => {
      node.textContent = `Class of ${graduationYear}`;
    });
    document.querySelectorAll("[data-student-stage]").forEach((node) => {
      node.textContent = level === "Graduated"
        ? `Graduated · Class of ${graduationYear}`
        : `${level} · Class of ${graduationYear}`;
    });
  }

  document.querySelectorAll("[data-current-month]").forEach((node) => {
    node.textContent = new Intl.DateTimeFormat("en-GB", {
      month: "long",
      year: "numeric",
    }).format(new Date());
  });
})();
