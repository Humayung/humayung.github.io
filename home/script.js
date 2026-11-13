(() => {
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  const projectCards = [...document.querySelectorAll(".project-card[data-category]")];
  const emptyState = document.querySelector(".empty-state");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("is-active", active);
        item.setAttribute("aria-pressed", String(active));
      });

      let visibleCount = 0;
      projectCards.forEach((card) => {
        const visible = filter === "all" || card.dataset.category === filter;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      if (emptyState) emptyState.hidden = visibleCount !== 0;
    });
  });

  const year = document.querySelector("#current-year");
  const currentYear = String(new Date().getFullYear());
  if (year) year.textContent = currentYear;
  const workshopYear = document.querySelector("#workshop-year");
  if (workshopYear) workshopYear.textContent = currentYear;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const heroArt = document.querySelector(".hero-art");
  if (heroArt && !reducedMotion) {
    heroArt.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const bounds = heroArt.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      heroArt.style.setProperty("--tilt-x", `${x * 7}deg`);
      heroArt.style.setProperty("--tilt-y", `${y * -7}deg`);
    });
    heroArt.addEventListener("pointerleave", () => {
      heroArt.style.setProperty("--tilt-x", "0deg");
      heroArt.style.setProperty("--tilt-y", "0deg");
    });
  }

  if (!reducedMotion && "IntersectionObserver" in window) {
    document.body.classList.add("has-motion");
    const revealTargets = document.querySelectorAll(
      ".hero-copy, .hero-art, .invitation-card, .section-topline, .work-heading, .filter-bar, .project-card, .about-section, .site-footer",
    );

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((element, index) => {
      element.setAttribute("data-reveal", "");
      if (element.classList.contains("project-card")) {
        element.style.setProperty("--reveal-delay", `${(index % 3) * 55}ms`);
      }
      revealObserver.observe(element);
    });
  }
})();
