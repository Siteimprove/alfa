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
  hasRole,
  isFocusable,
  isPerceivable,
  isVisible,
  isRendered,
  isWhitespace,
} from "../common/predicate";

const { isElement, hasNamespace, hasName } = Element;
const { isText } = Text;
const { and, test, not } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r14",
  requirements: [Criterion.of("2.5.3"), Technique.of("G208")],
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
              hasDescendant(and(Text.isText, isVisible(device)), {
                flattened: true,
              })
            )
          );
      },

      expectations(target) {
        const textContent = normalize(
          getVisibleInnerTextFromElement(target, device)
        );
        let name = "";

        const accessibleNameIncludesTextContent = test(
          hasAccessibleName(device, (accessibleName) => {
            name = normalize(accessibleName.value);
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
function getVisibleInnerTextFromTextNode(text: Text, device: Device): string {
  if (isVisible(device)(text)) return text.data;

  if (
    and(not(isVisible(device)), isRendered(device))(text) &&
    isWhitespace(text.data)
  )
    return " ";
  else return "";
}

function getVisibleInnerTextFromElement(
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
    return "\n" + childrenVisibleText(element, device) + "\n";
  }

  const display = Style.from(element, device).computed("display").value;
  const {
    values: [outside], // this covers both outside and internal specified => a better name?
  } = display;

  if (outside.value === "block" || outside.value === "table-caption") {
    return "\n" + childrenVisibleText(element, device) + "\n";
  }

  if (outside.value === "table-cell" || outside.value === "table-row") {
    return " " + childrenVisibleText(element, device) + " ";
  } else {
    return childrenVisibleText(element, device);
  }
}

function childrenVisibleText(node: Node, device: Device): string {
  const children = node.children({ flattened: true });

  let result = "";

  for (const child of children) {
    if (isText(child)) {
      result = result + getVisibleInnerTextFromTextNode(child, device);
    } else if (isElement(child)) {
      result = result + getVisibleInnerTextFromElement(child, device);
    } else {
      result = result + childrenVisibleText(child, device);
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
