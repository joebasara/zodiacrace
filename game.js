/* ===============================
   CONFIG
================================ */
const FALL_DURATION = 1200;   // ms to fall to hit circle
const HIT_WINDOW = 300;       // ± ms timing window
const START_OFFSET = 0;

/* ===============================
   BEATMAP (replace with recorded data)
================================ */
const beatmap = [
  { time: 800,  lane: 0 },
  { time: 1200, lane: 1 },
  { time: 2000, lane: 0 },
  { time: 2300, lane: 1 },
  { time: 3000, lane: 0 }
];

/* ===============================
   STATE
================================ */
const video = document.getElementById("bgVideo");
const startScreen = document.getElementById("startScreen");

let videoStarted = false;
let activeBeats = [];

/* ===============================
   START GAME (USER GESTURE)
================================ */
startScreen.addEventListener("touchstart", startGame, { once: true });
startScreen.addEventListener("click", startGame, { once: true });

function startGame() {
  video.play().then(() => {
    video.muted = false;        // REQUIRED for mobile audio
    videoStarted = true;
    startScreen.remove();
    requestAnimationFrame(update);
  }).catch(err => {
    console.error("Video failed to play:", err);
  });
}

/* ===============================
   SPAWN BEAT
================================ */
function spawnBeat(beat) {
  const laneEl = beat.lane === 0
    ? document.getElementById("lane-left")
    : document.getElementById("lane-right");

  const el = document.createElement("div");
  el.className = "beat";
  el.style.top = "-70px";

  laneEl.appendChild(el);

  activeBeats.push({
    el,
    laneEl,
    spawnTime: beat.time - FALL_DURATION,
    hitTime: beat.time,
    hit: false
  });
}

/* ===============================
   UPDATE LOOP
================================ */
function update() {
  if (!videoStarted) return;

  const songTime = video.currentTime * 1000 + START_OFFSET;

  // Spawn beats
  for (const beat of beatmap) {
    if (!beat.spawned && songTime >= beat.time - FALL_DURATION) {
      spawnBeat(beat);
      beat.spawned = true;
    }
  }

  // Update falling beats
  activeBeats = activeBeats.filter(b => {
    const progress = (songTime - b.spawnTime) / FALL_DURATION;

    if (progress >= 1.2) {
      if (!b.hit) b.el.classList.add("miss");
      setTimeout(() => b.el.remove(), 150);
      return false;
    }

    const laneHeight = b.laneEl.clientHeight;
    const hitY = laneHeight * 0.5;
    const startY = -70;
    const y = startY + progress * (hitY - startY);

    b.el.style.top = y + "px";
    return true;
  });

  requestAnimationFrame(update);
}

/* ===============================
   INPUT / HIT DETECTION
================================ */
document.body.addEventListener("touchstart", e => {
  handleTap(e.touches[0].clientX);
});

document.body.addEventListener("click", e => {
  handleTap(e.clientX);
});

function handleTap(x) {
  if (!videoStarted) return;

  const lane = x < window.innerWidth / 2 ? 0 : 1;
  const songTime = video.currentTime * 1000;

  for (const b of activeBeats) {
    if (b.hit) continue;
    if (b.laneEl.id !== (lane === 0 ? "lane-left" : "lane-right")) continue;

    const diff = Math.abs(songTime - b.hitTime);

    const beatRect = b.el.getBoundingClientRect();
    const circleRect = b.laneEl.querySelector(".hit-circle").getBoundingClientRect();

    const beatCenter = beatRect.top + beatRect.height / 2;
    const circleCenter = circleRect.top + circleRect.height / 2;
    const distance = Math.abs(beatCenter - circleCenter);

    if (diff <= HIT_WINDOW && distance < circleRect.height / 2) {
      b.hit = true;
      b.el.classList.add("hit");
      return;
    }
  }
}
