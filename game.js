/*************************************************
 * RHYTHM RACER (PC + MOBILE)
 * FIXED START RELIABILITY:
 * - Start on overlay click/tap AND background click/tap
 * - Shows error message if video can't load/play
 *************************************************/

/* =====================
   CONFIG
===================== */
const FALL_TIME = 1.6;         // seconds for beat to fall
const HIT_WINDOW = 0.10;       // hit tolerance
const POINTS_PER_HIT = 100;

// IMPORTANT: your file list shows "race.mp4"
const VIDEO_FILE = "race.mp4";

/* =====================
   BEATMAP (PASTE YOURS HERE)
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

/* =====================
   HELPERS
===================== */
function setError(msg) {
  errorEl.textContent = msg || "";
}

function setPoints(v) {
  score = v;
  pointsEl.textContent = `Points: ${score}`;
}

/* =====================
   VIDEO SETUP
===================== */
video.src = VIDEO_FILE;

// Keep muted for maximum autoplay compatibility on file://
// If you want sound later, you can set muted=false AFTER it starts.
video.muted = true;

// If video file is missing or can't decode, show it clearly.
video.addEventListener("error", () => {
  // Some browsers don’t expose detailed reasons, so we give a practical message.
  setError(
    `Video failed to load.\n` +
    `Check that "${VIDEO_FILE}" is in the same folder as index.html.\n` +
    `Also ensure the file can play in your browser (try opening it directly).`
  );
});

/* =====================
   START GAME (USER GESTURE)
===================== */
async function startGameOnce() {
  if (started) return;

  setError(""); // clear old errors
  started = true;

  // Hide overlay immediately so user sees response
  overlay.style.display = "none";

  // Reset run state
  beatIndex = 0;
  activeBeats = [];
  setPoints(0);

  try {
    // Ensure we start from beginning
    video.currentTime = 0;

    // Play must be triggered by user gesture; we are inside click/tap event.
    await video.play();

    // Start loop
    requestAnimationFrame(gameLoop);
  } catch (err) {
    // Playback blocked (or failed). Restore overlay + show reason.
    started = false;
    overlay.style.display = "flex";

    setError(
      `Video play was blocked or failed.\n` +
      `Common causes:\n` +
      `- Wrong filename (expected "${VIDEO_FILE}")\n` +
      `- Browser blocked playback\n` +
      `- Video codec unsupported\n\n` +
      `Details: ${String(err)}`
    );
  }
}

/* Bind start on BOTH overlay and background for reliability */
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
   MAIN LOOP
===================== */
function gameLoop() {
  const t = video.currentTime;

  spawnBeats(t);
  updateBeats(t);

  if (!video.ended && !video.paused) {
    requestAnimationFrame(gameLoop);
  } else if (video.ended) {
    console.log("Video ended. Final score:", score);
  }
}

/* =====================
   SPAWN
===================== */
function spawnBeats(t) {
  while (beatIndex < BEATMAP.length && (BEATMAP[beatIndex].time - t) <= FALL_TIME) {
    createBeat(BEATMAP[beatIndex]);
    beatIndex++;
  }
}

/* =====================
   CREATE BEAT
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
   UPDATE BEATS
   - hit circle position is dynamic => moving it doesn't break timing
===================== */
function updateBeats(t) {
  for (let i = activeBeats.length - 1; i >= 0; i--) {
    const b = activeBeats[i];
    const laneEl = lanes[b.lane];
    const hit = laneEl.querySelector(".hit-circle");

    // Center of hit circle (in lane coordinates)
    const hitY = hit.offsetTop + hit.offsetHeight / 2;

    // 0 at spawn, 1 at target time
    const progress = 1 - (b.time - t) / FALL_TIME;

    // Remove if far past the hit moment
    if (progress > 1.25) {
      b.el.remove();
      activeBeats.splice(i, 1);
      continue;
    }

    // Beat travels from 0 down to hitY
    const y = Math.max(0, hitY * progress);
    b.el.style.top = `${y}px`;
  }
}

/* =====================
   HIT DETECTION (POINTS ONLY)
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
