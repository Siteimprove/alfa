import { type Parser as CSSParser } from "../../syntax/index.js";

import { Keyword } from "../textual/keyword.js";
import { CSS4Color } from "./css4-color.js";

/**
 * {@link https://drafts.csswg.org/css-color-4/#css-system-colors}
 *
 * @public
 */
export type System = Keyword<System.Keyword>;

/**
 * @public
 */
export namespace System {
  const keywords = [
    "accentcolor",
    "accentcolortext",
    "activetext",
    "buttonborder",
    "buttonface",
    "buttontext",
    "canvas",
    "canvastext",
    "field",
    "fieldtext",
    "graytext",
    "highlight",
    "highlighttext",
    "linktext",
    "mark",
    "marktext",
    "selecteditem",
    "selecteditemtext",
    "visitedtext",
  ] as const;

  export type Keyword = (typeof keywords)[number];

  /*
   * The computed value of System colors depends on the user agent.
   * We should ultimately use browser specific values. In the meantime, we default
   * to Chrome's values as it is the most widely used UA.
   */

  // Retrieved from https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/system-color
  // On January 2026.
  const resolvedChrome: { [K in Keyword]: CSS4Color } = {
    // This is invalid in Chrome, so we use Firefox's values.
    accentcolor: CSS4Color.of("rgb(0, 96, 233)").getUnsafe().resolve(),
    // This is invalid in Chrome, so we use Firefox's values.
    accentcolortext: CSS4Color.of("rgb(255, 255, 255)").getUnsafe().resolve(),
    activetext: CSS4Color.of("rgb(0, 102, 204)").getUnsafe().resolve(),
    buttonborder: CSS4Color.of("rgb(0, 0, 0)").getUnsafe().resolve(),
    buttonface: CSS4Color.of("rgb(240, 240, 240)").getUnsafe().resolve(),
    buttontext: CSS4Color.of("rgb(0, 0, 0)").getUnsafe().resolve(),
    canvas: CSS4Color.of("rgb(255, 255, 255)").getUnsafe().resolve(),
    canvastext: CSS4Color.of("rgb(0, 0, 0)").getUnsafe().resolve(),
    field: CSS4Color.of("rgb(255, 255, 255)").getUnsafe().resolve(),
    fieldtext: CSS4Color.of("rgb(0, 0, 0)").getUnsafe().resolve(),
    graytext: CSS4Color.of("rgb(109, 109, 109)").getUnsafe().resolve(),
    highlight: CSS4Color.of("rgb(0, 120, 212)").getUnsafe().resolve(),
    highlighttext: CSS4Color.of("rgb(255, 255, 255)").getUnsafe().resolve(),
    linktext: CSS4Color.of("rgb(0, 102, 204)").getUnsafe().resolve(),
    mark: CSS4Color.of("rgb(255, 255, 0)").getUnsafe().resolve(),
    marktext: CSS4Color.of("rgb(0, 0, 0)").getUnsafe().resolve(),
    selecteditem: CSS4Color.of("rgb(25, 103, 210)").getUnsafe().resolve(),
    selecteditemtext: CSS4Color.of("rgb(255, 255, 255)").getUnsafe().resolve(),
    visitedtext: CSS4Color.of("rgb(0, 102, 204)").getUnsafe().resolve(),
  };

  export const resolve = (system: Keyword) => resolvedChrome[system];

  /**
   * {@link https://drafts.csswg.org/css-color/#typedef-system-color}
   */
  export const parse: CSSParser<System> = Keyword.parse(...keywords);
}
