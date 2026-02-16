const grid = document.querySelector(".js-grid");
const opensLeftEl = document.querySelector(".js-opens-left");
const luckEl = document.querySelector(".js-luck");
const messageEl = document.querySelector(".js-message");
const replayBtn = document.querySelector(".js-replay");
const revealOverlay = document.querySelector(".reveal-overlay");

const finalBlessing = [
  "新年快乐，万事如意 🧧",
  "恭喜发财，红包拿来 ✨",
  "心想事成，步步高升 🐎",
  "龙马精神，年年有余 🧨"
];

const blessingsFlirty = [
  "You’re cute. That’s your luck today 😌💗",
  "I’m not saying I like you… but I opened this for you 😏",
  "You + me + snacks = prosperous year 😳✨",
];

const blessingsChaotic = [
  "Plot twist: the envelope likes YOU 🧧💥",
  "Congratulations, you unlocked: dramatic luck 😂",
  "Caution: This blessing is slightly unhinged 😈",
];

// Luck-only rewards
const rewards = [
  { luck: 66 },
  { luck: 88 },
  { luck: 168 },
  { luck: 520 },
];

// No-reward lines (no repeats within a round)
const NO_REWARD_LINES = [
  "No luck points… only my virtual kisses 💋💖",
  "Empty envelope… full affection 😘",
  "Just vibes and a kiss for luck 💞✨",
  "No luck today—come here 💋",
  "Nothing… but I like you 💗",
  "Just me blowing you a kiss ✨💖",
  "Robbed!… compensated with hugs 🤗",
  "hugs today, luck tomorrow 🤗",
];

let opensLeft = 3;
let luck = 0;
let isRevealing = false;

let noRewardDeck = [];
let noRewardIndex = 0;

function randItem(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

function updateStats(){
  opensLeftEl.textContent = String(opensLeft);
  luckEl.textContent = String(luck);
}

function shuffleInPlace(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function resetNoRewardDeck(){
  noRewardDeck = [...NO_REWARD_LINES];
  shuffleInPlace(noRewardDeck);
  noRewardIndex = 0;
}

function nextNoRewardLine(){
  if (noRewardDeck.length === 0 || noRewardIndex >= noRewardDeck.length){
    resetNoRewardDeck();
  }
  return noRewardDeck[noRewardIndex++];
}

function isRewardEnvelopeForType(type){
  if (type === "runner") return Math.random() < 0.15; // 15% reward, 85% no reward
  return Math.random() < 0.30; // normal
}


function setMessage(html){
  messageEl.innerHTML = html;
}

function buildResultPanel({ title, label, value, sub }){
  return `
    <div class="result-panel">
      <div class="result-title">${title}</div>
      <div class="result-main">
        <span class="result-label">${label}</span>
        <span class="result-badge">${value}</span>
      </div>
      <div class="result-sub">${sub}</div>
    </div>
  `;
}

// Runner behavior: dodge on hover/pointerdown
function runnerDodge(el){
  const x = (Math.random() * 120) - 60;
  const y = (Math.random() * 80) - 40;
  el.style.transform = `translate(${x}px, ${y}px)`;
}

function lockGame(){
  const all = grid.querySelectorAll(".envelope");
  all.forEach(el => {
    el.disabled = true;
    el.style.cursor = "default";
  });
  replayBtn.hidden = false;
}

function launchHorse(){
  const h = document.querySelector(".horse");
  h.hidden = false;
  h.style.animation = "none";
  h.offsetHeight; // reset animation
  h.style.animation = "";
  setTimeout(() => h.hidden = true, 2600);
}

function launchConfetti() {
  const box = document.querySelector(".confetti");
  if (!box) return;

  box.style.display = "block";
  box.innerHTML = "";

  for (let i = 0; i < 50; i++) {
    const s = document.createElement("span");
    s.textContent = Math.random() > 0.5 ? "🧧" : "✨";
    s.style.left = Math.random() * 100 + "vw";
    s.style.animationDelay = Math.random() * 0.6 + "s";
    box.appendChild(s);
  }

  setTimeout(() => {
    box.innerHTML = "";
    box.style.display = "none";
  }, 3200);
}

function flashOverlay() {
  const d = document.createElement("div");
  d.className = "flashlight";
  document.body.appendChild(d);
  setTimeout(() => d.remove(), 650);
}

function launchKisses(card){
  const layer = document.createElement("div");
  layer.className = "kiss-burst";
  card.appendChild(layer);

  const emojis = ["💋","💖","✨","💞","😘"];

  for (let i = 0; i < 14; i++){
    const s = document.createElement("span");
    s.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    s.style.setProperty("--dx", (Math.random() * 140 - 70) + "px");
    s.style.animationDelay = (Math.random() * 120) + "ms";
    layer.appendChild(s);
  }

  setTimeout(() => layer.remove(), 900);
}

function makeEnvelope(index){
  // types: blessing (normal), runner (moves away), teaser (always no reward)
  const roll = Math.random();
  let type = "blessing";
  
  if (roll < 0.20) type = "runner";
  else if (roll < 0.35) type = "teaser";

  const btn = document.createElement("button");
  btn.dataset.runnerHits = "0";
  btn.type = "button";
  btn.className = "envelope";
  btn.dataset.index = String(index);
  btn.dataset.type = type;
  btn.dataset.opened = "false";
  btn.innerHTML = `<div class="shine"></div><div class="seal"></div>`;
  return btn;
}

async function revealEnvelopeAnimation(originalEl, text, options = {}){
  const clone = originalEl.cloneNode(true);
  clone.classList.remove("opened");
  clone.style.transform = "none";

  const card = document.createElement("div");
  card.className = "reveal-card";

  const wrap = document.createElement("div");
  wrap.className = "reveal-envelope-wrap";
  wrap.appendChild(clone);

  const resultEl = document.createElement("div");
  resultEl.className = "reveal-result " + (options.type || "reward");
  resultEl.textContent = text;
  wrap.appendChild(resultEl);

  card.appendChild(wrap);

  revealOverlay.innerHTML = "";
  revealOverlay.appendChild(card);
  revealOverlay.hidden = false;

  await card.animate(
    [
      { transform: "scale(0.85)", opacity: 0 },
      { transform: "scale(1.08)", opacity: 1, offset: 0.65 },
      { transform: "scale(1)", opacity: 1 }
    ],
    { duration: 700, easing: "cubic-bezier(.2,.9,.2,1)" }
  ).finished;

  await new Promise(r => setTimeout(r, 250));

  if (options.effect === "kisses") launchKisses(card);
  else flashOverlay();

  clone.classList.add("opened");
  clone.classList.add("overlay-opened");

  await resultEl.animate(
    [
      { opacity: 0, transform: "translate(-50%, 10px) scale(0.8)" },
      { opacity: 1, transform: "translate(-50%, -50px) scale(1.05)", offset: 0.7 },
      { opacity: 1, transform: "translate(-50%, -60px) scale(1)" },
    ],
    { duration: 500, easing: "cubic-bezier(.2,.9,.2,1)", fill: "forwards" }
  ).finished;

  await new Promise(r => setTimeout(r, 700));

  await card.animate(
    [
      { transform: "scale(1)", opacity: 1 },
      { transform: "scale(0.92)", opacity: 0 }
    ],
    { duration: 420, easing: "ease-in" }
  ).finished;

  revealOverlay.hidden = true;
  revealOverlay.innerHTML = "";
}

async function openBlessing(el){
  if (el.dataset.opened === "true") return;
  if (opensLeft <= 0) return;

  el.dataset.opened = "true";
  el.disabled = true;

  opensLeft -= 1;
  updateStats();

  const msg = Math.random() < 0.5 ? randItem(blessingsFlirty) : randItem(blessingsChaotic);
  const reward = randItem(rewards);
  const rewardText = `+${reward.luck} luck ✨`;

  setMessage("Opening… 🧧✨");

  await revealEnvelopeAnimation(el, rewardText, { type: "reward" });

  el.classList.add("opened");

  luck += reward.luck;
  updateStats();

  setMessage(`🎉 <b>BIG LUCK</b> 🎉<br>${msg}<br><b>${rewardText}</b>`);

  if (opensLeft === 0) await endSummary();
}

async function tease(el){
  if (el.dataset.opened === "true") return;
  if (opensLeft <= 0) return;

  el.dataset.opened = "true";
  el.disabled = true;

  opensLeft -= 1;
  updateStats();

  const text = nextNoRewardLine();
  setMessage("Opening… 🧧✨");

  await revealEnvelopeAnimation(el, text, { type: "no-reward", effect: "kisses" });

  el.classList.add("opened");
  setMessage(text);

  if (opensLeft === 0) await endSummary();
}

async function animateLuckTo(target, duration = 1600, onTick){
  const start = luck;
  const startTime = performance.now();

  return new Promise(resolve => {
    function tick(now){
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      luck = Math.floor(start + (target - start) * eased);
      updateStats();
      if (typeof onTick === "function") onTick(luck);
      if (t < 1) requestAnimationFrame(tick);
      else resolve();
    }
    requestAnimationFrame(tick);
  });
}

async function bigLuckTwist(){
  const card = document.createElement("div");
  card.className = "reveal-card center";

  const pill = document.createElement("div");
  pill.className = "reveal-result reward";
  pill.textContent = "🎉 Congrats! You’ve got BIG LUCK 🎉";
  card.appendChild(pill);

  const counter = document.createElement("div");
  counter.className = "reveal-result reward";
  counter.style.marginTop = "12px";
  counter.textContent = "0 ✨";
  card.appendChild(counter);

  revealOverlay.innerHTML = "";
  revealOverlay.appendChild(card);
  revealOverlay.hidden = false;

  launchConfetti();

  const BIG = 10088;

  await animateLuckTo(BIG, 1800, (v) => {
    counter.textContent = `${v} ✨`;
  });

  await new Promise(r => setTimeout(r, 850));

  revealOverlay.hidden = true;
  revealOverlay.innerHTML = "";
}

async function endSummary(){
  if (luck === 0){
    await bigLuckTwist();
  }

  const blessing = randItem(finalBlessing);

  setMessage(buildResultPanel({
    title: "🎊 Round Complete",
    label: "Total luck",
    value: `${luck} ✨`,
    sub: `${blessing} <span class="result-soft"> Hehheh 😌</span>`
  }));

  launchConfetti();
  launchHorse();
  lockGame();
}

function setup(){
  grid.innerHTML = "";
  opensLeft = 3;
  luck = 0;
  isRevealing = false;
  replayBtn.hidden = true;

  resetNoRewardDeck();
  updateStats();
  setMessage("Tap an envelope to start ✨");

  for (let i = 0; i < 8; i++){
    grid.appendChild(makeEnvelope(i));
  }

  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  grid.querySelectorAll(".envelope").forEach(el => {
    const type = el.dataset.type;

    if (type === "runner") {
      if (isTouch) {
        el.addEventListener("pointerdown", () => {
          if (opensLeft > 0 && el.dataset.opened === "false") runnerDodge(el);
        });
      } else {
        el.addEventListener("mouseenter", () => {
          if (opensLeft > 0 && el.dataset.opened === "false") runnerDodge(el);
        });
      }
    }

    el.addEventListener("click", async () => {

      
      
      if (opensLeft <= 0) return;
      if (el.dataset.opened === "true") return;

      if (isRevealing) return;

// Runner: must be clicked 3 times before it can be opened
if (type === "runner") {
  const hits = Number(el.dataset.runnerHits || "0") + 1;
  el.dataset.runnerHits = String(hits);

  // move on EVERY click (both desktop + mobile)
  runnerDodge(el);

  // optional: show feedback
  setMessage(`It’s running away! (${hits}/3) 🏃‍♀️💨`);

  // only allow reveal after 3 hits
  if (hits < 3) return;

  // after 3 hits, convert into a normal clickable envelope
  // (so next logic can decide reward vs no reward)
  // you can either reveal immediately, or require a 4th click.
}


      isRevealing = true;

      try{
        if (type === "teaser"){
          await tease(el);
          return;
        }

        // runner + blessing: mostly no reward, sometimes reward
        if (isRewardEnvelopeForType(type)) {
  await openBlessing(el);
} else {
  await tease(el);
}

      } finally {
        isRevealing = false;
      }
    });
  });

  replayBtn.onclick = () => setup();
}

setup();
