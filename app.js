'use strict';

const STORAGE_KEY = 'todo.tasks.v1';

const form = document.getElementById('task-form');
const input = document.getElementById('task-input');
const list = document.getElementById('task-list');
const counter = document.getElementById('counter');
const clearCompletedBtn = document.getElementById('clear-completed');

let tasks = loadTasks();

init();

function init() {
    form.addEventListener('submit', handleSubmit);
    clearCompletedBtn.addEventListener('click', handleClearCompleted);
    render();
}

function handleSubmit(event) {
    event.preventDefault();

    const text = input.value.trim();

    if (!text) {
        return;
    }

    tasks.push({
        id: createId(),
        text,
        completed: false,
        createdAt: Date.now(),
    });

    input.value = '';
    input.focus();

    saveTasks();
    render();
}

function handleClearCompleted() {
    tasks = tasks.filter((task) => !task.completed);

    saveTasks();
    render();
}

function loadTasks() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed.filter(isValidTask);
    } catch (error) {
        console.warn('Не удалось прочитать задачи из localStorage:', error);
        return [];
    }
}

function saveTasks() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (error) {
        console.error('Не удалось сохранить задачи:', error);
    }
}

function isValidTask(task) {
    return Boolean(
        task &&
        typeof task.id === 'string' &&
        typeof task.text === 'string' &&
        typeof task.completed === 'boolean'
    );
}

function createId() {
    if (window.crypto?.randomUUID) {
        return window.crypto.randomUUID();
    }

    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) {
        return;
    }

    task.completed = !task.completed;

    saveTasks();
    render();
}

function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);

    saveTasks();
    render();
}

function render() {
    list.innerHTML = '';

    if (tasks.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.className = 'empty-state';
        emptyItem.textContent = 'Пока нет задач. Добавьте первую!';
        list.appendChild(emptyItem);
    } else {
        const fragment = document.createDocumentFragment();

        tasks.forEach((task) => {
            fragment.appendChild(createTaskElement(task));
        });

        list.appendChild(fragment);
    }

    updateFooter();
}

function createTaskElement(task) {
    const item = document.createElement('li');
    item.className = `task${task.completed ? ' completed' : ''}`;
    item.dataset.id = task.id;

    const label = document.createElement('label');
    label.className = 'task-label';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.setAttribute('aria-label', `Отметить выполненной: ${task.text}`);
    checkbox.addEventListener('change', () => toggleTask(task.id));

    const text = document.createElement('span');
    text.className = 'task-text';
    text.textContent = task.text;

    label.append(checkbox, text);

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-delete';
    deleteButton.textContent = 'Удалить';
    deleteButton.setAttribute('aria-label', `Удалить задачу: ${task.text}`);
    deleteButton.addEventListener('click', () => deleteTask(task.id));

    item.append(label, deleteButton);

    return item;
}

function updateFooter() {
    const total = tasks.length;
    const active = tasks.filter((task) => !task.completed).length;
    const completed = total - active;

    if (total === 0) {
        counter.textContent = 'Нет задач';
    } else {
        counter.textContent = `Активных задач: ${active}`;
    }

    clearCompletedBtn.disabled = completed === 0;
}