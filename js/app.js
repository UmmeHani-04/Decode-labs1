(() => {
  'use strict';
  const KEY = 'hearth-tasks-v1';
  // ---- State ----
  const state = { tasks: load(), filter: 'all' };

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state.tasks)); } catch { /* storage unavailable */ }
  }

  // ---- Elements ----
  const $ = (s) => document.querySelector(s);
  const form = $('#task-form'), input = $('#task-input'), errorEl = $('#form-error');
  const list = $('#task-list'), empty = $('#empty-state');

  // ---- Mobile nav ----
  const toggle = $('.nav-toggle'), nav = $('#site-nav');
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(open));
  });
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) { nav.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }
  });

  // ---- Actions ----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return showError('Enter a task before adding it.');
    if (text.length > 80) return showError('Keep tasks under 80 characters.');
    showError('');
    state.tasks.unshift({ id: Date.now(), text, done: false });
    input.value = ''; input.focus();
    update();
  });

  list.addEventListener('change', (e) => {
    const li = e.target.closest('li'); if (!li) return;
    const t = state.tasks.find((x) => x.id === Number(li.dataset.id));
    if (t) { t.done = e.target.checked; update(); }
  });
  list.addEventListener('click', (e) => {
    const btn = e.target.closest('button'); if (!btn) return;
    state.tasks = state.tasks.filter((x) => x.id !== Number(btn.closest('li').dataset.id));
    update();
  });

  document.querySelectorAll('.chip').forEach((chip) =>
    chip.addEventListener('click', () => {
      state.filter = chip.dataset.filter;
      document.querySelectorAll('.chip').forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on); c.setAttribute('aria-pressed', String(on));
      });
      render();
    })
  );
  $('#clear-done').addEventListener('click', () => { state.tasks = state.tasks.filter((t) => !t.done); update(); });

  function showError(msg) { errorEl.textContent = msg; errorEl.hidden = !msg; }

  // ---- Render ----
  function render() {
    const visible = state.tasks.filter((t) =>
      state.filter === 'all' ? true : state.filter === 'done' ? t.done : !t.done);
    list.innerHTML = '';
    visible.forEach((t) => {
      const li = document.createElement('li');
      li.className = 'task' + (t.done ? ' is-done' : '');
      li.dataset.id = t.id;
      const cb = document.createElement('input');
      cb.type = 'checkbox'; cb.id = 't' + t.id; cb.checked = t.done;
      const label = document.createElement('label');
      label.htmlFor = cb.id; label.textContent = t.text;           // textContent: no HTML injection
      const del = document.createElement('button');
      del.type = 'button'; del.textContent = 'Delete'; del.setAttribute('aria-label', 'Delete task: ' + t.text);
      li.append(cb, label, del); list.append(li);
    });
    empty.hidden = visible.length > 0;
    const done = state.tasks.filter((t) => t.done).length;
    $('#stat-total').textContent = state.tasks.length;
    $('#stat-done').textContent = done;
    $('#stat-active').textContent = state.tasks.length - done;
  }
  function update() { save(); render(); }
  render();
})();
