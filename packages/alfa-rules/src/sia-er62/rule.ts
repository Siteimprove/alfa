import { Rule } from "@siteimprove/alfa-act";
import { DOM } from "@siteimprove/alfa-aria";
import { Array } from "@siteimprove/alfa-array";
import { Cache } from "@siteimprove/alfa-cache";
import { Color, Keyword } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element, Node, Text } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { List } from "@siteimprove/alfa-list";
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

import { expectation } from "../common/act/expectation";

import { Contrast } from "../common/diagnostic/contrast";
import { contrast } from "../common/expectation/contrast";

import { getForeground } from "../common/dom/get-colors";
import { isWhitespace } from "../common/predicate";

import { Scope, Stability, Version } from "../tags";

import {
  DistinguishingStyles,
  ElementDistinguishable,
  DistinguishingProperty,
} from "./diagnostics";

const { hasRole } = DOM;
const { isElement } = Element;
const { or, not, test, tee } = Predicate;
const { and } = Refinement;
const {
  hasBorder,
  hasBoxShadow,
  hasComputedStyle,
  hasOutline,
  hasTextDecoration,
  isVisible,
} = Style;
const { isText } = Text;

let distinguishingProperties: Map<
  Context,
  Map<Element, List<DistinguishingProperty>>
> = Map.empty();

/**
 * This version of R62 accepts differences in `font-family`, differences
 * in `cursor` (in the `hover` state), and 3:1 or more contrast with surrounding
 * text.
 *
 * These cannot be easily displayed in the current Page report:
 * * `cursor` only shows on hovering, we could have a `a:link` and `a:hover`
 *   states that look similar, but the first one is bad and the second good,
 *   resulting in confusing info;
 * * contrast with surrounding text is not shown as only link text is shown in
 *   the decorator. Additionally, we could have similar looking states but with
 *   different colors, one being good and the other bad, with little way to
 *   understand the difference.
 * * `font-family` may depend on a font that for some reason can't be loaded,
 *   so the difference wouldn't be visible.
 */
export default Rule.Atomic.of<Page, Element>({
  uri: "https://alfa.siteimprove.com/rules/sia-r62",
  requirements: [Criterion.of("1.4.1")],
  tags: [Scope.Component, Stability.Experimental, Version.of(2)],
  evaluate({ device, document }) {
    // Contains links (key) and their containing paragraph (value)
    let containers: Map<Element, Element> = Map.empty();

    return {
      applicability() {
        // Contains links (key) and the parents of the textnodes the links contain (value)
        let linkText: Map<Element, Set<Element>> = Map.empty();
        // Contains containers (key) and the parents of the text nodes
        // (not included in links) the containers have (value)
        let nonLinkText: Map<Element, Set<Element>> = Map.empty();

        gather(document, None, None);
        return getApplicableLinks();

        function gather(
          node: Node,
          container: Option<Element>,
          link: Option<Element>
        ): void {
          const isLink = hasRole(device, (role) => role.is("link"));
          const isParagraph = hasRole(device, "paragraph");

          if (isElement(node)) {
            if (container.isSome() && isLink(node)) {
              // For each link, store its containing paragraph
              containers = containers.set(node, container.get());
              link = Option.of(node);
            }

            // Otherwise, if the element is a paragraph element with non-link text
            // content then start collecting applicable elements.
            if (isParagraph(node)) {
              if (test(hasNonLinkText(device), node)) {
                // Start gathering links inside a paragraph with non-link text.
                container = Option.of(node);
              } else {
                // Stop gathering inside a paragraph without non-link text.
                container = None;
              }
            }
          } else {
            const isTextNode = test(and(isText, isVisible(device)), node);
            const parent = node.parent().filter(isElement);

            if (isTextNode && container.isSome() && parent.isSome()) {
              // For each link, store the parent of the text nodes it contains
              if (link.isSome()) {
                linkText = linkText.set(
                  link.get(),
                  linkText
                    .get(link.get())
                    .getOr(Set.empty<Element>())
                    .add(parent.get())
                );
              }
              // For each container, store the parent of the text nodes it contains
              else {
                nonLinkText = nonLinkText.set(
                  container.get(),
                  nonLinkText
                    .get(container.get())
                    .getOr(Set.empty<Element>())
                    .add(parent.get())
                );
              }
            }
          }

          const children = node.children({
            flattened: true,
            nested: true,
          });

          for (const child of children) {
            gather(child, container, link);
          }
        }

        function* getApplicableLinks(): Iterable<Element> {
          // Check if foreground is the same with the parent <p> element
          const hasDifferentForeground = (
            link: Element,
            container: Element
          ): boolean =>
            getForeground(link, device).none(
              (linkColors) =>
                // If the link has a foreground with the alpha channel less than 1 and background gradient color
                // then the rule is applicable as we can't tell for sure if it ever has the same foreground with a link
                // that might have the same foreground and gradient background, but with different gradient type or spread
                linkColors.length === 1 &&
                getForeground(container, device).some(
                  (containerColors) =>
                    // Similalry to the link, we assume the rule is applicable if the container has more than one foreground color
                    containerColors.length === 1 &&
                    linkColors[0].equals(containerColors[0])
                )
            );

          for (const [link, linkTexts] of linkText) {
            const nonLinkTexts = nonLinkText
              .get(containers.get(link).get())
              // At this point, we should always have something, still
              // safeguarding against any weird case.
              .getOr(Set.empty<Element>());

            if (
              linkTexts.some((linkElement) =>
                nonLinkTexts.some((nonLinkElement) =>
                  hasDifferentForeground(linkElement, nonLinkElement)
                )
              )
            ) {
              yield link;
            }
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
                    target,
                    device,
                    context
                  )
                    .map((isDistinguishable) => isDistinguishable(link))
                    .some((distinguishable) => distinguishable)
              );

              const distinguishableContrast = Set.from(
                nonLinkElements.flatMap((container) =>
                  Sequence.from(
                    Distinguishable.getPairwiseContrast(
                      container,
                      link,
                      device,
                      context
                    )
                  )
                )
              );

              const properties: List<DistinguishingProperty> =
                distinguishingProperties
                  .get(context)
                  .flatMap((elementMap) => elementMap.get(link))
                  .getOrElse(() => List.empty());

              return hasDistinguishableStyle
                ? Ok.of(
                    ElementDistinguishable.from(
                      link,
                      device,
                      target,
                      context,
                      properties,
                      distinguishableContrast
                    )
                  )
                : Err.of(
                    ElementDistinguishable.from(
                      link,
                      device,
                      target,
                      context,
                      properties,
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
      return (
        children
          .filter(isElement)
          .reject(hasRole(device, (role) => role.is("link")))
          // We've found nested paragraphs. While this is not really allowed by
          // HTML specs, it does happen…
          // In such a case, the inner paragraph would itself be a potential container
          // and any text in it should be registered with it, not with the outer one
          .reject(hasRole(device, "paragraph"))
          .some(hasNonLinkText)
      );
    });
  };
}

namespace Distinguishable {
  export function isDistinguishable(
    container: Element,
    target: Element,
    device: Device,
    context: Context = Context.empty()
  ): Array<Predicate<Element>> {
    let predicates: Array<
      readonly [DistinguishingProperty, Predicate<Element>]
    > = [
      // Things like text decoration and backgrounds risk blending with the
      // container element. We therefore need to check if these can be distinguished
      // from what the container element might itself set.
      ["background", hasDistinguishableBackground(container, device, context)],
      ["contrast", hasDistinguishableContrast(container, device, context)],
      ["font", hasDistinguishableFont(container, device, context)],
      [
        "text-decoration",
        hasDistinguishableTextDecoration(container, device, context),
      ],
      [
        "vertical-align",
        hasDistinguishableVerticalAlign(container, device, context),
      ],
      // We consider the mere presence of borders, box-shadows or outlines on the element as
      // distinguishable features. There's of course a risk of these blending with
      // other features of the container element, such as its background, but this
      // should hopefully not happen (too often) in practice. When it does, we
      // risk false negatives.
      ["border", hasBorder(device, context)],
      [
        "box-shadow",
        hasBoxShadow(device, context), //Checks for color != transparent and spread => 0
      ],
      ["outline", hasOutline(device, context)],
    ];

    if (context.isHovered(target)) {
      predicates = [
        ...predicates,
        ["cursor", hasDistinguishableCursor(container, device, context)],
      ];
    }

    return predicates.map(([name, predicate]) =>
      tee(predicate, (link, result) => {
        if (result) {
          let linkToProperties = distinguishingProperties
            .get(context)
            .getOr(Map.empty<Element, List<DistinguishingProperty>>());

          const properties = linkToProperties
            .get(link)
            .getOr(List.empty<DistinguishingProperty>())
            .append(name);

          distinguishingProperties = distinguishingProperties.set(
            context,
            linkToProperties.set(link, properties)
          );
        }
      })
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

    return (link: Element) => {
      const color = Style.from(link, device, context).computed(
        "background-color"
      ).value;

      const image = Style.from(link, device, context).computed(
        "background-image"
      ).value;

      // If the background is fully transparent or there is no `background-image` set on the link,
      // we assume it will end up being the same as the container. Intermediate backgrounds may change
      // that, but these would need to be set on ancestor of the link and of
      // no non-link text, so will be caught in one of the other comparisons.
      const hasBackground = !(
        Keyword.isKeyword(image.values[0]) &&
        image.values[0].equals(Keyword.of("none")) &&
        Color.isTransparent(color)
      );

      // Any difference in `background-image` is considered enough. If different
      // `background-image` ultimately yield the same background (e.g. the same
      // image at two different URLs), this creates false negatives.
      // When there is no `background-image` set on the link, we consider it to be the same as the container's
      const hasDifferentBackgroundFromContainer = !(
        color.equals(colorReference) && image.equals(imageReference)
      );

      return hasDifferentBackgroundFromContainer && hasBackground;
    };
  }

  export function getPairwiseContrast(
    container: Element,
    link: Element,
    device: Device,
    context: Context = Context.empty()
  ): ReadonlyArray<Contrast.Pairing<["container", "link"]>> {
    return getForeground(container, device, context)
      .map((containerColors) => [
        ...Array.flatMap(containerColors, (containerColor) =>
          getForeground(link, device, context)
            .map((linkColors) =>
              Array.map(linkColors, (linkColor) =>
                Contrast.Pairing.of<["container", "link"]>(
                  ["container", containerColor],
                  ["link", linkColor],
                  contrast(containerColor, linkColor)
                )
              )
            )
            .getOr([])
        ),
      ])
      .getOr([]);
  }

  function hasDistinguishableContrast(
    container: Element,
    device: Device,
    context: Context = Context.empty()
  ): Predicate<Element> {
    return (link) => {
      for (const contrastPairing of getPairwiseContrast(
        container,
        link,
        device,
        context
      )) {
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

  function hasDistinguishableCursor(
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
