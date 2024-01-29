import { cnpj as CnpjValidator } from "cpf-cnpj-validator";
import * as EmailValidator from "email-validator";

function isValidCnpj(cnpj: string): boolean {
  return CnpjValidator.isValid(cnpj);
}

function isValidEmail(email: string): boolean {
  return EmailValidator.validate(email);
}

function isValidYear(year: number): boolean {
  return year >= 2000 && year <= 2100;
}

function isValidMonth(month: number): boolean {
  return month >= 1 && month <= 12;
}

export { isValidCnpj, isValidEmail, isValidYear, isValidMonth };
