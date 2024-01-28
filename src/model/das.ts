import { ValidationError } from "../error/validation";
import { isValidMonth, isValidYear } from "../utils/validations";

class Das {
  readonly year: number;
  readonly month: number;
  filePath: string = "";

  constructor(year: number, month: number) {
    const errors: string[] = [];

    if (!isValidYear(year)) {
      errors.push("year is invalid");
    }

    if (!isValidMonth(month)) {
      errors.push("month is invalid");
    }

    if (errors.length > 0 ) {
      throw new ValidationError(errors);
    }

    this.year = year;
    this.month = month;
  }

  static from(obj: any): Das {
    const { year, month } = obj;
      
    if (typeof year !== "number" || typeof month !== "number") {
      throw new ValidationError(["Failed to parse Das from object"]);
    }

    const das = new Das(year, month);
    return das;
  }

  setFilePath(filePath: string) {
    this.filePath = filePath;
  }
}

export { Das };
