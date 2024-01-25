import { Mei } from "./mei";

describe("test MEI constructor", () => {
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

    expect(() => new Mei(cnpjInvalid, emailValid)).toThrow("cnpj is invalid");
    expect(() => new Mei(cnpjValid, emailInvalid)).toThrow("email is invalid");
  });
});

describe("test parse object to MEI", () => {
  it("with valid object", () => {
    const obj = { cnpj: "85443315000166", email: "user@mail.com" };

    const mei = Mei.from(obj);
    expect(mei.cnpj).toBe(obj.cnpj);
    expect(mei.email).toBe(obj.email);
  });

  it("with invalid object", () => {
    const error = "Failed to parse object to MEI";

    expect(() => Mei.from({})).toThrow(error);
    expect(() => Mei.from({ cnpj: ""})).toThrow(error);
    expect(() => Mei.from({ email: ""})).toThrow(error);
  });
});
