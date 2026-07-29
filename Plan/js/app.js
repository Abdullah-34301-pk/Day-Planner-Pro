const quickAddCta = document.getElementById('quick-add-cta');
const jumpToView = document.getElementById('jump-to-view');

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
      populateForm(taskToEdit);
      navigate('#/add');
    }
  }

  if (action === 'delete') {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks('Task removed.');
  }
}

quickAddCta.addEventListener('click', () => {
  titleInput.value = 'Write one focused note';
  categoryInput.value = 'Study';
  dateInput.value = todayString();
  navigate('#/add');
});

jumpToView.addEventListener('click', () => {
  setView('table');
  navigate('#/plans');
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
      }
    }
  }
});

document.addEventListener('click', (event) => {
  const card = event.target.closest('.dash-card');
  if (card && !event.target.closest('a, button')) {
    const jump = card.dataset.jump;
    if (jump) navigate(`#/${jump}`);
  }
});

resetForm();
setView('table');
loadTasks();

const initialStreak = calculateLongestStreak();
if (initialStreak > longestStreak) {
  longestStreak = initialStreak;
}

handleRoute();

calendarDisplayDate = new Date();
selectedCalendarDate = new Date();
renderCalendar();