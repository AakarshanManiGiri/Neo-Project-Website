const githubUsername = "AakarshanManiGiri";
const tonePattern = ["cognac", "emerald", "amber", "panel"];
const spanPattern = [7, 5, 4, 8];

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatRepoYear(repo) {
  const dateValue = repo.updated_at || repo.pushed_at || repo.created_at;
  if (!dateValue) {
    return "Repo";
  }

  return String(new Date(dateValue).getFullYear());
}

function renderStatusCard(title, description) {
  return `
    <article class="project-card" data-tone="panel" data-span="12">
      <div class="project-card__head">
        <div>
          <p class="project-card__label">GitHub</p>
          <h3 class="project-card__title">${escapeHtml(title)}</h3>
        </div>
        <span class="project-card__year">API</span>
      </div>

      <div class="project-card__rule"></div>

      <p class="project-card__body">${escapeHtml(description)}</p>
    </article>
  `;
}

function renderProjectCard(repo, index) {
  const tone = tonePattern[index % tonePattern.length];
  const span = spanPattern[index % spanPattern.length];
  const techItems = [repo.language, repo.private ? "Private" : "Public", `${repo.stargazers_count} Stars`].filter(Boolean);
  const techMarkup = techItems
    .map((item) => `<span class="chip">${escapeHtml(item)}</span>`)
    .join("");

  return `
    <article class="project-card" data-tone="${escapeHtml(tone)}" data-span="${escapeHtml(span)}">
      <div class="project-card__head">
        <div>
          <p class="project-card__label">GitHub Repo</p>
          <h3 class="project-card__title">${escapeHtml(repo.name)}</h3>
        </div>
        <span class="project-card__year">${escapeHtml(formatRepoYear(repo))}</span>
      </div>

      <div class="project-card__rule"></div>

      <p class="project-card__body">${escapeHtml(repo.description || "No description provided.")}</p>

      <div class="project-card__footer">
        <div class="project-card__tech">${techMarkup}</div>
        <a class="pressable" href="${escapeHtml(repo.html_url)}" target="_blank" rel="noreferrer">
          View on GitHub
          <span class="material-symbols-outlined" aria-hidden="true">arrow_forward</span>
        </a>
      </div>
    </article>
  `;
}

async function loadGitHubProjects() {
  const container = document.getElementById("project-grid");
  if (!container) {
    return;
  }

  container.setAttribute("aria-busy", "true");
  container.innerHTML = renderStatusCard(
    "Loading GitHub projects",
    "Fetching the latest public repositories from the profile data source."
  );

  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated`);

    if (!response.ok) {
      throw new Error(`GitHub API request failed with status ${response.status}`);
    }

    const repositories = await response.json();
    const visibleRepositories = Array.isArray(repositories)
      ? repositories.filter((repository) => !repository.fork)
      : [];

    if (visibleRepositories.length === 0) {
      container.innerHTML = renderStatusCard(
        "No public repositories",
        "The GitHub profile returned no public repositories to display right now."
      );
      return;
    }

    container.innerHTML = visibleRepositories.map((repository, index) => renderProjectCard(repository, index)).join("");
  } catch (error) {
    console.error("GitHub API error:", error);
    container.innerHTML = renderStatusCard(
      "GitHub projects unavailable",
      "The repository feed could not be loaded right now. Refresh later or check the network connection."
    );
  } finally {
    container.setAttribute("aria-busy", "false");
  }
}

function setupNavigation() {
  const links = [...document.querySelectorAll("[data-nav-link]")];
  const sections = [...document.querySelectorAll("main section[id]")];

  function setActiveLink(targetId) {
    links.forEach((link) => {
      const href = link.getAttribute("href") || "";
      const isActive = href === `#${targetId}`;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  links.forEach((link) => {
    const href = link.getAttribute("href") || "";

    if (!href.startsWith("#")) {
      return;
    }

    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);
      if (!target) {
        return;
      }

      event.preventDefault();
      setActiveLink(href.slice(1));
      target.scrollIntoView({
        behavior: reduceMotion ? "auto" : "smooth",
        block: "start",
      });
    });
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (visibleEntry) {
          setActiveLink(visibleEntry.target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-18% 0px -55% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
  } else if (sections[0]) {
    setActiveLink(sections[0].id);
  }

  setActiveLink("projects");
}

function revealSplash() {
  const splash = document.getElementById("splash");
  if (!splash || splash.dataset.state === "done") {
    return;
  }

  document.body.classList.add("is-loaded");
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  splash.dataset.state = "done";

  window.setTimeout(() => {
    splash.remove();
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, reduceMotion ? 0 : 900);
}

function init() {
  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  void loadGitHubProjects();
  setupNavigation();

  if (document.readyState === "complete") {
    window.setTimeout(revealSplash, reduceMotion ? 0 : 80);
    return;
  }

  window.addEventListener("load", revealSplash, { once: true });
}

init();