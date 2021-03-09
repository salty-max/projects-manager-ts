// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(v: Validatable): boolean {
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
function Autobind(_: any, __: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const method = descriptor.value;
  return {
    configurable: true,
    get() {
      return method.bind(this);
    },
  };
}

class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;

  constructor(private type: 'active' | 'done') {
    this.templateElement = document.getElementById('project-list')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    this.attach();
    this.renderContent();
  }

  private renderContent(): void {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private attach(): void {
    this.hostElement.insertAdjacentElement('beforeend', this.element);
  }
}

class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  formElement: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
    this.hostElement = document.getElementById('app')! as HTMLDivElement;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.formElement = importedNode.firstElementChild as HTMLFormElement;
    this.formElement.id = 'user-input';

    this.titleInputElement = this.formElement.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.formElement.querySelector(
      '#description',
    )! as HTMLInputElement;
    this.peopleInputElement = this.formElement.querySelector('#people')! as HTMLInputElement;

    this.configure();
    this.attach();
  }

  private gatherUserInput(): [string, string, number] | void {
    const title = this.titleInputElement.value;
    const description = this.descriptionInputElement.value;
    const people = +this.peopleInputElement.value;

    if (
      !validate({ value: title, required: true }) ||
      !validate({ value: description, required: true, minLength: 5 }) ||
      !validate({ value: people, required: true, min: 1, max: 5 })
    ) {
      alert('Invalid input, please try again!');
      return;
    } else {
      return [title, description, people];
    }
  }

  private clearInputs(): void {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @Autobind
  private handleSubmit(e: Event): void {
    e.preventDefault();
    const values = this.gatherUserInput();
    if (Array.isArray(values)) {
      const [title, description, people] = values;
      console.log(title, description, people);
      this.clearInputs();
    }
  }

  private configure(): void {
    this.formElement.addEventListener('submit', this.handleSubmit);
  }

  private attach(): void {
    this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
  }
}

const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const doneProjects = new ProjectList('done');
