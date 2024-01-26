import { ValidationError } from "../error/validation";
import { isValidMonth, isValidYear } from "../utils/validations";

class Das {
  readonly year: number;
  readonly month: number;
  fileName: string = "";
  filePath: string = "";

  constructor(year: number, month: number) {
    if (!isValidYear(year))
      throw new ValidationError("year is invalid");

    if (!isValidMonth(month)) 
      throw new ValidationError("month is invalid");

    this.year = year;
    this.month = month;
  }

  setFileInfo(fileName: string, filePath: string) {
    this.fileName = fileName;
    this.filePath = filePath;
  }
}

export { Das };
