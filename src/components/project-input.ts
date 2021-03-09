namespace App {
  export class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
    titleInputElement: HTMLInputElement;
    descriptionInputElement: HTMLInputElement;
    peopleInputElement: HTMLInputElement;

    constructor() {
      super('project-input', 'app', true, 'user-input');

      this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
      this.descriptionInputElement = this.element.querySelector(
        '#description',
      )! as HTMLInputElement;
      this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;

      this.configure();
    }

    configure(): void {
      this.element.addEventListener('submit', this.handleSubmit);
    }

    renderContent(): void {}

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
        projectState.addProject(title, description, people);
        this.clearInputs();
      }
    }
  }
}
