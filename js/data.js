const jsonImport = document.getElementById('json-import');
const importButton = document.getElementById('import-button');
const exportButton = document.getElementById('export-button');
const importPreviewArea = document.getElementById('import-preview');
const taskStatsContainer = document.getElementById('task-stats');
const focusStatsContainer = document.getElementById('focus-stats');
const streakStatsContainer = document.getElementById('streak-stats');
const rewardsStatsContainer = document.getElementById('rewards-stats');

let importPreviewTasks = [];
let importPreviewSessions = [];
let importPreviewXp = 0;

function renderTaskStats() {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.done).length;
  const urgent = tasks.filter((task) => task.urgent).length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;
  const categories = [...new Set(tasks.map((task) => task.category || 'General'))];
  const avgDifficulty = tasks.length
    ? (tasks.reduce((sum, task) => {
      const diffMap = { Easy: 1, Medium: 2, Hard: 3 };
      return sum + (diffMap[task.difficulty] || 0);
    }, 0) / tasks.length).toFixed(1)
    : 0;

  taskStatsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${total}</div>
      <div class="stat-label">Total tasks</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${completed}</div>
      <div class="stat-label">Completed</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${completionRate}%</div>
      <div class="stat-label">Completion rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${urgent}</div>
      <div class="stat-label">Urgent</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${categories.length}</div>
      <div class="stat-label">Categories</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${avgDifficulty}</div>
      <div class="stat-label">Avg difficulty</div>
    </div>
  `;
}

function renderFocusStats() {
  const totalMinutes = focusSessions.reduce((sum, s) => sum + s.minutes, 0);
  const sessionCount = focusSessions.length;
  const avgSession = sessionCount ? Math.round(totalMinutes / sessionCount) : 0;
  const uniqueDays = new Set(focusSessions.map((s) => s.at)).size;

  focusStatsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${totalMinutes}</div>
      <div class="stat-label">Total focus minutes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${sessionCount}</div>
      <div class="stat-label">Sessions</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${avgSession}</div>
      <div class="stat-label">Avg session (min)</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${uniqueDays}</div>
      <div class="stat-label">Focus days</div>
    </div>
  `;
}

function renderStreakStats() {
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

  const userSince = tasks.length
    ? new Date(Math.min(...tasks.map((t) => new Date(t.createdAt || Date.now()).getTime()))).toLocaleDateString()
    : 'N/A';

  streakStatsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${currentStreak}</div>
      <div class="stat-label">Current streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${longestStreak}</div>
      <div class="stat-label">Longest streak</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${uniqueDates.size}</div>
      <div class="stat-label">Active days</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${userSince}</div>
      <div class="stat-label">User since</div>
    </div>
  `;
}

function renderRewardsStats() {
  rewardsStatsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-value">${xp}</div>
      <div class="stat-label">Total XP</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${rewards.length}</div>
      <div class="stat-label">Rewards</div>
    </div>
  `;
}

function parseImportFile(file) {
  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = JSON.parse(event.target.result);
      const importedTasks = Array.isArray(data) ? data : data.tasks || [];
      const importedSessions = data.focusSessions || [];
      const importedXp = data.xp ?? xp;
      const importedWeeklyGoal = data.weeklyGoal ?? weeklyGoal;
      const importedLongestStreak = data.longestStreak ?? longestStreak;
      const importedRewards = data.rewards ?? rewards;

      importPreviewTasks = importedTasks;
      importPreviewSessions = importedSessions;
      importPreviewXp = importedXp;

      importPreviewArea.innerHTML = `
        <div class="import-preview">
          <p><strong>Import Preview</strong></p>
          <p>${importedTasks.length} tasks, ${importedSessions.length} focus sessions</p>
          <div class="import-actions">
            <button type="button" id="confirm-import" class="btn primary">Confirm Import</button>
            <button type="button" id="cancel-import" class="btn">Cancel</button>
          </div>
        </div>
      `;
      importPreviewArea.classList.remove('hidden');

      document.getElementById('confirm-import').addEventListener('click', () => {
        tasks = importedTasks;
        focusSessions = importedSessions;
        xp = importedXp;
        weeklyGoal = importedWeeklyGoal;
        longestStreak = importedLongestStreak;
        rewards = importedRewards;
        saveTasks('Data imported successfully.');
        importPreviewArea.innerHTML = '<p class="success">Import successful.</p>';
        renderDataPage();
      });
      document.getElementById('cancel-import').addEventListener('click', () => {
        importPreviewArea.classList.add('hidden');
        importPreviewArea.innerHTML = '';
      });
    } catch (error) {
      importPreviewArea.innerHTML = `<p class="error">Invalid JSON file: ${error.message}</p>`;
      importPreviewArea.classList.remove('hidden');
    }
  };
  reader.readAsText(file);
}

function exportAll() {
  const exportData = {
    tasks,
    focusSessions,
    xp,
    weeklyGoal,
    longestStreak,
    rewards,
    exportedAt: new Date().toISOString(),
  };
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-export-${todayString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function escapeCsv(value) {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function exportExcel() {
  const rows = [['Title', 'Date', 'Category', 'Priority', 'Difficulty', 'Status', 'Urgent', 'Tags', 'Notes', 'Bucket', 'Completed At']];
  tasks.forEach((task) => {
    rows.push([
      escapeCsv(task.title),
      escapeCsv(task.date),
      escapeCsv(task.category || 'General'),
      escapeCsv(task.priority || 'Medium'),
      escapeCsv(task.difficulty || 'Medium'),
      task.done ? 'Completed' : 'Active',
      task.urgent ? 'Yes' : 'No',
      escapeCsv((task.tags || []).join(', ')),
      escapeCsv(task.notes || ''),
      escapeCsv(task.bucket || 'Today'),
      escapeCsv(task.completedAt || ''),
    ]);
  });

  rows.push([]);
  rows.push(['Focus Minutes', 'Date']);
  focusSessions.forEach((s) => {
    rows.push([s.minutes, escapeCsv(s.at)]);
  });

  const csv = rows.map((row) => row.join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `plan-excel-${todayString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  setStatus('Excel file downloaded.');
}

function renderDataPage() {
  renderTaskStats();
  renderFocusStats();
  renderStreakStats();
  renderRewardsStats();
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
  loadTasks();
  renderDataPage();

  importButton.addEventListener('click', () => jsonImport.click());
  jsonImport.addEventListener('change', (event) => {
    if (event.target.files.length) parseImportFile(event.target.files[0]);
  });
  exportButton.addEventListener('click', exportAll);
  document.getElementById('excel-export-button').addEventListener('click', exportExcel);
});