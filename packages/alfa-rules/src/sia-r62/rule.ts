import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import color from "@siteimprove/alfa-style/src/property/color";

import { expectation } from "../common/expectation";

import {
  hasBorder,
  hasOutline,
  hasRole,
  hasTextDecoration,
  isVisible,
} from "../common/predicate";

const { isElement } = Element;
const { isText } = Text;
const { and, or, not, test } = Predicate;

export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r62",
  requirements: [Criterion.of("1.4.1")],
  evaluate({ device, document }) {
    let containers: Map<Element, Element> = Map.empty();

    return {
      applicability() {
        return visit(document, None);

        function* visit(
          node: Node,
          container: Option<Element>
        ): Iterable<Element> {
          if (isElement(node)) {
            // If the element is a semantic link, it might be applicable.
            if (
              test(
                hasRole(device, (role) => role.is("link")),
                node
              )
            ) {
              if (
                container.isSome() &&
                node
                  .descendants({ flattened: true })
                  .some(and(isText, isVisible(device)))
              ) {
                containers = containers.set(node, container.get());
                return yield node;
              }
            }

            // Otherwise, if the element is a <p> element with non-link text
            // content then start collecting applicable elements.
            else if (
              test(
                and(hasRole(device, "paragraph"), hasNonLinkText(device)),
                node
              )
            ) {
              container = Option.of(node);
            }
          }

          const children = node.children({
            flattened: true,
            nested: true,
          });

          for (const child of children) {
            yield* visit(child, container);
          }
        }
      },

      expectations(target) {
        const container = containers.get(target).get();

        return {
          1: expectation(
            test(and(isDistinguishable(container, device)), target),
            () => Outcomes.IsDistinguishable(target, device),
            () => Outcomes.IsNotDistinguishable(target, device)
          ),
          2: expectation(
            test(
              and(isDistinguishable(container, device, Context.hover(target))),
              target
            ),
            () =>
              Outcomes.IsDistinguishableHover(
                target,
                device,
                Context.hover(target)
              ),
            () =>
              Outcomes.IsNotDistinguishableHover(
                target,
                device,
                Context.hover(target)
              )
          ),
          3: expectation(
            test(
              and(isDistinguishable(container, device, Context.focus(target))),
              target
            ),
            () =>
              Outcomes.IsDistinguishableFocus(
                target,
                device,
                Context.focus(target)
              ),
            () =>
              Outcomes.IsNotDistinguishableFocus(
                target,
                device,
                Context.focus(target)
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  export const IsDistinguishable = (element: Element, device: Device) =>
    Ok.of(
      DistinguishableLinks.from(
        `The link is distinguishable from the surrounding text`,
        element,
        device
      )
    );
  export const IsDistinguishableHover = (
    element: Element,
    device: Device,
    context: Context
  ) =>
    Ok.of(
      DistinguishableLinks.from(
        `The link is hoverable from the surrounding text`,
        element,
        device,
        context
      )
    );
  export const IsDistinguishableFocus = (
    element: Element,
    device: Device,
    context: Context
  ) =>
    Ok.of(
      DistinguishableLinks.from(
        `The link is focused from the surrounding text`,
        element,
        device,
        context
      )
    );

  export const IsNotDistinguishable = (element: Element, device: Device) =>
    Err.of(
      DistinguishableLinks.from(
        `The link is not distinguishable from the surrounding text because is in
      default state`,
        element,
        device
      )
    );
  export const IsNotDistinguishableHover = (
    element: Element,
    device: Device,
    context: Context
  ) =>
    Err.of(
      DistinguishableLinks.from(
        `The link is not distinguishable from the surrounding text because is in
      hover state`,
        element,
        device,
        context
      )
    );
  export const IsNotDistinguishableFocus = (
    element: Element,
    device: Device,
    context: Context
  ) =>
    Err.of(
      DistinguishableLinks.from(
        `The link is not distinguishable from the surrounding text because is in
      focus state`,
        element,
        device,
        context
      )
    );
}

function hasNonLinkText(device: Device): Predicate<Element> {
  return function hasNonLinkText(element) {
    const children = element.children({
      flattened: true,
    });

    if (children.some(and(isText, isVisible(device)))) {
      return true;
    }

    return children
      .filter(isElement)
      .reject(hasRole(device, (role) => role.is("link")))
      .some(hasNonLinkText);
  };
}

function isDistinguishable(
  container: Element,
  device: Device,
  context?: Context
): Predicate<Element> {
  return or(
    // Things like text decoration and backgrounds risk blending with the
    // container element. We therefore need to check if these can be distinguished
    // from what the container element might itself set.
    hasDistinguishableTextDecoration(container, device, context),
    hasDistinguishableBackground(container, device, context),

    hasDistinguishableFontWeight(container, device, context),

    // We consider the mere presence of borders or outlines on the element as
    // distinguishable features. There's of course a risk of these blending with
    // other features of the container element, such as its background, but this
    // should hopefully not happen (too often) in practice. When it does, we
    // risk false negatives.
    hasOutline(device, context),
    hasBorder(device, context)
  );
}

function hasDistinguishableTextDecoration(
  container: Element,
  device: Device,
  context?: Context
): Predicate<Element> {
  return (element) =>
    test(not(hasTextDecoration(device, context)), container) &&
    test(hasTextDecoration(device, context), element);
}

/**
 * Check if an element has a distinguishable background from the given container
 * element.
 *
 * @remarks
 * This predicate currently only considers `background-color` as a possibly
 * distinguishable background. Other `background-*` properties, such as
 * `background-image`, should ideally also be considered, but `background-color`
 * is the only property that contains just a single layer while something like
 * `background-image` can contain multiple layers. It's therefore not trivial
 * to handle.
 */
function hasDistinguishableBackground(
  container: Element,
  device: Device,
  context?: Context
): Predicate<Element> {
  const reference = Style.from(container, device, context).computed(
    "background-color"
  ).value;

  return (element) => {
    return Style.from(element, device, context)
      .computed("background-color")
      .none((color) => Color.isTransparent(color) || color.equals(reference));
  };
}

/**
 * Check if an element has a different font weight than its container.
 *
 * This is brittle and imperfect but removes a strong pain point until we find
 * a better solution…
 */
function hasDistinguishableFontWeight(
  container: Element,
  device: Device,
  context?: Context
): Predicate<Element> {
  const reference = Style.from(container, device, context).computed(
    "font-weight"
  ).value;

  return (element) => {
    return Style.from(element, device, context)
      .computed("font-weight")
      .none((weight) => weight.equals(reference));
  };
}

class DistinguishableLinks extends Diagnostic {
  public static of(
    message: string,
    color: string = "",
    borderTopWidth: string = "",
    borderRightWidth: string = "",
    borderBottomWidth: string = "",
    borderLeftWidth: string = "",
    borderTopStyle: string = "",
    borderRightStyle: string = "",
    borderBottomStyle: string = "",
    borderLeftStyle: string = "",
    borderTopColor: string = "",
    borderRightColor: string = "",
    borderBottomColor: string = "",
    borderLeftColor: string = "",
    outlineWidth: string = "",
    outlineStyle: string = "",
    outlineColor: string = "",
    textDecorationColor: string = "",
    textDecorationLine: string = "",
    visibility: string = "",
    fontSize: string = ""
  ): DistinguishableLinks {
    return new DistinguishableLinks(
      message,
      color,
      borderTopWidth,
      borderRightWidth,
      borderBottomWidth,
      borderLeftWidth,
      borderTopStyle,
      borderRightStyle,
      borderBottomStyle,
      borderLeftStyle,
      borderTopColor,
      borderRightColor,
      borderBottomColor,
      borderLeftColor,
      outlineWidth,
      outlineStyle,
      outlineColor,
      textDecorationColor,
      textDecorationLine,
      visibility,
      fontSize
    );
  }

  private readonly _color: string;
  private readonly _borderTopWidth: string;
  private readonly _borderRightWidth: string;
  private readonly _borderBottomWidth: string;
  private readonly _borderLeftWidth: string;
  private readonly _borderTopStyle: string;
  private readonly _borderRightStyle: string;
  private readonly _borderBottomStyle: string;
  private readonly _borderLeftStyle: string;
  private readonly _borderTopColor: string;
  private readonly _borderRightColor: string;
  private readonly _borderBottomColor: string;
  private readonly _borderLeftColor: string;
  private readonly _outlineWidth: string;
  private readonly _outlineStyle: string;
  private readonly _outlineColor: string;
  private readonly _textDecorationColor: string;
  private readonly _textDecorationLine: string;
  private readonly _visibility: string;
  private readonly _fontSize: string;

  private constructor(
    message: string,
    color: string,
    borderTopWidth: string,
    borderRightWidth: string,
    borderBottomWidth: string,
    borderLeftWidth: string,
    borderTopStyle: string,
    borderRightStyle: string,
    borderBottomStyle: string,
    borderLeftStyle: string,
    borderTopColor: string,
    borderRightColor: string,
    borderBottomColor: string,
    borderLeftColor: string,
    outlineWidth: string,
    outlineStyle: string,
    outlineColor: string,
    textDecorationColor: string,
    textDecorationLine: string,
    visibility: string,
    fontSize: string
  ) {
    super(message);
    this._color = color;
    (this._borderTopWidth = borderTopWidth),
      (this._borderRightWidth = borderRightWidth),
      (this._borderBottomWidth = borderBottomWidth),
      (this._borderLeftWidth = borderLeftWidth),
      (this._borderTopStyle = borderTopStyle),
      (this._borderRightStyle = borderRightStyle),
      (this._borderBottomStyle = borderBottomStyle),
      (this._borderLeftStyle = borderLeftStyle),
      (this._borderTopColor = borderTopColor),
      (this._borderRightColor = borderRightColor),
      (this._borderBottomColor = borderBottomColor),
      (this._borderLeftColor = borderLeftColor),
      (this._outlineWidth = outlineWidth);
    this._outlineStyle = outlineStyle;
    this._outlineColor = outlineColor;
    this._textDecorationColor = textDecorationColor;
    this._textDecorationLine = textDecorationLine;
    this._visibility = visibility;
    this._fontSize = fontSize;
  }

  public get color(): string {
    return this._color;
  }

  public get borderTopWidth(): string {
    return this._borderTopWidth;
  }

  public get borderRightWidth(): string {
    return this._borderRightWidth;
  }

  public get borderBottomWidth(): string {
    return this._borderBottomWidth;
  }

  public get borderLeftWidth(): string {
    return this._borderLeftWidth;
  }

  public get borderTopStyle(): string {
    return this._borderTopStyle;
  }

  public get borderRightStyle(): string {
    return this._borderRightStyle;
  }

  public get borderBottomStyle(): string {
    return this._borderBottomStyle;
  }

  public get borderLeftStyle(): string {
    return this._borderLeftStyle;
  }
  public get borderTopColor(): string {
    return this._borderTopColor;
  }

  public get borderRightColor(): string {
    return this._borderRightColor;
  }

  public get borderBottomColor(): string {
    return this._borderBottomColor;
  }

  public get borderLeftColor(): string {
    return this._borderLeftColor;
  }

  public get outlineWidth(): string {
    return this._outlineWidth;
  }

  public get outlineStyle(): string {
    return this._outlineStyle;
  }

  public get outlineColor(): string {
    return this._outlineColor;
  }

  public get textDecorationColor(): string {
    return this._textDecorationColor;
  }

  public get textDecorationLine(): string {
    return this._textDecorationLine;
  }

  public get visibility(): string {
    return this._visibility;
  }

  public get fontSize(): string {
    return this._fontSize;
  }

  public toJSON(): DistinguishableLinks.JSON {
    return {
      ...super.toJSON(),
      color: this._color,

      borderTopWidth: this._borderTopWidth,
      borderRightWidth: this._borderRightWidth,
      borderBottomWidth: this._borderBottomWidth,
      borderLeftWidth: this._borderLeftWidth,

      borderTopStyle: this._borderTopStyle,
      borderRightStyle: this._borderRightStyle,
      borderBottomStyle: this._borderBottomStyle,
      borderLeftStyle: this._borderLeftStyle,

      borderTopColor: this._borderTopColor,
      borderRightColor: this._borderRightColor,
      borderBottomColor: this._borderBottomColor,
      borderLeftColor: this._borderLeftColor,

      outlineWidth: this._outlineWidth,
      outlineStyle: this._outlineStyle,
      outlineColor: this._outlineColor,

      textDecorationColor: this._textDecorationColor,
      textDecorationLine: this._textDecorationLine,

      visibility: this._visibility,
      fontSize: this._fontSize,
    };
  }
}

namespace DistinguishableLinks {
  export interface JSON extends Diagnostic.JSON {
    color: string;

    borderTopWidth: string;
    borderRightWidth: string;
    borderBottomWidth: string;
    borderLeftWidth: string;

    borderTopStyle: string;
    borderRightStyle: string;
    borderBottomStyle: string;
    borderLeftStyle: string;

    borderTopColor: string;
    borderRightColor: string;
    borderBottomColor: string;
    borderLeftColor: string;

    outlineWidth: string;
    outlineStyle: string;
    outlineColor: string;

    textDecorationColor: string;
    textDecorationLine: string;

    visibility: string;
    fontSize: string;
  }

  export function from(
    message: string,
    element: Element,
    device: Device,
    context: Context = Context.empty()
  ): DistinguishableLinks {
    const style = Style.from(element, device, context);

    return DistinguishableLinks.of(
      message,
      ...([
        "color",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
        "border-left-width",
        "border-top-style",
        "border-right-style",
        "border-bottom-style",
        "border-left-style",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
        "border-left-color",
        "outline-width",
        "outline-style",
        "outline-color",
        "text-decoration-color",
        "text-decoration-line",
        "visibility",
        "font-size",
      ] as const).map((property) => style.computed(property).toString())
    );
  }
}
