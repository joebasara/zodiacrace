/* ===============================
   CONFIG (175 BPM)
================================ */
const BPM = 175;
const BEAT_INTERVAL = 60000 / BPM; // ≈ 342.86ms
const OFFSET = 800;
const FALL_DURATION = 1200;
const HIT_WINDOW = 300;
const BEAT_SIZE = 60;

/* ===============================
   ELEMENTS
================================ */
const video = document.getElementById("bg-video");
const laneLeft = document.getElementById("lane-left");
const laneRight = document.getElementById("lane-right");

/* ===============================
   STATE
================================ */
let beatmap = [];
let activeBeats = [];
let started = false;

/* ===============================
   BUILD BEATMAP
================================ */
function buildBeatmap(durationMs) {
  beatmap = [];
  let time = OFFSET;
  let i = 0;

  while (time < durationMs) {
    beatmap.push({
      time,
      lane: i % 2,
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

  const songTime = video.currentTime * 1000;

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

  const songTime = video.currentTime * 1000;

  for (const beat of beatmap) {
    if (!beat.spawned && songTime >= beat.time - FALL_DURATION) {
      spawnBeat(beat);
      beat.spawned = true;
    }
  }

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
   START GAME (REQUIRED USER TAP)
================================ */
function startGame() {
  if (started) return;

  video.play().then(() => {
    buildBeatmap(video.duration * 1000);
    started = true;
    requestAnimationFrame(update);
  }).catch(err => {
    console.warn("Playback blocked:", err);
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
