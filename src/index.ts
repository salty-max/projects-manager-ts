// Validation
interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

function validate(v: Validatable) {
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

  private clearInputs() {
    this.titleInputElement.value = '';
    this.descriptionInputElement.value = '';
    this.peopleInputElement.value = '';
  }

  @Autobind
  private handleSubmit(e: Event) {
    e.preventDefault();
    const values = this.gatherUserInput();
    if (Array.isArray(values)) {
      const [title, description, people] = values;
      console.log(title, description, people);
      this.clearInputs();
    }
  }

  private configure() {
    this.formElement.addEventListener('submit', this.handleSubmit);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
  }
}

const projectInput = new ProjectInput();
