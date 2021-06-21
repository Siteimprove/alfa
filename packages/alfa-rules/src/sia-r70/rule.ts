/// <reference lib="dom" />

import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Document, Element, Namespace } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Page } from "@siteimprove/alfa-web";
import { List } from "@siteimprove/alfa-list";
import { Iterable } from "@siteimprove/alfa-iterable";

import { expectation } from "../common/expectation";
import { isIgnored, hasChild } from "../common/predicate";
import { Group } from "../common/group";

import { isVisible } from "../common/predicate/is-visible";

import { isDocumentElement } from "../common/predicate/is-document-element";

const { isElement, hasName, hasNamespace } = Element;
const { and, or, test, not } = Predicate;
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
export default Rule.Atomic.of<Page, Document, Group<Element>>({
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
              not(isIgnored(device))
              //or(isVisible(device), not(isIgnored(device)))
            )
          );

        //console.dir(deprecatedElements.toJSON(), { depth: null });

        return {
          1: expectation(
            deprecatedElements.isEmpty(),
            () => Outcomes.IsNotDeprecated,
            () => Outcomes.IsDeprecated(deprecatedElements)
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsNotDeprecated = Ok.of(
    Diagnostic.of(`The document doesn't contain deprecated elements`)
  );

  export const IsDeprecated = (errors: Iterable<Element>) =>
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

  export function areDeprecatedElements(
    value: unknown
  ): value is DeprecatedElements {
    return value instanceof DeprecatedElements;
  }
}
