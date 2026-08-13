/* script.js - quiz logic and playful button-escape behavior */

// Questions (exactly as specified)
const QUESTIONS = [
  { q: "Are you angry at me? 😟", yes: "Nooo, never ❤️", no: "Yes 😤" },
  { q: "If your phone had only 1% battery, would you still call me? 📱🔋", yes: "Of course, immediately 💕", no: "I would save the battery 😶" },
  { q: "Don’t you miss me? 🥺", yes: "I miss you a lot 💖", no: "Not really 😐" },
  { q: "Would you hug me if I looked sad? 🤗", yes: "Always 🤍", no: "I would run away 🏃" },
  { q: "If we were in a horror movie, would you hold my hand? 👻", yes: "Tightly 😭❤️", no: "Good luck 😶" },
  { q: "Who is the cutest person right now? 😌", yes: "Youuu 💘", no: "Someone else 😬" },
  { q: "Would you share your last french fry with me? 🍟", yes: "Yes, because I love you 💕", no: "Never 😈" },
  { q: "If I sent 27 messages in a row, what would you do? 😂", yes: "Reply to all of them 😭💖", no: "Mute you 🙃" },
  { q: "Do you want more random calls from me? 📞", yes: "Yes please 💞", no: "Please stop 😭" },
  { q: "Final question: Will you stay with me for many more silly moments? 💖", yes: "Forever and ever ✨", no: "I choose freedom 🚪" }
];

const ESCAPE_MESSAGES = [
  "Nice try 😏",
  "Catch me first 💨",
  "No negativity allowed 💖",
  "This button is shy 🙈",
  "Relationship protection activated ✨"
];

const POSITIVE_FEEDBACK = [
  "Aww 💕",
  "Correct answer detected ✨",
  "You’re adorable 🥺",
  "Relationship upgraded 💖"
];


// DOM refs
const qText = document.getElementById('question-text');
const btnPos = document.getElementById('btn-positive');
const btnNeg = document.getElementById('btn-negative');
const progressText = document.getElementById('progress-text');
const progressFill = document.getElementById('progress-fill');
const feedback = document.getElementById('feedback');
const answersWrap = document.getElementById('answers');
const escapeMsg = document.getElementById('escape-msg');
const card = document.getElementById('quiz-card');
const hugModal = document.getElementById('hug-modal');
const closeModalBtn = document.getElementById('close-modal');

let index = 0;
let score = 0;
let isMobile = 'ontouchstart' in window && window.innerWidth < 900;

// utility: detect rectangle overlap
function rectsOverlap(a, b) {
  return !(a.right <= b.left || a.left >= b.right || a.bottom <= b.top || a.top >= b.bottom);
}

// Initialize
function init() {
  renderQuestion();
  bindEvents();
  spawnParticles();
  // ensure escape tooltip is placed at card level so positioning can avoid overlapping question
  if (escapeMsg && card && escapeMsg.parentNode !== card) card.appendChild(escapeMsg);
}

function renderQuestion() {
  const item = QUESTIONS[index];
  qText.textContent = item.q;
  btnPos.textContent = item.yes;
  btnNeg.textContent = item.no;
  updateProgress();
  placeNegativeAtCenter();
}

function updateProgress() {
  progressText.textContent = `${index + 1} / ${QUESTIONS.length}`;
  const pct = Math.round(((index) / QUESTIONS.length) * 100);
  progressFill.style.width = `${pct}%`;
}

// move negative button to random position inside the answers area while avoiding the question and the positive button
function placeNegativeRandom() {
  const answersRect = answersWrap.getBoundingClientRect();
  const negRect = btnNeg.getBoundingClientRect();
  const posRect = btnPos.getBoundingClientRect();
  const questionRect = qText.getBoundingClientRect();
  const padding = 8;
  const maxAttempts = 80;
  let found = false;
  let candidateX = answersRect.left + padding;
  let candidateY = answersRect.top + padding;

  for (let i = 0; i < maxAttempts; i++) {
    const randX = Math.random() * (answersRect.width - negRect.width - padding * 2) + padding;
    const randY = Math.random() * (answersRect.height - negRect.height - padding * 2) + padding;
    const cLeft = answersRect.left + randX;
    const cTop = answersRect.top + randY;
    const candRect = { left: cLeft, top: cTop, right: cLeft + negRect.width, bottom: cTop + negRect.height };
    // avoid overlapping positive button or question area
    if (rectsOverlap(candRect, posRect)) continue;
    if (rectsOverlap(candRect, questionRect)) continue;
    found = true;
    candidateX = cLeft;
    candidateY = cTop;
    break;
  }

  if (!found) {
    // fallback: pick a corner inside answers but avoid known overlaps
    const fallbackX = answersRect.left + Math.max(padding, answersRect.width - negRect.width - padding * 2);
    const fallbackY = answersRect.top + Math.min(answersRect.height - negRect.height - padding, answersRect.height * 0.6);
    candidateX = fallbackX; candidateY = fallbackY;
  }

  btnNeg.style.position = 'absolute';
  // set left/top relative to answersWrap
  btnNeg.style.left = `${candidateX - answersRect.left}px`;
  btnNeg.style.top = `${candidateY - answersRect.top}px`;
  btnNeg.style.zIndex = 2;
  btnNeg.style.display = '';
}

function placeNegativeAtCenter() {
  // reset positioning and try to place the negative button within answers area without overlapping
  btnNeg.style.position = '';
  btnNeg.style.left = '';
  btnNeg.style.top = '';
  try {
    const answersRect = answersWrap.getBoundingClientRect();
    const negRect = btnNeg.getBoundingClientRect();
    const posRect = btnPos.getBoundingClientRect();
    const qRect = qText.getBoundingClientRect();
    const padding = 8;
    const x = Math.max(padding, answersRect.width - negRect.width - padding * 2);
    const y = (answersRect.height - negRect.height) / 2;
    const candRect = { left: answersRect.left + x, top: answersRect.top + y, right: answersRect.left + x + negRect.width, bottom: answersRect.top + y + negRect.height };
    if (rectsOverlap(candRect, posRect) || rectsOverlap(candRect, qRect)) {
      // keep normal flow if overlap would occur
      btnNeg.style.position = '';
    } else {
      btnNeg.style.position = 'absolute';
      btnNeg.style.left = `${x}px`;
      btnNeg.style.top = `${y}px`;
      btnNeg.style.zIndex = 2;
      btnNeg.style.display = '';
    }
  } catch (e) {
    // ignore and keep default
    btnNeg.style.position = '';
  }
}

// escape logic for desktop: move when cursor gets close
function handlePointerMove(e) {
  if (isMobile) return;
  const mouseX = e.clientX;
  const mouseY = e.clientY;
  const negRect = btnNeg.getBoundingClientRect();
  const centerX = negRect.left + negRect.width / 2;
  const centerY = negRect.top + negRect.height / 2;
  const dx = mouseX - centerX;
  const dy = mouseY - centerY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const threshold = Math.max(80, negRect.width);
  if (dist < threshold) {
    // move negative
    placeNegativeRandom();
    showEscapeMessage();
  }
}

// On mobile: prevent click and jump away when tapped
function handleNegativeTouch(e) {
  // show message and jump
  e.preventDefault();
  placeNegativeRandom();
  showEscapeMessage();
}

function showEscapeMessage() {
  const msg = ESCAPE_MESSAGES[Math.floor(Math.random() * ESCAPE_MESSAGES.length)];
  escapeMsg.textContent = msg;
  // position the escape message near the negative button but avoid overlapping the question
  const cardRect = card.getBoundingClientRect();
  const negRect = btnNeg.getBoundingClientRect();
  const qRect = qText.getBoundingClientRect();
  // prefer above the negative button
  let left = negRect.left + negRect.width / 2 - cardRect.left; // will be centered with transform
  let top = negRect.top - cardRect.top - 44; // above
  // if that would overlap the question area, place below the negative button
  if (top < (qRect.bottom - cardRect.top) + 8) {
    top = negRect.bottom - cardRect.top + 8;
  }
  escapeMsg.style.left = `${left}px`;
  escapeMsg.style.top = `${top}px`;
  escapeMsg.classList.add('show');
  setTimeout(() => escapeMsg.classList.remove('show'), 900);
}

// positive click handler
function handlePositive() {
  playHeartPop();
  showPositiveFeedback();
  score++;
  nextQuestion();
}

function showPositiveFeedback() {
  feedback.innerHTML = '';
  const txt = POSITIVE_FEEDBACK[Math.floor(Math.random() * POSITIVE_FEEDBACK.length)];
  const span = document.createElement('div');
  span.className = 'msg';
  span.textContent = txt;
  feedback.appendChild(span);
  setTimeout(() => { if (span.parentNode) span.remove() }, 800);
}

function playHeartPop() {
  // tiny heart floating animation near positive button
  const heart = document.createElement('div');
  heart.className = 'tiny-heart';
  heart.textContent = '💗';
  document.body.appendChild(heart);
  const btnRect = btnPos.getBoundingClientRect();
  heart.style.position = 'fixed';
  heart.style.left = `${btnRect.left + btnRect.width / 2}px`;
  heart.style.top = `${btnRect.top}px`;
  heart.style.fontSize = '18px';
  heart.style.zIndex = 60;
  heart.style.pointerEvents = 'none';
  heart.animate([
    { transform: 'translateY(0) scale(0.8)', opacity: 1 },
    { transform: 'translateY(-44px) scale(1.1)', opacity: 0 }
  ], { duration: 700, easing: 'cubic-bezier(.2,.9,.2,1)' }).onfinish = () => heart.remove();
}

function nextQuestion() {
  index++;
  if (index >= QUESTIONS.length) {
    showFinalScreen();
    return;
  }
  // small delay to let pop animation and feedback show
  setTimeout(() => {
    renderQuestion();
  }, 350);
}

// final screen rendering
function showFinalScreen() {
  // fill progress fully
  progressFill.style.width = `100%`;
  qText.textContent = `You passed the relationship test with maximum cuteness 💖`;
  // clear answers and show final UI
  answersWrap.innerHTML = '';

  const finalWrap = document.createElement('div');
  finalWrap.className = 'final-screen';

  // confetti (simple colorful circles)
  const confettiCanvas = document.createElement('canvas');
  confettiCanvas.style.width = '100%';
  confettiCanvas.style.height = '160px';
  confettiCanvas.width = answersWrap.clientWidth || 600;
  confettiCanvas.height = 160;
  finalWrap.appendChild(confettiCanvas);
  popConfetti(confettiCanvas);

  const heart = document.createElement('div');
  heart.className = 'big-heart';
  heart.textContent = '💖';
  finalWrap.appendChild(heart);

  const p = document.createElement('div');
  p.style.textAlign = 'center';
  p.innerHTML = `<strong style="font-size:1.05rem">You passed the relationship test with maximum cuteness 💖</strong>`;
  finalWrap.appendChild(p);

  const sub = document.createElement('div');
  sub.style.opacity = .95; sub.style.marginTop = '6px'; sub.textContent = `Thank you for being my favorite person, my comfort place, and my daily smile ✨`;
  finalWrap.appendChild(sub);

  const btns = document.createElement('div');
  btns.style.display = 'flex'; btns.style.gap = '12px'; btns.style.marginTop = '8px'; btns.style.flexWrap = 'wrap'; btns.style.justifyContent = 'center';

  const again = document.createElement('button');
  again.className = 'btn small'; again.textContent = 'Take it again 🔁';
  again.onclick = () => location.reload();

  const hug = document.createElement('button');
  hug.className = 'btn small'; hug.textContent = 'Send me a virtual hug 🤗';
  hug.onclick = () => showHugModal();

  btns.appendChild(again); btns.appendChild(hug);
  finalWrap.appendChild(btns);

  answersWrap.appendChild(finalWrap);
}

function showHugModal() {
  hugModal.setAttribute('aria-hidden', 'false');
}
closeModalBtn.addEventListener('click', () => hugModal.setAttribute('aria-hidden', 'true'));

// confetti implementation (simple burst)
function popConfetti(canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width; const h = canvas.height;
  const pieces = [];
  const colors = ['#ff79c6', '#ffd1e6', '#ffd6a5', '#b39cff', '#ffb4c6'];
  for (let i = 0; i < 80; i++) {
    pieces.push({ x: w / 2, y: h / 2, vx: (Math.random() - 0.5) * 6, vy: (Math.random() - 1.5) * -6, r: Math.random() * 6 + 2, c: colors[Math.floor(Math.random() * colors.length)] });
  }
  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    pieces.forEach(p => {
      p.x += p.vx; p.y += p.vy; p.vy += 0.12; p.vx *= 0.99; p.r *= 0.998;
      ctx.fillStyle = p.c; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    t++; if (t < 120) requestAnimationFrame(draw);
  }
  draw();
}

function bindEvents() {
  btnPos.addEventListener('click', handlePositive);
  // positive should be always clickable (no special behavior)

  if (isMobile) {
    // on mobile, the negative jumps on touchstart
    btnNeg.addEventListener('touchstart', handleNegativeTouch, { passive: false });
  } else {
    // on desktop, make it move when pointer gets close
    document.addEventListener('pointermove', handlePointerMove);
    // also prevent normal click by keeping it unreachable
    btnNeg.addEventListener('click', (e) => { e.preventDefault(); showEscapeMessage(); placeNegativeRandom(); });
  }

  // keyboard accessibility: allow keyboard-only users to use negative (but it will still move if attempted)
  btnNeg.addEventListener('focus', () => { placeNegativeRandom(); showEscapeMessage(); });

  // modal close with ESC
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hugModal.setAttribute('aria-hidden', 'true'); });
}

/* PARTICLES: floating hearts and sparkles */
function spawnParticles() {
  const wrap = document.getElementById('particle-wrap');
  const total = 28; // moderate number for smoothness
  for (let i = 0; i < total; i++) {
    const el = document.createElement('div');
    const isHeart = Math.random() > 0.4;
    el.className = isHeart ? 'particle heart' : 'particle sparkle';
    // random horizontal start
    el.style.left = (Math.random() * 100) + '%';
    el.style.bottom = (-Math.random() * 20 - 5) + '%';
    el.style.opacity = (Math.random() * 0.6 + 0.3).toFixed(2);
    const delay = Math.random() * 6;
    el.style.animationDelay = `${delay}s`;
    el.style.transform = `scale(${(Math.random() * 0.8 + 0.6).toFixed(2)})`;
    wrap.appendChild(el);
  }
}

// create styles for particles dynamically for maintainability
(function injectParticleStyles() {
  const s = document.createElement('style');
  s.textContent = `
  .particle{position:fixed;will-change:transform,opacity;pointer-events:none;z-index:-1}
  .particle.heart{font-size:18px;animation:riseUp 9s linear infinite}
  .particle.sparkle{width:6px;height:6px;border-radius:50%;background:rgba(255,255,255,0.85);filter:blur(0.6px);animation:riseUp 10s linear infinite}
  @keyframes riseUp{0%{transform:translateY(0) rotate(0deg);opacity:0}10%{opacity:1}100%{transform:translateY(-130vh) rotate(360deg);opacity:0}}
  `;
  document.head.appendChild(s);
})();

// ensure negative button stays inside answers when window resizes
window.addEventListener('resize', () => { if (!isMobile) placeNegativeAtCenter(); });

// initial call
init();

// small accessibility tweak: if user tries to tab to negative and it's unreachable, still show message
btnNeg.setAttribute('aria-label', 'Negative answer (evades clicks)');
btnPos.setAttribute('aria-label', 'Positive answer');

// make buttons friendly on mobile by ensuring tap highlight is subtle
document.addEventListener('touchstart', () => { }, { passive: true });

// end of file
