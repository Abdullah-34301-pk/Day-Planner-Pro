const STORAGE_KEY = 'day-planner-items-v1';
const EXPORT_FILE_NAME = 'day-planner-data.json';

let tasks = [];
let focusSessions = [];
let xp = 0;
let rewards = [
  { name: 'Coffee break', cost: 40 },
  { name: 'Movie night', cost: 80 },
  { name: 'Small treat', cost: 120 }
];
let longestStreak = 0;
let weeklyGoal = 8;

function createId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function todayString() {
  return new Date().toISOString().split('T')[0];
}

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      tasks = parsed;
      xp = 0;
      focusSessions = [];
      longestStreak = 0;
      weeklyGoal = 8;
      rewards = [
        { name: 'Coffee break', cost: 40 },
        { name: 'Movie night', cost: 80 },
        { name: 'Small treat', cost: 120 }
      ];
      return;
    }

    tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    xp = Number(parsed.xp || 0);
    focusSessions = Array.isArray(parsed.focusSessions) ? parsed.focusSessions : [];
    longestStreak = Number(parsed.longestStreak || 0);
    weeklyGoal = Number(parsed.weeklyGoal || 8);
    rewards = Array.isArray(parsed.rewards) && parsed.rewards.length ? parsed.rewards : [
      { name: 'Coffee break', cost: 40 },
      { name: 'Movie night', cost: 80 },
      { name: 'Small treat', cost: 120 }
    ];
  } catch (error) {
    tasks = [];
    xp = 0;
    focusSessions = [];
    longestStreak = 0;
    weeklyGoal = 8;
    rewards = [
      { name: 'Coffee break', cost: 40 },
      { name: 'Movie night', cost: 80 },
      { name: 'Small treat', cost: 120 }
    ];
  }
}

function saveTasks(message = 'Saved locally.') {
  const payload = { tasks, xp, focusSessions, rewards, longestStreak, weeklyGoal };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  setStatus(message);
}

function calculateLongestStreak() {
  const dates = [...new Set(
    tasks.filter(t => t.done && t.completedAt).map(t => t.completedAt)
  )].sort();
  if (!dates.length) return 0;
  let longest = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }
  return longest;
}

function handleTaskActions(event) {
  const control = event.target.closest('button, input');
  if (!control) return;

  const action = control.dataset.action;
  const id = control.dataset.id;
  if (!id) return;

  if (action === 'toggle-done') {
    tasks = tasks.map((task) => {
      if (task.id !== id) return task;
      const done = !task.done;
      const completedAt = done ? todayString() : '';
      return { ...task, done, completedAt };
    });
    xp += 15;
    const calculated = calculateLongestStreak();
    if (calculated > longestStreak) {
      longestStreak = calculated;
    }
    saveTasks('Progress updated.');
  }

  if (action === 'toggle-urgent') {
    tasks = tasks.map((task) => (task.id === id ? { ...task, urgent: !task.urgent } : task));
    saveTasks('Urgency updated.');
  }

  if (action === 'edit') {
    const taskToEdit = tasks.find((task) => task.id === id);
    if (taskToEdit) {
      sessionStorage.setItem('editTaskId', id);
      window.location.href = 'add-task.html';
    }
  }

  if (action === 'delete') {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks('Task removed.');
  }
}