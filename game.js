// =====================
// CONFIG
// =====================
const HIT_WINDOW = 0.3;          // seconds
const FALL_TIME = 1.2;           // seconds for beat to fall
const LANES = [0.15, 0.85];      // left / right (screen %)
const HIT_CIRCLE_RADIUS = 80;    // px

// =====================
// ELEMENTS
// =====================
const video = document.getElementById("bgVideo");
const game = document.getElementById("game");
const startScreen = document.getElementById("startScreen");

// =====================
// STATE
// =====================
let activeBeats = [];
let videoStarted = false;
let lastTime = 0;

// =====================
// BEATMAP (EDIT THESE TIMES)
// =====================
const beatmap = [
  { time: 1.0, lane: 0, spawned: false },
  { time: 1.8, lane: 1, spawned: false },
  { time: 2.6, lane: 0, spawned: false },
  { time: 3.4, lane: 1, spawned: false },
  { time: 4.2, lane: 0, spawned: false },
];

// =====================
// RESET (CRITICAL FOR MOBILE)
// =====================
function resetGameState() {
  video.pause();
  video.currentTime = 0;
  video.muted = true;

  beatmap.forEach(b => b.spawned = false);

  activeBeats.forEach(b => b.el.remove());
  activeBeats = [];

  lastTime = 0;
  videoStarted = false;
}

// =====================
// SPAWN BEAT
// =====================
function spawnBeat(beat) {
  const el = document.createElement("div");
  el.className = "beat";

  el.style.left = `${LANES[beat.lane] * 100}%`;
  el.style.top = "-60px";

  game.appendChild(el);

  activeBeats.push({
    time: beat.time,
    lane: beat.lane,
    el
  });
}

// =====================
// UPDATE LOOP
// =====================
function update(timestamp) {
  if (!videoStarted) return;

  const t = video.currentTime;

  // Spawn beats
  beatmap.forEach(b => {
    if (!b.spawned && t >= b.time - FALL_TIME) {
      b.spawned = true;
      spawnBeat(b);
    }
  });

  // Update beats
  activeBeats.forEach((b, i) => {
    const progress = (t - (b.time - FALL_TIME)) / FALL_TIME;
    const y = progress * window.innerHeight * 0.5;

    b.el.style.transform = `translate(-50%, ${y}px)`;

    // Miss
    if (t > b.time + HIT_WINDOW) {
      b.el.style.background = "red";
      setTimeout(() => b.el.remove(), 200);
      activeBeats.splice(i, 1);
    }
  });

  requestAnimationFrame(update);
}

// =====================
// INPUT
// =====================
function handleHit(x) {
  const t = video.currentTime;
  const lane = x < window.innerWidth / 2 ? 0 : 1;

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

// Touch + Mouse
window.addEventListener("touchstart", e => {
  handleHit(e.touches[0].clientX);
});

window.addEventListener("mousedown", e => {
  handleHit(e.clientX);
});

// =====================
// START GAME (MOBILE SAFE)
// =====================
function startGame() {
  resetGameState();

  video.play().then(() => {
    video.muted = false;
    videoStarted = true;
    startScreen.style.display = "none";
    requestAnimationFrame(update);
  }).catch(err => {
    console.error("Playback failed:", err);
  });
}

startScreen.addEventListener("click", startGame);
startScreen.addEventListener("touchstart", startGame);

// =====================
// MOBILE BACK/FORWARD CACHE FIX
// =====================
window.addEventListener("pageshow", e => {
  if (e.persisted) location.reload();
});
