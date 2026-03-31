import Background from "./property/background.ts";
import BackgroundPosition from "./property/background-position.ts";
import BackgroundRepeat from "./property/background-repeat.ts";
import BorderBlockColor from "./property/border-block-color.ts";
import BorderBlockEnd from "./property/border-block-end.ts";
import BorderBlockStart from "./property/border-block-start.ts";
import BorderBlockStyle from "./property/border-block-style.ts";
import BorderBlock from "./property/border-block.ts";
import BorderBlockWidth from "./property/border-block-width.ts";
import BorderBottom from "./property/border-bottom.ts";
import BorderColor from "./property/border-color.ts";
import BorderImage from "./property/border-image.ts";
import BorderInlineColor from "./property/border-inline-color.ts";
import BorderInlineEnd from "./property/border-inline-end.ts";
import BorderInlineStart from "./property/border-inline-start.ts";
import BorderInlineStyle from "./property/border-inline-style.ts";
import BorderInline from "./property/border-inline.ts";
import BorderInlineWidth from "./property/border-inline-width.ts";
import BorderLeft from "./property/border-left.ts";
import BorderRadius from "./property/border-radius.ts";
import BorderRight from "./property/border-right.ts";
import BorderStyle from "./property/border-style.ts";
import BorderTop from "./property/border-top.ts";
import Border from "./property/border.ts";
import BorderWidth from "./property/border-width.ts";
import FlexFlow from "./property/flex-flow.ts";
import Font from "./property/font.ts";
import FontVariant from "./property/font-variant.ts";
import InsetBlock from "./property/inset-block.ts";
import InsetInline from "./property/inset-inline.ts";
import Inset from "./property/inset.ts";
import Margin from "./property/margin.ts";
import Mask from "./property/mask.ts";
import Outline from "./property/outline.ts";
import Overflow from "./property/overflow.ts";
import TextDecoration from "./property/text-decoration.ts";
import TextWrap from "./property/text-wrap.ts";
import WhiteSpace from "./property/white-space.ts";

import type { Shorthand } from "./shorthand.ts";

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
    mask: Mask,
    outline: Outline,
    overflow: Overflow,
    "text-wrap": TextWrap,
    "text-decoration": TextDecoration,
    "white-space": WhiteSpace,
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
