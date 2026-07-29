const form = document.getElementById('planner-form');
const titleInput = document.getElementById('title');
const dateInput = document.getElementById('date');
const quickDateInput = document.getElementById('quick-date');
const categoryInput = document.getElementById('category');
const notesInput = document.getElementById('notes');
const urgentInput = document.getElementById('urgent');
const tagInput = document.getElementById('tags');
const subtaskInput = document.getElementById('subtasks');
const priorityInput = document.getElementById('priority');
const difficultyInput = document.getElementById('difficulty');
const repeatRuleInput = document.getElementById('repeat-rule');
const bucketInput = document.getElementById('bucket');
const submitButton = document.getElementById('submit-btn');
const cancelEditButton = document.getElementById('cancel-edit-btn');
const quickAddButtons = document.querySelectorAll('.quick-add-btn');

let currentEditingId = null;

function resetForm() {
  form.reset();
  dateInput.value = todayString();
  quickDateInput.value = '';
  categoryInput.value = 'General';
  priorityInput.value = 'Medium';
  difficultyInput.value = 'Medium';
  repeatRuleInput.value = 'none';
  bucketInput.value = 'Today';
  currentEditingId = null;
  submitButton.textContent = 'Add task';
  cancelEditButton.classList.add('hidden');
}

function populateForm(task) {
  titleInput.value = task.title || '';
  dateInput.value = task.date || todayString();
  quickDateInput.value = '';
  categoryInput.value = task.category || 'General';
  notesInput.value = task.notes || '';
  urgentInput.checked = Boolean(task.urgent);
  tagInput.value = (task.tags || []).join(', ');
  subtaskInput.value = (task.subtasks || []).join('\n');
  priorityInput.value = task.priority || 'Medium';
  difficultyInput.value = task.difficulty || 'Medium';
  repeatRuleInput.value = task.repeatRule || 'none';
  bucketInput.value = task.bucket || 'Today';
  currentEditingId = task.id;
  submitButton.textContent = 'Save changes';
  cancelEditButton.classList.remove('hidden');
}

function addTask(event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const parsedDate = parseQuickDate(quickDateInput.value) || dateInput.value || todayString();
  const notes = notesInput.value.trim();
  const urgent = urgentInput.checked;
  const category = categoryInput.value;
  const tags = tagInput.value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
  const subtasks = subtaskInput.value
    .split('\n')
    .map((subtask) => subtask.trim())
    .filter(Boolean);
  const priority = priorityInput.value;
  const difficulty = difficultyInput.value;
  const repeatRule = repeatRuleInput.value;
  const bucket = bucketInput.value;

  if (!title) {
    setStatus('Please add a task title first.', true);
    return;
  }

  const taskPayload = {
    id: currentEditingId || createId(),
    title,
    date: parsedDate,
    category,
    urgent,
    notes,
    tags,
    subtasks,
    priority,
    difficulty,
    repeatRule,
    bucket,
    done: false,
    createdAt: new Date().toISOString(),
    completedAt: '',
  };

  if (currentEditingId) {
    tasks = tasks.map((task) => (task.id === currentEditingId ? { ...task, ...taskPayload } : task));
    saveTasks('Task updated.');
  } else {
    tasks.unshift(taskPayload);
    saveTasks('Task added and saved locally.');
  }

  resetForm();
}

function handleQuickAdd(event) {
  const button = event.target.closest('button');
  if (!button) return;
  titleInput.value = button.dataset.title || '';
  categoryInput.value = button.dataset.category || 'General';
  urgentInput.checked = true;
  dateInput.value = todayString();
  navigate('#/add');
}

form.addEventListener('submit', addTask);
cancelEditButton.addEventListener('click', resetForm);
quickAddButtons.forEach((button) => button.addEventListener('click', handleQuickAdd));