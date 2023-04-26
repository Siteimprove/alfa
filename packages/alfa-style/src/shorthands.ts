import BackgroundPosition from "./property2/background-position";
import BackgroundRepeat from "./property2/background-repeat";
import BorderBlockColor from "./property2/border-block-color";
import BorderBlockStart from "./property2/border-block-start";
import BorderBlockStyle from "./property2/border-block-style";
import BorderBlock from "./property2/border-block";
import BorderBlockWidth from "./property2/border-block-width";
import BorderBottom from "./property2/border-bottom";
import BorderColor from "./property2/border-color";
import BorderImage from "./property2/border-image";
import BorderInlineColor from "./property2/border-inline-color";
import BorderInlineStart from "./property2/border-inline-start";
import BorderInlineStyle from "./property2/border-inline-style";
import BorderInline from "./property2/border-inline";
import BorderInlineWidth from "./property2/border-inline-width";
import BorderLeft from "./property2/border-left";
import BorderRadius from "./property2/border-radius";
import BorderRight from "./property2/border-right";
import BorderStyle from "./property2/border-style";
import BorderTop from "./property2/border-top";
import Border from "./property2/border";
import BorderWidth from "./property2/border-width";
import FlexFlow from "./property2/flex-flow";
import Font from "./property2/font";
import FontVariant from "./property2/font-variant";
import InsetBlock from "./property2/inset-block";
import InsetInline from "./property2/inset-inline";
import Inset from "./property2/inset";
import Margin from "./property2/margin";
import Outline from "./property2/outline";
import Overflow from "./property2/overflow";
import TextDecoration from "./property2/text-decoration";

export namespace Shorthands {
  export type Property = typeof shortHands;

  export type Name = keyof Property;
  export const shortHands = {
    "background-position": BackgroundPosition,
    "background-repeat": BackgroundRepeat,
    "border-block-color": BorderBlockColor,
    "border-block-start": BorderBlockStart,
    "border-block-style": BorderBlockStyle,
    "border-block": BorderBlock,
    "border-block-width": BorderBlockWidth,
    "border-bottom": BorderBottom,
    "border-color": BorderColor,
    "border-image": BorderImage,
    "border-inline-color": BorderInlineColor,
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
