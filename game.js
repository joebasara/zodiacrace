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

  { time: 5.587, lane: 1 },
  { time: 6.272, lane: 0 },
  { time: 7.815, lane: 1 },
  { time: 7.987, lane: 0 },
  { time: 8.330, lane: 1 },
  { time: 9.015, lane: 0 },

  { time: 10.387, lane: 1 },
  { time: 10.473, lane: 0 },
  { time: 10.730, lane: 1 },
  { time: 10.901, lane: 0 },
  { time: 11.244, lane: 1 },
  { time: 11.416, lane: 0 },

  { time: 11.930, lane: 1 },
  { time: 12.101, lane: 0 },
  { time: 12.616, lane: 1 },
  { time: 12.787, lane: 0 },
  { time: 13.301, lane: 1 },
  { time: 13.473, lane: 0 },

  { time: 15.187, lane: 1 },
  { time: 15.530, lane: 1 },
  { time: 15.873, lane: 1 },

  { time: 16.044, lane: 0 },
  { time: 16.215, lane: 1 },
  { time: 16.387, lane: 0 },
  { time: 16.558, lane: 1 },
  { time: 16.901, lane: 0 },

  { time: 17.244, lane: 1 },
  { time: 17.587, lane: 0 },
  { time: 17.930, lane: 1 },
  { time: 18.273, lane: 0 },
  { time: 18.616, lane: 1 },
  { time: 18.959, lane: 0 },

  { time: 19.301, lane: 1 },
  { time: 19.644, lane: 0 },
  { time: 19.987, lane: 1 },
  { time: 20.330, lane: 0 },
  { time: 20.673, lane: 1 },
  { time: 21.016, lane: 0 },

  { time: 21.358, lane: 1 },
  { time: 21.701, lane: 0 },
  { time: 22.044, lane: 1 },

  { time: 22.387, lane: 1 },
  { time: 22.730, lane: 1 },
  { time: 23.073, lane: 1 },
  { time: 23.415, lane: 1 },
  { time: 23.758, lane: 1 },
  { time: 24.101, lane: 1 },
  { time: 24.444, lane: 1 },

  { time: 24.787, lane: 1 },
  { time: 24.787, lane: 0 },

  { time: 25.130, lane: 1 },
  { time: 25.130, lane: 0 },

  { time: 25.473, lane: 0 },
  { time: 25.473, lane: 1 },

  { time: 25.816, lane: 1 },
  { time: 25.816, lane: 0 },

  { time: 26.158, lane: 0 },
  { time: 26.158, lane: 1 },

  { time: 26.501, lane: 0 },
  { time: 26.501, lane: 1 },

  { time: 26.672, lane: 0 },
  { time: 26.672, lane: 1 },

  { time: 26.844, lane: 0 },
  { time: 26.844, lane: 1 },

  { time: 27.530, lane: 1 },
  { time: 27.873, lane: 0 },

  { time: 28.215, lane: 1 },
  { time: 28.558, lane: 0 },
  { time: 28.730, lane: 1 },
  { time: 28.901, lane: 0 },

  { time: 29.073, lane: 1 },
  { time: 29.244, lane: 0 },
  { time: 29.587, lane: 1 },
  { time: 29.930, lane: 0 },

  { time: 30.273, lane: 1 },
  { time: 30.616, lane: 0 },
  { time: 30.958, lane: 1 },
  { time: 31.301, lane: 0 },

  { time: 31.473, lane: 1 },
  { time: 31.644, lane: 0 },
  { time: 31.816, lane: 1 },
  { time: 31.987, lane: 0 },

  { time: 32.330, lane: 1 },
  { time: 32.673, lane: 0 },
  { time: 33.016, lane: 1 },
  { time: 33.358, lane: 0 },

  { time: 33.701, lane: 1 },
  { time: 34.044, lane: 0 },
  { time: 34.215, lane: 1 },
  { time: 34.387, lane: 0 },

  { time: 34.558, lane: 1 },
  { time: 34.730, lane: 0 },

  { time: 35.073, lane: 1 },
  { time: 35.415, lane: 0 },
  { time: 35.758, lane: 1 },
  { time: 36.101, lane: 0 },

  { time: 36.444, lane: 1 },
  { time: 36.787, lane: 0 },
  { time: 37.130, lane: 1 },
  { time: 37.301, lane: 0 },

  { time: 37.473, lane: 1 },
  { time: 37.816, lane: 0 },
  { time: 38.158, lane: 1 },

  { time: 38.501, lane: 1 },
  { time: 38.873, lane: 1 },

  { time: 39.044, lane: 0 },
  { time: 39.215, lane: 1 },
  { time: 39.530, lane: 1 },
  { time: 39.701, lane: 0 },

  { time: 39.873, lane: 1 },
  { time: 40.215, lane: 1 },
  { time: 40.387, lane: 0 },
  { time: 40.558, lane: 1 },

  { time: 40.901, lane: 1 },
  { time: 41.073, lane: 0 },
  { time: 41.244, lane: 1 },

  { time: 41.587, lane: 1 },
  { time: 41.758, lane: 0 },
  { time: 41.930, lane: 1 },

  { time: 42.273, lane: 1 },
  { time: 42.444, lane: 0 },
  { time: 42.616, lane: 1 },

  { time: 42.958, lane: 1 },
  { time: 43.130, lane: 0 },
  { time: 43.301, lane: 1 },

  { time: 43.644, lane: 1 },
  { time: 43.816, lane: 0 },
  { time: 43.987, lane: 1 },

  { time: 44.330, lane: 1 },
  { time: 44.501, lane: 0 },
  { time: 44.673, lane: 1 },

  { time: 45.016, lane: 1 },
  { time: 45.187, lane: 0 },
  { time: 45.358, lane: 1 },

  { time: 45.701, lane: 1 },
  { time: 45.873, lane: 0 },
  { time: 46.044, lane: 1 },

  { time: 46.387, lane: 1 },
  { time: 46.558, lane: 0 },
  { time: 46.730, lane: 1 },

  { time: 47.416, lane: 1 },
  { time: 48.101, lane: 1 },
  { time: 48.444, lane: 1 },
  { time: 48.787, lane: 1 },
  { time: 49.473, lane: 1 },
  { time: 50.159, lane: 1 },
  { time: 50.844, lane: 1 },
  { time: 51.530, lane: 1 },
  { time: 52.216, lane: 1 },

  { time: 52.387, lane: 0 },
  { time: 52.558, lane: 1 },
  { time: 52.730, lane: 0 },
  { time: 52.901, lane: 1 },

  { time: 53.073, lane: 0 },
  { time: 53.244, lane: 1 },
  { time: 53.416, lane: 0 },
  { time: 53.587, lane: 1 },

  { time: 53.758, lane: 0 },
  { time: 53.930, lane: 1 },
  { time: 54.101, lane: 0 },
  { time: 54.273, lane: 1 },

  { time: 54.444, lane: 0 },
  { time: 54.616, lane: 1 },
  { time: 54.787, lane: 0 },
  { time: 54.959, lane: 1 },

  { time: 55.130, lane: 0 },
  { time: 55.301, lane: 1 },
  { time: 55.473, lane: 0 },
  { time: 55.644, lane: 1 },

  { time: 55.816, lane: 0 },
  { time: 55.987, lane: 1 },
  { time: 56.158, lane: 0 },
  { time: 56.330, lane: 1 },

  { time: 56.501, lane: 0 },
  { time: 56.673, lane: 1 },
  { time: 56.844, lane: 0 },
  { time: 57.016, lane: 1 },

  { time: 57.187, lane: 0 },
  { time: 57.358, lane: 1 },
  { time: 57.530, lane: 0 },
  { time: 57.701, lane: 1 },

  { time: 57.873, lane: 0 },
  { time: 58.044, lane: 1 },
  { time: 58.216, lane: 0 },
  { time: 58.387, lane: 1 },

  { time: 58.558, lane: 0 },
  { time: 58.730, lane: 1 },
  { time: 58.901, lane: 0 },
  { time: 59.073, lane: 1 },

  { time: 59.244, lane: 0 },
  { time: 59.416, lane: 1 },
  { time: 59.587, lane: 0 },
  { time: 59.758, lane: 1 },

  { time: 59.930, lane: 0 },
  { time: 60.101, lane: 1 },
  { time: 60.273, lane: 0 },
  { time: 60.444, lane: 1 },

  { time: 61.130, lane: 1 },
  { time: 61.816, lane: 1 },

  { time: 63.187, lane: 1 },
  { time: 63.358, lane: 0 },
  { time: 63.530, lane: 1 },
  { time: 63.701, lane: 0 },

  { time: 63.873, lane: 1 },
  { time: 64.044, lane: 0 },
  { time: 64.215, lane: 1 },
  { time: 64.387, lane: 0 },

  { time: 64.558, lane: 1 },
  { time: 64.730, lane: 0 },
  { time: 64.901, lane: 1 },
  { time: 65.073, lane: 0 },

  { time: 65.244, lane: 1 },
  { time: 65.416, lane: 0 },
  { time: 65.587, lane: 1 },
  { time: 65.758, lane: 0 },

  { time: 65.930, lane: 1 },
  { time: 66.101, lane: 0 },
  { time: 66.273, lane: 1 },
  { time: 66.444, lane: 0 },

  { time: 66.616, lane: 1 },
  { time: 66.787, lane: 0 },
  { time: 66.959, lane: 1 },
  { time: 67.130, lane: 0 },

  { time: 67.301, lane: 1 },
  { time: 67.473, lane: 0 },
  { time: 67.644, lane: 1 },
  { time: 67.816, lane: 0 },

  { time: 67.987, lane: 1 },
  { time: 68.158, lane: 0 },
  { time: 68.330, lane: 1 },
  { time: 68.501, lane: 0 },

  { time: 68.673, lane: 1 },
  { time: 68.844, lane: 0 },
  { time: 69.016, lane: 1 },
  { time: 69.187, lane: 0 },

  { time: 69.358, lane: 1 },
  { time: 69.530, lane: 0 },
  { time: 69.701, lane: 1 },
  { time: 69.873, lane: 0 },

  { time: 70.044, lane: 1 },
  { time: 70.215, lane: 0 },
  { time: 70.387, lane: 1 },
  { time: 70.558, lane: 0 },

  { time: 70.730, lane: 1 },
  { time: 70.901, lane: 0 },
  { time: 71.073, lane: 1 },
  { time: 71.244, lane: 0 },

  { time: 71.416, lane: 1 },

  { time: 72.101, lane: 1 },
  { time: 72.787, lane: 1 },
  { time: 73.473, lane: 1 },
  { time: 74.159, lane: 1 },

  { time: 79.816, lane: 1 },
  { time: 79.987, lane: 0 },
  { time: 80.501, lane: 1 },
  { time: 80.673, lane: 0 },
  { time: 81.187, lane: 1 },
  { time: 81.358, lane: 0 },
  { time: 81.873, lane: 1 },
  { time: 82.044, lane: 0 },

  { time: 83.758, lane: 1 },
  { time: 84.101, lane: 0 },
  { time: 84.444, lane: 1 },
  { time: 84.616, lane: 0 },
  { time: 84.787, lane: 1 },
  { time: 84.959, lane: 0 },

  { time: 85.130, lane: 1 },
  { time: 85.473, lane: 0 },
  { time: 85.816, lane: 1 },
  { time: 86.158, lane: 0 },
  { time: 86.501, lane: 1 },
  { time: 86.844, lane: 0 },

  { time: 87.187, lane: 1 },
  { time: 87.530, lane: 0 },
  { time: 87.873, lane: 1 },
  { time: 88.216, lane: 0 },
  { time: 88.558, lane: 1 },
  { time: 88.901, lane: 0 },

  { time: 89.244, lane: 1 },
  { time: 89.587, lane: 0 },
  { time: 89.930, lane: 1 },
  { time: 90.273, lane: 0 },
  { time: 90.616, lane: 1 },

  { time: 91.301, lane: 1 },
  { time: 91.987, lane: 1 },
  { time: 92.673, lane: 1 },
  { time: 93.358, lane: 1 },
  { time: 94.044, lane: 1 },
  { time: 94.730, lane: 1 },
  { time: 95.416, lane: 1 },
  { time: 96.101, lane: 1 },

  { time: 96.444, lane: 1 },
  { time: 96.616, lane: 0 },
  { time: 96.787, lane: 1 },
  { time: 97.130, lane: 1 },
  { time: 97.301, lane: 0 },
  { time: 97.473, lane: 1 },
  { time: 97.816, lane: 1 },
  { time: 97.987, lane: 0 },

  { time: 98.158, lane: 1 },
  { time: 98.330, lane: 0 },
  { time: 98.501, lane: 1 },
  { time: 98.844, lane: 1 },
  { time: 99.187, lane: 1 },

  { time: 99.358, lane: 0 },
  { time: 99.530, lane: 1 },
  { time: 99.873, lane: 1 },
  { time: 100.044, lane: 0 },

  { time: 100.216, lane: 1 },
  { time: 100.558, lane: 1 },
  { time: 100.730, lane: 0 },

  { time: 100.901, lane: 1 },
  { time: 101.073, lane: 0 },
  { time: 101.244, lane: 1 },

  { time: 101.587, lane: 1 },
  { time: 101.930, lane: 1 },
  { time: 102.101, lane: 0 },

  { time: 102.273, lane: 1 },
  { time: 102.616, lane: 1 },
  { time: 102.787, lane: 0 },

  { time: 102.958, lane: 1 },
  { time: 103.301, lane: 1 },
  { time: 103.473, lane: 0 },

  { time: 103.644, lane: 1 },
  { time: 103.816, lane: 0 },
  { time: 103.987, lane: 1 },
  { time: 104.158, lane: 0 },

  { time: 104.330, lane: 1 },
  { time: 104.673, lane: 1 },
  { time: 104.844, lane: 0 },

  { time: 105.016, lane: 1 },
  { time: 105.358, lane: 1 },
  { time: 105.530, lane: 0 },

  { time: 105.701, lane: 1 },
  { time: 105.873, lane: 0 },
  { time: 105.944, lane: 1 },
  { time: 106.015, lane: 0 },

  { time: 106.101, lane: 1 },
  { time: 106.187, lane: 0 },
  { time: 106.273, lane: 1 },
  { time: 106.616, lane: 0 }

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

