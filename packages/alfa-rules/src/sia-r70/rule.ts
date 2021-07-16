import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { List } from "@siteimprove/alfa-list";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Array } from "@siteimprove/alfa-array";

import { expectation } from "../common/expectation";
import { hasChild, isRendered, isDocumentElement } from "../common/predicate";

const { isElement, hasName, hasNamespace } = Element;
const { and, test } = Predicate;

const isDeprecated = hasName(
  "acronym",
  "applet",
  "basefont",
  "bgsound",
  "big",
  "blink",
  "center",
  "content",
  "dir",
  "font",
  "frame",
  "frameset",
  "hgroup",
  "image",
  "keygen",
  "marquee",
  "menuitem",
  "nobr",
  "noembed",
  "noframes",
  "plaintext",
  "rb",
  "rtc",
  "shadow",
  "spacer",
  "strike",
  "tt",
  "xmp"
);

export default Rule.Atomic.of<Page, Document>({
  uri: "https://alfa.siteimprove.com/rules/sia-r70",
  evaluate({ device, document }) {
    return {
      applicability() {
        return test(hasChild(isDocumentElement), document) ? [document] : [];
      },

      expectations(target) {
        const deprecatedElements = target
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(hasNamespace(Namespace.HTML), isDeprecated, isRendered(device))
          );

        return {
          1: expectation(
            deprecatedElements.isEmpty(),
            () => Outcomes.HasNoDeprecatedElement,
            () => Outcomes.HasDeprecatedElements(deprecatedElements)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const HasNoDeprecatedElement = Ok.of(
    Diagnostic.of(`The document doesn't contain any deprecated element`)
  );

  export const HasDeprecatedElements = (errors: Iterable<Element>) =>
    Err.of(
      DeprecatedElements.of(
        `The document contains deprecated elements: `,
        errors
      )
    );
}

class DeprecatedElements extends Diagnostic implements Iterable<Element> {
  public static of(
    message: string,
    errors: Iterable<Element> = []
  ): DeprecatedElements {
    return new DeprecatedElements(message, Array.from(errors));
  }

  private constructor(message: string, errors: Array<Element>) {
    super(message);
    this._errors = errors;
  }

  public *[Symbol.iterator](): Iterator<Element> {
    yield* this._errors;
  }

  private _errors: ReadonlyArray<Element>;

  public equalsError(value: unknown, errors: ReadonlyArray<Element>): boolean {
    return (
      value instanceof DeprecatedElements &&
      value._message === this._message &&
      Array.equals(value._errors, this._errors)
    );
  }

  public toJSON(): DeprecatedElements.JSON {
    return {
      ...super.toJSON(),
      errors: Array.toJSON(this._errors),
    };
  }

  public get errors(): ReadonlyArray<Element> {
    return this._errors;
  }
}

namespace DeprecatedElements {
  export interface JSON extends Diagnostic.JSON {
    errors: List.JSON<Element>;
  }

  export function isDeprecatedElements(
    value: unknown
  ): value is DeprecatedElements {
    return value instanceof DeprecatedElements;
  }
}
