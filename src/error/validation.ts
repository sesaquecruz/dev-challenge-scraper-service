class ValidationError extends Error {
  readonly errors: string[];

  constructor(errors: string[]) {
    super();
    this.errors = errors;
  }

  appendError(error: ValidationError) {
    this.errors.push(...error.errors);
  }

  hasError(): boolean {
    return this.errors.length > 0;
  }
}

export { ValidationError };
