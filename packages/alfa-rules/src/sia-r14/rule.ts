import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Node, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Style } from "@siteimprove/alfa-style";
import { Criterion, Technique } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { expectation } from "../common/expectation";
import { normalize } from "../common/normalize";

import {
  hasAccessibleName,
  hasAttribute,
  hasDescendant,
  isPerceivable,
  hasRole,
  isFocusable,
  isRendered,
  isWhitespace,
} from "../common/predicate";
import { Scope } from "../tags/scope";

const { isElement, hasNamespace, hasName } = Element;
const { isText } = Text;
const { and, test, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r14",
  requirements: [Criterion.of("2.5.3"), Technique.of("G208")],
  tags: [Scope.Component],
  evaluate({ device, document }) {
    return {
      applicability() {
        return document
          .descendants({ flattened: true, nested: true })
          .filter(isElement)
          .filter(
            and(
              hasNamespace(Namespace.HTML, Namespace.SVG),
              hasAttribute(
                (attribute) =>
                  attribute.name === "aria-label" ||
                  attribute.name === "aria-labelledby"
              ),
              isFocusable(device),
              hasRole(
                device,
                (role) => role.isWidget() && role.isNamedBy("contents")
              ),
              hasDescendant(and(Text.isText, isPerceivable(device)), {
                flattened: true,
              })
            )
          );
      },

      expectations(target) {
        // Removes all punctiation (underscore, hypen, brackets, quotation marks, etc)
        // and normalise
        function removePunctuationAndNormalise(input: string): string {
          return normalize(input.replace(/\p{P}/gu, ""));
        }

        const textContent = removePunctuationAndNormalise(
          getPerceivableInnerTextFromElement(target, device)
        );

        let name = "";
        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(device, (accessibleName) => {
            name = removePunctuationAndNormalise(accessibleName.value);
            return name.includes(textContent);
          }),
          target
        );

        return {
          1: expectation(
            accessibleNameIncludesTextContent,
            () => Outcomes.VisibleIsInName(textContent, name),
            () => Outcomes.VisibleIsNotInName(textContent, name)
          ),
        };
      },
    };
  },
});

/**
 * {@link https://alfa.siteimprove.com/terms/visible-inner-text}
 */
function getPerceivableInnerTextFromTextNode(
  text: Text,
  device: Device
): string {
  if (isPerceivable(device)(text)) {
    return text.data;
  }

  if (
    and(not(isPerceivable(device)), isRendered(device))(text) &&
    isWhitespace(text.data)
  ) {
    return " ";
  }

  return "";
}

function getPerceivableInnerTextFromElement(
  element: Element,
  device: Device
): string {
  if (!isRendered(device)(element)) {
    return "";
  }

  if (hasName("br")(element)) {
    return "\n";
  }

  if (hasName("p")(element)) {
    return "\n" + childrenPerceivableText(element, device) + "\n";
  }

  const display = Style.from(element, device).computed("display").value;
  const {
    values: [outside], // this covers both outside and internal specified.
  } = display;

  if (outside.value === "block" || outside.value === "table-caption") {
    return "\n" + childrenPerceivableText(element, device) + "\n";
  }

  if (outside.value === "table-cell" || outside.value === "table-row") {
    return " " + childrenPerceivableText(element, device) + " ";
  }

  return childrenPerceivableText(element, device);
}

function childrenPerceivableText(node: Node, device: Device): string {
  const children = node.children({ flattened: true });

  let result = "";

  for (const child of children) {
    if (isText(child)) {
      result = result + getPerceivableInnerTextFromTextNode(child, device);
    } else if (isElement(child)) {
      result = result + getPerceivableInnerTextFromElement(child, device);
    } else {
      result = result + childrenPerceivableText(child, device);
    }
  }
  //Returning the whole text from its children
  return result;
}
export namespace Outcomes {
  export const VisibleIsInName = (textContent: string, name: string) =>
    Ok.of(
      LabelAndName.of(
        `The visible text content of the element is included within its accessible name`,
        textContent,
        name
      )
    );

  export const VisibleIsNotInName = (textContent: string, name: string) =>
    Err.of(
      LabelAndName.of(
        `The visible text content of the element is not included within its accessible name`,
        textContent,
        name
      )
    );
}

class LabelAndName extends Diagnostic {
  public static of(
    message: string,
    textContent: string = "",
    name: string = ""
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

  public toJSON(): LabelAndName.JSON {
    return {
      ...super.toJSON(),
      textContent: this._textContent,
      name: this._name,
    };
  }
}

namespace LabelAndName {
  export interface JSON extends Diagnostic.JSON {
    textContent: string;
    name: string;
  }
}
