// Drag & drop
interface Draggable {
  dragStartHandler(event: DragEvent): void;
  dragEndHandler(event: DragEvent): void;
}

interface DragTarget {
  dragOverHandler(event: DragEvent): void;
  dropHandler(event: DragEvent): void;
  dragLeaveHandler(event: DragEvent): void;
}

// Project type
enum ProjectStatus {
  Active,
  Done,
}
class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus,
  ) {}
}

// State management
type Listener<T> = (items: T[]) => void;

abstract class State<T> {
  protected listeners: Listener<T>[] = [];

  addListener(listener: Listener<T>) {
    this.listeners.push(listener);
  }
}
class ProjectState extends State<Project> {
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {
    super();
  }

  static getInstance() {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  }

  addProject(title: string, description: string, people: number) {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      people,
      ProjectStatus.Active,
    );

    this.projects.push(newProject);
    this.updateListeners();
  }

  moveProject(id: string, newStatus: ProjectStatus) {
    const project = this.projects.find((item) => item.id === id);

    if (project && project.status !== newStatus) {
      project.status = newStatus;
      this.updateListeners();
    }
  }

  private updateListeners() {
    for (const listener of this.listeners) {
      listener(this.projects.slice()); // pass a copy of projects array
    }
  }
}

const projectState = ProjectState.getInstance(); // State singleton

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

abstract class Component<T extends HTMLElement, U extends HTMLElement> {
  templateElement: HTMLTemplateElement;
  hostElement: T;
  element: U;

  constructor(
    templateId: string,
    hostElementId: string,
    insertAtStart: boolean,
    newElementId?: string,
  ) {
    this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
    this.hostElement = document.getElementById(hostElementId)! as T;

    const importedNode = document.importNode(this.templateElement.content, true);

    this.element = importedNode.firstElementChild as U;
    if (newElementId) {
      this.element.id = newElementId;
    }

    this.attach(insertAtStart);
  }

  private attach(insertAtStart: boolean): void {
    this.hostElement.insertAdjacentElement(
      insertAtStart ? 'afterbegin' : 'beforeend',
      this.element,
    );
  }

  abstract configure(): void;
  abstract renderContent?(): void;
}

class ProjectItem extends Component<HTMLUListElement, HTMLLIElement> implements Draggable {
  private project: Project;

  get persons() {
    return this.project.people === 1 ? '1 person' : `${this.project.people} persons`;
  }

  constructor(parentId: string, project: Project) {
    super('single-project', parentId, false, project.id);
    this.project = project;

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragStartHandler(event: DragEvent) {
    event.dataTransfer!.setData('text/plain', this.project.id);
    event.dataTransfer!.effectAllowed = 'move';
  }

  @Autobind
  dragEndHandler(_: DragEvent) {
    console.log('Drag end');
  }

  configure(): void {
    this.element.addEventListener('dragstart', this.dragStartHandler);
    this.element.addEventListener('dragend', this.dragEndHandler);
  }

  renderContent(): void {
    this.element.querySelector('h3')!.textContent = this.project.title;
    this.element.querySelector('h4')!.textContent = `${this.persons} assigned`;
    this.element.querySelector('p')!.textContent = this.project.description;
  }
}

class ProjectList extends Component<HTMLDivElement, HTMLElement> implements DragTarget {
  assignedProjects: Project[];

  constructor(private type: 'active' | 'done') {
    super('project-list', 'app', false, `${type}-projects`);
    this.assignedProjects = [];

    this.configure();
    this.renderContent();
  }

  @Autobind
  dragOverHandler(event: DragEvent) {
    if (event.dataTransfer && event.dataTransfer.types[0] === 'text/plain') {
      event.preventDefault();
      const listEl = this.element.querySelector('ul')! as HTMLUListElement;
      listEl.classList.add('droppable');
    }
  }

  @Autobind
  dropHandler(event: DragEvent) {
    const projectId = event.dataTransfer!.getData('text/plain');
    projectState.moveProject(
      projectId,
      this.type === 'active' ? ProjectStatus.Active : ProjectStatus.Done,
    );
    const listEl = this.element.querySelector('ul')! as HTMLUListElement;
    listEl.classList.remove('droppable');
  }

  @Autobind
  dragLeaveHandler(_: DragEvent) {
    const listEl = this.element.querySelector('ul')! as HTMLUListElement;
    listEl.classList.remove('droppable');
  }

  configure() {
    this.element.addEventListener('dragover', this.dragOverHandler);
    this.element.addEventListener('dragleave', this.dragLeaveHandler);
    this.element.addEventListener('drop', this.dropHandler);

    projectState.addListener((projects: Project[]) => {
      const filteredProjects = projects.filter((project) => {
        if (this.type === 'active') {
          return project.status === ProjectStatus.Active;
        } else {
          return project.status === ProjectStatus.Done;
        }
      });

      this.assignedProjects = filteredProjects;
      this.renderProjects();
    });
  }

  renderContent(): void {
    const listId = `${this.type}-projects-list`;
    this.element.querySelector('ul')!.id = listId;
    this.element.querySelector('h2')!.textContent = `${this.type.toUpperCase()} PROJECTS`;
  }

  private renderProjects() {
    const list = document.getElementById(`${this.type}-projects-list`)! as HTMLUListElement;

    list.innerHTML = '';
    for (const project of this.assignedProjects) {
      new ProjectItem(list.id, project);
    }
  }
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement> {
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    super('project-input', 'app', true, 'user-input');

    this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
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

const projectInput = new ProjectInput();
const activeProjects = new ProjectList('active');
const doneProjects = new ProjectList('done');
