const insightsWeeklyBars = document.getElementById('insights-weekly-bars');
const upcomingList = document.getElementById('upcoming-list');
const insightsStreakInfo = document.getElementById('insights-streak-info');

function renderInsightsPage() {
  const upcoming = [...tasks]
    .filter((task) => !task.done)
    .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
    .slice(0, 5);

  upcomingList.innerHTML = upcoming.length
    ? upcoming.map((task) => `<li>${escapeHtml(task.title)} · ${escapeHtml(formatDate(task.date))}</li>`).join('')
    : '<li>No upcoming work.</li>';

  const now = new Date();
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  insightsWeeklyBars.innerHTML = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(now);
    day.setDate(now.getDate() - (6 - index));
    const dayValue = formatDateValue(day);
    const dayCount = tasks.filter((task) => task.done && task.completedAt === dayValue).length;
    const height = Math.max(4, dayCount * 22);
    return `<div class="history-bar" style="height:${height}px"><span>${dayLabels[day.getDay()]}</span></div>`;
  }).join('');

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

  insightsStreakInfo.innerHTML = `
    <div class="dash-streak-item">
      <div class="dash-streak-value">${currentStreak}</div>
      <div class="dash-streak-label">Current</div>
    </div>
    <div class="dash-streak-item">
      <div class="dash-streak-value">${longestStreak}</div>
      <div class="dash-streak-label">Longest</div>
    </div>
  `;
}