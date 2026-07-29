const timerDisplay = document.getElementById('timer-display');
const timerStartBtn = document.getElementById('timer-start-btn');
const timerPauseBtn = document.getElementById('timer-pause-btn');
const timerResetBtn = document.getElementById('timer-reset-btn');
const timerModeRadios = document.querySelectorAll('input[name="timer-mode"]');
const timerCustomInput = document.getElementById('timer-custom');
const timerProgress = document.getElementById('timer-progress');
const sessionList = document.getElementById('session-list');
const totalFocusMinutes = document.getElementById('total-focus-minutes');
const breakTime = document.getElementById('break-time');
const focusComplete = document.getElementById('focus-complete');

let timerState = {
  seconds: 0,
  totalSeconds: 0,
  isRunning: false,
  isPaused: false,
  intervalId: null,
  mode: 'pomodoro',
  sessionStartAt: null,
  phase: 'focus',
};

const timerModes = {
  pomodoro: 25 * 60,
  'short-break': 5 * 60,
  'long-break': 15 * 60,
};

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getTimerDuration() {
  if (timerState.mode === 'custom') {
    const v = parseInt(timerCustomInput.value, 10);
    return v > 0 && v <= 999 ? v * 60 : 25 * 60;
  }
  return timerModes[timerState.mode] || 25 * 60;
}

function updateTimerDisplay() {
  timerDisplay.textContent = formatTimer(timerState.seconds);
  const pct = timerState.totalSeconds > 0
    ? ((timerState.totalSeconds - timerState.seconds) / timerState.totalSeconds) * 100
    : 0;
  timerProgress.style.width = `${pct}%`;
  document.title = `${formatTimer(timerState.seconds)} — Plan`;
}

function completePomodoro() {
  const elapsedMinutes = Math.round((timerState.totalSeconds - timerState.seconds) / 60);
  if (elapsedMinutes < 1) return;
  focusSessions.push({ minutes: elapsedMinutes, at: todayString() });
  saveTasks('Pomodoro session saved.');
  renderSessions();

  focusComplete.classList.remove('hidden');
  focusComplete.querySelector('.focus-complete-minutes').textContent = elapsedMinutes;
  focusComplete.querySelector('.focus-time-display').textContent = `${elapsedMinutes}m`;
}

function tickTimer() {
  timerState.seconds -= 1;
  updateTimerDisplay();

  if (timerState.seconds <= 0) {
    clearInterval(timerState.intervalId);
    timerState.isRunning = false;
    timerState.isPaused = false;
    timerStartBtn.disabled = false;
    timerPauseBtn.disabled = true;
    timerStartBtn.textContent = 'Start';
    completePomodoro();
    breakTime.classList.remove('hidden');
  }
}

function startTimer() {
  if (timerState.isPaused) {
    timerState.isPaused = false;
    timerState.intervalId = setInterval(tickTimer, 1000);
    timerStartBtn.disabled = true;
    timerPauseBtn.disabled = false;
    timerStartBtn.textContent = 'Running';
    return;
  }

  timerState.totalSeconds = getTimerDuration();
  timerState.seconds = timerState.totalSeconds;
  timerState.isRunning = true;
  timerState.isPaused = false;
  timerState.sessionStartAt = new Date().toISOString();
  updateTimerDisplay();

  focusComplete.classList.add('hidden');
  breakTime.classList.add('hidden');
  timerStartBtn.disabled = true;
  timerPauseBtn.disabled = false;
  timerStartBtn.textContent = 'Running';
  timerState.intervalId = setInterval(tickTimer, 1000);
}

function pauseTimer() {
  if (timerState.isRunning && !timerState.isPaused) {
    clearInterval(timerState.intervalId);
    timerState.isPaused = true;
    timerStartBtn.disabled = false;
    timerStartBtn.textContent = 'Resume';
    timerPauseBtn.disabled = true;
  }
}

function resetTimer() {
  clearInterval(timerState.intervalId);
  timerState.isRunning = false;
  timerState.isPaused = false;
  timerState.seconds = getTimerDuration();
  timerState.totalSeconds = getTimerDuration();
  timerState.sessionStartAt = null;
  updateTimerDisplay();
  timerStartBtn.disabled = false;
  timerPauseBtn.disabled = true;
  timerStartBtn.textContent = 'Start';
  focusComplete.classList.add('hidden');
  breakTime.classList.add('hidden');
}

function setTimerMode(mode) {
  timerState.mode = mode;
  timerCustomInput.disabled = mode !== 'custom';
  timerCustomInput.parentElement.classList.toggle('disabled', mode !== 'custom');
  resetTimer();
}

function renderSessions() {
  const totalMinutes = focusSessions.reduce((sum, s) => sum + s.minutes, 0);
  totalFocusMinutes.textContent = totalMinutes;
  sessionList.innerHTML = focusSessions
    .slice()
    .reverse()
    .slice(0, 20)
    .map(
      (s) => `
      <div class="session-entry">
        <div class="session-minutes">${s.minutes}m</div>
        <div class="session-date">${escapeHtml(formatDate(s.at))}</div>
      </div>
    `
    )
    .join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  loadTasks();
  resetTimer();
  renderSessions();

  timerStartBtn.addEventListener('click', startTimer);
  timerPauseBtn.addEventListener('click', pauseTimer);
  timerResetBtn.addEventListener('click', resetTimer);

  timerModeRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      if (radio.checked) setTimerMode(radio.value);
    });
  });

  timerCustomInput.addEventListener('input', () => {
    if (timerState.mode === 'custom') resetTimer();
  });
});