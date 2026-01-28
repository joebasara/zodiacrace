/* =========================
   CONFIG
========================= */
const FALL_TIME = 1.2;   // seconds
const HIT_WINDOW = 0.3; // seconds
const LANES = [0.15, 0.85];

/* =========================
   ELEMENTS
========================= */
const video = document.getElementById("bgVideo");
const game = document.getElementById("game");
const startScreen = document.getElementById("startScreen");

/* =========================
   STATE
========================= */
let started = false;
let activeBeats = [];

/* =========================
   BEATMAP (EDIT THIS)
========================= */
const beatmap = [
  { time: 1.0, lane: 0, spawned: false },
  { time: 1.8, lane: 1, spawned: false },
  { time: 2.6, lane: 0, spawned: false },
  { time: 3.4, lane: 1, spawned: false },
  { time: 4.2, lane: 0, spawned: false }
];

/* =========================
   SPAWN BEAT
========================= */
function spawnBeat(b) {
  const el = document.createElement("div");
  el.className = "beat";
  el.style.left = `${LANES[b.lane] * 100}%`;
  el.style.top = "-60px";
  game.appendChild(el);

  activeBeats.push({ ...b, el });
}

/* =========================
   UPDATE LOOP
========================= */
function update() {
  if (!started) return;

  const t = video.currentTime;

  // Spawn beats
  beatmap.forEach(b => {
    if (!b.spawned && t >= b.time - FALL_TIME) {
      b.spawned = true;
      spawnBeat(b);
    }
  });

  // Move beats
  activeBeats = activeBeats.filter(b => {
    const progress = (t - (b.time - FALL_TIME)) / FALL_TIME;

    if (progress > 1.3) {
      b.el.remove();
      return false;
    }

    const y = progress * window.innerHeight * 0.5;
    b.el.style.top = `${y}px`;
    return true;
  });

  requestAnimationFrame(update);
}

/* =========================
   INPUT
========================= */
function handleHit(x) {
  const lane = x < window.innerWidth / 2 ? 0 : 1;
  const t = video.currentTime;

  for (let i = 0; i < activeBeats.length; i++) {
    const b = activeBeats[i];
    if (
      b.lane === lane &&
      Math.abs(b.time - t) <= HIT_WINDOW
    ) {
      b.el.style.background = "gold";
      setTimeout(() => b.el.remove(), 150);
      activeBeats.splice(i, 1);
      return;
    }
  }
}

window.addEventListener("touchstart", e => {
  handleHit(e.touches[0].clientX);
});

window.addEventListener("mousedown", e => {
  handleHit(e.clientX);
});

/* =========================
   START (MOBILE SAFE)
========================= */
function startGame() {
  if (started) return;

  started = true;
  startScreen.style.display = "none";

  video.currentTime = 0;
  video.muted = false;

  video.play().then(() => {
    requestAnimationFrame(update);
  }).catch(err => {
    console.error("Playback blocked:", err);
  });
}

startScreen.addEventListener("click", startGame);
startScreen.addEventListener("touchstart", startGame);

/* =========================
   iOS BACK CACHE FIX
========================= */
window.addEventListener("pageshow", e => {
  if (e.persisted) location.reload();
});
