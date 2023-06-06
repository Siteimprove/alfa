import { Diagnostic, Rule } from "@siteimprove/alfa-act";
import {
  Declaration,
  Element,
  Namespace,
  Node,
  Query,
  Text,
} from "@siteimprove/alfa-dom";
import { None, Option } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/act/expectation";

import { Scope } from "../tags";

const { isElement, hasNamespace, hasName } = Element;
const { isText } = Text;
const { and, or, not } = Predicate;
const { hasCascadedStyle, hasComputedStyle, hasSpecifiedStyle, isVisible } =
  Style;
const { getElementDescendants } = Query;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r75",
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return getElementDescendants(document, Node.fullTree).filter(
          and(
            hasNamespace(Namespace.HTML),
            not(hasName("sup", "sub")),
            Node.hasTextContent(),
            isVisible(device),
            hasCascadedStyle(
              `font-size`,
              (fontSize) => {
                switch (fontSize.type) {
                  case "length":
                    // We cannot resolve calculation at cascaded time, so we simply
                    // discard elements with calculated font-size to avoid
                    // false positives.
                    return !fontSize.hasCalculation() && fontSize.value > 0;
                  case "percentage":
                    return fontSize.value > 0;

                  default:
                    return true;
                }
              },
              device
            )
          )
        );
      },

      expectations(target) {
        const declaration = Style.from(target, device)
          .cascaded("font-size")
          // Applicability guarantees there is a cascaded value
          .getUnsafe().source;

        const texts = target
          .descendants(Node.fullTree)
          .filter(isText)
          .reject((text) => text.data.trim() === "")
          .collect((text) => text.parent().filter(isElement))
          .every(
            or(
              hasSpecifiedStyle(
                "font-size",
                (_, source) =>
                  // We do need to compare with physical identity, not structural
                  // identity (.equals) to differentiate, e.g., two
                  // "font-size: 100%" declarations
                  source !== declaration,
                device
              ),
              hasComputedStyle(
                "font-size",
                (fontSize, _) => fontSize.value >= 9,
                device
              )
            )
          );

        return {
          1: expectation(
            texts,
            () => Outcomes.IsSufficient(declaration),
            () => Outcomes.IsInsufficient(declaration)
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
  export const IsSufficient = (declaration: Option<Declaration>) =>
    Ok.of(
      WithDeclaration.of(`The font size is greater than 9 pixels`, declaration)
    );

  export const IsInsufficient = (declaration: Option<Declaration>) =>
    Err.of(
      WithDeclaration.of(`The font size is smaller than 9 pixels`, declaration)
    );
}

/**
 * @public
 */
export class WithDeclaration extends Diagnostic {
  public static of(message: string, declaration: Option<Declaration> = None) {
    return new WithDeclaration(message, declaration);
  }

  private readonly _declaration: Option<Declaration>;

  constructor(message: string, declaration: Option<Declaration>) {
    super(message);
    this._declaration = declaration;
  }

  public get declaration(): Option<Declaration> {
    return this._declaration;
  }

  equals(value: WithDeclaration): boolean;

  equals(value: unknown): value is this;

  equals(value: unknown): boolean {
    return (
      value instanceof WithDeclaration &&
      value._message === this.message &&
      value._declaration === this._declaration
    );
  }

  toJSON(): WithDeclaration.JSON {
    return {
      ...super.toJSON(),
      declaration: this._declaration.toJSON(),
    };
  }
}

/**
 * @public
 */
export namespace WithDeclaration {
  export interface JSON extends Diagnostic.JSON {
    declaration: Option.JSON<Declaration>;
  }

  export function isWithDeclaration(
    value: Diagnostic
  ): value is WithDeclaration;

  export function isWithDeclaration(value: unknown): value is WithDeclaration;

  export function isWithDeclaration(value: unknown): value is WithDeclaration {
    return value instanceof WithDeclaration;
  }
}
