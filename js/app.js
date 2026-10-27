const CA = "ASCcuz8Dy5edyvjZMcpyJEkfx87fgjw1pBVoLbj4pump";
const CHART = "https://dexscreener.com/solana/" + CA;

const CARDS = [
  { no: "001", name: "Inferno Holo", rarity: "Holo Rare", hp: 120, image: "img/card-inferno.webp", accent: "#ff6a1a" },
  { no: "002", name: "Gold Secret Rare", rarity: "Secret Rare", hp: 150, image: "img/card-gold.webp", accent: "#ffc83d" },
  { no: "003", name: "Shadow Edition", rarity: "Stage 1", hp: 180, image: "img/card-shadow.webp", accent: "#ff3d1f" },
  { no: "004", name: "Rainbow Full Art", rarity: "Full Art", hp: 200, image: "img/card-rainbow.webp", accent: "#ff8ad8" },
  { no: "005", name: "Chrome Cosmic", rarity: "Chrome", hp: 130, image: "img/card-cosmic.webp", accent: "#9ad7ff" },
];

const PACKS = [
  { name: "Inferno Holo", image: "img/pack-inferno.webp" },
  { name: "Gold Secret Rare", image: "img/pack-gold.webp" },
  { name: "Shadow Edition", image: "img/pack-shadow.webp" },
  { name: "Rainbow Full Art", image: "img/pack-rainbow.webp" },
  { name: "Chrome Cosmic", image: "img/pack-cosmic.webp" },
];

const HERO_CARDS = [1, 0, 3, 2];

const $ = (sel) => document.querySelector(sel);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function fitCanvas(canvas) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  const pw = Math.max(1, Math.round(w * dpr));
  const ph = Math.max(1, Math.round(h * dpr));
  if (canvas.width !== pw || canvas.height !== ph) {
    canvas.width = pw;
    canvas.height = ph;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

function roundImage(ctx, img, x, y, w, h, radius) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();
  ctx.drawImage(img, x, y, w, h);
  ctx.restore();
}

function rangeProgress(el) {
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 0;
  return clamp(-el.getBoundingClientRect().top / total, 0, 1);
}

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

function bootPreloader() {
  const root = document.documentElement;
  const pre = $(".preloader");
  const count = $(".pl-count");
  const start = performance.now();
  const duration = reduceMotion ? 200 : 1400;

  function tick(now) {
    const t = clamp((now - start) / duration, 0, 1);
    count.textContent = String(Math.round(t * 100)).padStart(3, "0");
    if (t < 1) requestAnimationFrame(tick);
    else finish();
  }

  function finish() {
    root.classList.remove("is-loading");
    pre.classList.add("is-leave");
    $(".fca").classList.add("is-shown");
    playHeroIntro();
    setTimeout(() => pre.remove(), 700);
  }

  requestAnimationFrame(tick);
}

function playHeroIntro() {
  document.querySelectorAll(".hero-line").forEach((line, li) => {
    [...line.children].forEach((ch, i) => {
      ch.style.animation = `chIn .8s cubic-bezier(.2,.8,.2,1) ${(li * 0.1 + i * 0.034).toFixed(3)}s both`;
    });
  });
}

function bootCursor() {
  if (!matchMedia("(pointer:fine)").matches) return;
  document.documentElement.classList.add("has-cursor");
  const ring = $(".cursor-ring");
  const dot = $(".cursor-dot");
  let x = innerWidth / 2;
  let y = innerHeight / 2;
  let rx = x;
  let ry = y;

  window.addEventListener("pointermove", (e) => {
    x = e.clientX;
    y = e.clientY;
    dot.style.transform = `translate(${x}px, ${y}px)`;
    const zone = e.target.closest("[data-cursor]");
    const hot = e.target.closest("a, button");
    if (zone) {
      ring.dataset.label = zone.dataset.cursor;
      ring.classList.add("is-hover");
    } else if (hot) {
      ring.dataset.label = "";
      ring.classList.add("is-hover");
    } else {
      ring.dataset.label = "";
      ring.classList.remove("is-hover");
    }
  });

  function follow() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(follow);
  }
  follow();
}

function bootNav() {
  const nav = $(".nav");
  const links = $(".nav-links");
  const burger = $(".burger");
  let lastY = window.scrollY;

  burger.addEventListener("click", () => {
    const open = links.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  });

  links.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => {
      links.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
    });
  });

  $(".scroll-cue").addEventListener("click", () => {
    $("#gigas").scrollIntoView({ behavior: "smooth" });
  });
  $(".ft-top").addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle("is-solid", y > 12);
    const menuOpen = links.classList.contains("is-open");
    if (menuOpen || y < lastY - 4) nav.classList.remove("is-hidden");
    else if (y > lastY + 6 && y > 90) nav.classList.add("is-hidden");
    lastY = y;
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function showToast(wrap, message) {
  wrap.querySelector(".toast")?.remove();
  const toast = document.createElement("span");
  toast.className = "toast";
  toast.setAttribute("role", "status");
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

function bootWallet() {
  let address = "";

  async function connect() {
    const phantom = window.phantom?.solana || window.solana;
    if (phantom?.connect) {
      const res = await phantom.connect();
      return res.publicKey.toString();
    }
    if (window.ethereum?.request) {
      const [addr] = await window.ethereum.request({ method: "eth_requestAccounts" });
      return addr;
    }
    const err = new Error("NO_WALLET");
    throw err;
  }

  document.querySelectorAll("[data-connect]").forEach((button) => {
    button.addEventListener("click", async () => {
      const wrap = button.closest(".connect-wrap");
      if (address) return;
      try {
        address = await connect();
        const short = `${address.slice(0, 4)}…${address.slice(-4)}`;
        document.querySelectorAll(".js-connect-label").forEach((label) => {
          label.textContent = short;
        });
      } catch (err) {
        const cancelled = err && (err.code === 4001 || /reject|denied|cancel/i.test(err.message || ""));
        showToast(
          wrap,
          err?.message === "NO_WALLET"
            ? "No wallet found. Install Phantom or MetaMask."
            : cancelled
              ? "Connection cancelled."
              : "Connection cancelled."
        );
      }
    });
  });
}

async function copyAddress() {
  const copy = $(".fca-copy");
  copy.textContent = "Copied";
  copy.classList.add("is-done");
  try {
    await navigator.clipboard.writeText(CA);
  } catch {
    const area = document.createElement("textarea");
    area.value = CA;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.left = "-999px";
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }
  setTimeout(() => {
    copy.textContent = "Copy";
    copy.classList.remove("is-done");
  }, 1600);
}

function bootMeet() {
  const section = $("#gigas");
  const figures = [...document.querySelectorAll(".mg-figure")];
  const texts = [...document.querySelectorAll(".mg-text")];
  const words = [...document.querySelectorAll(".mg-word")];
  const bar = $(".mg-progress i");
  const hues = ["#3a0f04", "#4a2208", "#321018"];

  return function update() {
    const p = rangeProgress(section);
    const x = p * 2;
    const paint = (nodes) => {
      nodes.forEach((node, i) => {
        const opacity = clamp(1 - Math.abs(x - i), 0, 1);
        node.style.opacity = String(opacity);
        node.style.zIndex = opacity > 0.5 ? "2" : "1";
      });
    };
    paint(figures);
    paint(texts);
    paint(words);
    bar.style.transform = `scaleY(${p})`;
    section.style.setProperty("--mg-hue", hues[Math.round(x)] || hues[0]);
  };
}

function bootCollection(cardImages) {
  const section = $("#collection");
  const canvas = $(".col-canvas-wrap canvas");
  const dots = [...document.querySelectorAll(".col-dots button")];
  const name = $(".col-name");
  const rarity = $(".pill-accent");
  const no = $(".col-no");
  const hp = $(".col-hp");
  const info = $(".col-info");
  let shown = 0;
  let lastIndex = 0;

  function setInfo(index) {
    const card = CARDS[index];
    if (!card || index === lastIndex) return;
    lastIndex = index;
    name.textContent = card.name;
    rarity.textContent = card.rarity;
    rarity.style.background = card.accent;
    no.textContent = card.no;
    hp.textContent = String(card.hp);
    section.style.setProperty("--accent", card.accent);
    dots.forEach((dot, i) => {
      const on = i === index;
      dot.classList.toggle("is-active", on);
      dot.setAttribute("aria-selected", String(on));
    });
    info.style.animation = "none";
    void info.offsetWidth;
    info.style.animation = "";
  }

  dots.forEach((dot, i) => {
    dot.addEventListener("click", () => {
      const total = section.offsetHeight - window.innerHeight;
      const top = window.scrollY + section.getBoundingClientRect().top + (i / (CARDS.length - 1)) * total;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  return function update(dt) {
    const target = rangeProgress(section) * (CARDS.length - 1);
    shown += (target - shown) * (1 - Math.pow(0.001, dt));
    if (Math.abs(target - shown) < 0.001) shown = target;
    setInfo(clamp(Math.round(shown), 0, CARDS.length - 1));

    const { ctx, w, h } = fitCanvas(canvas);
    if (w < 2 || h < 2) return;
    ctx.clearRect(0, 0, w, h);
    const cardH = Math.min(h * 0.9, w * 1.05);
    const cardW = cardH * (688 / 1024);
    const order = CARDS.map((_, i) => i).sort((a, b) => Math.abs(b - shown) - Math.abs(a - shown));
    for (const i of order) {
      const img = cardImages[i];
      if (!img) continue;
      const offset = i - shown;
      if (Math.abs(offset) > 3.2) continue;
      const scale = 1 - Math.min(0.46, Math.abs(offset) * 0.18);
      const x = offset * cardW * (w < 800 ? 0.58 : 0.66);
      ctx.save();
      ctx.translate(w / 2 + x, h * 0.5 + Math.abs(offset) * 16);
      ctx.rotate(offset * -0.18);
      ctx.scale(scale, scale);
      ctx.shadowColor = "rgba(255, 90, 20, 0.35)";
      ctx.shadowBlur = 36 * (1 - Math.min(1, Math.abs(offset)));
      roundImage(ctx, img, -cardW / 2, -cardH / 2, cardW, cardH, 18);
      ctx.restore();
    }
  };
}

function bootGraded(cardImages) {
  const stage = $(".gr-stage");
  const slab = $(".slab");
  const img = $(".slab img");
  const buttons = [...document.querySelectorAll(".gr-picker button")];
  const active = $(".gr-active");
  const printNo = $(".gr-print");
  let index = 0;
  let rotX = -8;
  let rotY = 16;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  function select(i) {
    index = i;
    const card = CARDS[i];
    if (!img.src.endsWith(card.image)) {
      img.style.opacity = "0.35";
      img.onload = () => { img.style.opacity = "1"; };
      img.src = card.image;
    }
    img.alt = `${card.name} graded slab`;
    active.textContent = card.name;
    printNo.textContent = `#${card.no}`;
    buttons.forEach((button, n) => {
      const on = n === i;
      button.classList.toggle("is-active", on);
      button.setAttribute("aria-selected", String(on));
    });
  }

  buttons.forEach((button, i) => button.addEventListener("click", () => select(i)));

  stage.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    stage.setPointerCapture(e.pointerId);
  });
  stage.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    rotY += (e.clientX - lastX) * 0.45;
    rotX = clamp(rotX + (e.clientY - lastY) * 0.3, -42, 42);
    lastX = e.clientX;
    lastY = e.clientY;
  });
  const release = () => { dragging = false; };
  stage.addEventListener("pointerup", release);
  stage.addEventListener("pointercancel", release);

  return function update(t) {
    const swayX = dragging ? 0 : Math.cos(t * 0.55) * 4;
    const swayY = dragging ? 0 : Math.sin(t * 0.7) * 8;
    slab.style.transform = `rotateX(${rotX + swayX}deg) rotateY(${rotY + swayY}deg)`;
    return cardImages[index];
  };
}

function bootPacks(packImages) {
  const canvas = $(".pk-stage canvas");
  const caption = $(".pk-caption");
  let angle = 0;
  let dragging = false;
  let lastX = 0;
  let lastName = "";

  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastX;
    angle += dx * 0.008;
    lastX = e.clientX;
  });
  const release = () => { dragging = false; };
  canvas.addEventListener("pointerup", release);
  canvas.addEventListener("pointercancel", release);

  return function update(dt) {
    if (!dragging && !reduceMotion) angle += dt * 0.35;
    const { ctx, w, h } = fitCanvas(canvas);
    if (w < 2 || h < 2) return;
    ctx.clearRect(0, 0, w, h);
    const items = PACKS.map((pack, i) => {
      const a = angle + (i / PACKS.length) * Math.PI * 2;
      return { i, name: pack.name, z: Math.cos(a), x: Math.sin(a), img: packImages[i] };
    }).sort((a, b) => a.z - b.z);

    let front = items[0];
    for (const item of items) {
      if (!item.img) continue;
      const depth = (item.z + 1) / 2;
      const ph = Math.min(h * (0.42 + depth * 0.5), w * 0.72);
      const pw = ph * (600 / 1002);
      ctx.save();
      ctx.globalAlpha = 0.28 + depth * 0.72;
      ctx.shadowColor = "rgba(255, 106, 26, 0.45)";
      ctx.shadowBlur = 28 * depth;
      ctx.translate(w / 2 + item.x * w * 0.32, h * 0.5 + (1 - depth) * 26);
      ctx.scale(0.72 + depth * 0.28, 0.72 + depth * 0.28);
      roundImage(ctx, item.img, -pw / 2, -ph / 2, pw, ph, 14);
      ctx.restore();
      if (!front || item.z > front.z) front = item;
    }
    if (front && front.name !== lastName) {
      lastName = front.name;
      caption.innerHTML = `<b>${front.name}</b> — Five booster designs. One legend inside.`;
    }
  };
}

function bootLive() {
  const section = $("#live");
  const frame = $(".lv-frame");
  const video = frame.querySelector("video");
  return function update() {
    const p = rangeProgress(section);
    const tilt = (1 - p) * 26;
    const scale = 0.74 + p * 0.26;
    frame.style.transform = `rotateX(${tilt}deg) scale(${scale})`;
    const rect = frame.getBoundingClientRect();
    const visible = rect.bottom > 80 && rect.top < window.innerHeight - 40;
    if (visible) video.play().catch(() => {});
    else video.pause();
  };
}

function bootCoin() {
  const canvas = $(".brand-coin canvas");
  return function update(t) {
    const { ctx, w, h } = fitCanvas(canvas);
    const cx = w / 2;
    const cy = h / 2;
    const rad = Math.min(w, h) / 2 - 1;
    ctx.clearRect(0, 0, w, h);
    const g = ctx.createRadialGradient(cx - rad * 0.32, cy - rad * 0.36, rad * 0.1, cx, cy, rad);
    g.addColorStop(0, "#fff6d0");
    g.addColorStop(0.42, "#ffc83d");
    g.addColorStop(1, "#c2410c");
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.lineWidth = Math.max(1.5, w * 0.045);
    ctx.strokeStyle = "rgba(122, 58, 6, 0.45)";
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, rad * 0.78, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(90, 38, 0, 0.4)";
    ctx.stroke();
    ctx.fillStyle = "#5a2600";
    ctx.font = `400 ${Math.round(w * 0.28)}px Anton, Impact, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("TGC", cx, cy + w * 0.02);
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, rad, 0, Math.PI * 2);
    ctx.clip();
    ctx.translate(cx, cy);
    ctx.rotate(t * 0.7);
    const shine = ctx.createLinearGradient(-rad, 0, rad, 0);
    shine.addColorStop(0, "rgba(255,255,255,0)");
    shine.addColorStop(0.5, "rgba(255,255,255,0.5)");
    shine.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(-rad, -rad * 0.18, rad * 2, rad * 0.28);
    ctx.restore();
  };
}

function bootHero(cardImages) {
  const canvas = $(".hero-canvas");
  const embers = Array.from({ length: 42 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: Math.random() * 1.8 + 0.5,
    s: Math.random() * 0.08 + 0.025,
    a: Math.random() * 0.7 + 0.2,
  }));
  const spots = [
    { x: 0.04, y: 0.16, rot: -0.22, h: 0.34 },
    { x: 0.07, y: 0.54, rot: 0.14, h: 0.38 },
    { x: 0.78, y: 0.12, rot: 0.2, h: 0.34 },
    { x: 0.74, y: 0.52, rot: -0.12, h: 0.38 },
  ];

  return function update(dt, t) {
    const { ctx, w, h } = fitCanvas(canvas);
    if (w < 2) return;
    ctx.clearRect(0, 0, w, h);
    const narrow = w < 760;
    spots.forEach((spot, i) => {
      const img = cardImages[HERO_CARDS[i]];
      if (!img) return;
      const cardH = h * (narrow ? spot.h * 0.72 : spot.h);
      const cardW = cardH * (688 / 1024);
      const bob = Math.sin(t * 0.9 + i) * (narrow ? 6 : 10);
      const x = (narrow ? 0.02 + (spot.x > 0.5 ? 0.62 : 0) : spot.x) * w;
      const y = spot.y * h + bob;
      ctx.save();
      ctx.translate(x + cardW / 2, y + cardH / 2);
      ctx.rotate(spot.rot + Math.sin(t * 0.6 + i) * 0.03);
      ctx.shadowColor = "rgba(255, 100, 30, 0.4)";
      ctx.shadowBlur = 24;
      roundImage(ctx, img, -cardW / 2, -cardH / 2, cardW, cardH, 12);
      ctx.restore();
    });
    for (const ember of embers) {
      ember.y -= ember.s * dt * 8;
      if (ember.y < -0.02) ember.y = 1.02;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, 186, 90, ${ember.a})`;
      ctx.arc(ember.x * w, ember.y * h, ember.r, 0, Math.PI * 2);
      ctx.fill();
    }
  };
}

async function main() {
  bootPreloader();
  bootCursor();
  bootNav();
  bootWallet();
  $(".fca-addr").addEventListener("click", copyAddress);

  const [cardImages, packImages] = await Promise.all([
    Promise.all(CARDS.map((card) => loadImage(card.image))),
    Promise.all(PACKS.map((pack) => loadImage(pack.image))),
  ]);

  const hero = bootHero(cardImages);
  const meet = bootMeet();
  const collection = bootCollection(cardImages);
  const graded = bootGraded(cardImages);
  const packs = bootPacks(packImages);
  const live = bootLive();
  const coin = bootCoin();

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    hero(dt, t);
    meet();
    collection(dt);
    graded(t);
    packs(dt);
    live();
    coin(t);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

main();
