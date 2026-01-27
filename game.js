const video = document.getElementById("video");
const lanes = document.querySelectorAll(".lane");

const FALL_DURATION = 2000; // ms to fall into hit circle
const HIT_WINDOW = 300;    // timing forgiveness (ms)
const OFFSET = 400;        // sync offset (ms)

const beats = [
  { time: 1.0, lane: 0 },
  { time: 1.5, lane: 1 },
  { time: 2.0, lane: 0 },
  { time: 2.5, lane: 1 },
  { time: 3.0, lane: 0 },
  { time: 3.5, lane: 1 }
];

let activeBeats = [];
let started = false;

function spawnBeat(beat) {
  const lane = lanes[beat.lane];
  const el = document.createElement("div");
  el.className = "beat";
  el.style.top = "-70px";
  lane.appendChild(el);

  activeBeats.push({
    ...beat,
    el,
    spawnTime: beat.time * 1000 - FALL_DURATION
  });
}

function update() {
  if (!started) return;

  const now = video.currentTime * 1000;

  beats.forEach(b => {
    if (!b.spawned && now >= b.time * 1000 - FALL_DURATION - OFFSET) {
      spawnBeat(b);
      b.spawned = true;
    }
  });

  activeBeats.forEach(b => {
    const progress = (now - b.spawnTime - OFFSET) / FALL_DURATION;
    if (progress < 0 || progress > 1.2) return;

    const laneHeight = lanes[b.lane].clientHeight;
    const hitY = laneHeight * 0.5;
    const startY = -70;
    const travelDistance = hitY - startY;

    const y = startY + progress * travelDistance;
    b.el.style.top = y + "px";
  });

  requestAnimationFrame(update);
}

function handleTap(laneIndex) {
  const now = video.currentTime * 1000;

  for (let i = 0; i < activeBeats.length; i++) {
    const b = activeBeats[i];
    if (b.lane !== laneIndex || b.hit) continue;

    const diff = Math.abs(now - b.time * 1000);

    const beatRect = b.el.getBoundingClientRect();
    const circleRect = lanes[laneIndex]
      .querySelector(".hit-circle")
      .getBoundingClientRect();

    const beatCenterY = beatRect.top + beatRect.height / 2;
    const circleCenterY = circleRect.top + circleRect.height / 2;
    const distance = Math.abs(beatCenterY - circleCenterY);

    if (diff <= HIT_WINDOW && distance < circleRect.height / 2) {
      b.hit = true;
      b.el.classList.add("hit");

      setTimeout(() => b.el.remove(), 200);
      return;
    }
  }
}

document.querySelectorAll(".tap-zone").forEach(zone => {
  zone.addEventListener("pointerdown", () => {
    if (!started) {
      video.muted = false;   // REQUIRED for browser audio unlock
      video.play();
      started = true;
      update();
    }

    handleTap(Number(zone.dataset.lane));
  });
});
