function Logger(logString: string) {
  return function (constructor: Function) {
    console.log(logString);
    console.log(constructor);
  };
}

function WithTemplate(template: string, hookId: string) {
  return function <T extends { new (...args: any[]): { name: string } }>(target: T) {
    console.log('Rendering template...');

    return class extends target {
      constructor(..._: any[]) {
        super();
        const element = document.getElementById(hookId);
        if (element) {
          element.innerHTML = template;
          const name = document.createElement('p');
          name.innerHTML = this.name;
          element.appendChild(name);
        }
      }
    };
  };
}

@Logger('LOGGING - PERSON')
@WithTemplate('<p>Hello World</p>', 'app')
class Person {
  name = 'Max';

  constructor() {
    console.log('Creating new person...');
  }

  present() {
    console.log(`Hello, my name is ${this.name}.`);
  }
}

const p1 = new Person();
console.log(p1);

function LogProperty(target: any, property: string) {
  console.log('Property decorator');
  console.log(target, property);
}

function LogAccessor(target: any, name: string, descriptor: PropertyDescriptor) {
  console.log('Accessor decorator');
  console.log(target, name, descriptor);
}

function LogMethod(target: any, name: string | Symbol, descriptor: PropertyDescriptor) {
  console.log('Method decorator');
  console.log(target, name, descriptor);
}

function LogParameter(target: any, name: string | Symbol, position: number) {
  console.log('Parameter decorator');
  console.log(target, name, position);
}

class Product {
  @LogProperty
  private _title: string;
  private _price: number;

  constructor(title: string, price: number) {
    this._title = title;
    this._price = price;
  }

  @LogAccessor
  set title(val: string) {
    if (val) {
      this._title = val;
    }
  }

  set price(val: number) {
    if (val > 0) {
      this._price = val;
    } else {
      throw new Error('Invalid price - should be positive');
    }
  }

  get title() {
    return this._title;
  }

  get priceDT() {
    return this._price;
  }

  @LogMethod
  getPriceWithTax(@LogParameter vat: number) {
    return this._price * (1 + vat / 100);
  }
}

const product = new Product('Vans', 49);
console.log(product.getPriceWithTax(20));

function Autobind(_: any, __: string, descriptor: PropertyDescriptor): PropertyDescriptor {
  const method = descriptor.value;
  const newDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: true,
    get() {
      return method.bind(this);
    },
  };

  return newDescriptor;
}

class Printer {
  message = 'This works!';

  @Autobind
  showMessage() {
    console.log(this.message);
  }
}

const printer = new Printer();

const button = document.querySelector('button');
button?.addEventListener('click', printer.showMessage);

interface ValidatorConfig {
  [property: string]: {
    [validatableProp: string]: string[];
  };
}

const registeredValidators: ValidatorConfig = {};

function Required(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: [...registeredValidators[target.constructor.name][propName], 'required'],
  };
}

function PositiveNumber(target: any, propName: string) {
  registeredValidators[target.constructor.name] = {
    ...registeredValidators[target.constructor.name],
    [propName]: [...registeredValidators[target.constructor.name][propName], 'positive'],
  };
}

function validate(obj: any) {
  const objectValidatorConfig = registeredValidators[obj.constructor.name];

  if (!objectValidatorConfig) {
    return true;
  }

  let isValid = true;

  for (const prop in objectValidatorConfig) {
    for (const validator of objectValidatorConfig[prop]) {
      switch (validator) {
        case 'required':
          isValid = isValid && !!obj[prop];
          break;
        case 'positive':
          isValid = isValid && obj[prop] > 0;
          break;
      }
    }
  }

  return isValid;
}

class Course {
  @Required
  title: string;

  @PositiveNumber
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }
}

const courseForm = document.querySelector('form');

courseForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  const { value: title } = document.getElementById('title') as HTMLInputElement;
  const { value: price } = document.getElementById('price') as HTMLInputElement;

  const createdCourse = new Course(title, +price);
  if (!validate(createdCourse)) {
    throw new Error('Invalid input');
  } else {
    console.log(createdCourse);
  }
});
