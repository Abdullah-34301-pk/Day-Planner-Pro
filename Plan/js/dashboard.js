let statsAnimated = false;

const taskCount = document.getElementById('task-count');
const doneCount = document.getElementById('done-count');
const urgentCount = document.getElementById('urgent-count');
const streakCount = document.getElementById('streak-count');
const todayProgress = document.getElementById('today-progress');
const nextTask = document.getElementById('next-task');
const motivationBanner = document.getElementById('motivation-banner');
const xpSummary = document.getElementById('xp-summary');
const rewardsList = document.getElementById('rewards-list');
const dashboardGrid = document.getElementById('dashboard-grid');

function renderHeaderStats() {
  const completed = tasks.filter((task) => task.done).length;
  const urgent = tasks.filter((task) => task.urgent).length;

  if (!statsAnimated) {
    animateNumericValue(taskCount, tasks.length, { duration: 900 });
    animateNumericValue(doneCount, completed, { duration: 900 });
    animateNumericValue(urgentCount, urgent, { duration: 900 });
    statsAnimated = true;
  } else {
    taskCount.textContent = tasks.length;
    doneCount.textContent = completed;
    urgentCount.textContent = urgent;
  }

  const completedDates = tasks.filter((task) => task.done && task.completedAt).map((task) => task.completedAt);
  const uniqueDates = new Set(completedDates);
  let streak = 0;
  let cursor = new Date();
  while (uniqueDates.has(cursor.toISOString().split('T')[0])) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  animateNumericValue(streakCount, streak, { duration: 900 });

  const todayTasks = tasks.filter((task) => task.date === todayString());
  const todayCompleted = todayTasks.filter((task) => task.done).length;
  const todayPercent = todayTasks.length ? Math.round((todayCompleted / todayTasks.length) * 100) : 0;
  animateNumericValue(todayProgress, todayPercent, { duration: 900, suffix: '%' });

  const next = [...tasks]
    .filter((task) => !task.done)
    .sort((a, b) => {
      if (a.urgent !== b.urgent) return Number(b.urgent) - Number(a.urgent);
      return (a.date || '').localeCompare(b.date || '');
    })[0];
  nextTask.textContent = next ? next.title : 'All clear';

  if (tasks.length && !tasks.some((task) => !task.done)) {
    motivationBanner.classList.remove('hidden');
    motivationBanner.textContent = 'Everything is wrapped up. That is a strong day.';
  } else {
    motivationBanner.classList.add('hidden');
  }
}

function renderDashboardPage() {
  renderHeaderStats();

  const now = new Date();
  const today = todayString();

  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const weekStartStr = formatDateValue(weekStart);
  const monthStartStr = formatDateValue(new Date(now.getFullYear(), now.getMonth(), 1));

  const thisWeekTasks = tasks.filter((task) => task.date && task.date >= weekStartStr);
  const completedThisWeek = thisWeekTasks.filter((task) => task.done).length;
  const weekCompletionRate = thisWeekTasks.length ? Math.round((completedThisWeek / thisWeekTasks.length) * 100) : 0;

  const thisMonthTasks = tasks.filter((task) => task.date && task.date >= monthStartStr);
  const completedThisMonth = thisMonthTasks.filter((task) => task.done).length;
  const monthCompletionRate = thisMonthTasks.length ? Math.round((completedThisMonth / thisMonthTasks.length) * 100) : 0;

  const todayTasks = tasks.filter((task) => task.date === today);
  const completedToday = todayTasks.filter((task) => task.done).length;
  const todayCompletionRate = todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0;

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

  const categories = ['Work', 'Study', 'Health', 'Personal', 'Chores', 'General'];
  const categoryData = categories.map((cat) => {
    const total = tasks.filter((task) => (task.category || 'General') === cat).length;
    const done = tasks.filter((task) => (task.category || 'General') === cat && task.done).length;
    return { name: cat, total, done };
  }).sort((a, b) => b.done - a.done);
  const maxCategoryDone = Math.max(...categoryData.map((c) => c.done), 1);

  const thisWeekMinutes = focusSessions
    .filter((s) => s.at && s.at >= weekStartStr)
    .reduce((sum, s) => sum + s.minutes, 0);

  const goalProgress = weeklyGoal > 0 ? Math.min(Math.round((completedThisWeek / weeklyGoal) * 100), 100) : 0;

  const trendBars = Array.from({ length: 28 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (27 - index));
    const dayValue = formatDateValue(day);
    const count = tasks.filter((task) => task.done && task.completedAt === dayValue).length;
    return { day, dayValue, count };
  });
  const maxTrendCount = Math.max(...trendBars.map((d) => d.count), 1);

  dashboardGrid.innerHTML = `
    <div class="dash-card dash-card-full" data-jump="insight">
      <div class="dash-card-header">
        <h3>Completion rate</h3>
        <a href="insight.html" class="dash-card-link">Details →</a>
      </div>
      <div class="dash-completion-row">
        <div class="dash-completion-item">
          <div class="dash-completion-value">${todayCompletionRate}%</div>
          <div class="dash-completion-label">Today</div>
        </div>
        <div class="dash-completion-item">
          <div class="dash-completion-value">${weekCompletionRate}%</div>
          <div class="dash-completion-label">This week</div>
        </div>
        <div class="dash-completion-item">
          <div class="dash-completion-value">${monthCompletionRate}%</div>
          <div class="dash-completion-label">This month</div>
        </div>
      </div>
    </div>

    <div class="dash-card dash-card-full" data-jump="insight">
      <div class="dash-card-header">
        <h3>Trend — last 28 days</h3>
        <a href="insight.html" class="dash-card-link">Details →</a>
      </div>
      <div class="history-bars" style="height:100px">
        ${trendBars.map((d) => `
          <div class="history-bar" style="height:${Math.max(4, (d.count / maxTrendCount) * 90)}px">
            <span>${d.day.getDate()}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="dash-card" data-jump="insight">
      <div class="dash-card-header">
        <h3>Streak</h3>
        <a href="insight.html" class="dash-card-link">Details →</a>
      </div>
      <div class="dash-streak-row">
        <div class="dash-streak-item">
          <div class="dash-streak-value">${currentStreak}</div>
          <div class="dash-streak-label">Current</div>
        </div>
        <div class="dash-streak-item">
          <div class="dash-streak-value">${longestStreak}</div>
          <div class="dash-streak-label">Longest</div>
        </div>
      </div>
    </div>

    <div class="dash-card" data-jump="plans">
      <div class="dash-card-header">
        <h3>Category breakdown</h3>
        <a href="plans.html" class="dash-card-link">All plans →</a>
      </div>
      <div class="dash-category-bars">
        ${categoryData.map((c) => `
          <div class="dash-category-row">
            <span class="dash-category-label">${escapeHtml(c.name)}</span>
            <div class="dash-category-track">
              <div class="dash-category-fill" style="width:${Math.max(4, (c.done / maxCategoryDone) * 100)}%"></div>
            </div>
            <span class="dash-category-count">${c.done}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="dash-card" data-jump="timer">
      <div class="dash-card-header">
        <h3>Focus time this week</h3>
        <a href="timer.html" class="dash-card-link">Timer →</a>
      </div>
      <div class="dash-focus-value">${thisWeekMinutes}</div>
      <div class="dash-focus-caption">minutes logged this week</div>
    </div>

    <div class="dash-card" data-jump="plans">
      <div class="dash-card-header">
        <h3>Weekly goal</h3>
      </div>
      <div class="dash-goal-row">
        <div class="dash-goal-text">
          <div class="dash-goal-value">${completedThisWeek} / ${weeklyGoal}</div>
          <div class="dash-goal-label">tasks completed this week</div>
        </div>
        <div style="text-align:center">
          <div style="font-size:0.82rem;color:var(--muted);margin-bottom:4px">${goalProgress}%</div>
          <button type="button" class="dash-goal-edit" id="edit-goal-btn">Edit</button>
        </div>
      </div>
    </div>
  `;

  xpSummary.innerHTML = `
    <div class="xp-card">
      <strong>${xp} XP</strong>
      <span>Level ${Math.floor(xp / 100) + 1}</span>
    </div>
  `;
  rewardsList.innerHTML = rewards.map((reward) => `<div class="reward-item">${escapeHtml(reward.name)} · ${reward.cost} XP</div>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  loadTasks();

  const initialStreak = calculateLongestStreak();
  if (initialStreak > longestStreak) {
    longestStreak = initialStreak;
  }

  renderDashboardPage();

  const quickAddCta = document.getElementById('quick-add-cta');
  const jumpToView = document.getElementById('jump-to-view');

  quickAddCta.addEventListener('click', () => {
    sessionStorage.setItem('quickAdd', 'true');
    window.location.href = 'add-task.html';
  });

  jumpToView.addEventListener('click', () => {
    window.location.href = 'plans.html';
  });

  document.addEventListener('click', (event) => {
    const goalBtn = event.target.closest('#edit-goal-btn');
    if (goalBtn) {
      const newGoal = prompt('Weekly task goal:', String(weeklyGoal));
      if (newGoal !== null) {
        const parsed = parseInt(newGoal, 10);
        if (!isNaN(parsed) && parsed > 0) {
          weeklyGoal = parsed;
          saveTasks('Weekly goal updated.');
          renderDashboardPage();
        }
      }
    }
  });

  document.addEventListener('click', (event) => {
    const card = event.target.closest('.dash-card');
    if (card && !event.target.closest('a, button')) {
      const jump = card.dataset.jump;
      if (jump) window.location.href = `${jump}.html`;
    }
  });
});