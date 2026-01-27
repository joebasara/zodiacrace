/* ===============================
   CONFIG (175 BPM)
================================ */
const BPM = 175;
const BEAT_INTERVAL = 60000 / BPM; // ≈ 342.86 ms
const OFFSET = 800;                // ms before first beat
const FALL_DURATION = 1200;        // ms travel time
const HIT_WINDOW = 300;            // ms
const BEAT_SIZE = 60;

/* ===============================
   ELEMENTS
================================ */
const audio = document.getElementById("audio");
const laneLeft = document.getElementById("lane-left");
const laneRight = document.getElementById("lane-right");

/* ===============================
   STATE
================================ */
let beatmap = [];
let activeBeats = [];
let started = false;

/* ===============================
   BUILD BEATMAP (STRAIGHT 175 BPM)
================================ */
function buildBeatmap(durationMs) {
  beatmap = [];
  let time = OFFSET;
  let i = 0;

  while (time < durationMs) {
    beatmap.push({
      time,
      lane: i % 2, // alternate lanes
      spawned: false
    });
    time += BEAT_INTERVAL;
    i++;
  }
}

/* ===============================
   SPAWN BEAT
================================ */
function spawnBeat(beat) {
  const laneEl = beat.lane === 0 ? laneLeft : laneRight;
  const hitLine = laneEl.querySelector(".hit-line");

  const el = document.createElement("div");
  el.className = "beat";
  el.style.top = "-80px";
  laneEl.appendChild(el);

  const hitY =
    hitLine.offsetTop + hitLine.offsetHeight / 2;

  activeBeats.push({
    el,
    lane: beat.lane,
    spawnTime: beat.time - FALL_DURATION,
    hitTime: beat.time,
    hitY,
    hit: false
  });
}

/* ===============================
   INPUT
================================ */
function handleTap(lane) {
  if (!started) return;

  const songTime = audio.currentTime * 1000;

  const candidates = activeBeats.filter(b =>
    b.lane === lane && !b.hit
  );

  if (!candidates.length) return;

  const beat = candidates.reduce((a, b) =>
    Math.abs(a.hitTime - songTime) <
    Math.abs(b.hitTime - songTime) ? a : b
  );

  const diff = Math.abs(songTime - beat.hitTime);

  if (diff <= HIT_WINDOW) {
    beat.hit = true;
    beat.el.classList.add("hit");
    setTimeout(() => beat.el.remove(), 120);
    activeBeats = activeBeats.filter(b => b !== beat);
  }
}

/* ===============================
   MAIN LOOP
================================ */
function update() {
  if (!started) return;

  const songTime = audio.currentTime * 1000;

  // Spawn beats
  for (const beat of beatmap) {
    if (!beat.spawned && songTime >= beat.time - FALL_DURATION) {
      spawnBeat(beat);
      beat.spawned = true;
    }
  }

  // Update beats
  activeBeats = activeBeats.filter(b => {
    const progress = (songTime - b.spawnTime) / FALL_DURATION;

    if (!b.hit && songTime - b.hitTime > HIT_WINDOW) {
      b.hit = true;
      b.el.classList.add("miss");
      setTimeout(() => b.el.remove(), 150);
      return false;
    }

    if (progress >= 1.2) {
      b.el.remove();
      return false;
    }

    const y = progress * b.hitY - BEAT_SIZE / 2;
    b.el.style.top = `${y}px`;
    return true;
  });

  requestAnimationFrame(update);
}

/* ===============================
   START GAME (USER GESTURE)
================================ */
function startGame() {
  if (started) return;

  audio.play().then(() => {
    buildBeatmap(audio.duration * 1000);
    started = true;
    requestAnimationFrame(update);
  }).catch(err => {
    console.warn("Play blocked:", err);
  });
}

/* ===============================
   EVENTS
================================ */
document.body.addEventListener("touchstart", e => {
  startGame();
  const x = e.touches[0].clientX;
  handleTap(x < window.innerWidth / 2 ? 0 : 1);
}, { passive: false });

document.body.addEventListener("click", startGame, { once: true });

document.body.addEventListener("keydown", e => {
  startGame();
  if (e.key === "ArrowLeft") handleTap(0);
  if (e.key === "ArrowRight") handleTap(1);
});
