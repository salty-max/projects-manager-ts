"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var App;
(function (App) {
    let ProjectStatus;
    (function (ProjectStatus) {
        ProjectStatus[ProjectStatus["Active"] = 0] = "Active";
        ProjectStatus[ProjectStatus["Done"] = 1] = "Done";
    })(ProjectStatus = App.ProjectStatus || (App.ProjectStatus = {}));
    class Project {
        constructor(id, title, description, people, status) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.people = people;
            this.status = status;
        }
    }
    App.Project = Project;
})(App || (App = {}));
var App;
(function (App) {
    class State {
        constructor() {
            this.listeners = [];
        }
        addListener(listener) {
            this.listeners.push(listener);
        }
    }
    class ProjectState extends State {
        constructor() {
            super();
            this.projects = [];
        }
        static getInstance() {
            if (this.instance) {
                return this.instance;
            }
            this.instance = new ProjectState();
            return this.instance;
        }
        addProject(title, description, people) {
            const newProject = new App.Project(Math.random().toString(), title, description, people, App.ProjectStatus.Active);
            this.projects.push(newProject);
            this.updateListeners();
        }
        moveProject(id, newStatus) {
            const project = this.projects.find((item) => item.id === id);
            if (project && project.status !== newStatus) {
                project.status = newStatus;
                this.updateListeners();
            }
        }
        updateListeners() {
            for (const listener of this.listeners) {
                listener(this.projects.slice()); // pass a copy of projects array
            }
        }
    }
    App.ProjectState = ProjectState;
    App.projectState = ProjectState.getInstance(); // State singleton
})(App || (App = {}));
var App;
(function (App) {
    function validate(v) {
        let isValid = true;
        if (v.required) {
            isValid = isValid && v.value.toString().trim().length !== 0;
        }
        if (v.minLength != null && typeof v.value === 'string') {
            isValid = isValid && v.value.length >= v.minLength;
        }
        if (v.maxLength != null && typeof v.value === 'string') {
            isValid = isValid && v.value.length <= v.maxLength;
        }
        if (v.min != null && typeof v.value === 'number') {
            isValid = isValid && v.value >= v.min;
        }
        if (v.max != null && typeof v.value === 'number') {
            isValid = isValid && v.value <= v.max;
        }
        return isValid;
    }
    App.validate = validate;
})(App || (App = {}));
var App;
(function (App) {
    function Autobind(_, __, descriptor) {
        const method = descriptor.value;
        return {
            configurable: true,
            get() {
                return method.bind(this);
            },
        };
    }
    App.Autobind = Autobind;
})(App || (App = {}));
var App;
(function (App) {
    class Component {
        constructor(templateId, hostElementId, insertAtStart, newElementId) {
            this.templateElement = document.getElementById(templateId);
            this.hostElement = document.getElementById(hostElementId);
            const importedNode = document.importNode(this.templateElement.content, true);
            this.element = importedNode.firstElementChild;
            if (newElementId) {
                this.element.id = newElementId;
            }
            this.attach(insertAtStart);
        }
        attach(insertAtStart) {
            this.hostElement.insertAdjacentElement(insertAtStart ? 'afterbegin' : 'beforeend', this.element);
        }
    }
    App.Component = Component;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectItem extends App.Component {
        constructor(parentId, project) {
            super('single-project', parentId, false, project.id);
            this.project = project;
            this.configure();
            this.renderContent();
        }
        get persons() {
            return this.project.people === 1 ? '1 person' : `${this.project.people} persons`;
        }
        dragStartHandler(event) {
            event.dataTransfer.setData('text/plain', this.project.id);
            event.dataTransfer.effectAllowed = 'move';
        }
        dragEndHandler(_) {
            console.log('Drag end');
        }
        configure() {
            this.element.addEventListener('dragstart', this.dragStartHandler);
            this.element.addEventListener('dragend', this.dragEndHandler);
        }
        renderContent() {
            this.element.querySelector('h3').textContent = this.project.title;
            this.element.querySelector('h4').textContent = `${this.persons} assigned`;
            this.element.querySelector('p').textContent = this.project.description;
        }
    }
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragStartHandler", null);
    __decorate([
        App.Autobind
    ], ProjectItem.prototype, "dragEndHandler", null);
    App.ProjectItem = ProjectItem;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectList extends App.Component {
        constructor(type) {
            super('project-list', 'app', false, `${type}-projects`);
            this.type = type;
            this.assignedProjects = [];
            this.configure();
            this.renderContent();
        }
        dragOverHandler(event) {
            if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
                event.preventDefault();
                const listEl = this.element.querySelector('ul');
                listEl.classList.add('droppable');
            }
        }
        dropHandler(event) {
            const projectId = event.dataTransfer.getData('text/plain');
            App.projectState.moveProject(projectId, this.type === 'active' ? App.ProjectStatus.Active : App.ProjectStatus.Done);
            const listEl = this.element.querySelector('ul');
            listEl.classList.remove('droppable');
        }
        dragLeaveHandler(_) {
            const listEl = this.element.querySelector('ul');
            listEl.classList.remove('droppable');
        }
        configure() {
            this.element.addEventListener('dragover', this.dragOverHandler);
            this.element.addEventListener('dragleave', this.dragLeaveHandler);
            this.element.addEventListener('drop', this.dropHandler);
            App.projectState.addListener((projects) => {
                const filteredProjects = projects.filter((project) => {
                    if (this.type === 'active') {
                        return project.status === App.ProjectStatus.Active;
                    }
                    else {
                        return project.status === App.ProjectStatus.Done;
                    }
                });
                this.assignedProjects = filteredProjects;
                this.renderProjects();
            });
        }
        renderContent() {
            const listId = `${this.type}-projects-list`;
            this.element.querySelector('ul').id = listId;
            this.element.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
        }
        renderProjects() {
            const list = document.getElementById(`${this.type}-projects-list`);
            list.innerHTML = '';
            for (const project of this.assignedProjects) {
                new App.ProjectItem(list.id, project);
            }
        }
    }
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragOverHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dropHandler", null);
    __decorate([
        App.Autobind
    ], ProjectList.prototype, "dragLeaveHandler", null);
    App.ProjectList = ProjectList;
})(App || (App = {}));
var App;
(function (App) {
    class ProjectInput extends App.Component {
        constructor() {
            super('project-input', 'app', true, 'user-input');
            this.titleInputElement = this.element.querySelector('#title');
            this.descriptionInputElement = this.element.querySelector('#description');
            this.peopleInputElement = this.element.querySelector('#people');
            this.configure();
        }
        configure() {
            this.element.addEventListener('submit', this.handleSubmit);
        }
        renderContent() { }
        gatherUserInput() {
            const title = this.titleInputElement.value;
            const description = this.descriptionInputElement.value;
            const people = +this.peopleInputElement.value;
            if (!App.validate({ value: title, required: true }) ||
                !App.validate({ value: description, required: true, minLength: 5 }) ||
                !App.validate({ value: people, required: true, min: 1, max: 5 })) {
                alert('Invalid input, please try again!');
                return;
            }
            else {
                return [title, description, people];
            }
        }
        clearInputs() {
            this.titleInputElement.value = '';
            this.descriptionInputElement.value = '';
            this.peopleInputElement.value = '';
        }
        handleSubmit(e) {
            e.preventDefault();
            const values = this.gatherUserInput();
            if (Array.isArray(values)) {
                const [title, description, people] = values;
                App.projectState.addProject(title, description, people);
                this.clearInputs();
            }
        }
    }
    __decorate([
        App.Autobind
    ], ProjectInput.prototype, "handleSubmit", null);
    App.ProjectInput = ProjectInput;
})(App || (App = {}));
/// <reference path="models/drag-drop.ts" />
/// <reference path="models/project.ts" />
/// <reference path="state/project-state.ts" />
/// <reference path="utils/validation.ts" />
/// <reference path="decorators/autobind.ts" />
/// <reference path="components/component.ts" />
/// <reference path="components/project-item.ts" />
/// <reference path="components/project-list.ts" />
/// <reference path="components/project-input.ts" />
var App;
(function (App) {
    new App.ProjectInput();
    new App.ProjectList('active');
    new App.ProjectList('done');
})(App || (App = {}));
//# sourceMappingURL=bundle.js.map