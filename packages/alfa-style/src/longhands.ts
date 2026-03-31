import { Refinement } from "@siteimprove/alfa-refinement";
import type { Longhand } from "./longhand.ts";

import BackgroundAttachment from "./property/background-attachment.ts";
import BackgroundClip from "./property/background-clip.ts";
import BackgroundColor from "./property/background-color.ts";
import BackgroundImage from "./property/background-image.ts";
import BackgroundOrigin from "./property/background-origin.ts";
import BackgroundPositionX from "./property/background-position-x.ts";
import BackgroundPositionY from "./property/background-position-y.ts";
import BackgroundRepeatX from "./property/background-repeat-x.ts";
import BackgroundRepeatY from "./property/background-repeat-y.ts";
import BackgroundSize from "./property/background-size.ts";
import BorderBlockEndColor from "./property/border-block-end-color.ts";
import BorderBlockEndStyle from "./property/border-block-end-style.ts";
import BorderBlockEndWidth from "./property/border-block-end-width.ts";
import BorderBlockStartColor from "./property/border-block-start-color.ts";
import BorderBlockStartStyle from "./property/border-block-start-style.ts";
import BorderBlockStartWidth from "./property/border-block-start-width.ts";
import BorderBottomColor from "./property/border-bottom-color.ts";
import BorderBottomLeftRadius from "./property/border-bottom-left-radius.ts";
import BorderBottomRightRadius from "./property/border-bottom-right-radius.ts";
import BorderBottomStyle from "./property/border-bottom-style.ts";
import BorderBottomWidth from "./property/border-bottom-width.ts";
import BorderCollapse from "./property/border-collapse.ts";
import BorderEndEndRadius from "./property/border-end-end-radius.ts";
import BorderEndStartRadius from "./property/border-end-start-radius.ts";
import BorderImageOutset from "./property/border-image-outset.ts";
import BorderImageRepeat from "./property/border-image-repeat.ts";
import BorderImageSlice from "./property/border-image-slice.ts";
import BorderImageSource from "./property/border-image-source.ts";
import BorderImageWidth from "./property/border-image-width.ts";
import BorderInlineEndColor from "./property/border-inline-end-color.ts";
import BorderInlineEndStyle from "./property/border-inline-end-style.ts";
import BorderInlineEndWidth from "./property/border-inline-end-width.ts";
import BorderInlineStartColor from "./property/border-inline-start-color.ts";
import BorderInlineStartStyle from "./property/border-inline-start-style.ts";
import BorderInlineStartWidth from "./property/border-inline-start-width.ts";
import BorderLeftColor from "./property/border-left-color.ts";
import BorderLeftStyle from "./property/border-left-style.ts";
import BorderLeftWidth from "./property/border-left-width.ts";
import BorderRightColor from "./property/border-right-color.ts";
import BorderRightStyle from "./property/border-right-style.ts";
import BorderRightWidth from "./property/border-right-width.ts";
import BorderStartEndRadius from "./property/border-start-end-radius.ts";
import BorderStartStartRadius from "./property/border-start-start-radius.ts";
import BorderTopColor from "./property/border-top-color.ts";
import BorderTopLeftRadius from "./property/border-top-left-radius.ts";
import BorderTopRightRadius from "./property/border-top-right-radius.ts";
import BorderTopStyle from "./property/border-top-style.ts";
import BorderTopWidth from "./property/border-top-width.ts";
import Bottom from "./property/bottom.ts";
import BoxShadow from "./property/box-shadow.ts";
import ClipPath from "./property/clip-path.ts";
import Clip from "./property/clip.ts";
import Color from "./property/color.ts";
import Contain from "./property/contain.ts";
import ContainerType from "./property/container-type.ts";
import Cursor from "./property/cursor.ts";
import Display from "./property/display.ts";
import FlexDirection from "./property/flex-direction.ts";
import FlexWrap from "./property/flex-wrap.ts";
import Float from "./property/float.ts";
import FontFamily from "./property/font-family.ts";
import FontSize from "./property/font-size.ts";
import FontStretch from "./property/font-stretch.ts";
import FontStyle from "./property/font-style.ts";
import FontVariantCaps from "./property/font-variant-caps.ts";
import FontVariantEastAsian from "./property/font-variant-east-asian.ts";
import FontVariantLigatures from "./property/font-variant-ligatures.ts";
import FontVariantNumeric from "./property/font-variant-numeric.ts";
import FontVariantPosition from "./property/font-variant-position.ts";
import FontWeight from "./property/font-weight.ts";
import Height from "./property/height.ts";
import Hyphens from "./property/hyphens.ts";
import InsetBlockEnd from "./property/inset-block-end.ts";
import InsetBlockStart from "./property/inset-block-start.ts";
import InsetInlineEnd from "./property/inset-inline-end.ts";
import InsetInlineStart from "./property/inset-inline-start.ts";
import Isolation from "./property/isolation.ts";
import Left from "./property/left.ts";
import LetterSpacing from "./property/letter-spacing.ts";
import LineBreak from "./property/line-break.ts";
import LineHeight from "./property/line-height.ts";
import MarginBottom from "./property/margin-bottom.ts";
import MarginLeft from "./property/margin-left.ts";
import MarginRight from "./property/margin-right.ts";
import MarginTop from "./property/margin-top.ts";
import MaskClip from "./property/mask-clip.ts";
import MaskComposite from "./property/mask-composite.ts";
import MaskImage from "./property/mask-image.ts";
import MaskMode from "./property/mask-mode.ts";
import MaskOrigin from "./property/mask-origin.ts";
import MaskPosition from "./property/mask-position.ts";
import MaskRepeat from "./property/mask-repeat.ts";
import MaskSize from "./property/mask-size.ts";
import MaxHeight from "./property/max-height.ts";
import MaxWidth from "./property/max-width.ts";
import MinHeight from "./property/min-height.ts";
import MinWidth from "./property/min-width.ts";
import MixBlendMode from "./property/mix-blend-mode.ts";
import Opacity from "./property/opacity.ts";
import OutlineColor from "./property/outline-color.ts";
import OutlineOffset from "./property/outline-offset.ts";
import OutlineStyle from "./property/outline-style.ts";
import OutlineWidth from "./property/outline-width.ts";
import OverflowWrap from "./property/overflow-wrap.ts";
import OverflowX from "./property/overflow-x.ts";
import OverflowY from "./property/overflow-y.ts";
import Perspective from "./property/perspective.ts";
import PointerEvents from "./property/pointer-events.ts";
import Position from "./property/position.ts";
import Right from "./property/right.ts";
import Rotate from "./property/rotate.ts";
import Scale from "./property/scale.ts";
import TextAlign from "./property/text-align.ts";
import TextDecorationColor from "./property/text-decoration-color.ts";
import TextDecorationLine from "./property/text-decoration-line.ts";
import TextDecorationStyle from "./property/text-decoration-style.ts";
import TextDecorationThickness from "./property/text-decoration-thickness.ts";
import TextIndent from "./property/text-indent.ts";
import TextOverflow from "./property/text-overflow.ts";
import TextShadow from "./property/text-shadow.ts";
import TextTransform from "./property/text-transform.ts";
import TextWrapMode from "./property/text-wrap-mode.ts";
import TextWrapStyle from "./property/text-wrap-style.ts";
import Top from "./property/top.ts";
import Transform from "./property/transform.ts";
import Translate from "./property/translate.ts";
import VerticalAlign from "./property/vertical-align.ts";
import Visibility from "./property/visibility.ts";
import WrapAfter from "./property/wrap-after.ts";
import WrapBefore from "./property/wrap-before.ts";
import WrapInside from "./property/wrap-inside.ts";
import WhiteSpaceCollapse from "./property/white-space-collapse.ts";
import WhiteSpaceTrim from "./property/white-space-trim.ts";
import Width from "./property/width.ts";
import WillChange from "./property/will-change.ts";
import WordBreak from "./property/word-break.ts";
import WordSpacing from "./property/word-spacing.ts";
import ZIndex from "./property/z-index.ts";

/**
 * @public
 */
export namespace Longhands {
  export type Property = typeof longHands;
  /**
   * @internal
   */
  export type PropName = keyof Property;

  type Aliases = typeof aliases;
  type AliasesName = keyof Aliases;

  export type Name = PropName | AliasesName;

  /**
   * @internal
   */
  export type TrueName<N extends Name> = N extends PropName
    ? N
    : N extends AliasesName
      ? Aliases[N]
      : never;

  /**
   * Extract the parsed type of a named property.
   *
   * @remarks
   * The parsed type differs from the declared type in that the parsed type
   * must not include the defaulting keywords as these are handled globally
   * rather than individually.
   *
   * The parsed type doesn't really exist in CSS. It is an artefact on how we
   * handle the default keywords.
   */
  export type Parsed<N extends Name> = Longhand.Parsed<Property[TrueName<N>]>;

  /**
   * Extract the declared type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#declared}
   *
   * @remarks
   * The declared type includes the parsed type in addition to the defaulting
   * keywords recognised by all properties. It is the type of what can actually
   * be written as the value of the property.
   */
  export type Declared<N extends Name> = Parsed<N> | Longhand.Default;

  /**
   * Extract the cascaded type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#cascaded}
   */
  export type Cascaded<N extends Name> = Declared<N>;

  /**
   * Extract the specified type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#specified}
   */
  export type Specified<N extends Name> = Parsed<N> | Computed<N>;

  /**
   * Extract the computed type a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#computed}
   */
  export type Computed<N extends Name> = Longhand.Computed<
    Property[TrueName<N>]
  >;

  /**
   * Extract the used type of a named property.
   *
   * {@link https://drafts.csswg.org/css-cascade/#used}
   */
  export type Used<N extends Name> = Longhand.Used<Property[TrueName<N>]>;

  /**
   * Extract the initial type of a named property.
   */
  export type Initial<N extends Name> = Computed<N>;

  /**
   * Extract the inherited type of a named property.
   */
  export type Inherited<N extends Name> = Computed<N>;

  const longHands = {
    "background-attachment": BackgroundAttachment,
    "background-clip": BackgroundClip,
    "background-color": BackgroundColor,
    "background-image": BackgroundImage,
    "background-origin": BackgroundOrigin,
    "background-position-x": BackgroundPositionX,
    "background-position-y": BackgroundPositionY,
    "background-repeat-x": BackgroundRepeatX,
    "background-repeat-y": BackgroundRepeatY,
    "background-size": BackgroundSize,
    "border-block-end-color": BorderBlockEndColor,
    "border-block-end-style": BorderBlockEndStyle,
    "border-block-end-width": BorderBlockEndWidth,
    "border-block-start-color": BorderBlockStartColor,
    "border-block-start-style": BorderBlockStartStyle,
    "border-block-start-width": BorderBlockStartWidth,
    "border-bottom-color": BorderBottomColor,
    "border-bottom-left-radius": BorderBottomLeftRadius,
    "border-bottom-right-radius": BorderBottomRightRadius,
    "border-bottom-style": BorderBottomStyle,
    "border-bottom-width": BorderBottomWidth,
    "border-collapse": BorderCollapse,
    "border-end-end-radius": BorderEndEndRadius,
    "border-end-start-radius": BorderEndStartRadius,
    "border-image-outset": BorderImageOutset,
    "border-image-repeat": BorderImageRepeat,
    "border-image-slice": BorderImageSlice,
    "border-image-source": BorderImageSource,
    "border-image-width": BorderImageWidth,
    "border-inline-end-color": BorderInlineEndColor,
    "border-inline-end-style": BorderInlineEndStyle,
    "border-inline-end-width": BorderInlineEndWidth,
    "border-inline-start-color": BorderInlineStartColor,
    "border-inline-start-style": BorderInlineStartStyle,
    "border-inline-start-width": BorderInlineStartWidth,
    "border-left-color": BorderLeftColor,
    "border-left-style": BorderLeftStyle,
    "border-left-width": BorderLeftWidth,
    "border-right-color": BorderRightColor,
    "border-right-style": BorderRightStyle,
    "border-right-width": BorderRightWidth,
    "border-start-end-radius": BorderStartEndRadius,
    "border-start-start-radius": BorderStartStartRadius,
    "border-top-color": BorderTopColor,
    "border-top-left-radius": BorderTopLeftRadius,
    "border-top-right-radius": BorderTopRightRadius,
    "border-top-style": BorderTopStyle,
    "border-top-width": BorderTopWidth,
    bottom: Bottom,
    "box-shadow": BoxShadow,
    "clip-path": ClipPath,
    clip: Clip,
    color: Color,
    contain: Contain,
    "container-type": ContainerType,
    cursor: Cursor,
    display: Display,
    "flex-direction": FlexDirection,
    "flex-wrap": FlexWrap,
    float: Float,
    "font-family": FontFamily,
    "font-size": FontSize,
    "font-stretch": FontStretch,
    "font-style": FontStyle,
    "font-variant-caps": FontVariantCaps,
    "font-variant-east-asian": FontVariantEastAsian,
    "font-variant-ligatures": FontVariantLigatures,
    "font-variant-numeric": FontVariantNumeric,
    "font-variant-position": FontVariantPosition,
    "font-weight": FontWeight,
    height: Height,
    hyphens: Hyphens,
    "inset-block-end": InsetBlockEnd,
    "inset-block-start": InsetBlockStart,
    "inset-inline-end": InsetInlineEnd,
    "inset-inline-start": InsetInlineStart,
    isolation: Isolation,
    left: Left,
    "letter-spacing": LetterSpacing,
    "line-break": LineBreak,
    "line-height": LineHeight,
    "margin-bottom": MarginBottom,
    "margin-left": MarginLeft,
    "margin-right": MarginRight,
    "margin-top": MarginTop,
    "mask-clip": MaskClip,
    "mask-composite": MaskComposite,
    "mask-image": MaskImage,
    "mask-mode": MaskMode,
    "mask-origin": MaskOrigin,
    "mask-position": MaskPosition,
    "mask-repeat": MaskRepeat,
    "mask-size": MaskSize,
    "max-height": MaxHeight,
    "max-width": MaxWidth,
    "min-height": MinHeight,
    "min-width": MinWidth,
    "mix-blend-mode": MixBlendMode,
    opacity: Opacity,
    "outline-color": OutlineColor,
    "outline-offset": OutlineOffset,
    "outline-style": OutlineStyle,
    "outline-width": OutlineWidth,
    "overflow-wrap": OverflowWrap,
    "overflow-x": OverflowX,
    "overflow-y": OverflowY,
    perspective: Perspective,
    "pointer-events": PointerEvents,
    position: Position,
    right: Right,
    rotate: Rotate,
    scale: Scale,
    "text-align": TextAlign,
    "text-decoration-color": TextDecorationColor,
    "text-decoration-line": TextDecorationLine,
    "text-decoration-style": TextDecorationStyle,
    "text-decoration-thickness": TextDecorationThickness,
    "text-indent": TextIndent,
    "text-overflow": TextOverflow,
    "text-shadow": TextShadow,
    "text-transform": TextTransform,
    "text-wrap-mode": TextWrapMode,
    "text-wrap-style": TextWrapStyle,
    top: Top,
    transform: Transform,
    translate: Translate,
    "vertical-align": VerticalAlign,
    visibility: Visibility,
    "wrap-after": WrapAfter,
    "wrap-before": WrapBefore,
    "wrap-inside": WrapInside,
    // "white-space": WhiteSpace,
    "white-space-collapse": WhiteSpaceCollapse,
    "white-space-trim": WhiteSpaceTrim,
    width: Width,
    "will-change": WillChange,
    "word-break": WordBreak,
    "word-spacing": WordSpacing,
    "z-index": ZIndex,
  };

  /**
   * {@link https://drafts.csswg.org/css-cascade-5/#legacy-name-alias}
   */
  const aliases = {
    // https://developer.mozilla.org/en-US/docs/Web/CSS/word-wrap
    "word-wrap": "overflow-wrap",
  } satisfies { [alias in string]: PropName };

  function isPropName(name: string): name is PropName {
    return name in longHands;
  }

  function isAliasesName(name: string): name is AliasesName {
    return name in aliases;
  }

  export const isName: (name: string) => name is Name = Refinement.or(
    isPropName,
    isAliasesName,
  );

  /**
   * @internal
   */
  export function propName<N extends Name>(name: N): TrueName<N> {
    return (isAliasesName(name) ? aliases[name] : name) as TrueName<N>;
  }

  export function get<N extends Name>(name: N): Property[TrueName<N>] {
    return longHands[propName(name)];
  }
}
