"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
// Autobind decorator
function Autobind(_, __, descriptor) {
    const method = descriptor.value;
    return {
        configurable: true,
        get() {
            return method.bind(this);
        },
    };
}
class ProjectList {
    constructor(type) {
        this.type = type;
        this.templateElement = document.getElementById('project-list');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.element = importedNode.firstElementChild;
        this.element.id = `${this.type}-projects`;
        this.attach();
        this.renderContent();
    }
    renderContent() {
        const listId = `${this.type}-projects-list`;
        this.element.querySelector('ul').id = listId;
        this.element.querySelector('h2').textContent = `${this.type.toUpperCase()} PROJECTS`;
    }
    attach() {
        this.hostElement.insertAdjacentElement('beforeend', this.element);
    }
}
class ProjectInput {
    constructor() {
        this.templateElement = document.getElementById('project-input');
        this.hostElement = document.getElementById('app');
        const importedNode = document.importNode(this.templateElement.content, true);
        this.formElement = importedNode.firstElementChild;
        this.formElement.id = 'user-input';
        this.titleInputElement = this.formElement.querySelector('#title');
        this.descriptionInputElement = this.formElement.querySelector('#description');
        this.peopleInputElement = this.formElement.querySelector('#people');
        this.configure();
        this.attach();
    }
    gatherUserInput() {
        const title = this.titleInputElement.value;
        const description = this.descriptionInputElement.value;
        const people = +this.peopleInputElement.value;
        if (!validate({ value: title, required: true }) ||
            !validate({ value: description, required: true, minLength: 5 }) ||
            !validate({ value: people, required: true, min: 1, max: 5 })) {
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
            console.log(title, description, people);
            this.clearInputs();
        }
    }
    configure() {
        this.formElement.addEventListener('submit', this.handleSubmit);
    }
    attach() {
        this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
    }
}
__decorate([
    Autobind
], ProjectInput.prototype, "handleSubmit", null);
const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const doneProjects = new ProjectList('done');
//# sourceMappingURL=index.js.map