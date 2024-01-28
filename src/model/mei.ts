import { ValidationError } from "../error/validation";
import { isValidCnpj, isValidEmail } from "../utils/validations";

class Mei {
  readonly cnpj: string;
  readonly email: string;

	constructor(cnpj: string, email: string) {
    const errors: string[] = [];

    if (!isValidCnpj(cnpj)) {
      errors.push("cnpj is invalid");
    }

    if (!isValidEmail(email)) {
      errors.push("email is invalid");
    }

    if (errors.length > 0 ) {
      throw new ValidationError(errors);
    }

    this.cnpj = cnpj;
    this.email = email;
  }

  static from(obj: any): Mei {
    const { cnpj, email } = obj;
      
    if (typeof cnpj !== "string" || typeof email !== "string") {
      throw new ValidationError(["Failed to parse Mei from object"]);
    }

    const mei = new Mei(cnpj, email);
    return mei;
  }
}

export { Mei };
