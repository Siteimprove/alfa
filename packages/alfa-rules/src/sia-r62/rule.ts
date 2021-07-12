import { Rule, Diagnostic } from "@siteimprove/alfa-act";
import { Cache } from "@siteimprove/alfa-cache";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
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
const { or, not, test } = Predicate;
const { and } = Refinement;

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
        const nonLinkElements = containers
          .get(target)
          .get()
          .inclusiveDescendants({
            flattened: true,
            nested: true,
          })
          .filter(and(isElement, hasNonLinkText(device)));

        const linkElements = target
          // All descendants of the link.
          .inclusiveDescendants({
            flattened: true,
            nested: true,
          })
          .filter(isElement)
          // Plus those ancestors who don't include non-link text.
          .concat(
            target
              .ancestors({
                flattened: true,
                nested: true,
              })
              .takeWhile(and(isElement, not(hasNonLinkText(device))))
          );

        const hasDistinguishingStyle = (context?: Context) =>
          Set.from(
            linkElements.map((link) =>
              // If the link element is distinguishable from at least one
              // non-link element, this is good enough.
              // Note that ACT rules draft requires the link-element to be
              // distinguishable from *all* non-link elements in order to be good.
              nonLinkElements.some((container) =>
                isDistinguishable(container, device, context)(link)
              )
                ? Ok.of(ComputedStyles.from(link, device, context))
                : Err.of(ComputedStyles.from(link, device, context))
            )
          )
            .toArray()
            // sort the Ok before the Err, relative order doesn't matter.
            .sort((a, b) => (b.isOk() ? 1 : -1));

        // The context needs to be set on the *target*, not on its ancestors
        // or descendants
        const isDefaultDistinguishable = hasDistinguishingStyle();

        const isHoverDistinguishable = hasDistinguishingStyle(
          Context.hover(target)
        );

        const isFocusDistinguishable = hasDistinguishingStyle(
          Context.focus(target)
        );

        return {
          1: expectation(
            // If at least one link element is good, this is enough. The sorting
            // guarantees it is first in the array.
            isDefaultDistinguishable[0].isOk() &&
              isHoverDistinguishable[0].isOk() &&
              isFocusDistinguishable[0].isOk(),
            () =>
              Outcomes.IsDistinguishable(
                isDefaultDistinguishable,
                isHoverDistinguishable,
                isFocusDistinguishable
              ),
            () =>
              Outcomes.IsNotDistinguishable(
                isDefaultDistinguishable,
                isHoverDistinguishable,
                isFocusDistinguishable
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
    defaultStyles: Iterable<Result<ComputedStyles>>,
    hoverStyles: Iterable<Result<ComputedStyles>>,
    focusStyles: Iterable<Result<ComputedStyles>>
  ) =>
    Ok.of(
      DistinguishingStyles.of(
        `The link is distinguishable from the surrounding text`,
        defaultStyles,
        hoverStyles,
        focusStyles
      )
    );

  export const IsNotDistinguishable = (
    defaultStyles: Iterable<Result<ComputedStyles>>,
    hoverStyles: Iterable<Result<ComputedStyles>>,
    focusStyles: Iterable<Result<ComputedStyles>>
  ) =>
    Err.of(
      DistinguishingStyles.of(
        `The link is not distinguishable from the surrounding text`,
        defaultStyles,
        hoverStyles,
        focusStyles
      )
    );
}

const hasNonLinkTextCache = Cache.empty<Element, boolean>();

function hasNonLinkText(device: Device): Predicate<Element> {
  return function hasNonLinkText(element) {
    return hasNonLinkTextCache.get(element, () => {
      //  If we are already below a link, escape.
      if (
        element
          .inclusiveAncestors({
            flattened: true,
          })
          .some(
            and(
              isElement,
              hasRole(device, (role) => role.is("link"))
            )
          )
      ) {
        return false;
      }

      const children = element.children({
        flattened: true,
      });

      // If we've found text, we're done.
      if (children.some(and(isText, isVisible(device)))) {
        return true;
      }

      // Otherwise, go down.
      return children
        .filter(isElement)
        .reject(hasRole(device, (role) => role.is("link")))
        .some(hasNonLinkText);
    });
  };
}

function isDistinguishable(
  container: Element,
  device: Device,
  context: Context = Context.empty()
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
 * a better solution.
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

export class ComputedStyles implements Equatable, Hashable, Serializable {
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

  public hash(hash: Hash): void {
    this._style.hash(hash);
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

    // Trying to reduce the footprint of the result by exporting shorthands
    // rather than longhands, and avoiding to export values that are the same
    // as the initial value of the property.
    function fourValuesShorthand(
      postfix: "color" | "style" | "width"
    ): readonly [Name, string] {
      const shorthand = `border-${postfix}` as const;

      function getLongHand(side: "top" | "right" | "bottom" | "left"): string {
        return style.computed(`border-${side}-${postfix}` as const).toString();
      }

      let top = getLongHand("top");
      let right = getLongHand("right");
      let bottom = getLongHand("bottom");
      let left = getLongHand("left");

      if (left === right) {
        left = "";
        if (bottom === top) {
          bottom = "";
          if (right === top) {
            right = "";
            if (
              top ===
              Property.get(`border-top-${postfix}` as const).initial.toString()
            ) {
              top = "";
            }
          }
        }
      }

      return [shorthand, `${top} ${right} ${bottom} ${left}`.trim()];
    }

    const shorthands = (["color", "style", "width"] as const).map((postfix) =>
      fourValuesShorthand(postfix)
    );

    function longhand(name: Property.Name): string {
      const property = style.computed(name).toString();

      return property === Property.get(name).initial.toString() ? "" : property;
    }

    const outline = `${longhand("outline-color")} ${longhand(
      "outline-style"
    )} ${longhand("outline-width")}`.trim();

    // While text-decoration-style and text-decoration-thickness are not
    // important for deciding if there is one, but they are important for
    // rendering the link with the correct styling.
    const textDecoration = `${longhand("text-decoration-line")} ${longhand(
      "text-decoration-color"
    )} ${longhand("text-decoration-style")} ${longhand(
      "text-decoration-thickness"
    )}`.trim();

    const longhands = (
      ["background-color", "color", "font-weight"] as const
    ).map((property) => [property, longhand(property)] as const);

    return ComputedStyles.of(
      [
        ...shorthands,
        ...longhands,
        ["outline", outline] as const,
        ["text-decoration", textDecoration] as const,
      ].filter(([_, value]) => value !== "")
    );
  }
}

export class DistinguishingStyles extends Diagnostic {
  public static of(
    message: string,
    defaultStyles: Iterable<Result<ComputedStyles>> = Sequence.empty(),
    hoverStyles: Iterable<Result<ComputedStyles>> = Sequence.empty(),
    focusStyles: Iterable<Result<ComputedStyles>> = Sequence.empty()
  ): DistinguishingStyles {
    return new DistinguishingStyles(
      message,
      Sequence.from(defaultStyles),
      Sequence.from(hoverStyles),
      Sequence.from(focusStyles)
    );
  }

  private readonly _defaultStyles: Sequence<Result<ComputedStyles>>;
  private readonly _hoverStyles: Sequence<Result<ComputedStyles>>;
  private readonly _focusStyles: Sequence<Result<ComputedStyles>>;

  private constructor(
    message: string,
    defaultStyles: Sequence<Result<ComputedStyles>>,
    hoverStyles: Sequence<Result<ComputedStyles>>,
    focusStyles: Sequence<Result<ComputedStyles>>
  ) {
    super(message);
    this._defaultStyles = defaultStyles;
    this._hoverStyles = hoverStyles;
    this._focusStyles = focusStyles;
  }

  public get defaultStyles(): Iterable<Result<ComputedStyles>> {
    return this._defaultStyles;
  }

  public get hoverStyles(): Iterable<Result<ComputedStyles>> {
    return this._hoverStyles;
  }

  public get focusStyles(): Iterable<Result<ComputedStyles>> {
    return this._focusStyles;
  }

  public equals(value: DistinguishingStyles): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof DistinguishingStyles &&
      value._defaultStyles.equals(this._defaultStyles) &&
      value._hoverStyles.equals(this._hoverStyles) &&
      value._focusStyles.equals(this._focusStyles)
    );
  }

  public toJSON(): DistinguishingStyles.JSON {
    return {
      ...super.toJSON(),
      defaultStyle: this._defaultStyles.toJSON(),
      hoverStyle: this._hoverStyles.toJSON(),
      focusStyle: this._focusStyles.toJSON(),
    };
  }
}

export namespace DistinguishingStyles {
  export interface JSON extends Diagnostic.JSON {
    defaultStyle: Sequence.JSON<Result<ComputedStyles>>;
    hoverStyle: Sequence.JSON<Result<ComputedStyles>>;
    focusStyle: Sequence.JSON<Result<ComputedStyles>>;
  }
}
