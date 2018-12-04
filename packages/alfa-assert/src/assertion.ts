import { audit, isResult, Outcome, Rule } from "@siteimprove/alfa-act";
import { Device, getDefaultDevice } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  DocumentType,
  Element,
  getOwnerElement,
  isDocument,
  NodeType,
  serialize
} from "@siteimprove/alfa-dom";
import { highlight, mark } from "@siteimprove/alfa-highlight";
import { values } from "@siteimprove/alfa-util";
import { Rules } from "@siteimprove/alfa-wcag";

const rules = values(Rules);

const documentType: DocumentType = {
  nodeType: NodeType.DocumentType,
  name: "html",
  childNodes: []
};

type Aspect = Document | Device;
type Target = Attribute | Document | Element;

export class Assertion {
  private readonly target: Document | Element;

  public get to(): this {
    return this;
  }

  public get be(): this {
    return this;
  }

  public constructor(target: Document | Element) {
    this.target = target;
  }

  public get accessible(): void {
    for (const rule of rules) {
      this.pass(rule as Rule<Aspect, Target>);
    }

    return;
  }

  public pass<A extends Aspect, T extends Target>(rule: Rule<A, T>): void {
    const device = getDefaultDevice();

    const document: Document = isDocument(this.target)
      ? this.target
      : {
          nodeType: NodeType.Document,
          compatMode: "CSS1Compat",
          styleSheets: [],
          childNodes: [documentType, this.target]
        };

    const results = audit({ device, document }, [
      (rule as unknown) as Rule<Aspect, Target>
    ]);

    for (const result of results.filter(isResult)) {
      if (result.outcome === Outcome.Inapplicable) {
        continue;
      }

      if (result.outcome === Outcome.Failed) {
        const { expectations, aspect, target } = result;

        const { message } = values(expectations).find(
          expectation => !expectation.holds
        )!;

        throw new AssertionError(message, aspect, target);
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

    if ("nodeType" in target) {
      prelude = "The";
    } else {
      prelude = `The attribute ${mark.yellow(target.localName)} on the`;
      target = getOwnerElement(target, document)!;
    }

    return `

${prelude} following element has violations:

${highlight("html", serialize(target, document))}

${mark.bold("Reason:")} ${this.message}

    `.trim();
  }
}
