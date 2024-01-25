import { cnpj as CnpjValidator } from "cpf-cnpj-validator";
import * as EmailValidator from "email-validator";

function isValidCnpj(cnpj: string): boolean {
  return CnpjValidator.isValid(cnpj);
}

function isValidEmail(email: string): boolean {
  return EmailValidator.validate(email);
}

export { isValidCnpj, isValidEmail };
