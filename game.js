/*************************************************
 * RHYTHM RACER (PC + MOBILE)
 * - Starts muted for autoplay safety
 * - Unmutes AFTER user clicks/taps Start
 *************************************************/

/* =====================
   CONFIG
===================== */
const FALL_TIME = 1.6;
const HIT_WINDOW = 0.10;
const POINTS_PER_HIT = 100;
const VIDEO_FILE = "race.mp4";

/* =====================
   BEATMAP (PASTE YOURS HERE)
===================== */
const BEATMAP = [
  // { time: 5.561, lane: 1 },
  // { time: 6.240, lane: 0 },
];

/* =====================
   DOM
===================== */
const game = document.getElementById("game");
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const errorEl = document.getElementById("error");
const pointsEl = document.getElementById("points");

const lanes = [
  document.getElementById("lane-left"),
  document.getElementById("lane-right"),
];

/* =====================
   STATE
===================== */
let started = false;
let beatIndex = 0;
let activeBeats = [];
let score = 0;

function setError(msg) { errorEl.textContent = msg || ""; }
function setPoints(v) {
  score = v;
  pointsEl.textContent = `Points: ${score}`;
}

/* =====================
   VIDEO
===================== */
video.src = VIDEO_FILE;

// Start muted for compatibility; we'll unmute after user click.
video.muted = true;
video.volume = 1.0;

video.addEventListener("error", () => {
  setError(
    `Video failed to load.\n` +
    `Check that "${VIDEO_FILE}" is in the same folder as index.html.\n` +
    `Also ensure the file can play in your browser (try opening it directly).`
  );
});

/* =====================
   START GAME
===================== */
async function startGameOnce() {
  if (started) return;

  setError("");
  started = true;
  overlay.style.display = "none";

  beatIndex = 0;
  activeBeats = [];
  setPoints(0);

  try {
    video.currentTime = 0;

    // Play while muted first (most reliable)
    video.muted = true;
    await video.play();

    // Now unmute AFTER play succeeds (still inside user gesture)
    video.muted = false;
    video.volume = 1.0;

    requestAnimationFrame(gameLoop);
  } catch (err) {
    started = false;
    overlay.style.display = "flex";
    setError(
      `Video play was blocked or failed.\n` +
      `Details: ${String(err)}`
    );
  }
}

overlay.addEventListener("click", startGameOnce);
overlay.addEventListener("touchstart", startGameOnce, { passive: true });
game.addEventListener("click", startGameOnce);
game.addEventListener("touchstart", startGameOnce, { passive: true });

/* =====================
   INPUT
===================== */
window.addEventListener("keydown", (e) => {
  if (!started) return;
  const k = e.key.toLowerCase();
  if (k === "a") hitLane(0);
  if (k === "d") hitLane(1);
});

game.addEventListener("touchstart", (e) => {
  if (!started) return;
  const x = e.touches[0].clientX;
  const lane = x < window.innerWidth / 2 ? 0 : 1;
  hitLane(lane);
}, { passive: true });

/* =====================
   LOOP
===================== */
function gameLoop() {
  const t = video.currentTime;
  spawnBeats(t);
  updateBeats(t);

  if (!video.ended && !video.paused) {
    requestAnimationFrame(gameLoop);
  }
}

/* =====================
   SPAWN / UPDATE
===================== */
function spawnBeats(t) {
  while (beatIndex < BEATMAP.length && (BEATMAP[beatIndex].time - t) <= FALL_TIME) {
    createBeat(BEATMAP[beatIndex]);
    beatIndex++;
  }
}

function createBeat(data) {
  const beat = document.createElement("div");
  beat.className = "beat";
  lanes[data.lane].appendChild(beat);

  activeBeats.push({ el: beat, time: data.time, lane: data.lane });
}

function updateBeats(t) {
  for (let i = activeBeats.length - 1; i >= 0; i--) {
    const b = activeBeats[i];
    const laneEl = lanes[b.lane];
    const hit = laneEl.querySelector(".hit-circle");

    const hitY = hit.offsetTop + hit.offsetHeight / 2;
    const progress = 1 - (b.time - t) / FALL_TIME;

    if (progress > 1.25) {
      b.el.remove();
      activeBeats.splice(i, 1);
      continue;
    }

    const y = Math.max(0, hitY * progress);
    b.el.style.top = `${y}px`;
  }
}

/* =====================
   HIT (POINTS ONLY)
===================== */
function hitLane(lane) {
  const t = video.currentTime;

  for (let i = 0; i < activeBeats.length; i++) {
    const b = activeBeats[i];
    if (b.lane !== lane) continue;

    if (Math.abs(b.time - t) <= HIT_WINDOW) {
      setPoints(score + POINTS_PER_HIT);
      b.el.remove();
      activeBeats.splice(i, 1);
      return;
    }
  }
}
