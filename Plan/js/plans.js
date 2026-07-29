const taskTableBody = document.getElementById('task-table-body');
const searchInput = document.getElementById('search-input');
const filterSelect = document.getElementById('filter-select');
const sortSelect = document.getElementById('sort-select');
const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthLabel = document.getElementById('calendar-month-label');
const calendarDetail = document.getElementById('calendar-detail');
const calendarTodayButton = document.getElementById('calendar-today-btn');
const boardColumns = document.getElementById('board-columns');
const viewButtons = document.querySelectorAll('[data-view]');
const viewSurfaces = document.querySelectorAll('.view-surface');

let currentView = 'table';
let calendarDisplayDate = new Date();
let selectedCalendarDate = new Date();
let draggedTaskId = null;

function getFilteredTasks() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = filterSelect.value;
  const sort = sortSelect.value;

  let filtered = tasks.filter((task) => {
    const matchesQuery = !query || task.title.toLowerCase().includes(query) || task.notes.toLowerCase().includes(query) || task.category.toLowerCase().includes(query);
    const matchesFilter = filter === 'all' || (filter === 'active' && !task.done) || (filter === 'completed' && task.done) || (filter === 'urgent' && task.urgent);
    return matchesQuery && matchesFilter;
  });

  filtered = filtered.sort((a, b) => {
    if (sort === 'urgent') {
      return Number(b.urgent) - Number(a.urgent);
    }
    if (sort === 'status') {
      return Number(a.done) - Number(b.done);
    }
    return a.date.localeCompare(b.date);
  });

  return filtered;
}

function revealRows() {
  const rows = taskTableBody.querySelectorAll('tr');
  rows.forEach((row, index) => {
    row.classList.add('reveal');
    row.classList.add('is-visible');
    row.style.setProperty('--row-delay', `${index * 40}ms`);
  });
}

function renderTable() {
  const visibleTasks = getFilteredTasks();

  if (!visibleTasks.length) {
    taskTableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No matching plans. Try another search or filter.</td></tr>';
    return;
  }

  taskTableBody.innerHTML = visibleTasks
    .map((task, index) => {
      const status = getDueStatus(task);
      const doneClass = task.done ? 'done' : '';
      const overdueClass = status === 'Overdue' && !task.done ? 'overdue' : '';
      const tags = (task.tags || []).join(', ');
      return `
        <tr class="${doneClass} ${overdueClass}" draggable="true" data-id="${task.id}" style="--row-delay:${index * 40}ms">
          <td>
            <input class="check-box" type="checkbox" data-action="toggle-done" data-id="${task.id}" ${task.done ? 'checked' : ''} />
          </td>
          <td>
            <div class="task-title">${escapeHtml(task.title)}</div>
            <div class="task-notes">${escapeHtml(task.notes || 'No notes')}</div>
            ${task.category ? `<div class="badge">${escapeHtml(task.category)}</div>` : ''}
            ${tags ? `<div class="badge">${escapeHtml(tags)}</div>` : ''}
          </td>
          <td>${escapeHtml(formatDate(task.date))}</td>
          <td>${task.category ? escapeHtml(task.category) : 'General'}</td>
          <td>
            <div class="badge">${escapeHtml(status)}</div>
            ${task.urgent ? '<span class="badge urgent">Urgent</span>' : ''}
            ${task.done ? '<span class="badge done">Done</span>' : ''}
          </td>
          <td>
            <div class="task-actions">
              <button class="icon-btn" data-action="edit" data-id="${task.id}">✎</button>
              <button class="icon-btn" data-action="toggle-urgent" data-id="${task.id}">${task.urgent ? '★' : '☆'}</button>
              <button class="icon-btn" data-action="delete" data-id="${task.id}">✕</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join('');

  window.requestAnimationFrame(revealRows);
}

function renderCalendar() {
  const year = calendarDisplayDate.getFullYear();
  const month = calendarDisplayDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = firstDay.getDay();
  const monthLabel = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const selectedDateValue = formatDateValue(selectedCalendarDate);

  calendarMonthLabel.textContent = monthLabel;

  const cells = [];
  for (let i = 0; i < startDay; i += 1) {
    cells.push('<div class="calendar-day empty"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayValue = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayTasks = tasks.filter((task) => task.date === dayValue);
    const count = dayTasks.length;
    const completedCount = dayTasks.filter((task) => task.done).length;
    const isToday = dayValue === todayString();
    const isSelected = dayValue === selectedDateValue;
    cells.push(`
      <button type="button" class="calendar-day ${isToday ? 'active' : ''} ${isSelected ? 'selected' : ''}" data-date="${dayValue}">
        <div class="day-label">${day}</div>
        <div class="day-count">${count} plan${count === 1 ? '' : 's'}</div>
        <div class="day-meta">${completedCount}/${count} done</div>
      </button>
    `);
  }

  calendarGrid.innerHTML = cells.join('');
  renderCalendarDetail();
}

function renderCalendarDetail() {
  const selectedDateValue = formatDateValue(selectedCalendarDate);
  const selectedTasks = tasks.filter((task) => task.date === selectedDateValue);
  const completedCount = selectedTasks.filter((task) => task.done).length;
  const selectedLabel = new Date(`${selectedDateValue}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  if (!selectedTasks.length) {
    calendarDetail.innerHTML = `
      <div class="calendar-detail-header">
        <div>
          <h4>${selectedLabel}</h4>
          <p>No plans scheduled for this day.</p>
        </div>
        <span class="calendar-pill">0 plans</span>
      </div>
    `;
    return;
  }

  calendarDetail.innerHTML = `
    <div class="calendar-detail-header">
      <div>
        <h4>${selectedLabel}</h4>
        <p>${completedCount} of ${selectedTasks.length} tasks completed.</p>
      </div>
      <span class="calendar-pill">${completedCount}/${selectedTasks.length} done</span>
    </div>
    <ul class="calendar-task-list">
      ${selectedTasks
        .map((task) => `
          <li class="calendar-task-item ${task.done ? 'done' : ''}">
            <div class="calendar-task-top">
              <strong>${escapeHtml(task.title)}</strong>
              <span class="badge ${task.urgent ? 'urgent' : ''} ${task.done ? 'done' : ''}">${task.done ? 'Done' : task.urgent ? 'Urgent' : 'Planned'}</span>
            </div>
            <div class="calendar-task-meta">${escapeHtml(task.category || 'General')} · ${escapeHtml(task.notes || 'No notes')}</div>
          </li>
        `)
        .join('')}
    </ul>
  `;
}

function renderBoard() {
  const buckets = ['Today', 'Upcoming', 'Anytime', 'Someday'];
  const bucketTasks = buckets.map((bucket) => ({
    bucket,
    tasks: tasks.filter((task) => task.bucket === bucket && !task.done)
  }));

  boardColumns.innerHTML = bucketTasks
    .map(({ bucket, tasks: bucketTasksList }) => `
      <div class="board-column">
        <div class="board-column-header">${escapeHtml(bucket)}</div>
        <div class="board-column-body">
          ${bucketTasksList.length ? bucketTasksList.map((task) => `
            <div class="board-card">
              <div class="board-card-top">
                <strong>${escapeHtml(task.title)}</strong>
                <span class="badge ${task.urgent ? 'urgent' : ''}">${escapeHtml(task.priority || 'Medium')}</span>
              </div>
              <div class="board-card-meta">${escapeHtml(task.category || 'General')} · ${escapeHtml(formatDate(task.date))}</div>
            </div>
          `).join('') : '<div class="board-card empty">Nothing here.</div>'}
        </div>
      </div>
    `)
    .join('');
}

function setView(viewName) {
  currentView = viewName;
  viewButtons.forEach((button) => {
    const isActive = button.dataset.view === viewName;
    button.classList.toggle('active', isActive);
  });
  viewSurfaces.forEach((surface) => {
    const surfaceKey = surface.id.replace('-view', '');
    surface.classList.toggle('active', surfaceKey === viewName);
  });
}

function changeCalendarMonth(step) {
  calendarDisplayDate = new Date(calendarDisplayDate.getFullYear(), calendarDisplayDate.getMonth() + step, 1);
  if (selectedCalendarDate.getMonth() !== calendarDisplayDate.getMonth() || selectedCalendarDate.getFullYear() !== calendarDisplayDate.getFullYear()) {
    selectedCalendarDate = new Date(calendarDisplayDate.getFullYear(), calendarDisplayDate.getMonth(), 1);
  }
  renderCalendar();
}

function changeCalendarYear(step) {
  calendarDisplayDate = new Date(calendarDisplayDate.getFullYear() + step, calendarDisplayDate.getMonth(), 1);
  if (selectedCalendarDate.getFullYear() !== calendarDisplayDate.getFullYear() || selectedCalendarDate.getMonth() !== calendarDisplayDate.getMonth()) {
    selectedCalendarDate = new Date(calendarDisplayDate.getFullYear(), calendarDisplayDate.getMonth(), 1);
  }
  renderCalendar();
}

function selectCalendarDate(dateValue) {
  const [year, month, day] = dateValue.split('-').map(Number);
  selectedCalendarDate = new Date(year, month - 1, day);
  calendarDisplayDate = new Date(year, month - 1, 1);
  renderCalendar();
}

function reorderTasks(fromId, toId) {
  const fromIndex = tasks.findIndex((task) => task.id === fromId);
  const toIndex = tasks.findIndex((task) => task.id === toId);
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return;
  const [moved] = tasks.splice(fromIndex, 1);
  tasks.splice(toIndex, 0, moved);
  saveTasks('Tasks reordered.');
}

function renderAll() {
  renderTable();
  renderCalendar();
  renderBoard();
  calendarDisplayDate = new Date();
  selectedCalendarDate = new Date();
}

document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  setView('table');
  renderAll();

  taskTableBody.addEventListener('click', (event) => {
    if (event.target.closest('button')) {
      handleTaskActions(event);
      renderAll();
    }
  });
  taskTableBody.addEventListener('change', (event) => {
    if (event.target.classList.contains('check-box')) {
      handleTaskActions(event);
      renderAll();
    }
  });
  taskTableBody.addEventListener('dragstart', (event) => {
    const row = event.target.closest('tr');
    if (!row) return;
    draggedTaskId = row.dataset.id;
  });
  taskTableBody.addEventListener('dragover', (event) => {
    event.preventDefault();
  });
  taskTableBody.addEventListener('drop', (event) => {
    event.preventDefault();
    const row = event.target.closest('tr');
    if (!row || !draggedTaskId) return;
    reorderTasks(draggedTaskId, row.dataset.id);
    draggedTaskId = null;
  });

  calendarGrid.addEventListener('click', (event) => {
    const dayButton = event.target.closest('button[data-date]');
    if (dayButton) {
      selectCalendarDate(dayButton.dataset.date);
    }
  });
  document.querySelectorAll('[data-calendar-nav]').forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.calendarNav === 'prev-month') changeCalendarMonth(-1);
      if (button.dataset.calendarNav === 'next-month') changeCalendarMonth(1);
      if (button.dataset.calendarNav === 'prev-year') changeCalendarYear(-1);
      if (button.dataset.calendarNav === 'next-year') changeCalendarYear(1);
    });
  });
  calendarTodayButton.addEventListener('click', () => {
    calendarDisplayDate = new Date();
    selectedCalendarDate = new Date();
    renderCalendar();
  });

  viewButtons.forEach((button) => button.addEventListener('click', () => setView(button.dataset.view)));

  searchInput.addEventListener('input', renderTable);
  filterSelect.addEventListener('change', renderTable);
  sortSelect.addEventListener('change', renderTable);
});