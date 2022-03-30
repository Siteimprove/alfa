import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Document, Element, Namespace, Node } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";
import { isRendered, isDocumentElement } from "../common/predicate";
import { Scope } from "../tags";

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
  tags: [Scope.Page],
  evaluate({ device, document }) {
    return {
      applicability() {
        return test(Node.hasChild(isDocumentElement), document)
          ? [document]
          : [];
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
    Diagnostic.of(`The document doesn't contain any deprecated elements`)
  );

  export const HasDeprecatedElements = (errors: Iterable<Element>) =>
    Err.of(
      DeprecatedElements.of(`The document contains deprecated elements`, errors)
    );
}

/**
 * @internal
 */
export class DeprecatedElements
  extends Diagnostic
  implements Iterable<Element>
{
  public static of(
    message: string,
    errors: Iterable<Element> = []
  ): DeprecatedElements {
    return new DeprecatedElements(message, Array.from(errors));
  }

  private _errors: ReadonlyArray<Element>;

  private constructor(message: string, errors: Array<Element>) {
    super(message);
    this._errors = errors;
  }

  public get errors(): ReadonlyArray<Element> {
    return this._errors;
  }

  public equals(value: DeprecatedElements): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DeprecatedElements &&
      value._message === this._message &&
      Array.equals(value._errors, this._errors)
    );
  }

  public *[Symbol.iterator](): Iterator<Element> {
    yield* this._errors;
  }

  public toJSON(): DeprecatedElements.JSON {
    return {
      ...super.toJSON(),
      errors: this._errors.map((element) => element.path()),
    };
  }
}

/**
 * @internal
 */
export namespace DeprecatedElements {
  export interface JSON extends Diagnostic.JSON {
    errors: Array<string>;
  }

  export function isDeprecatedElements(
    value: Diagnostic
  ): value is DeprecatedElements;

  export function isDeprecatedElements(
    value: unknown
  ): value is DeprecatedElements;

  export function isDeprecatedElements(
    value: unknown
  ): value is DeprecatedElements {
    return value instanceof DeprecatedElements;
  }
}
