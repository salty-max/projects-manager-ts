"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
function Logger(logString) {
    return function (constructor) {
        console.log(logString);
        console.log(constructor);
    };
}
function WithTemplate(template, hookId) {
    return function (target) {
        console.log('Rendering template...');
        return class extends target {
            constructor(..._) {
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
let Person = class Person {
    constructor() {
        this.name = 'Max';
        console.log('Creating new person...');
    }
    present() {
        console.log(`Hello, my name is ${this.name}.`);
    }
};
Person = __decorate([
    Logger('LOGGING - PERSON'),
    WithTemplate('<p>Hello World</p>', 'app')
], Person);
const p1 = new Person();
console.log(p1);
function LogProperty(target, property) {
    console.log('Property decorator');
    console.log(target, property);
}
function LogAccessor(target, name, descriptor) {
    console.log('Accessor decorator');
    console.log(target, name, descriptor);
}
function LogMethod(target, name, descriptor) {
    console.log('Method decorator');
    console.log(target, name, descriptor);
}
function LogParameter(target, name, position) {
    console.log('Parameter decorator');
    console.log(target, name, position);
}
class Product {
    constructor(title, price) {
        this._title = title;
        this._price = price;
    }
    set title(val) {
        if (val) {
            this._title = val;
        }
    }
    set price(val) {
        if (val > 0) {
            this._price = val;
        }
        else {
            throw new Error('Invalid price - should be positive');
        }
    }
    get title() {
        return this._title;
    }
    get priceDT() {
        return this._price;
    }
    getPriceWithTax(vat) {
        return this._price * (1 + vat / 100);
    }
}
__decorate([
    LogProperty
], Product.prototype, "_title", void 0);
__decorate([
    LogAccessor
], Product.prototype, "title", null);
__decorate([
    LogMethod,
    __param(0, LogParameter)
], Product.prototype, "getPriceWithTax", null);
const product = new Product('Vans', 49);
console.log(product.getPriceWithTax(20));
function Autobind(_, __, descriptor) {
    const method = descriptor.value;
    const newDescriptor = {
        configurable: true,
        enumerable: true,
        get() {
            return method.bind(this);
        },
    };
    return newDescriptor;
}
class Printer {
    constructor() {
        this.message = 'This works!';
    }
    showMessage() {
        console.log(this.message);
    }
}
__decorate([
    Autobind
], Printer.prototype, "showMessage", null);
const printer = new Printer();
const button = document.querySelector('button');
button === null || button === void 0 ? void 0 : button.addEventListener('click', printer.showMessage);
const registeredValidators = {};
function Required(target, propName) {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: [...registeredValidators[target.constructor.name][propName], 'required'] });
}
function PositiveNumber(target, propName) {
    registeredValidators[target.constructor.name] = Object.assign(Object.assign({}, registeredValidators[target.constructor.name]), { [propName]: [...registeredValidators[target.constructor.name][propName], 'positive'] });
}
function validate(obj) {
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
    constructor(t, p) {
        this.title = t;
        this.price = p;
    }
}
__decorate([
    Required
], Course.prototype, "title", void 0);
__decorate([
    PositiveNumber
], Course.prototype, "price", void 0);
const courseForm = document.querySelector('form');
courseForm === null || courseForm === void 0 ? void 0 : courseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const { value: title } = document.getElementById('title');
    const { value: price } = document.getElementById('price');
    const createdCourse = new Course(title, +price);
    if (!validate(createdCourse)) {
        throw new Error('Invalid input');
    }
    else {
        console.log(createdCourse);
    }
});
//# sourceMappingURL=index.js.map