import Background from "./property/background";
import BackgroundPosition from "./property/background-position";
import BackgroundRepeat from "./property/background-repeat";
import BorderBlockColor from "./property/border-block-color";
import BorderBlockEnd from "./property/border-block-end";
import BorderBlockStart from "./property/border-block-start";
import BorderBlockStyle from "./property/border-block-style";
import BorderBlock from "./property/border-block";
import BorderBlockWidth from "./property/border-block-width";
import BorderBottom from "./property/border-bottom";
import BorderColor from "./property/border-color";
import BorderImage from "./property/border-image";
import BorderInlineColor from "./property/border-inline-color";
import BorderInlineEnd from "./property/border-inline-end";
import BorderInlineStart from "./property/border-inline-start";
import BorderInlineStyle from "./property/border-inline-style";
import BorderInline from "./property/border-inline";
import BorderInlineWidth from "./property/border-inline-width";
import BorderLeft from "./property/border-left";
import BorderRadius from "./property/border-radius";
import BorderRight from "./property/border-right";
import BorderStyle from "./property/border-style";
import BorderTop from "./property/border-top";
import Border from "./property/border";
import BorderWidth from "./property/border-width";
import FlexFlow from "./property/flex-flow";
import Font from "./property/font";
import FontVariant from "./property/font-variant";
import InsetBlock from "./property/inset-block";
import InsetInline from "./property/inset-inline";
import Inset from "./property/inset";
import Margin from "./property/margin";
import Outline from "./property/outline";
import Overflow from "./property/overflow";
import TextDecoration from "./property/text-decoration";

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

  export function isName(name: string): name is Name {
    return name in shortHands;
  }

  export function get<N extends Name>(name: N): Property[N] {
    return shortHands[name];
  }
}
