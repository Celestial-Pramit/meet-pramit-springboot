/* ========== SNOW ========== */

const canvas = document.getElementById("particleCanvas");
const ctx = canvas.getContext("2d");
let flakes = [];
let animFrame;

function resizeCanvas() {
  const hero = document.querySelector(".hero");
  canvas.width = hero.offsetWidth;
  canvas.height = hero.offsetHeight;
}

class Snowflake {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * canvas.height;
    this.size = Math.random() * 4 + 1;
    this.speedY = Math.random() * 0.8 + 0.3;
    this.speedX = Math.random() * 0.3 - 0.15;
    this.opacity = Math.random() * 0.6 + 0.2;
    this.swing = Math.random() * 2;
    this.swingSpeed = Math.random() * 0.02 + 0.005;
    this.angle = Math.random() * Math.PI * 2;
  }

  update() {
    this.angle += this.swingSpeed;
    this.x += this.speedX + Math.sin(this.angle) * this.swing;
    this.y += this.speedY;

    if (this.y > canvas.height + 10) {
      this.y = -10;
      this.x = Math.random() * canvas.width;
    }
    if (this.x < -10 || this.x > canvas.width + 10) {
      this.x = Math.random() * canvas.width;
    }
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
    ctx.fill();
  }
}

function initSnow() {
  flakes = [];
  const count = Math.min(120, Math.floor((canvas.width * canvas.height) / 10000));
  for (let i = 0; i < count; i++) {
    flakes.push(new Snowflake());
  }
}

function animateSnow() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  flakes.forEach((f) => {
    f.update();
    f.draw();
  });
  animFrame = requestAnimationFrame(animateSnow);
}

function startSnow() {
  resizeCanvas();
  initSnow();
  animateSnow();
}

startSnow();

window.addEventListener("resize", () => {
  resizeCanvas();
  initSnow();
});

/* ========== NAVBAR ========== */

const navbar = document.getElementById("navbar");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = navLinks.querySelectorAll("a");

window.addEventListener("scroll", () => {
  navbar.classList.toggle("scrolled", window.scrollY > 50);
});

navToggle.addEventListener("click", () => {
  navToggle.classList.toggle("active");
  navLinks.classList.toggle("open");
});

navAnchors.forEach((link) => {
  link.addEventListener("click", () => {
    navToggle.classList.remove("active");
    navLinks.classList.remove("open");
  });
});

/* ========== LUCIDE ICONS ========== */

function initLucide() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

initLucide();

/* ========== THEME TOGGLE ========== */

function setTheme(theme) {
  document.body.classList.toggle("light", theme === "light");
  localStorage.setItem("theme", theme);
  const themeItem = document.querySelector('.circle-menu-item[data-action="theme"] i');
  if (themeItem) themeItem.setAttribute("data-lucide", theme === "light" ? "sun" : "moon");
  if (typeof lucide !== "undefined") lucide.createIcons();
}

initLucide();

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") setTheme("light");

/* ========== KONAMI CODE ========== */

const konami = ["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"];
let konamiIdx = 0;

document.addEventListener("keydown", (e) => {
  if (e.key === konami[konamiIdx]) {
    konamiIdx++;
    if (konamiIdx === konami.length) {
      document.body.classList.add("konami-active");
      setTimeout(() => document.body.classList.remove("konami-active"), 4000);
      konamiIdx = 0;
    }
  } else {
    konamiIdx = 0;
  }
});

/* ========== RESUME TOGGLE & PDF.JS ========== */

const toggleBtn = document.getElementById("toggleResume");
const resumePreview = document.getElementById("resumePreview");

if (toggleBtn && resumePreview) {
  toggleBtn.addEventListener("click", () => {
    const isHidden = resumePreview.classList.toggle("hidden");
    toggleBtn.textContent = isHidden ? "Show Resume" : "Hide Resume";
  });
}

if (typeof pdfjsLib !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
  const canvas = document.getElementById("pdfCanvas");
  const ctx = canvas.getContext("2d");
  const prevBtn = document.getElementById("pdfPrev");
  const nextBtn = document.getElementById("pdfNext");
  const curSpan = document.getElementById("pdfCurrent");
  const totalSpan = document.getElementById("pdfTotal");
  let pdfDoc = null, pageNum = 1;

  function renderPage(num) {
    pdfDoc.getPage(num).then(page => {
      const vp = page.getViewport({ scale: 1.5 });
      canvas.width = vp.width;
      canvas.height = vp.height;
      page.render({ canvasContext: ctx, viewport: vp });
      curSpan.textContent = num;
      prevBtn.disabled = num <= 1;
      nextBtn.disabled = num >= pdfDoc.numPages;
    });
  }

  pdfjsLib.getDocument("resume.pdf").promise.then(doc => {
    pdfDoc = doc;
    totalSpan.textContent = doc.numPages;
    renderPage(1);
  });

  prevBtn.addEventListener("click", () => { if (pageNum > 1) { pageNum--; renderPage(pageNum); } });
  nextBtn.addEventListener("click", () => { if (pageNum < pdfDoc.numPages) { pageNum++; renderPage(pageNum); } });
}

/* ========== HERO TEXT SCRAMBLE ANIMATION ========== */

(function() {
  const hero = document.getElementById("home");
  const heroTitle = document.querySelector(".hero-title");
  const heroSubtitle = document.querySelector(".hero-subtitle");
  const titleHTML = heroTitle.innerHTML;
  const subtitleHTML = heroSubtitle.innerHTML;
  const titleLines = heroTitle.innerText.split("\n");
  const subtitleLines = heroSubtitle.innerText.split("\n");
  const chars = "!<>-_\\/[]{}—=+*^?#________";
  let busy = false;

  function doScramble(el, lines, cb) {
    const totalChars = lines.reduce((s, l) => s + l.length, 0);
    el.textContent = "";
    const spans = [];
    let idx = 0;
    lines.forEach((line, li) => {
      if (li > 0) el.appendChild(document.createElement("br"));
      for (let i = 0; i < line.length; i++) {
        const s = document.createElement("span");
        s.className = "scramble-char";
        s.textContent = chars[Math.floor(Math.random() * chars.length)];
        el.appendChild(s);
        spans[idx++] = s;
      }
    });
    const flatText = lines.join("");
    let pos = 0;
    function reveal() {
      if (pos >= totalChars) { if (cb) cb(); return; }
      spans[pos].textContent = flatText[pos];
      pos++;
      setTimeout(reveal, 50);
    }
    let flickers = 0;
    const flicker = setInterval(() => {
      spans.forEach(s => {
        s.textContent = chars[Math.floor(Math.random() * chars.length)];
      });
      flickers++;
      if (flickers > 8) {
        clearInterval(flicker);
        reveal();
      }
    }, 60);
  }

  function resetText() {
    heroTitle.innerHTML = titleHTML;
    heroSubtitle.innerHTML = subtitleHTML;
    heroTitle.style.height = "";
    heroSubtitle.style.height = "";
  }

  function playScramble() {
    if (busy) return;
    busy = true;
    heroTitle.style.height = heroTitle.offsetHeight + "px";
    heroSubtitle.style.height = heroSubtitle.offsetHeight + "px";
    heroTitle.classList.add("anim-scramble");
    heroSubtitle.classList.add("anim-scramble");
    doScramble(heroTitle, titleLines, () => {
      heroTitle.innerHTML = titleHTML;
      heroTitle.classList.remove("anim-scramble");
      setTimeout(() => {
        heroSubtitle.classList.add("anim-scramble");
        doScramble(heroSubtitle, subtitleLines, () => {
          heroSubtitle.innerHTML = subtitleHTML;
          heroSubtitle.classList.remove("anim-scramble");
          busy = false;
        });
      }, 400);
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        resetText();
        playScramble();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(hero);
})();

/* ========== TIMELINE SCROLL ANIMATION ========== */

(function() {
  const timeline = document.querySelector(".timeline");
  if (!timeline) return;
  const items = timeline.querySelectorAll(".timeline-item");

  const fill = document.createElement("div");
  fill.className = "timeline-fill";
  timeline.appendChild(fill);

  function updateLine() {
    const rect = timeline.getBoundingClientRect();
    const vh = window.innerHeight;
    const totalH = rect.bottom - rect.top;
    const progress = Math.max(0, Math.min(1, (vh - rect.top) / (vh + totalH)));
    timeline.style.setProperty("--line-height", (progress * 100) + "%");
  }

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -40px 0px" });

  items.forEach(item => obs.observe(item));

  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateLine();
        ticking = false;
      });
      ticking = true;
    }
  });
  updateLine();
})();

/* ── Floating Pikachu ── */
(function() {
  const p = document.getElementById('pikachu');
  if (!p) return;
  const pad = 20;
  let w = window.innerWidth, h = window.innerHeight;
  let cx = w - 70, cy = h - 80;
  let intervalId, dragging = false, offX, offY;

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function moveTo(x, y) {
    cx = clamp(x, pad, w - 60);
    cy = clamp(y, pad, h - 70);
    p.style.left = cx + 'px';
    p.style.top = cy + 'px';
  }

  function pickTarget() {
    if (dragging) return;
    const tx = pad + Math.random() * (w - 100 - pad * 2);
    const ty = pad + Math.random() * (h - 100 - pad * 2);
    p.style.transition = 'left 2.5s cubic-bezier(0.45, 0.05, 0.2, 0.99), top 2.5s cubic-bezier(0.45, 0.05, 0.2, 0.99)';
    moveTo(tx, ty);
  }

  p.addEventListener('mousedown', function(e) {
    dragging = true;
    clearInterval(intervalId);
    const rect = p.getBoundingClientRect();
    offX = e.clientX - rect.left;
    offY = e.clientY - rect.top;
    p.style.transition = 'none';
    p.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function(e) {
    if (!dragging) return;
    moveTo(e.clientX - offX, e.clientY - offY);
  });

  document.addEventListener('mouseup', function() {
    if (!dragging) return;
    dragging = false;
    p.style.cursor = 'grab';
    p.style.transition = 'left 2.5s cubic-bezier(0.45, 0.05, 0.2, 0.99), top 2.5s cubic-bezier(0.45, 0.05, 0.2, 0.99)';
    pickTarget();
    intervalId = setInterval(pickTarget, 3000);
  });

  function onResize() {
    w = window.innerWidth;
    h = window.innerHeight;
    cx = parseFloat(p.style.left) || cx;
    cy = parseFloat(p.style.top) || cy;
    moveTo(cx, cy);
  }

  p.style.position = 'fixed';
  p.style.bottom = 'auto';
  p.style.right = 'auto';
  p.style.left = cx + 'px';
  p.style.top = cy + 'px';
  p.style.cursor = 'grab';

  pickTarget();
  intervalId = setInterval(pickTarget, 3000);
  window.addEventListener('resize', onResize);
})();

/* ── Circle Menu ── */
(function() {
  const menu = document.getElementById('circleMenu');
  const btn = document.getElementById('circleMenuBtn');
  if (!menu || !btn) return;

  let open = false;

  btn.addEventListener('click', function(e) {
    e.stopPropagation();
    open = !open;
    menu.classList.toggle('open', open);
    if (open) {
      btn.innerHTML = '<i data-lucide="x"></i>';
    } else {
      btn.innerHTML = '<i data-lucide="settings"></i>';
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
  });

  document.addEventListener('click', function() {
    if (open) {
      open = false;
      menu.classList.remove('open');
      btn.innerHTML = '<i data-lucide="settings"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });

  menu.querySelectorAll('.circle-menu-item').forEach(function(item) {
    item.addEventListener('click', function(e) {
      e.stopPropagation();
      const action = item.dataset.action;

      if (action === 'theme') {
        const isLight = document.body.classList.contains('light');
        setTheme(isLight ? 'dark' : 'light');
        lucide.createIcons();
      }

      if (action === 'brightness') {
        const isLight = document.body.classList.toggle('light');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        const themeItem = document.querySelector('.circle-menu-item[data-action="theme"] i');
        if (themeItem) themeItem.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
        item.innerHTML = isLight ? '<i data-lucide="moon"></i>' : '<i data-lucide="sun"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }

      if (action === 'translate') {
        const about = document.getElementById('about');
        if (!about) return;
        const els = about.querySelectorAll('[data-bn]');
        const isBn = about.classList.toggle('bn');
        els.forEach(function(el) {
          if (isBn) {
            el.dataset.en = el.innerHTML;
            el.innerHTML = el.dataset.bn;
          } else {
            el.innerHTML = el.dataset.en;
          }
        });
        item.innerHTML = isBn ? '<span style="font-size:0.75rem;">বাং</span>' : '<i data-lucide="languages"></i>';
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }

      open = false;
      menu.classList.remove('open');
      btn.innerHTML = '<i data-lucide="settings"></i>';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    });
  });
})();

/* ── Staggered Fade-Up Scroll Animation ── */
(function() {
  const groups = [
    { parent: '.about-card-grid', clazz: 'blur-fade', stagger: 70 },
    { parent: '.about .stats-grid', clazz: 'blur-fade', stagger: 70 },
    { parent: '.about-image-col', clazz: 'fade-up', stagger: 0 },
    { parent: '.skills-grid', clazz: 'blur-fade', stagger: 60 },
    { parent: '.research-grid', clazz: 'blur-fade', stagger: 60 },
    { parent: '.projects-grid', clazz: 'blur-fade', stagger: 80 },
    { parent: '.resume-card', clazz: 'fade-up', stagger: 0 },
    { parent: '.resume-preview', clazz: 'fade-up', stagger: 200 },
    { parent: '.contact-info', clazz: 'fade-up', stagger: 0 },
    { parent: '.contact-form', clazz: 'blur-fade', stagger: 70 },
  ];

  const entries = [];

  groups.forEach(({ parent, clazz, stagger }) => {
    const el = document.querySelector(parent);
    if (!el) return;
    if (stagger > 0) {
      Array.from(el.children).forEach(c => c.classList.add(clazz));
      entries.push({ el, clazz, stagger });
    } else {
      el.classList.add(clazz);
      entries.push({ el, clazz, single: true });
    }
  });

  const obs = new IntersectionObserver((ins) => {
    ins.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);
      const found = entries.find(e => e.el === entry.target);
      if (!found) return;
      if (found.single) {
        found.el.classList.add('visible');
      } else {
        Array.from(found.el.children).forEach((c, i) => {
          setTimeout(() => c.classList.add('visible'), i * found.stagger);
        });
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  entries.forEach(e => obs.observe(e.el));
})();
