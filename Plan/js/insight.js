const weeklyMomentumContainer = document.getElementById('weekly-momentum');
const nextUpContainer = document.getElementById('next-up');
const taskLogContainer = document.getElementById('task-log');
const heatmapContainer = document.getElementById('heatmap');
const streakDisplayContainer = document.getElementById('streak-display');
const xpDisplayContainer = document.getElementById('xp-display');
const momentumChartContainer = document.getElementById('momentum-chart');

function renderNextUp() {
  const now = new Date();
  const today = todayString();
  const futureTasks = tasks
    .filter((task) => !task.done)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const tasksDueToday = futureTasks.filter((task) => task.date === today);
  const tasksOverdue = futureTasks.filter((task) => task.date && task.date < today);
  const tasksFuture = futureTasks.filter((task) => task.date && task.date > today);
  const tasksNoDate = futureTasks.filter((task) => !task.date);

  const upcoming = [...tasksOverdue, ...tasksDueToday, ...tasksFuture, ...tasksNoDate].slice(0, 8);

  if (!upcoming.length) {
    nextUpContainer.innerHTML = '<div class="empty-state">No upcoming tasks.</div>';
    return;
  }

  nextUpContainer.innerHTML = upcoming
    .map((task) => {
      const status = getDueStatus(task);
      let statusClass = '';
      if (status === 'Overdue') statusClass = 'overdue';
      else if (status === 'Due Today') statusClass = 'due-today';
      else if (status === 'Due Tomorrow') statusClass = 'due-tomorrow';

      return `
        <div class="next-task-card ${statusClass}" data-id="${task.id}">
          <div class="next-task-top">
            <input class="check-box" type="checkbox" data-action="toggle-done" data-id="${task.id}" ${task.done ? 'checked' : ''} />
            <div>
              <div class="next-task-title">${escapeHtml(task.title)}</div>
              <div class="next-task-meta">${escapeHtml(formatDate(task.date))} · ${escapeHtml(task.category || 'General')}</div>
            </div>
          </div>
          <div>
            <span class="badge">${escapeHtml(status)}</span>
            ${task.urgent ? '<span class="badge urgent">Urgent</span>' : ''}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderWeeklyMomentum() {
  const now = new Date();
  const tasksThisWeek = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const totalDone = [];
  let weekTotal = 0;

  for (let i = 0; i < 7; i += 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - i));
    const dayValue = formatDateValue(day);
    const dayTasks = tasks.filter((task) => task.date === dayValue);
    const done = dayTasks.filter((task) => task.done).length;
    tasksThisWeek.push({ day: dayNames[day.getDay()], date: dayValue, total: dayTasks.length, done, label: day.getDate() });
    weekTotal += done;
    totalDone.push(done);
  }

  const maxDone = Math.max(...totalDone, 1);
  const momentumScore = tasks.length ? Math.round((weekTotal / Math.max(tasks.length, 1)) * 100) : 0;

  weeklyMomentumContainer.innerHTML = `
    <div class="chart-bar-container">
      ${tasksThisWeek
        .map((d) => {
          const barHeight = Math.max(6, (d.done / maxDone) * 80);
          return `
            <div class="chart-bar-item">
              <div class="chart-bar-label">${d.day}</div>
              <div class="chart-bar-fill" style="height:${barHeight}px">
                <span>${d.done}</span>
              </div>
            </div>
          `;
        })
        .join('')}
    </div>
    <div class="momentum-summary">
      <div class="momentum-score">
        <strong>${weekTotal}</strong>
        <span>tasks done this week</span>
      </div>
      <div class="momentum-score">
        <strong>${momentumScore}%</strong>
        <span>momentum score</span>
      </div>
    </div>
  `;
}

function renderTaskLog() {
  const log = tasks
    .filter((task) => task.done && task.completedAt)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, 20);

  if (!log.length) {
    taskLogContainer.innerHTML = '<div class="empty-state">No completed tasks yet. Start checking things off.</div>';
    return;
  }

  taskLogContainer.innerHTML = log
    .map(
      (task) => `
      <div class="log-entry">
        <div class="log-date">${escapeHtml(formatDate(task.completedAt))}</div>
        <div class="log-title">${escapeHtml(task.title)}</div>
        <div class="log-category">${escapeHtml(task.category || 'General')}</div>
      </div>
    `
    )
    .join('');
}

function renderHeatmap() {
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeks = 20;
  const cells = [];

  for (let w = weeks - 1; w >= 0; w -= 1) {
    for (let d = 0; d < 7; d += 1) {
      const day = new Date(now);
      day.setDate(now.getDate() - (w * 7 + (6 - d)));
      const dayValue = formatDateValue(day);
      const dayTasks = tasks.filter((task) => task.date === dayValue);
      const completed = dayTasks.filter((task) => task.done).length;
      const level = completed === 0 ? 0 : completed <= 2 ? 1 : completed <= 4 ? 2 : 3;
      cells.push({ dayValue, level, dayOfWeek: d, week: w });

      if (w === weeks - 1) {
        const label = document.createElement('div');
        label.className = 'heatmap-label';
        label.textContent = dayNames[d];
      }
    }
  }

  heatmapContainer.innerHTML = cells
    .map(
      (cell) => `
      <div class="heatmap-cell level-${cell.level}" title="${cell.dayValue}: ${cell.level} tasks"></div>
    `
    )
    .join('');
}

function renderStreakDisplay() {
  const completedDates = tasks.filter((task) => task.done && task.completedAt).map((task) => task.completedAt);
  const uniqueDates = new Set(completedDates);
  let currentStreak = 0;
  let cursor = new Date();
  while (uniqueDates.has(cursor.toISOString().split('T')[0])) {
    currentStreak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const calculatedLongest = calculateLongestStreak();
  if (calculatedLongest > longestStreak) {
    longestStreak = calculatedLongest;
  }

  streakDisplayContainer.innerHTML = `
    <div class="streak-row">
      <div class="streak-item">
        <div class="streak-value">${currentStreak}</div>
        <div class="streak-label">Current streak</div>
      </div>
      <div class="streak-item">
        <div class="streak-value">${longestStreak}</div>
        <div class="streak-label">Longest streak</div>
      </div>
      <div class="streak-item">
        <div class="streak-value">${uniqueDates.size}</div>
        <div class="streak-label">Active days</div>
      </div>
    </div>
  `;
}

function renderXpDisplay() {
  xpDisplayContainer.innerHTML = `
    <div class="xp-display-row">
      <div class="xp-display-item">
        <div class="xp-display-value">${xp}</div>
        <div class="xp-display-label">Total XP</div>
      </div>
      <div class="xp-display-item">
        <div class="xp-display-value">Level ${Math.floor(xp / 100) + 1}</div>
        <div class="xp-display-label">Current level</div>
      </div>
    </div>
  `;
}

function renderMomentumChart() {
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const data = [];

  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(now);
    day.setDate(now.getDate() - i);
    const dayValue = formatDateValue(day);
    const dayTasks = tasks.filter((task) => task.date === dayValue);
    const done = dayTasks.filter((task) => task.done).length;
    data.push({ label: dayNames[day.getDay()], value: done, date: dayValue });
  }

  const maxVal = Math.max(...data.map((d) => d.value), 1);

  momentumChartContainer.innerHTML = data
    .map((d) => {
      const pct = (d.value / maxVal) * 100;
      return `<div class="momentum-bar-wrap"><div class="momentum-bar" style="height:${pct}%"><span>${d.value}</span></div><div class="momentum-bar-label">${d.label}</div></div>`;
    })
    .join('');
}

function renderInsights() {
  renderWeeklyMomentum();
  renderNextUp();
  renderTaskLog();
  renderHeatmap();
  renderStreakDisplay();
  renderXpDisplay();
  renderMomentumChart();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  loadTasks();
  renderInsights();
});