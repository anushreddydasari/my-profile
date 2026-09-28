const STORAGE_KEY = 'todo-tasks-v1';
let tasks = [], filter = 'all';

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch (_) { tasks = []; }
}
function render() {
  const ul = document.getElementById('todo-list');
  ul.innerHTML = '';
  let filtered = tasks.filter(t => filter === 'all' || (filter === 'active' ? !t.done : t.done));
  filtered.forEach((t, i) => {
    let li = document.createElement('li');
    li.className = 'todo-item' + (t.done ? ' done' : '');
    let cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = !!t.done;
    cb.addEventListener('change', () => { t.done = !t.done; saveTasks(); render(); });
    let lbl = document.createElement('label');
    lbl.textContent = t.text;
    let del = document.createElement('button');
    del.textContent = '✕'; del.className = 'delete-btn';
    del.addEventListener('click', () => { tasks.splice(tasks.indexOf(t),1); saveTasks(); render(); });
    li.append(cb, lbl, del);
    ul.appendChild(li);
  });
  document.getElementById('remaining').textContent =
    (tasks.filter(t => !t.done).length) + ' task'+(tasks.filter(t => !t.done).length === 1 ? '' : 's')+' left';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
}
document.getElementById('todo-form').onsubmit = e => {
  e.preventDefault();
  let input = document.getElementById('todo-input');
  let value = input.value.trim();
  if (!value) return;
  tasks.push({text:value,done:false});
  saveTasks();
  input.value = '';
  render();
};
document.querySelectorAll('.filter-btn').forEach(b =>
  b.onclick = () => { filter = b.dataset.filter; render(); });
loadTasks();
render();
