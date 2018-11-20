import { audit, isResult, Outcome } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import {
  Document,
  DocumentType,
  Element,
  getOwnerElement,
  isDocument,
  NodeType,
  serialize
} from "@siteimprove/alfa-dom";
import { values } from "@siteimprove/alfa-util";
import { Rules } from "@siteimprove/alfa-wcag";
import { Assertion, AssertionError } from "./types";

const rules = values(Rules);

const documentType: DocumentType = {
  nodeType: NodeType.DocumentType,
  name: "html",
  childNodes: []
};

class Expectation<T extends Document | Element> implements Assertion {
  private readonly target: T;

  private negate = false;

  public get to(): this {
    return this;
  }

  public get be(): this {
    return this;
  }

  public get not(): this {
    this.negate = true;
    return this;
  }

  public constructor(target: T) {
    this.target = target;
  }

  public get accessible(): AssertionError | null {
    const device = getDefaultDevice();

    const document: Document = isDocument(this.target)
      ? this.target
      : {
          nodeType: NodeType.Document,
          compatMode: "CSS1Compat",
          styleSheets: [],
          childNodes: [documentType, this.target]
        };

    const results = audit({ device, document }, rules).filter(isResult);

    let hasFailure = false;

    for (const result of results) {
      if (result.outcome === Outcome.Inapplicable) {
        continue;
      }

      let target: Document | Element;

      if ("nodeType" in result.target) {
        target = result.target;
      } else {
        target = getOwnerElement(result.target, document)!;
      }

      if (result.outcome === Outcome.Failed) {
        hasFailure = true;

        if (this.negate !== true) {
          return {
            name: "AssertionError",
            message: `Expected ${serialize(target, document)} to not fail ${
              result.rule
            }`
          };
        }
      }
    }

    if (this.negate === true && !hasFailure) {
      return {
        name: "AssertionError",
        message: `Expected ${serialize(
          this.target,
          document
        )} to not be accessible`
      };
    }

    return null;
  }
}

export function expect<T extends Document | Element>(target: T): Assertion {
  return new Expectation(target);
}
