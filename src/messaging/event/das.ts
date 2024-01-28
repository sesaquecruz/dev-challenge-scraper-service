import { ValidationError } from "../../error/validation";
import { Das } from "../../model/das";
import { Mei } from "../../model/mei";

class DasEvent {
  constructor(readonly mei: Mei, readonly das: Das) { }

  static from(obj: any): DasEvent {
    const { mei, das } = obj;
      
    if (!mei || !das) {
      throw new ValidationError(["Failed to parse DasEvent from object"]);
    }

    const dasEvent = new DasEvent(Mei.from(mei), Das.from(das));
    return dasEvent;
  }
}

export { DasEvent };
