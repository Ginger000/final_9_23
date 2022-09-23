const deleteIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`;

const editIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`;

const URL = 'http://localhost:3000/todos';
const getTodoItemEndPoint = (id) => `http://localhost:3000/todos/${id}`;

const listContainer = document.querySelector('.list__container');

const inputForm = document.querySelector('.input');
const inputContent = document.querySelector('.input__content');
const editingContent = document.querySelector('.todo_editing');
const isEditing = false;

//state class for todos
class State {
    constructor() {
        this._tods = [];
    }

    get todos() {
        return this._todos;
    }

    set todos(todos) {
        this._todos = todos;
    }
}

const state = new State();

//as the app is initiated
(() => {
    setUpTodoList();
    setUpPostEvent();
})();

// fetch and render the whole todo list
function setUpTodoList() {
    fetch(URL)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
            state.todos = data;
            renderList(state.todos);
        });
}

//render each todo item in one todo list
function renderList(todos) {
    const sortedTodos = todos.sort((a, b) => b.date - a.date);
    const todosInnerHTML = sortedTodos
        .map((todo) => {
            return `
        <div class="todo__item">
          <div class="todo__content" id="${todo.id}">${todo.title}</div>
          <div>
            <span class="todo__icon todo__icon--edit" id="edit-${todo.id}" onclick="startEdit(${todo.id})">${editIcon}</span>
            <span class="todo__icon todo__icon--delete" onclick="handleDelete(${todo.id})">${deleteIcon}</span>
          </div>
          
        </div>`;
        })
        .join();
    listContainer.innerHTML = todosInnerHTML;
}

function setUpPostEvent() {
    inputForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const content = inputContent.value;
        //input validation
        if (content.trim().length !== 0) {
            // const newId =
            const newTodoItem = {
                id: Math.random(),
                title: content,
                completed: false,
                date: Date.now(),
            };

            fetch(URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTodoItem),
            })
                .then((response) => response.json())
                .then((data) => console.log('suscessful post', data))
                .catch((err) => alert(err));
        }
    });
}

function handleDelete(id) {
    const targetURL = getTodoItemEndPoint(id);
    fetch(targetURL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
    })
        .then((response) => response.json())
        .then((data) => console.log('suscessful delete', data))
        .catch((err) => alert(err));
}

function updateEdit(id) {
    const targetURL = getTodoItemEndPoint(id);

    const oldTodo = state.todos((todo) => (todo.id = id))[0];
    const updTodo = { ...oldTodo, title: editingContent };
    fetch(targetURL, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(updTodo),
    })
        .then((response) => response.json())
        .then((data) => {
            state.todos = state.todos.map((todo) =>
                todo.id === id ? data : todo
            );
            isEditing = false;
        })
        .catch((err) => console.log(err));
}

function startEdit(id) {
    const currTodoItem = document.querySelector(`#${id}`);
    currTodoItem.innerHTML = `<input class=todo_editing type="text">`;
    isEditing = true;
    const currEditButton = document.querySelector(`edit-#${id}`);
}
