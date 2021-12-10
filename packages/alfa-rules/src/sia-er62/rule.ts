import { Rule } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Color } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Map } from "@siteimprove/alfa-map";
import { Option, None } from "@siteimprove/alfa-option";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Err, Ok, Result } from "@siteimprove/alfa-result";
import { Context } from "@siteimprove/alfa-selector";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";
import { Criterion } from "@siteimprove/alfa-wcag";
import { Page } from "@siteimprove/alfa-web";

import { Contrast } from "../../src/common/diagnostic/contrast";
import { expectation } from "../common/expectation";
import { contrast } from "../common/expectation/contrast";
import { getForeground } from "../common/expectation/get-colors";
import {
  hasBorder,
  hasComputedStyle,
  hasOutline,
  hasRole,
  hasTextDecoration,
  isVisible,
  isWhitespace,
} from "../common/predicate";
import { Stability } from "../tags/stability";

import { DistinguishingStyles, ElementDistinguishable } from "./diagnostics";

const { isElement } = Element;
const { isText } = Text;
const { or, not, test } = Predicate;
const { and } = Refinement;

const pairwiseContrastCache = Cache.empty<
  Element,
  Cache<Element, ReadonlyArray<Contrast.Pairing>>
>();

/**
 * This version of R62 accepts differences in `font-family`, and differences
 * in `cursor` (in the `hover` state).
 * These cannot be easily displayed in the current Page report:
 * * `cursor` only shows on hovering, we could have a `a:link` and `a:hover`
 *   states that look similar, but the first one is bad and the second good,
 *   resulting in confusing info;
 * * `font-family` may depend on a font that for some reason can't be loaded,
 *   so the difference wouldn't be visible.
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r62#experimental",
  requirements: [Criterion.of("1.4.1")],
  tags: [Stability.Experimental],
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

        const hasDistinguishingStyle = (context: Context = Context.empty()) =>
          Set.from(
            linkElements.map((link) => {
              // If the link element is distinguishable from at least one
              // non-link element, this is good enough.
              // Note that ACT rules draft requires the link-element to be
              // distinguishable from *all* non-link elements in order to be good.
              const hasDistinguishableStyle = nonLinkElements.some(
                (container) =>
                  Distinguishable.isDistinguishable(
                    container,
                    device,
                    context
                  )(link) ||
                  (context.isHovered(target) &&
                    Distinguishable.hasDistinguishableCursor(
                      container,
                      device,
                      context
                    )(link))
              );

              const distinguishableContrast = Set.from(
                nonLinkElements.flatMap((container) =>
                  Sequence.from(
                    pairwiseContrastCache
                      .get(container, Cache.empty)
                      .get(link, () =>
                        Distinguishable.getPairwiseContrast(
                          container,
                          link,
                          device,
                          context
                        )
                      )
                  )
                )
              ).toArray();

              return hasDistinguishableStyle
                ? Ok.of(
                    ElementDistinguishable.of(
                      ElementDistinguishable.serialise(
                        link,
                        device,
                        target,
                        context
                      ),
                      distinguishableContrast
                    )
                  )
                : Err.of(
                    ElementDistinguishable.of(
                      ElementDistinguishable.serialise(
                        link,
                        device,
                        target,
                        context
                      ),
                      distinguishableContrast
                    )
                  );
            })
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
    defaultStyles: Iterable<Result<ElementDistinguishable>>,
    hoverStyles: Iterable<Result<ElementDistinguishable>>,
    focusStyles: Iterable<Result<ElementDistinguishable>>
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
    defaultStyles: Iterable<Result<ElementDistinguishable>>,
    hoverStyles: Iterable<Result<ElementDistinguishable>>,
    focusStyles: Iterable<Result<ElementDistinguishable>>
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

      // If we've found text with more than whitespaces, we're done.
      if (
        children.some(
          and(
            isText,
            and<Text>(isVisible(device), (text) => !isWhitespace(text.data))
          )
        )
      ) {
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

namespace Distinguishable {
  export function isDistinguishable(
    container: Element,
    device: Device,
    context: Context = Context.empty()
  ): Predicate<Element> {
    return or(
      // Things like text decoration and backgrounds risk blending with the
      // container element. We therefore need to check if these can be distinguished
      // from what the container element might itself set.
      hasDistinguishableBackground(container, device, context),
      hasDistinguishableContrast(container, device, context),
      hasDistinguishableFont(container, device, context),
      hasDistinguishableTextDecoration(container, device, context),
      hasDistinguishableVerticalAlign(container, device, context),
      // We consider the mere presence of borders or outlines on the element as
      // distinguishable features. There's of course a risk of these blending with
      // other features of the container element, such as its background, but this
      // should hopefully not happen (too often) in practice. When it does, we
      // risk false negatives.
      hasBorder(device, context),
      hasOutline(device, context)
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
   * This predicate currently only considers `background-color` and
   * `background-image` as a possibly distinguishable background. Other
   * `background-*` properties should ideally also be considered.
   *
   * Additionally, this predicate do not handle transparency in the topmost layer.
   * The exact same (partly transparent) `background-color` or `background-image`
   * could be on top of a different (opaque) background and thus creates a
   * difference. However, in these cases the (lower layer) distinguishing
   * background would be on an ancestor of the link but of no non-link text (in
   * order to be distinguishing), so should be found when looking at the ancestors
   * of the link.
   *
   * Lastly, this does not account for absolutely positioned backgrounds from
   * random nodes in the DOM. Using these to push an image below links in
   * paragraph sounds so crazy (from a sheer code maintenance point of view) that
   * this hopefully won't be a problem.
   */
  function hasDistinguishableBackground(
    container: Element,
    device: Device,
    context?: Context
  ): Predicate<Element> {
    const colorReference = Style.from(container, device, context).computed(
      "background-color"
    ).value;

    const imageReference = Style.from(container, device, context).computed(
      "background-image"
    ).value;

    return or(
      hasComputedStyle(
        "background-color",
        not(
          // If the background is fully transparent, we assume it will end up
          // being the same as the container. Intermediate backgrounds may change
          // that, but these would need to be set on ancestor of the link and of
          // no non-link text, so will be caught in one of the other comparisons.
          (color) => Color.isTransparent(color) || color.equals(colorReference)
        ),
        device,
        context
      ),
      // Any difference in `background-image` is considered enough. If different
      // `background-image` ultimately yield the same background (e.g. the same
      // image at two different URLs), this creates false negatives.
      hasComputedStyle(
        "background-image",
        not((image) => image.equals(imageReference)),
        device,
        context
      )
    );
  }

  export function getPairwiseContrast(
    container: Element,
    link: Element,
    device: Device,
    context?: Context
  ): ReadonlyArray<Contrast.Pairing> {
    return getForeground(container, device, context)
      .map((containerColors) => [
        ...Array.flatMap(containerColors, (containerColor) =>
          getForeground(link, device, context)
            .map((linkColors) =>
              Array.map(linkColors, (linkColor) => {
                return Contrast.Pairing.of(
                  containerColor,
                  linkColor,
                  contrast(containerColor, linkColor)
                );
              })
            )
            .getOr([])
        ),
      ])
      .getOr([]);
  }

  function hasDistinguishableContrast(
    container: Element,
    device: Device,
    context?: Context
  ): Predicate<Element> {
    return (link) => {
      const contrastPairings = pairwiseContrastCache
        .get(container, Cache.empty)
        .get(link, () => getPairwiseContrast(container, link, device, context));
      for (const contrastPairing of contrastPairings) {
        // If at least one of the contrast values are bigger than the threshold, the link is marked distinguisable
        if (contrastPairing.contrast >= 3) {
          return true;
        }
      }
      return false;
    };
  }

  /**
   * Check if an element has a different font weight or family than its container.
   *
   * This is brittle and imperfect but removes a strong pain point until we find
   * a better solution.
   */

  function hasDistinguishableFont(
    container: Element,
    device: Device,
    context?: Context
  ): Predicate<Element> {
    const style = Style.from(container, device, context);

    const referenceWeight = style.computed("font-weight").value;
    const referenceFamily = Option.from(
      style.computed("font-family").value.values[0]
    );

    return or(
      hasComputedStyle(
        "font-weight",
        not((weight) => weight.equals(referenceWeight)),
        device,
        context
      ),
      hasComputedStyle(
        "font-family",
        not((family) => Option.from(family.values[0]).equals(referenceFamily)),
        device,
        context
      )
    );
  }

  function hasDistinguishableVerticalAlign(
    container: Element,
    device: Device,
    context?: Context
  ): Predicate<Element> {
    const reference = Style.from(container, device, context).computed(
      "vertical-align"
    ).value;

    return hasComputedStyle(
      "vertical-align",
      not((alignment) => alignment.equals(reference)),
      device,
      context
    );
  }

  export function hasDistinguishableCursor(
    container: Element,
    device: Device,
    context?: Context
  ): Predicate<Element> {
    // Checking if there is a custom cursor, otherwise grabbing the built-in
    function getFirstCursor(style: Style.Computed<"cursor">) {
      return style.values[0].values.length !== 0
        ? style.values[0].values[0]
        : style.values[1];
    }
    const containerCursorStyle = Style.from(
      container,
      device,
      context
    ).computed("cursor").value;

    // We assume that the first custom cursor, if any, will never fail to load
    // and thus don't try to default further.
    const reference = getFirstCursor(containerCursorStyle);

    return hasComputedStyle(
      "cursor",
      not((cursor) => getFirstCursor(cursor).equals(reference)),
      device,
      context
    );
  }
}
