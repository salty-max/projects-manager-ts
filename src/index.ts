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

  @Autobind
  private handleSubmit(e: Event) {
    e.preventDefault();

    // const { value: title } = this.titleInputElement;
    // const { value: description } = this.descriptionInputElement;
    // const { value: people } = this.peopleInputElement;
  }

  private configure() {
    this.formElement.addEventListener('submit', this.handleSubmit);
  }

  private attach() {
    this.hostElement.insertAdjacentElement('afterbegin', this.formElement);
  }
}

const projectInput = new ProjectInput();
