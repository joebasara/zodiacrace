// game.js
/*************************************************
 * RHYTHM RACER - SIMPLE MOBILE + PC (ONE START BUTTON)
 *
 * Requirements covered:
 * 1) ONLY ONE start button (no unmute button)
 * 2) Start gesture starts BOTH video + audio on mobile
 * 3) Beat timing tied to video.currentTime (not wall clock)
 * 4) You can paste your own beatmap
 * 5) PC keys A/D + Mobile tap left/right
 * 6) Hit circle position can be moved in CSS; visuals still align
 * 7) Beats turn yellow when hit + hit circle flashes
 * 8) Points only (no combo/hits UI), show points counter
 * 9) End phrases based on score ranges (with safe scaling if total != 618)
 * 10) Allow spawning higher off-screen to improve feel without breaking timing
 *************************************************/

/* =====================
   CONFIG
===================== */

// Video file (must exist in same folder)
const VIDEO_FILE = "race.mp4";

/*
  HIT WINDOW:
  If you still feel “not accurate”, increase slightly (e.g. 0.18–0.22).
*/
const HIT_WINDOW = 0.15;

// Remove beats a bit after they pass their scheduled time (miss cleanup)
const MISS_CLEANUP_AFTER = 0.35;

// Score per hit (simple points)
const POINTS_PER_HIT = 1;

/*
  VISUAL SPEED SYSTEM (important):
  Many rhythm-game “rushed” feelings happen when distance changes
  (hit circle moved up/down, spawn moved off-screen) but FALL_TIME stays fixed.

  Here we keep VISUAL SPEED consistent by computing FALL_TIME dynamically:

    fallTime = distancePx / speedPxPerSec

  So:
    - Move hit circle? still feels the same
    - Spawn higher off-screen? still feels the same
*/
const SPEED_FRACTION_OF_LANE_PER_SEC = 0.95; // ~0.95 lane-heights per second

/*
  Spawn above screen:
  Higher spawn makes early beats appear sooner (more reaction time),
  but with this speed system, it won’t make the timing “rush”.
*/
const SPAWN_OFFSCREEN_MULTIPLIER = 0.35; // 0.35 lane-heights above the lane top

/*
  If your beatmap was authored assuming a specific “audio offset”,
  you can adjust it here. Positive = beats happen later, negative = earlier.
  Default 0.
*/
const GLOBAL_TIME_OFFSET = 0.0;

/* =====================
   BEATMAP
   Paste your beatmap here:
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
const totalEl = document.getElementById("total");

const resultBox = document.getElementById("result");
const resultLine = document.getElementById("resultLine");
const resultPhrase = document.getElementById("resultPhrase");

/* =====================
   STATE
===================== */
let started = false;
let beatIndex = 0;
let activeBeats = []; // { el, time, lane }
let score = 0;

/* =====================
   INIT
===================== */
video.src = VIDEO_FILE;
// Don't force muted in HTML. We unmute and play on Start gesture.
video.preload = "auto";
totalEl.textContent = String(BEATMAP.length);

/* =====================
   START BUTTON
   - Must be one gesture that calls play()
   - We hide overlay after playback begins
===================== */
startBtn.addEventListener("click", async () => {
  if (started) return;
  started = true;

  // Reset in case you later add restart
  beatIndex = 0;
  activeBeats = [];
  score = 0;
  scoreEl.textContent = "0";
  totalEl.textContent = String(BEATMAP.length);

  resultBox.classList.remove("show");

  // Clean any leftover beats
  for (const laneEl of lanes) {
    laneEl.querySelectorAll(".beat").forEach((b) => b.remove());
  }

  try {
    // Key: unmute BEFORE play(), inside gesture
    video.muted = false;
    video.volume = 1.0;

    await video.play();

    overlay.classList.add("hidden");
    requestAnimationFrame(gameLoop);
  } catch (err) {
    console.warn("Playback blocked on Start:", err);

    // Fallback: try muted (still one button, no extra unmute UI)
    try {
      video.muted = true;
      await video.play();
      overlay.classList.add("hidden");
      requestAnimationFrame(gameLoop);
    } catch (err2) {
      console.error("Still blocked even when muted:", err2);
      // Keep overlay visible; allow user to tap Start again
      started = false;
    }
  }
});

/* =====================
   INPUT
   PC: A=left, D=right
   Mobile: tap left/right half
===================== */

// Keyboard
window.addEventListener("keydown", (e) => {
  if (!started || video.paused) return;
  const k = e.key.toLowerCase();
  if (k === "a") handleHit(0);
  if (k === "d") handleHit(1);
});

// Pointer input
game.addEventListener("pointerdown", (e) => {
  if (!started || video.paused) return;

  // prevent accidental double actions
  e.preventDefault?.();

  const lane = e.clientX < window.innerWidth / 2 ? 0 : 1;
  handleHit(lane);
}, { passive: false });

/* =====================
   CORE LOOP
===================== */
function gameLoop() {
  const t = video.currentTime;

  spawnBeats(t);
  updateBeats(t);
  cleanupMisses(t);

  if (video.ended || (video.duration && t >= video.duration - 0.02)) {
    showResult();
    return;
  }

  if (!video.paused) requestAnimationFrame(gameLoop);
}

/* =====================
   VISUAL TIMING HELPERS
   fallTime is computed per lane based on pixel distance and speed
===================== */
function computeLaneMetrics(laneEl) {
  const hit = laneEl.querySelector(".hit-circle");
  const laneRect = laneEl.getBoundingClientRect();
  const hitRect = hit.getBoundingClientRect();

  // Target position inside lane: center of hit circle
  const hitY = (hitRect.top - laneRect.top) + (hitRect.height / 2);

  // Spawn above the lane top, offscreen
  const spawnY = -laneRect.height * SPAWN_OFFSCREEN_MULTIPLIER;

  // Distance in pixels
  const distance = hitY - spawnY;

  // Speed = fraction of lane height per second
  const speedPxPerSec = laneRect.height * SPEED_FRACTION_OF_LANE_PER_SEC;

  // Dynamic fall time to keep speed consistent
  const fallTime = Math.max(0.35, distance / Math.max(120, speedPxPerSec));

  return { hitY, spawnY, distance, fallTime };
}

/* =====================
   SPAWN
   Spawn a beat when it's fallTime seconds away from its scheduled hit time.
===================== */
function spawnBeats(t) {
  // We use left lane metrics as reference; lanes are same height in our layout.
  // (If you later make them different, compute per lane in createBeat/update.)
  const refMetrics = computeLaneMetrics(lanes[0]);
  const refFallTime = refMetrics.fallTime;

  while (beatIndex < BEATMAP.length) {
    const beat = BEATMAP[beatIndex];
    const scheduled = beat.time + GLOBAL_TIME_OFFSET;

    if ((scheduled - t) <= refFallTime) {
      createBeat({ time: scheduled, lane: beat.lane });
      beatIndex++;
    } else {
      break;
    }
  }
}

/* =====================
   CREATE BEAT ELEMENT
===================== */
function createBeat(data) {
  const beat = document.createElement("div");
  beat.className = "beat";

  // Put it in the lane
  const laneEl = lanes[data.lane];
  laneEl.appendChild(beat);

  // Start offscreen (actual top set in updateBeats)
  beat.style.top = "-200px";

  activeBeats.push({
    el: beat,
    time: data.time,
    lane: data.lane,
  });
}

/* =====================
   UPDATE VISUALS
   Position beats from spawnY -> hitY based on progress.
===================== */
function updateBeats(t) {
  for (const b of activeBeats) {
    const laneEl = lanes[b.lane];
    const { hitY, spawnY, fallTime } = computeLaneMetrics(laneEl);

    // progress: 0 at spawn moment, 1 at scheduled hit time
    const progress = 1 - (b.time - t) / fallTime;

    // clamp
    const p = Math.max(0, progress);

    // interpolate
    const y = spawnY + (hitY - spawnY) * p;

    b.el.style.top = `${y}px`;
  }
}

/* =====================
   CLEANUP MISSES
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
   HIT DETECTION
   - only hits beats in the tapped lane
   - within HIT_WINDOW
   - gives points
   - beat turns yellow briefly + hit circle flashes
===================== */
function handleHit(lane) {
  const t = video.currentTime;

  for (let i = 0; i < activeBeats.length; i++) {
    const b = activeBeats[i];
    if (b.lane !== lane) continue;

    if (Math.abs(b.time - t) <= HIT_WINDOW) {
      // Visual feedback: beat yellow
      b.el.classList.add("hit");

      // Hit circle flash
      const hitCircle = lanes[lane].querySelector(".hit-circle");
      hitCircle.classList.add("flash");
      setTimeout(() => hitCircle.classList.remove("flash"), 90);

      // Remove beat after short moment so yellow is visible
      const elToRemove = b.el;
      activeBeats.splice(i, 1);
      setTimeout(() => {
        elToRemove.remove();
      }, 60);

      // Points
      score += POINTS_PER_HIT;
      scoreEl.textContent = String(score);
      return;
    } else {
      // beats are time-ordered by spawn, so if earliest isn't in window,
      // later ones won't be either (for same lane). We can early-exit.
      // But only if beat times are non-decreasing in your beatmap.
      // We'll keep it safe and not early-exit.
    }
  }
}

/* =====================
   END RESULT + PHRASES
   User phrases:
     600 - 618: 马到成功! Huat Ah!
     500 - 599: 万马奔腾! Overdrive!
     0   - 500: 龙马精神! You can do it!

   If total beats isn't 618, we scale thresholds proportionally so it still works:
     scaled600 = round(600/618 * total)
     scaled500 = round(500/618 * total)
===================== */
function showResult() {
  video.pause();

  const totalBeats = BEATMAP.length;
  const msg = `Score: ${score} / ${totalBeats}`;
  resultLine.textContent = msg;

  // Scaling logic (keeps your intent even if total beats differs)
  const scaled600 = Math.round((600 / 618) * totalBeats);
  const scaled500 = Math.round((500 / 618) * totalBeats);

  let phrase = "龙马精神! You can do it!";
  if (score >= Math.min(totalBeats, scaled600)) {
    phrase = "马到成功! Huat Ah!";
  } else if (score >= Math.min(totalBeats, scaled500)) {
    phrase = "万马奔腾! Overdrive!";
  }

  resultPhrase.textContent = phrase;

  // Show results in the start overlay panel (simple and mobile-friendly)
  overlay.classList.remove("hidden");
  resultBox.classList.add("show");
}



