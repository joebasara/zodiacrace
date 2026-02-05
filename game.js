/*************************************************
 * RHYTHM RACER - MOBILE AUDIO SAFE VERSION
 *
 * Key mobile rule:
 * - Start video on a user gesture (tap).
 * - Unmute MUST be triggered by an explicit user gesture (button tap).
 *************************************************/

const FALL_TIME = 1.6;      // seconds for a beat to fall
const HIT_WINDOW = 0.15;    // hit tolerance (seconds)

const BEATMAP = [
  // Paste your beatmap here:
  // { time: 5.561, lane: 1 },
];

const game = document.getElementById("game");
const video = document.getElementById("video");
const overlay = document.getElementById("overlay");
const startBtn = document.getElementById("startBtn");
const unmuteBtn = document.getElementById("unmuteBtn");
const pointsEl = document.getElementById("points");

const lanes = [
  document.getElementById("lane-left"),
  document.getElementById("lane-right")
];

let started = false;
let beatIndex = 0;
let activeBeats = [];
let points = 0;

// --- Set your file name here ---
video.src = "race.mp4";
video.preload = "auto";

// iOS sometimes requires this too:
video.setAttribute("playsinline", "");
video.setAttribute("webkit-playsinline", "");

// Start muted first for max compatibility (we unmute via button)
video.muted = true;
video.volume = 1.0;

function setPoints(v) {
  points = v;
  pointsEl.textContent = `Points: ${points}`;
}

/* =====================
   START FLOW
   - Start video (muted) on START tap
===================== */
startBtn.addEventListener("click", async () => {
  if (started) return;
  started = true;

  try {
    // Play (muted) so motion starts even if audio is blocked
    await video.play();
    overlay.classList.add("hidden");
    requestAnimationFrame(gameLoop);
  } catch (e) {
    // If play fails, keep overlay visible
    console.warn("Video play failed:", e);
  }
});

/* =====================
   UNMUTE FLOW (mobile crucial)
   - Must be a direct user tap
===================== */
unmuteBtn.addEventListener("click", async () => {
  try {
    video.muted = false;
    video.volume = 1.0;

    // Re-call play() after unmuting; some phones need this
    await video.play();
  } catch (e) {
    console.warn("Unmute/play failed:", e);
  }
});

/* =====================
   MOBILE CONTROLS
   Tap left/right side of screen after start
===================== */
game.addEventListener("pointerdown", (ev) => {
  if (!started) return;

  // If user never pressed UNMUTE, try again on the first gameplay tap
  // (still won’t always work on iOS unless they hit UNMUTE button,
  // but it helps on Android Chrome)
  if (video.muted) {
    // Best-effort attempt; no harm if blocked
    video.muted = false;
    video.play().catch(() => {});
  }

  const x = ev.clientX;
  const w = window.innerWidth;
  const lane = x < w / 2 ? 0 : 1;
  handleHit(lane);
});

/* =====================
   MAIN LOOP
===================== */
function gameLoop() {
  const t = video.currentTime;

  spawnBeats(t);
  updateBeats(t);

  // End condition
  if (video.ended) {
    started = false;
    showEndMessage();
    return;
  }

  requestAnimationFrame(gameLoop);
}

/* =====================
   SPAWN
===================== */
function spawnBeats(t) {
  while (beatIndex < BEATMAP.length && BEATMAP[beatIndex].time - t <= FALL_TIME) {
    createBeat(BEATMAP[beatIndex]);
    beatIndex++;
  }
}

function createBeat(data) {
  const beat = document.createElement("div");
  beat.className = "beat";
  lanes[data.lane].appendChild(beat);

  activeBeats.push({
    el: beat,
    time: data.time,
    lane: data.lane
  });
}

/* =====================
   UPDATE POSITIONS
   Beat falls so it reaches hit-circle center at data.time
===================== */
function updateBeats(t) {
  for (let i = activeBeats.length - 1; i >= 0; i--) {
    const b = activeBeats[i];
    const laneEl = lanes[b.lane];
    const hit = laneEl.querySelector(".hit-circle");

    const laneRect = laneEl.getBoundingClientRect();
    const hitRect = hit.getBoundingClientRect();

    // Y target (center of hit circle) relative to lane
    const hitY = (hitRect.top - laneRect.top) + hitRect.height / 2;

    const progress = 1 - (b.time - t) / FALL_TIME;

    // Miss cleanup
    if (progress > 1.25) {
      b.el.remove();
      activeBeats.splice(i, 1);
      continue;
    }

    // Move from top (0) down to hitY
    b.el.style.top = `${Math.max(0, hitY * progress)}px`;
  }
}

/* =====================
   HIT
   - Must match lane + timing window
===================== */
function handleHit(inputLane) {
  const t = video.currentTime;

  for (let i = 0; i < activeBeats.length; i++) {
    const b = activeBeats[i];

    if (b.lane !== inputLane) continue;

    if (Math.abs(b.time - t) <= HIT_WINDOW) {
      b.el.remove();
      activeBeats.splice(i, 1);
      setPoints(points + 1);
      return;
    }
  }
}

/* =====================
   END MESSAGE (simple)
===================== */
function showEndMessage() {
  overlay.classList.remove("hidden");
  overlay.querySelector(".title").textContent = "Finished!";
  overlay.querySelector(".sub").innerHTML = `Final Points: <b>${points}</b>`;
}
