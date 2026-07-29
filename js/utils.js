const statusMessage = document.getElementById('status-message');

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function parseQuickDate(input) {
  const value = (input || '').trim().toLowerCase();
  if (!value) return null;
  const today = new Date();
  if (value === 'tomorrow') {
    today.setDate(today.getDate() + 1);
    return formatDateValue(today);
  }
  if (value === 'next week') {
    today.setDate(today.getDate() + 7);
    return formatDateValue(today);
  }
  if (value === 'today') return todayString();
  if (value === 'monday') {
    const day = today.getDay();
    const diff = day === 1 ? 0 : (8 - day) % 7 || 7;
    today.setDate(today.getDate() + diff);
    return formatDateValue(today);
  }
  return null;
}

function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDate(dateString) {
  if (!dateString) return 'No date';
  const date = new Date(`${dateString}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function getDueStatus(task) {
  if (task.done) return 'Completed';
  if (!task.date) return 'No date';
  const today = todayString();
  const taskDate = task.date;
  if (taskDate < today) return 'Overdue';
  if (taskDate === today) return 'Due today';
  return 'Upcoming';
}

function setStatus(message, isError = false) {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? 'var(--error)' : 'var(--primary)';
  statusMessage.classList.remove('hidden');
  clearTimeout(statusMessage._hideTimer);
  statusMessage._hideTimer = setTimeout(() => {
    statusMessage.classList.add('hidden');
  }, 4000);
}

function animateNumericValue(element, toValue, { duration = 900, suffix = '' } = {}) {
  const currentText = element.textContent.replace(/[^0-9.-]/g, '');
  const fromValue = Number.parseFloat(currentText || element.dataset.value || '0');
  const safeFrom = Number.isFinite(fromValue) ? fromValue : 0;
  const safeTo = Number(toValue);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion || safeFrom === safeTo) {
    element.textContent = `${safeTo}${suffix}`;
    element.dataset.value = String(safeTo);
    return;
  }

  const startTime = performance.now();
  const tick = (time) => {
    const progress = Math.min((time - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = safeFrom + (safeTo - safeFrom) * eased;
    element.textContent = `${Math.round(current)}${suffix}`;
    if (progress < 1) {
      window.requestAnimationFrame(tick);
    } else {
      element.textContent = `${Math.round(safeTo)}${suffix}`;
      element.dataset.value = String(safeTo);
    }
  };
  window.requestAnimationFrame(tick);
}