import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Property, Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

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
            test(isDistinguishable(container, device), target),
            () => Outcomes.IsDistinguishable(target, device),
            () => Outcomes.IsNotDistinguishable(target, device)
          ),
          2: expectation(
            test(
              isDistinguishable(container, device, Context.hover(target)),
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
              isDistinguishable(container, device, Context.focus(target)),
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
    style: Iterable<[Property.Name, string]> = []
  ): DistinguishableLinks {
    return new DistinguishableLinks(message, Map.from(style));
  }

  private readonly _style: Map<Property.Name, string>;

  private constructor(message: string, style: Map<Property.Name, string>) {
    super(message);
    this._style = style;
  }

  public get style(): Map<Property.Name, string> {
    return this._style;
  }

  public equals(value: DistinguishableLinks): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DistinguishableLinks && value._style.equals(this._style)
    );
  }

  public toJSON(): DistinguishableLinks.JSON {
    return {
      ...super.toJSON(),
      style: this._style.toJSON(),
    };
  }
}

namespace DistinguishableLinks {
  export interface JSON extends Diagnostic.JSON {
    style: Map.JSON<Property.Name, string>;
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
      ([
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
      ] as const).map((property) => [
        property,
        style.computed(property).toString(),
      ])
    );
  }
}
