// ----------------------------
// GitHub Project Fetcher
// ----------------------------
async function loadGitHubProjects() {
  const username = "AakarshanManiGiri";

  try {
    const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated`);
    const repos = await response.json();

    const container = document.getElementById("project-list");
    if (!container) return;

    container.innerHTML = ""; // Clear old entries

    repos.forEach(repo => {
      if (repo.fork) return; // skip forks

      const card = `
  <div class="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-6 hover:bg-white/20 transition">

    <h3 class="text-xl font-semibold mb-2 text-cyan-200 drop-shadow-[0_0_6px_rgba(0,255,255,0.5)]">
      ${repo.name}
    </h3>

    <p class="text-sm mb-3 text-white/80">
      ${repo.description ? repo.description : "No description provided."}
    </p>

    <a href="${repo.html_url}" target="_blank"
       class="text-cyan-300 font-semibold hover:underline">
       View on GitHub →
    </a>

  </div>
`;

      container.innerHTML += card;
    });

  } catch (err) {
    console.error("GitHub API error:", err);
  }
}

loadGitHubProjects();


// ----------------------------
// Neo-Punk Fluid Background
// ----------------------------
const canvas = document.getElementById("fluid-bg");
const ctx = canvas.getContext("2d");

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width; 
canvas.height = height;
canvas.style.width = width + 'px';
canvas.style.height = height + 'px';

const mouse = { x: canvas.width / 2, y: canvas.height / 2, down: false };

window.addEventListener("resize", () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';
});

window.addEventListener("mousemove", (e) => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

window.addEventListener("mousedown", () => (mouse.down = true));
window.addEventListener("mouseup", () => (mouse.down = false));

// Neo-punk color palette
const colors = ["#00f5ff", "#ff00e6", "#8b5cff"];

class Particle {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.vx = (Math.random() - 0.5) * 0.5;
    this.vy = (Math.random() - 0.5) * 0.5;
    this.size = 1 + Math.random() * 2;
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    const dx = mouse.x - this.x;
    const dy = mouse.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const force = mouse.down ? 0.6 : 0.25;
    const effectRadius = mouse.down ? 260 : 200;

    if (dist < effectRadius) {
      const strength = (effectRadius - dist) / effectRadius;
      this.vx += (dx / dist) * strength * force * 0.3;
      this.vy += (dy / dist) * strength * force * 0.3;
    }

    const angle = Math.sin(this.y * 0.002 + performance.now() * 0.0004);
    this.vx += Math.cos(angle) * 0.02;
    this.vy += Math.sin(angle) * 0.02;

    this.vx *= 0.96;
    this.vy *= 0.96;

    this.x += this.vx;
    this.y += this.vy;

    if (
      this.x < -50 ||
      this.x > canvas.width + 50 ||
      this.y < -50 ||
      this.y > canvas.height + 50
    ) {
      this.reset();
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
    }
  }

  draw() {
  ctx.beginPath();
  ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
  ctx.fillStyle = this.color;
  ctx.globalAlpha = 0.85;
  ctx.fill();
}
}

const particles = [];
const PARTICLE_COUNT = 300;
for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

function animate() {
  requestAnimationFrame(animate);

  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "rgba(7, 16, 39, 0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.globalCompositeOperation = "lighter";

  particles.forEach((p) => {
    p.update();
    p.draw();
  });
}

animate();
