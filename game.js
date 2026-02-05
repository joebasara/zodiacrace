// game.js
/*************************************************
 * RHYTHM RACER - SIMPLE MOBILE + PC
 *
 * Goals:
 * 1) ONLY ONE START BUTTON (no unmute button)
 * 2) Start button gesture starts BOTH video + audio
 * 3) Beat timing stays tied to video.currentTime
 * 4) You can paste your own beatmap
 *************************************************/

/* =====================
   CONFIG
===================== */

// Time (seconds) for a beat to travel from spawn point to the hit circle center
const FALL_TIME = 1.6;

// Hit tolerance window (seconds)
const HIT_WINDOW = 0.15;

// How long after the scheduled time before we auto-remove a beat (miss cleanup)
const MISS_CLEANUP_AFTER = 0.35;

// Score per successful hit (simple points only)
const POINTS_PER_HIT = 1;

// Video file (must exist in same folder)
const VIDEO_FILE = "race.mp4";

/* =====================
   BEATMAP
   👉 Paste your beatmap here
   lane: 0 = left, 1 = right
===================== */

const BEATMAP = [
  // Example entries:
  // { time: 5.561, lane: 1 },
  // { time: 6.240, lane: 0 },
];

/* =====================
   DOM REFERENCES
===================== */
const game = document.getElementById("game");
const video = document.getElementById("video");
const lanes = [
  document.getElementById("lane-left"),
  document.getElementById("lane-right"),
];

const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");

const scoreEl = document.getElementById("score");
const result = document.getElementById("result");
const resultLine = document.getElementById("resultLine");

/* =====================
   STATE
===================== */
let started = false;
let beatIndex = 0;
let activeBeats = []; // { el, time, lane }
let score = 0;

/* =====================
   LOAD VIDEO
===================== */
video.src = VIDEO_FILE;
// Important: do NOT force muted in HTML.
// We'll set muted=false and call play() inside the Start button gesture.

/* =====================
   START BUTTON (ONE BUTTON ONLY)
   - On mobile, audio is allowed ONLY if play() happens
     right inside a user gesture (tap/click).
===================== */
startBtn.addEventListener("click", async () => {
  if (started) return;
  started = true;

  // Reset game state (useful if you later add "restart")
  beatIndex = 0;
  activeBeats = [];
  score = 0;
  scoreEl.textContent = "0";
  result.classList.remove("show");

  try {
    // KEY: set audio ON before play() inside this gesture
    video.muted = false;
    video.volume = 1.0;

    // Attempt to start audio+video together
    await video.play();

    // Hide overlay only after playback begins
    overlay.classList.add("hidden");

    requestAnimationFrame(gameLoop);
  } catch (err) {
    // If something blocks it, we log it so you can debug on mobile.
    console.warn("Playback blocked on Start:", err);

    // As a fallback, try starting muted (rare on modern devices)
    // (Still keeps "one button" UX; no unmute button shown.)
    try {
      video.muted = true;
      await video.play();
      overlay.classList.add("hidden");
      requestAnimationFrame(gameLoop);
    } catch (err2) {
      console.error("Still blocked even when muted:", err2);
      // If this happens, the device/browser is extremely restrictive.
      // The user can try tapping again; we keep the overlay visible.
      started = false;
    }
  }
});

/* =====================
   INPUT (PC + MOBILE)

   PC:
     - A = left lane hit
     - D = right lane hit

   Mobile:
     - Tap LEFT half of screen = left hit
     - Tap RIGHT half of screen = right hit
===================== */

// Keyboard (PC)
window.addEventListener("keydown", (e) => {
  if (!started) return;

  const k = e.key.toLowerCase();
  if (k === "a") handleHit(0);
  if (k === "d") handleHit(1);
});

// Tap/click screen (mobile + desktop)
game.addEventListener("pointerdown", (e) => {
  // IMPORTANT: Don't allow hits before starting (prevents "tap start" also hitting)
  if (!started || video.paused) return;

  const x = e.clientX;
  const lane = x < window.innerWidth / 2 ? 0 : 1;
  handleHit(lane);
});

/* =====================
   MAIN LOOP
===================== */
function gameLoop() {
  const t = video.currentTime;

  spawnBeats(t);
  updateBeats(t);
  cleanupMisses(t);

  // End of video -> show results
  if (video.ended || (video.duration && t >= video.duration - 0.02)) {
    showResult();
    return;
  }

  if (!video.paused) requestAnimationFrame(gameLoop);
}

/* =====================
   SPAWN LOGIC
   We spawn a beat FALL_TIME seconds BEFORE its hit time.
===================== */
function spawnBeats(t) {
  while (beatIndex < BEATMAP.length && (BEATMAP[beatIndex].time - t) <= FALL_TIME) {
    createBeat(BEATMAP[beatIndex]);
    beatIndex++;
  }
}

/* =====================
   CREATE BEAT ELEMENT
===================== */
function createBeat(data) {
  const beat = document.createElement("div");
  beat.className = "beat";

  lanes[data.lane].appendChild(beat);

  activeBeats.push({
    el: beat,
    time: data.time,
    lane: data.lane,
  });
}

/* =====================
   UPDATE BEATS VISUALLY
   - We read the hit-circle position dynamically.
   - So you can move hit-circle in CSS and timing remains correct.
===================== */
function updateBeats(t) {
  // Note: we avoid splicing in this loop; cleanup happens separately.
  for (const b of activeBeats) {
    const laneEl = lanes[b.lane];
    const hit = laneEl.querySelector(".hit-circle");

    const laneRect = laneEl.getBoundingClientRect();
    const hitRect = hit.getBoundingClientRect();

    // Y position (within the lane) where the beat should land (center of hit circle)
    const hitY = (hitRect.top - laneRect.top) + (hitRect.height / 2);

    // progress = 0 at spawn time, 1 at hit time
    const progress = 1 - (b.time - t) / FALL_TIME;

    // Clamp a bit so it doesn't go negative
    const clamped = Math.max(0, progress);

    // Interpolate from top (0px) -> hitY px
    b.el.style.top = `${hitY * clamped}px`;
  }
}

/* =====================
   MISS CLEANUP
   - If the beat is too far past its hit time, remove it.
===================== */
function cleanupMisses(t) {
  for (let i = activeBeats.length - 1; i >= 0; i--) {
    const b = activeBeats[i];
    if (t > b.time + MISS_CLEANUP_AFTER) {
      b.el.remove();
      activeBeats.splice(i, 1);
    }
  }
}

/* =====================
   HIT DETECTION (simple points)
   - Match lane
   - Must be within HIT_WINDOW of scheduled time
===================== */
function handleHit(lane) {
  const t = video.currentTime;

  // Find the earliest hittable beat in that lane
  for (let i = 0; i < activeBeats.length; i++) {
    const b = activeBeats[i];
    if (b.lane !== lane) continue;

    if (Math.abs(b.time - t) <= HIT_WINDOW) {
      // Successful hit
      b.el.remove();
      activeBeats.splice(i, 1);

      score += POINTS_PER_HIT;
      scoreEl.textContent = String(score);
      return;
    }
  }
}

/* =====================
   END RESULT
===================== */
function showResult() {
  // Pause to stop loop safely
  video.pause();

  const totalBeats = BEATMAP.length;
  const msg = `Score: ${score} / ${totalBeats}`;

  resultLine.textContent = msg;
  result.classList.add("show");
}
