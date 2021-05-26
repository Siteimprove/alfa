import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Property, Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import * as json from "@siteimprove/alfa-json";

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

        const defaultStyle = isDistinguishable(target, container, device);
        const hoverStyle = isDistinguishable(
          target,
          container,
          device,
          Context.hover(target)
        );
        const focusStyle = isDistinguishable(
          target,
          container,
          device,
          Context.focus(target)
        );

        return {
          1: expectation(
            defaultStyle.isOk() && hoverStyle.isOk() && focusStyle.isOk(),
            () =>
              Outcomes.IsDistinguishable(defaultStyle, hoverStyle, focusStyle),
            () =>
              Outcomes.IsNotDistinguishable(
                defaultStyle,
                hoverStyle,
                focusStyle
              )
          ),
        };
      },
    };
  },
});

export namespace Outcomes {
  // We could tweak typing to ensure that isDistinguishable only accepts Ok and
  // that isNotDistinguishable has at least one Err.
  // This would requires changing the expectation since it does not refine
  // and is thus probably not worth the effort.
  export const IsDistinguishable = (
    defaultStyle: Result<ComputedStyles>,
    hoverStyle: Result<ComputedStyles>,
    focusStyle: Result<ComputedStyles>
  ) =>
    Ok.of(
      DistinguishingStyles.of(
        `The link is distinguishable from the surrounding text`,
        defaultStyle,
        hoverStyle,
        focusStyle
      )
    );

  export const IsNotDistinguishable = (
    defaultStyle: Result<ComputedStyles>,
    hoverStyle: Result<ComputedStyles>,
    focusStyle: Result<ComputedStyles>
  ) =>
    Err.of(
      DistinguishingStyles.of(
        `The link is not distinguishable from the surrounding text`,
        defaultStyle,
        hoverStyle,
        focusStyle
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
  target: Element,
  container: Element,
  device: Device,
  context: Context = Context.empty()
): Result<ComputedStyles> {
  const style = ComputedStyles.from(target, device, context);

  return test(
    or(
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
    ),
    target
  )
    ? Ok.of(style)
    : Err.of(style);
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

type Name = Property.Name | Property.Shorthand.Name;

export class ComputedStyles implements Equatable, Serializable {
  public static of(
    style: Iterable<readonly [Name, string]> = []
  ): ComputedStyles {
    return new ComputedStyles(Map.from(style));
  }

  private readonly _style: Map<Name, string>;

  private constructor(style: Map<Name, string>) {
    this._style = style;
  }

  public get style(): Map<Name, string> {
    return this._style;
  }

  public equals(value: ComputedStyles): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof ComputedStyles && value._style.equals(this._style);
  }

  public toJSON(): ComputedStyles.JSON {
    return {
      style: this._style.toJSON(),
    };
  }
}

export namespace ComputedStyles {
  export interface JSON {
    [key: string]: json.JSON;
    style: Map.JSON<Name, string>;
  }

  export function from(
    element: Element,
    device: Device,
    context: Context = Context.empty()
  ): ComputedStyles {
    const style = Style.from(element, device, context);

    function fourValuesShorthand(
      postfix: "color" | "style" | "width"
    ): readonly [Name, string] {
      const shorthand = `border-${postfix}` as const;

      function getLongHand(side: "top" | "right" | "bottom" | "left"): string {
        return style.computed(`border-${side}-${postfix}` as const).toString();
      }

      const top = getLongHand("top");
      let right = getLongHand("right");
      let bottom = getLongHand("bottom");
      let left = getLongHand("left");

      if (left === right) {
        left = "";
        if (bottom === top) {
          bottom = "";
          if (right === top) {
            right = "";
          }
        }
      }

      return [shorthand, `${top} ${right} ${bottom} ${left}`.trim()];
    }

    const shorthands = (["color", "style", "width"] as const).map((postfix) =>
      fourValuesShorthand(postfix)
    );

    const longhands = ([
      "background-color",
      "color",
      "font-weight",
      "outline-width",
      "outline-style",
      "outline-color",
      "text-decoration-color",
      "text-decoration-line",
    ] as const).map(
      (property) => [property, style.computed(property).toString()] as const
    );

    return ComputedStyles.of([...shorthands, ...longhands]);
  }
}

export class DistinguishingStyles extends Diagnostic {
  public static of(
    message: string,
    defaultStyle: Result<ComputedStyles> = Err.of(ComputedStyles.of([])),
    hoverStyle: Result<ComputedStyles> = Err.of(ComputedStyles.of([])),
    focusStyle: Result<ComputedStyles> = Err.of(ComputedStyles.of([]))
  ): DistinguishingStyles {
    return new DistinguishingStyles(
      message,
      defaultStyle,
      hoverStyle,
      focusStyle
    );
  }

  private readonly _defaultStyle: Result<ComputedStyles>;
  private readonly _hoverStyle: Result<ComputedStyles>;
  private readonly _focusStyle: Result<ComputedStyles>;

  private constructor(
    message: string,
    defaultStyle: Result<ComputedStyles>,
    hoverStyle: Result<ComputedStyles>,
    focusStyle: Result<ComputedStyles>
  ) {
    super(message);
    this._defaultStyle = defaultStyle;
    this._hoverStyle = hoverStyle;
    this._focusStyle = focusStyle;
  }

  public get defaultStyle(): Result<ComputedStyles> {
    return this._defaultStyle;
  }

  public get hoverStyle(): Result<ComputedStyles> {
    return this._hoverStyle;
  }

  public get focusStyle(): Result<ComputedStyles> {
    return this._focusStyle;
  }

  public equals(value: DistinguishingStyles): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DistinguishingStyles &&
      value._defaultStyle.equals(this._defaultStyle) &&
      value._hoverStyle.equals(this._hoverStyle) &&
      value._focusStyle.equals(this._focusStyle)
    );
  }

  public toJSON(): DistinguishingStyles.JSON {
    return {
      ...super.toJSON(),
      defaultStyle: this._defaultStyle.toJSON(),
      hoverStyle: this._hoverStyle.toJSON(),
      focusStyle: this._focusStyle.toJSON(),
    };
  }
}

export namespace DistinguishingStyles {
  export interface JSON extends Diagnostic.JSON {
    defaultStyle: Result.JSON<ComputedStyles>;
    hoverStyle: Result.JSON<ComputedStyles>;
    focusStyle: Result.JSON<ComputedStyles>;
  }
}
