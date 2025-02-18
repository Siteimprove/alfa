import { type Ident, Keyword, List } from "@siteimprove/alfa-css";
import { Device } from "@siteimprove/alfa-device";
import { Element } from "@siteimprove/alfa-dom";
import type { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Style } from "@siteimprove/alfa-style";

const { and, not, or } = Refinement;
const {
  hasComputedStyle,
  hasInitialComputedStyle,
  isPositioned,
  isFlexOrGridChild,
} = Style;

/**
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context}
 *
 * @remarks
 * This doesn't cover the following known cases, either because we haven't
 * implemented support for the CSS property or because it's otherwise not
 * feasible to cover the case. In the future, new properties may be added that
 * also create stacking contexts. We will have to update this predicate as such
 * new properties become supported by the browsers.
 *
 * * The properties `filter`, `backdrop-filter` and `mask-border` having
 *   non-initial values: Support for the properties are not yet implemented in Alfa.
 *
 * * Elements placed into the top layer and its corresponding ::backdrop e.g.
 *   fullscreen and popover elements: It's unclear how to implement this and it's
 *   not the most important use case currently.
 *
 * * Element that has had stacking context-creating properties animated using
 *   @keyframes, with `animation-fill-mode` set to `forwards`: It's unclear how
 *   to implement this, but it is a valid case, that we should eventually support.
 *
 * @internal
 */
export function createsStackingContext(device: Device): Predicate<Element> {
  const hasZIndex = not(hasInitialComputedStyle("z-index", device));

  return or(
    // positioned with z-index:
    and(isPositioned(device, "absolute", "relative"), hasZIndex),

    // fixed or sticky:
    isPositioned(device, "fixed", "sticky"),

    // child of flex or grid:
    and(hasZIndex, isFlexOrGridChild(device)),

    // opacity < 1:
    hasComputedStyle("opacity", ({ value: opacity }) => opacity < 1, device),

    // non-initial properties:
    not(hasInitialComputedStyle("mix-blend-mode", device)),
    not(hasInitialComputedStyle("transform", device)),
    not(hasInitialComputedStyle("scale", device)),
    not(hasInitialComputedStyle("rotate", device)),
    not(hasInitialComputedStyle("translate", device)),
    not(hasInitialComputedStyle("perspective", device)),
    not(hasInitialComputedStyle("clip-path", device)),
    not(hasInitialComputedStyle("mask-clip", device)),
    not(hasInitialComputedStyle("mask-composite", device)),
    not(hasInitialComputedStyle("mask-mode", device)),
    not(hasInitialComputedStyle("mask-origin", device)),
    not(hasInitialComputedStyle("mask-position", device)),
    not(hasInitialComputedStyle("mask-repeat", device)),
    not(hasInitialComputedStyle("mask-size", device)),
    not(hasInitialComputedStyle("mask-image", device)),

    // isolation: isolate
    hasComputedStyle("isolation", ({ value }) => value === "isolate", device),

    // will-change: specifying any property that would create a stacking context
    // on non-initial value
    hasComputedStyle(
      "will-change",
      and(List.isList<Ident>, (list) =>
        list.some((ident) =>
          ident.is(
            "position",
            "z-index",
            "opacity",
            "mix-blend-mode",
            "transform",
            "scale",
            "rotate",
            "translate",
            "filter",
            "backdrop-filter",
            "perspective",
            "clip-path",
            "mask",
            "isolation",
          ),
        ),
      ),
      device,
    ),

    // contain: strict | content | layout | paint
    hasComputedStyle(
      "contain",
      (value) => {
        return Keyword.isKeyword(value)
          ? value.is("strict", "content")
          : value.layout || value.paint;
      },
      device,
    ),
  );
}
