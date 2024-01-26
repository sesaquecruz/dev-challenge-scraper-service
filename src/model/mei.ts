import { ValidationError } from "../error/validation";
import { isValidCnpj, isValidEmail } from "../utils/validations";
import { Das } from "./das";

class Mei {
  readonly cnpj: string;
  readonly email: string;
  das: Das;

	constructor(cnpj: string, email: string, das: Das) {
    if (!isValidCnpj(cnpj))
      throw new ValidationError("cnpj is invalid");

    if (!isValidEmail(email))
      throw new ValidationError("email is invalid");

    this.cnpj = cnpj;
    this.email = email;
    this.das = das;
  }

  // Parse the message received from RabbitMQ
  static from(obj: any): Mei {
    try {
      const { cnpj, email, das: { year, month }} = obj;
      
      if (
        typeof cnpj === "string" &&
        typeof email === "string" &&
        typeof year === "number" &&
        typeof month === "number"
      ) {
        const das = new Das(year, month);
        const mei = new Mei(cnpj, email, das);
        return mei;
      }
        
      throw new Error();
    } catch(error) {
      throw new ValidationError("Failed to parse message to MEI");
    }
  }
}

export { Mei };
