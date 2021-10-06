import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Device } from "@siteimprove/alfa-device";
import { Element, Namespace, Text } from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
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
              hasDescendant(and(Text.isText, isPerceivable(device)), {
                flattened: true,
              })
            )
          );
      },

      expectations(target) {
        const textContent = getPerceivableTextContent(target, device);
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

function getPerceivableTextContent(element: Element, device: Device): string {
  return normalize(
    element
      .descendants({ flattened: true })
      .filter(isText)
      .filter(isPerceivable(device))
      .map((text) => text.data)
      .join("")
  );
}

// https://github.com/Siteimprove/sanshikan/blob/6265a8045c1964ec90a62bed8adb6454e138fd77/terms/visible-inner-text.md
function getVisibleInnerTextFromTextNode(device: Device, text: Text): string {
  if (isVisible(device)(text)) return text.data;

  if (
    and(not(isVisible(device)), isRendered(device))(text) &&
    isWhitespace(text.data)
  )
    return " ";
  else return "";
}

function getVisibleInnerTextFromElement(
  device: Device,
  element: Element
): string {
  if (isRendered(device)(element)) return "";
  if (hasName("br")(element)) return "\n";
  if (hasName("p")(element)) return "\n"+//start from 3rd: visible text from children;
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
