import { Document, Element } from "@siteimprove/alfa-dom";
import { Assertion } from "./assertion";

export function expect(target: Document | Element): Assertion {
  return new Assertion(target);
}
