import { ValidationError } from "../error/validation";
import { Mei } from "./mei";

describe("teste parse MEI from message", () => {
  it("with valid message", () => {
    const message = {
      cnpj: "85443315000166",
      email: "user@mail.com",
      das: {
        year: 2024,
        month: 1,
      },
    };

    const mei = Mei.from(message);
    expect(mei.cnpj).toBe(message.cnpj);
    expect(mei.email).toBe(message.email);
    expect(mei.das.year).toBe(message.das.year);
    expect(mei.das.month).toBe(message.das.month);
  });

  it("with invalid message", () => {
    const expectErrors = (obj: any, message: string) => {
      try {
        Mei.from(obj);
      } catch (error) {
        expect(error).toBeInstanceOf(ValidationError);  
        expect((error as ValidationError).message).toEqual(message);
        return;
      }
      throw new Error("mei creating did not throw an error");
    };

    expectErrors({}, "Failed to parse message to MEI");
    expectErrors({ cnpj: "85443315000166", email: "user@mail.com" }, "Failed to parse message to MEI");
    expectErrors({ das: {year: 2024, month: 1 }}, "Failed to parse message to MEI");
  });
});
