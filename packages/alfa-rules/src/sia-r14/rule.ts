import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Element, Namespace, Node, Query, Text } from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { String } from "@siteimprove/alfa-string";
import { Style } from "@siteimprove/alfa-style";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import type { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation.js";

import { Scope, Stability } from "../tags/index.js";

const { hasAccessibleName, hasRole, isPerceivableForAll } = DOM;
const { hasAttribute, hasNamespace } = Element;
const { hasDescendant } = Node;
const { and, test } = Predicate;
const { isFocusable } = Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r14",
  requirements: [Criterion.of("2.5.3"), Technique.of("G208")],
  tags: [Scope.Component, Stability.Stable],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML, Namespace.SVG),
            hasAttribute(
              (attribute) =>
                attribute.name === "aria-label" ||
                attribute.name === "aria-labelledby",
            ),
            isFocusable(device),
            hasRole(
              device,
              (role) => role.isWidget() && role.isNamedBy("contents"),
            ),
            hasDescendant(
              and(Text.isText, isPerceivableForAll(device)),
              Node.flatTree,
            ),
          ),
        );
      },

      expectations(target) {
        const removePunctuationAndNormalise = String.and(
          String.removePunctuation,
          String.normalize,
        );

        const textContent = removePunctuationAndNormalise(
          Style.innerText(device, isPerceivableForAll)(target),
        );

        let name = "";
        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(device, (accessibleName) => {
            name = removePunctuationAndNormalise(accessibleName.value);
            return name.includes(textContent);
          }),
          target,
        );

        return {
          1: expectation(
            accessibleNameIncludesTextContent,
            () => Outcomes.VisibleIsInName(textContent, name),
            () => Outcomes.VisibleIsNotInName(textContent, name),
          ),
        };
      },
    };
  },
});

/**
 * @public
 */
export namespace Outcomes {
  export const VisibleIsInName = (textContent: string, name: string) =>
    Ok.of(
      LabelAndName.of(
        `The visible text content of the element is included within its accessible name`,
        textContent,
        name,
      ),
    );

  export const VisibleIsNotInName = (textContent: string, name: string) =>
    Err.of(
      LabelAndName.of(
        `The visible text content of the element is not included within its accessible name`,
        textContent,
        name,
      ),
    );
}

/**
 * @public
 */
export class LabelAndName extends Diagnostic {
  public static of(
    message: string,
    textContent: string = "",
    name: string = "",
  ): LabelAndName {
    return new LabelAndName(message, textContent, name);
  }

  private readonly _textContent: string;
  private readonly _name: string;

  private constructor(message: string, textContent: string, name: string) {
    super(message);
    this._textContent = textContent;
    this._name = name;
  }

  public get textContent(): string {
    return this._textContent;
  }

  public get name(): string {
    return this._name;
  }

  public equals(value: LabelAndName): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof LabelAndName &&
      value._message === this._message &&
      value._textContent === this._textContent &&
      value._name === this._name
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeString(this._name);
    hash.writeString(this._textContent);
  }

  public toJSON(options?: Node.SerializationOptions): LabelAndName.JSON {
    return {
      ...super.toJSON(options),
      textContent: this._textContent,
      name: this._name,
    };
  }
}

/**
 * @public
 */
export namespace LabelAndName {
  export interface JSON extends Diagnostic.JSON {
    textContent: string;
    name: string;
  }

  export function isLabelAndName(value: Diagnostic): value is LabelAndName;

  export function isLabelAndName(value: unknown): value is LabelAndName;

  /**@public */
  export function isLabelAndName(value: unknown): value is LabelAndName {
    return value instanceof LabelAndName;
  }
}
