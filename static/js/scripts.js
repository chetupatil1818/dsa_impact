document.addEventListener('DOMContentLoaded', function() {
    loadTasks();
    document.getElementById('search').addEventListener('input', filterTasks);
    document.getElementById('add-task-form').addEventListener('submit', addTask);
});

function loadTasks() {
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            displayTasks(tasks);
            displayTodayTasks(tasks);
        });
}

function displayTasks(tasks) {
    const taskList = document.getElementById('task-list');
    const completedTaskList = document.getElementById('completed-task-list');
    taskList.innerHTML = '';
    completedTaskList.innerHTML = '';

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.title;
        li.addEventListener('click', () => showTaskDetails(task.id));

        if (task.done) {
            completedTaskList.appendChild(li);
        } else {
            taskList.appendChild(li);
        }
    });
}

function displayTodayTasks(tasks) {
    const todayTasks = document.getElementById('today-tasks');
    todayTasks.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    tasks.filter(task => task.date === today).forEach(task => {
        const li = document.createElement('li');
        li.textContent = task.title;
        li.className = task.done ? 'completed-task' : '';
        li.addEventListener('click', () => showTaskDetails(task.id));
        todayTasks.appendChild(li);
    });
}

function showTaskDetails(taskId) {
    fetch(`/task/${taskId}`)
        .then(response => response.json())
        .then(task => {
            const taskDetails = document.getElementById('task-details');
            taskDetails.innerHTML = `
                <h3>${task.title}</h3>
                <p>${task.description}</p>
                <p><strong>Date:</strong> ${task.date}</p>
                <button onclick="deleteTask(${task.id})">Delete</button>
                <button onclick="markAsDone(${task.id})">${task.done ? 'Mark as incomplete' : 'Mark as done'}</button>
            `;
        });
}

function addTask(event) {
    event.preventDefault();
    const title = document.getElementById('new-task-title').value;
    const description = document.getElementById('new-task-description').value;
    const date = document.getElementById('new-task-date').value;

    fetch('/task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, description, date, done: false }),
    })
    .then(response => response.json())
    .then(task => {
        loadTasks();
        document.getElementById('add-task-form').reset();
    });
}

function deleteTask(taskId) {
    fetch(`/task/${taskId}`, {
        method: 'DELETE',
    })
    .then(() => {
        loadTasks();
        document.getElementById('task-details').innerHTML = '';
    });
}

function markAsDone(taskId) {
    fetch(`/task/${taskId}`)
        .then(response => response.json())
        .then(task => {
            task.done = !task.done;
            return fetch(`/task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });
        })
        .then(response => response.json())
        .then(() => {
            loadTasks();
            showTaskDetails(taskId);
        });
}

function filterTasks() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    fetch('/tasks')
        .then(response => response.json())
        .then(tasks => {
            const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(searchTerm));
            displayTasks(filteredTasks);
        });
}

function toggleCompletedTasks() {
    const completedTaskList = document.getElementById('completed-task-list');
    completedTaskList.style.display = completedTaskList.style.display === 'none' ? 'block' : 'none';
}
