import { ValidationError } from "../error/validation";
import { isValidCnpj, isValidEmail } from "../utils/validations";

class Mei {
  readonly cnpj: string;
  readonly email: string;

	constructor(cnpj: string, email: string) {
    if (!isValidCnpj(cnpj)) {
      throw new ValidationError("cnpj is invalid");
    }

    if (!isValidEmail(email)) {
      throw new ValidationError("email is invalid");
    }

    this.cnpj = cnpj;
    this.email = email;
  }

  static from(obj: any): Mei {
    if (!this.isMei(obj)) {
      throw new ValidationError("Failed to parse object to MEI");
    }    

    const { cnpj, email } = obj;
    return new Mei(cnpj, email);
  }

  static isMei(obj: any): boolean {
    const mei: Mei = { cnpj: "", email: ""};

    for (const field of Object.keys(mei)) {
      console.log(field);
      if (obj[field] === undefined || typeof obj[field] !== typeof mei[field]) {
          return false;
      }
    }

    return true;
  }
}

export { Mei };
