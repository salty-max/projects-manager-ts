export interface Validatable {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

export function validate(v: Validatable): boolean {
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
