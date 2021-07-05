import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { List } from "@siteimprove/alfa-list";
import { Iterable } from "@siteimprove/alfa-iterable";

import { expectation } from "../common/expectation";
import { hasChild, isRendered, isDocumentElement } from "../common/predicate";

const { isElement, hasName, hasNamespace } = Element;
const { and, test } = Predicate;

const deprecated = [
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
  "xmp",
];

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
            and(
              hasNamespace(Namespace.HTML),
              hasName("acronym", ...deprecated),
              isRendered(device)
            )
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
    errors: Iterable<Element> = List.empty()
  ): DeprecatedElements {
    return new DeprecatedElements(message, List.from(errors));
  }

  private readonly _errors: List<Element>;

  private constructor(message: string, errors: List<Element>) {
    super(message);
    this._errors = errors;
  }

  public *[Symbol.iterator](): Iterator<Element> {
    yield* this._errors;
  }

  public equals(value: DeprecatedElements): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DeprecatedElements &&
      value._message === this._message &&
      value._errors.equals(this._errors)
    );
  }

  public toJSON(): DeprecatedElements.JSON {
    return {
      ...super.toJSON(),
      errors: this._errors.toJSON(),
    };
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
