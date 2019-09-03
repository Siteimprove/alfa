import { audit, Outcome, Rule } from "@siteimprove/alfa-act";
import { getDefaultDevice } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  DocumentType,
  getOwnerElement,
  isAttribute,
  isDocument,
  NodeType,
  serialize
} from "@siteimprove/alfa-dom";
import { highlight, mark } from "@siteimprove/alfa-highlight";
import { keys } from "@siteimprove/alfa-util";

import { rules } from "./rules";
import { Aspect, Target } from "./types";

const documentType: DocumentType = {
  nodeType: NodeType.DocumentType,
  publicId: "",
  systemId: "",
  name: "html",
  childNodes: []
};

export class Assertion {
  private readonly target: Exclude<Target, Attribute>;

  public get to(): this {
    return this;
  }

  public get be(): this {
    return this;
  }

  public get should(): this {
    return this;
  }

  public constructor(target: Exclude<Target, Attribute>) {
    this.target = target;
  }

  public get accessible(): void {
    for (const rule of rules) {
      this.pass(rule as Rule<Aspect, Target>);
    }

    return;
  }

  public pass(rule: Rule<Aspect, Target>): void {
    const device = getDefaultDevice();

    const document: Document = isDocument(this.target)
      ? this.target
      : {
          nodeType: NodeType.Document,
          styleSheets: [],
          childNodes: [documentType, this.target]
        };

    const { results } = audit({ device, document }, [rule]);

    for (const result of results) {
      if (result.outcome === Outcome.Inapplicable) {
        continue;
      }

      if (result.outcome === Outcome.Failed) {
        const { expectations, aspect, target } = result;

        const failure = keys(expectations).find(
          key => expectations[key].holds === false
        );

        if (failure !== undefined) {
          let { message } = expectations[failure];

          if (message === undefined) {
            message = `Expectation ${failure} does not hold`;
          }

          throw new AssertionError(message, aspect, target);
        }
      }
    }
  }
}

export class AssertionError extends Error {
  public readonly name = "AssertionError";

  public readonly aspect: Aspect;
  public readonly target: Target;

  public constructor(message: string, aspect: Aspect, target: Target) {
    super(message);

    this.aspect = aspect;
    this.target = target;
  }

  public toString(): string {
    const document = this.aspect as Document;

    let target = this.target;
    let prelude: string;

    if (isAttribute(target)) {
      prelude = `The attribute ${mark.yellow(target.localName)} on the`;
      target = getOwnerElement(target, document)!;
    } else {
      prelude = "The";
    }

    return `

${prelude} following element has violations:

${highlight("html", serialize(target, document))}

${mark.bold("Reason:")} ${this.message}

    `.trim();
  }
}
