const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
if (navToggle && nav) {
  navToggle.addEventListener("click", () => nav.classList.toggle("open"));
}

const glow = document.querySelector(".cursor-glow");
window.addEventListener("pointermove", (event) => {
  if (!glow) return;
  glow.style.left = event.clientX + "px";
  glow.style.top = event.clientY + "px";
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      const delay = entry.target.dataset.delay;
      if (delay) entry.target.style.setProperty("--delay", delay + "ms");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.querySelectorAll("[data-counter]").forEach((el) => {
  el.textContent = el.dataset.counter || el.textContent;
});

document.querySelectorAll("[data-tabs]").forEach((tabs) => {
  const buttons = [...tabs.querySelectorAll("button")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  buttons.forEach((button) => button.addEventListener("click", () => {
    const id = button.dataset.tab;
    buttons.forEach((item) => item.classList.toggle("active", item === button));
    panels.forEach((panel) => panel.classList.toggle("active", panel.dataset.panel === id));
  }));
});

document.querySelectorAll("[data-accordion] .faq-item button").forEach((button) => {
  button.addEventListener("click", () => button.closest(".faq-item").classList.toggle("open"));
});

document.querySelectorAll("[data-toast]").forEach((button) => {
  button.addEventListener("click", () => {
    const old = document.querySelector(".toast");
    if (old) old.remove();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = button.dataset.toast;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2400);
  });
});

document.querySelectorAll("[data-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = "Дякуємо. Запит підготовлено, ми зв'яжемося з вами після підключення форми.";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2600);
    form.reset();
  });
});

const canvas = document.querySelector("[data-canvas]");
if (canvas) {
  const ctx = canvas.getContext("2d");
  let points = [];
  const resize = () => {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = canvas.parentElement.offsetHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = canvas.parentElement.offsetHeight + "px";
    points = Array.from({ length: 46 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - .5) * .36 * devicePixelRatio,
      vy: (Math.random() - .5) * .36 * devicePixelRatio
    }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(114,255,216,.24)";
    ctx.fillStyle = "rgba(114,255,216,.62)";
    points.forEach((p, i) => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2.2 * devicePixelRatio, 0, Math.PI * 2);
      ctx.fill();
      for (let j = i + 1; j < points.length; j++) {
        const q = points[j];
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 180 * devicePixelRatio) {
          ctx.globalAlpha = 1 - d / (180 * devicePixelRatio);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    });
    requestAnimationFrame(draw);
  };
  resize();
  draw();
  window.addEventListener("resize", resize);
}

const COOKIE_KEY = "auris_cookie_choice_until";
const COOKIE_TTL_MS = 24 * 60 * 60 * 1000;

function initCookieBanner() {
  const cookieBanner = document.querySelector("[data-cookie-banner]");
  const cookieAccept = document.querySelector("[data-cookie-accept]");
  const cookieReject = document.querySelector("[data-cookie-reject]");
  if (!cookieBanner) return;

  let cookieValidUntil = 0;
  try {
    cookieValidUntil = Number(localStorage.getItem(COOKIE_KEY) || 0);
  } catch (_error) {
    cookieValidUntil = 0;
  }

  if (Date.now() <= cookieValidUntil) {
    cookieBanner.hidden = true;
    return;
  }

  cookieBanner.hidden = false;

  const saveChoice = (choice) => {
    try {
      localStorage.setItem(COOKIE_KEY, String(Date.now() + COOKIE_TTL_MS));
      localStorage.setItem("auris_cookie_choice", choice);
    } catch (_error) {}
    cookieBanner.hidden = true;
  };

  if (cookieAccept) {
    cookieAccept.addEventListener("click", () => saveChoice("accepted"));
  }
  if (cookieReject) {
    cookieReject.addEventListener("click", () => saveChoice("rejected"));
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initCookieBanner);
} else {
  initCookieBanner();
}
