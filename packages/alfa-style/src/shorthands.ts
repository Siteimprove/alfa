import Background from "./property/background.js";
import BackgroundPosition from "./property/background-position.js";
import BackgroundRepeat from "./property/background-repeat.js";
import BorderBlockColor from "./property/border-block-color.js";
import BorderBlockEnd from "./property/border-block-end.js";
import BorderBlockStart from "./property/border-block-start.js";
import BorderBlockStyle from "./property/border-block-style.js";
import BorderBlock from "./property/border-block.js";
import BorderBlockWidth from "./property/border-block-width.js";
import BorderBottom from "./property/border-bottom.js";
import BorderColor from "./property/border-color.js";
import BorderImage from "./property/border-image.js";
import BorderInlineColor from "./property/border-inline-color.js";
import BorderInlineEnd from "./property/border-inline-end.js";
import BorderInlineStart from "./property/border-inline-start.js";
import BorderInlineStyle from "./property/border-inline-style.js";
import BorderInline from "./property/border-inline.js";
import BorderInlineWidth from "./property/border-inline-width.js";
import BorderLeft from "./property/border-left.js";
import BorderRadius from "./property/border-radius.js";
import BorderRight from "./property/border-right.js";
import BorderStyle from "./property/border-style.js";
import BorderTop from "./property/border-top.js";
import Border from "./property/border.js";
import BorderWidth from "./property/border-width.js";
import FlexFlow from "./property/flex-flow.js";
import Font from "./property/font.js";
import FontVariant from "./property/font-variant.js";
import InsetBlock from "./property/inset-block.js";
import InsetInline from "./property/inset-inline.js";
import Inset from "./property/inset.js";
import Margin from "./property/margin.js";
import Outline from "./property/outline.js";
import Overflow from "./property/overflow.js";
import TextDecoration from "./property/text-decoration.js";
import type { Shorthand } from "./shorthand.js";

/**
 * @public
 */
export namespace Shorthands {
  export type Property = typeof shortHands;

  export type Name = keyof Property;

  export const shortHands = {
    background: Background,
    "background-position": BackgroundPosition,
    "background-repeat": BackgroundRepeat,
    "border-block-color": BorderBlockColor,
    "border-block-end": BorderBlockEnd,
    "border-block-start": BorderBlockStart,
    "border-block-style": BorderBlockStyle,
    "border-block": BorderBlock,
    "border-block-width": BorderBlockWidth,
    "border-bottom": BorderBottom,
    "border-color": BorderColor,
    "border-image": BorderImage,
    "border-inline-color": BorderInlineColor,
    "border-inline-end": BorderInlineEnd,
    "border-inline-start": BorderInlineStart,
    "border-inline-style": BorderInlineStyle,
    "border-inline": BorderInline,
    "border-inline-width": BorderInlineWidth,
    "border-left": BorderLeft,
    "border-radius": BorderRadius,
    "border-right": BorderRight,
    "border-style": BorderStyle,
    "border-top": BorderTop,
    border: Border,
    "border-width": BorderWidth,
    "flex-flow": FlexFlow,
    font: Font,
    "font-variant": FontVariant,
    "inset-block": InsetBlock,
    "inset-inline": InsetInline,
    inset: Inset,
    margin: Margin,
    outline: Outline,
    overflow: Overflow,
    "text-decoration": TextDecoration,
  } as const;

  export type Longhands<N extends Name> =
    Property[N] extends Shorthand<infer L> ? L : never;

  export function isName(name: string): name is Name {
    return name in shortHands;
  }

  export function get<N extends Name>(name: N): Property[N] {
    return shortHands[name];
  }
}
