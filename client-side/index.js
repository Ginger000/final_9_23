const deleteIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="DeleteIcon" aria-label="fontSize small"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path></svg>`;

const editIcon = `<svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" data-testid="EditIcon" aria-label="fontSize small"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path></svg>`;

const URL = 'http://localhost:3000/todos';
const getTodoItemEndPoint = (id) => `http://localhost:3000/todos/${id}`;

const listContainer = document.querySelector('.list__container');

const inputForm = document.querySelector('.input');
const inputContent = document.querySelector('.input__content');

let isEditing = false;

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
//my question: Is this the same function as useEffect?
//it call the function everytime the page is refreshed?
//That's the reason I don't call render function again after CRUD?
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
    let todosInnerHTML;
    if (todos.length === 0) {
        todosInnerHTML = `<div class="todo__placeholder"> No Task Yet</div>`;
    } else {
        const sortedTodos = todos.sort((a, b) => b.date - a.date);
        todosInnerHTML = sortedTodos
            .map((todo) => {
                return `
        <div class="todo__item">
          <div class="todo__content" id="title-${todo.id}" onclick="crossTodo(${todo.id})">${todo.title}</div>
          <div>
            <span class="todo__icon todo__icon--edit"" onclick="startEdit(${todo.id})">${editIcon}</span>
            <span class="todo__icon todo__icon--delete" onclick="handleDelete(${todo.id})">${deleteIcon}</span>
          </div>
          
        </div>`;
            })
            .join('');
    }

    listContainer.innerHTML = todosInnerHTML;
}

//submit newTodo and post to the server
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

//Delete the todo item from server
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

//updated the edited todo item to the server
function updateEdit(id) {
    const targetURL = getTodoItemEndPoint(id);
    const editingContent = document.querySelector('.todo__editing');
    console.log('editingContent', editingContent.value);
    const oldTodo = state.todos.filter((todo) => (todo.id = id))[0];
    const updTodo = { ...oldTodo, title: editingContent.value };
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
            switchInterfaceToList(data);
        })
        .catch((err) => console.log(err));
}

//switch to the input form when click the edit button
function switchInterfaceToEdit(id) {
    const currTodoItem = document.getElementById(`title-${id}`);
    currTodoItem.innerHTML = `<input class="todo__editing" type="text">`;
}

//switch back to normal todo item after clicking edit button
//when the edit is finished
function switchInterfaceToList(todo) {
    const currTodoItem = document.getElementById(`title-${id}`);
    currTodoItem.innerHTML = `${todo.title}`;
}

//trigger todo item switch to edit mode
//or trigger the http put behavior
//depends on the global boolean value 'isEditing' regarding
//whether user is editing
function startEdit(id) {
    if (isEditing === true) {
        updateEdit(id);
    } else {
        swtichInterfaceToEdit(id);
    }

    isEditing = !isEditing;
}

// cross out when click the todo item
function crossTodo(id) {
    const currTodoItem = document.getElementById(`title-${id}`);
    currTodoItem.classList.add('todo__content--cross');
}
