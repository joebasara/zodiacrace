/*************************************************
 * RHYTHM RACER (PC + MOBILE)
 * Audio fix for GitHub Pages / mobile:
 * - Try starting UNMUTED on user gesture
 * - If blocked, start muted and show Unmute button
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
const unmuteBtn = document.getElementById("unmuteBtn");

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
video.preload = "auto";
// We'll control muted/volume in start() based on what the browser allows.
video.muted = false;
video.volume = 1.0;

video.addEventListener("error", () => {
  setError(
    `Video failed to load.\n` +
    `Check that "${VIDEO_FILE}" is in the same folder as index.html.\n` +
    `Also ensure the file can play in your browser (try opening it directly).`
  );
});

/* =====================
   UNMUTE BUTTON
   (Only needed when browser forces muted)
===================== */
async function forceUnmute() {
  try {
    video.muted = false;
    video.volume = 1.0;

    // Some browsers require a second play() attempt after changing muted.
    await video.play();

    // Hide button if unmute succeeded
    if (!video.muted && video.volume > 0) {
      unmuteBtn.style.display = "none";
    }
  } catch (e) {
    // Keep button visible; user can tap again
  }
}

unmuteBtn.addEventListener("click", forceUnmute);
unmuteBtn.addEventListener("touchstart", forceUnmute, { passive: true });

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

    // Attempt 1: start unmuted (best chance for real audio)
    video.muted = false;
    video.volume = 1.0;
    await video.play();

    // If browser *still* forces muted, show Unmute button
    if (video.muted || video.volume === 0) {
      unmuteBtn.style.display = "block";
    } else {
      unmuteBtn.style.display = "none";
    }

    requestAnimationFrame(gameLoop);
  } catch (err1) {
    // Attempt 2: fallback to muted start (so the game still runs)
    try {
      video.muted = true;
      video.volume = 1.0;
      await video.play();

      // Now prompt user to unmute via a direct button press
      unmuteBtn.style.display = "block";

      requestAnimationFrame(gameLoop);
    } catch (err2) {
      started = false;
      overlay.style.display = "flex";
      setError(
        `Video play was blocked or failed.\n` +
        `Details: ${String(err2)}`
      );
    }
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
