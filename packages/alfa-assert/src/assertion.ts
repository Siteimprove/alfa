import { Audit, Outcome, Rule } from "@siteimprove/alfa-act";
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

import { rules } from "./rules";
import { Input, Target } from "./types";

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
      this.pass(rule);
    }

    return;
  }

  public pass(rule: Rule<Input, Target>): void {
    const device = getDefaultDevice();

    const document: Document = isDocument(this.target)
      ? this.target
      : {
          nodeType: NodeType.Document,
          styleSheets: [],
          childNodes: [documentType, this.target]
        };

    Audit.of({ device, document })
      .add(rule)
      .evaluate()
      .map(outcomes => {
        for (const outcome of outcomes) {
          if (Outcome.isFailed(outcome)) {
            const { expectations, target } = outcome;

            for (const [n, expectation] of expectations) {
              if (!expectation.holds) {
                const message = `Expectation ${n} does not hold`;

                throw new AssertionError(message, target);
              }
            }
          }
        }
      });
  }
}

export class AssertionError extends Error {
  public readonly name = "AssertionError";

  public readonly target: Rule.Target<Rule.Aspect<Input>, Target>;

  public constructor(
    message: string,
    target: Rule.Target<Rule.Aspect<Input>, Target>
  ) {
    super(message);

    this.target = target;
  }

  public toString(): string {
    const document = this.target.aspect as Document;

    let target = this.target.target;
    let prelude: string;

    if (isAttribute(target)) {
      const attribute = target;

      prelude = `The attribute ${mark.yellow(attribute.localName)} on the`;

      for (const ownerElement of getOwnerElement(attribute, document)) {
        target = ownerElement;
      }
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
