const DURATIONS = { focus: 25, shortBreak: 5, longBreak: 10 };

const MODE_META = {
  focus:      { label: '专注时间', cls: 'mode-focus',    color: '#FDE731' },
  shortBreak: { label: '短休息',   cls: 'mode-shortBreak', color: '#FB8C18' },
  longBreak:  { label: '长休息',   cls: 'mode-longBreak',  color: '#9C27B0' },
};

const NEXT_MODE = { focus: 'shortBreak', shortBreak: 'focus', longBreak: 'focus' };

const ICONS = {
  play:  '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
};

const CIRCUMFERENCE = 534; // 2 * PI * 85
const audio = document.getElementById('alarm-sound');
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelector(sel);

let mode = 'focus';
let totalTime = DURATIONS.focus * 60;
let timeLeft = DURATIONS.focus * 60;
let running = false;
let timer = null;

const elMin     = $('minutes');
const elSec     = $('seconds');
const elRing    = $('progress-circle');
const elBtnPlay = $('start-btn');
const elBtnReset= $('reset-btn');
const elLabel   = $('phase-label');
const elWin     = $$('.window-frame');
const elTabs    = $$('.mode-tabs');
const elModeTabs = elTabs.querySelectorAll('.mode-tab');

function makeAlarm() {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const buf = ctx.createBuffer(1, ctx.sampleRate * 1.5, ctx.sampleRate);
  const d   = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) {
    const t = i / ctx.sampleRate;
    const f = 800 + Math.sin(t * 6) * 200;
    const e = Math.max(0, 1 - t / 1.5);
    const p = Math.sin(t * Math.PI / 0.3) > 0 ? 1 : 0.3;
    d[i] = Math.sin(2 * Math.PI * f * t) * e * p * 0.3;
  }
  const blob = new Blob([buf], { type: 'audio/wav' });
  audio.src = URL.createObjectURL(blob);
}

function tick() {
  renderDisplay();
  if (--timeLeft < 0) {
    clearInterval(timer); timer = null; running = false;
    audio.play().catch(() => {});
    window.pomodoro.notify('番茄钟', '时间到！');
    setMode(NEXT_MODE[mode]);
    start();
  }
}

function renderDisplay() {
  elMin.textContent = String((timeLeft / 60 | 0)).padStart(2, '0');
  elSec.textContent = String(timeLeft % 60).padStart(2, '0');
  elRing.style.strokeDashoffset = CIRCUMFERENCE * (1 - timeLeft / totalTime);
}

function setMode(m) {
  if (running) stop();
  mode = m;
  totalTime = DURATIONS[m] * 60;
  timeLeft = totalTime;
  elModeTabs.forEach(t => t.classList.toggle('active', t.dataset.mode === m));
  const meta = MODE_META[m];
  elWin.className = 'window-frame ' + meta.cls;
  elWin.style.setProperty('--accent', meta.color);
  elLabel.textContent = meta.label;
  elBtnPlay.innerHTML = ICONS.play;
  renderDisplay();
}

function start() {
  running = true;
  elBtnPlay.innerHTML = ICONS.pause;
  timeLeft--; // Decrement immediately before first display
  tick();
  timer = setInterval(tick, 1000);
}

function stop() {
  running = false;
  clearInterval(timer); timer = null;
  elBtnPlay.innerHTML = ICONS.play;
}

function reset() {
  if (running) stop();
  timeLeft = totalTime;
  renderDisplay();
}

elBtnPlay.addEventListener('click', () => running ? stop() : start());
elBtnReset.addEventListener('click', reset);
elTabs.addEventListener('click', e => e.target.dataset.mode && setMode(e.target.dataset.mode));
$$('#close-btn').addEventListener('click',   () => window.pomodoro.close());
$$('#minimize-btn').addEventListener('click', () => window.pomodoro.minimize());

makeAlarm();
renderDisplay(); // Show initial time

document.addEventListener('keydown', e => {
  if (e.code === 'Space') e.preventDefault(), start();
  else if (e.code === 'KeyR') reset();
});
