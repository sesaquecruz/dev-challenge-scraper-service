import { ValidationError } from "../error/validation";
import { Mei } from "./mei";

describe("test Mei creation", () => {
  it("with valid values", () => {
    const cnpj = "85443315000166";
    const email = "user@mail.com";

    const mei = new Mei(cnpj, email);
    expect(mei.cnpj).toBe(cnpj);
    expect(mei.email).toBe(email);
  });

  it("with invalid values", () => {
    const cnpjValid = "85443315000166";
    const emailValid = "user@mail.com";
    
    const cnpjInvalid = "85443315000165";
    const emailInvalid = "user@mailcom";

    const expectErrors = (cnpj: string, email: string, errors: string[]) => {
      try {
        new Mei(cnpj, email);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);  
        expect((error as ValidationError).errors).toEqual(errors);
        return;
      }
      throw new Error("Mei creating did not throw an error");
    };
    
    expectErrors(cnpjInvalid, emailValid, ["cnpj is invalid"]);
    expectErrors(cnpjValid, emailInvalid, ["email is invalid"]);
    expectErrors(cnpjInvalid, emailInvalid, ["cnpj is invalid", "email is invalid"]);
  });
});

describe("teste parse Mei from object", () => {
  it("with valid object", () => {
    const obj = {
      cnpj: "85443315000166",
      email: "user@mail.com",
    };

    const mei = Mei.from(obj);
    expect(mei.cnpj).toBe(obj.cnpj);
    expect(mei.email).toBe(obj.email);
  });

  it("with invalid object", () => {
    const expectErrors = (obj: any, errors: string[]) => {
      try {
        Mei.from(obj);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);  
        expect((error as ValidationError).errors).toEqual(errors);
        return;
      }
      throw new Error("Mei creating did not throw an error");
    };

    expectErrors({}, ["Failed to parse Mei from object"]);
    expectErrors({ cnpj: "85443315000166" }, ["Failed to parse Mei from object"]);
    expectErrors({ email: "user@mail.com" }, ["Failed to parse Mei from object"]);
  });
});
