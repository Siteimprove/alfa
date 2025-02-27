import { Refinement } from "@siteimprove/alfa-refinement";
import type { Longhand } from "./longhand.js";

import BackgroundAttachment from "./property/background-attachment.js";
import BackgroundClip from "./property/background-clip.js";
import BackgroundColor from "./property/background-color.js";
import BackgroundImage from "./property/background-image.js";
import BackgroundOrigin from "./property/background-origin.js";
import BackgroundPositionX from "./property/background-position-x.js";
import BackgroundPositionY from "./property/background-position-y.js";
import BackgroundRepeatX from "./property/background-repeat-x.js";
import BackgroundRepeatY from "./property/background-repeat-y.js";
import BackgroundSize from "./property/background-size.js";
import BorderBlockEndColor from "./property/border-block-end-color.js";
import BorderBlockEndStyle from "./property/border-block-end-style.js";
import BorderBlockEndWidth from "./property/border-block-end-width.js";
import BorderBlockStartColor from "./property/border-block-start-color.js";
import BorderBlockStartStyle from "./property/border-block-start-style.js";
import BorderBlockStartWidth from "./property/border-block-start-width.js";
import BorderBottomColor from "./property/border-bottom-color.js";
import BorderBottomLeftRadius from "./property/border-bottom-left-radius.js";
import BorderBottomRightRadius from "./property/border-bottom-right-radius.js";
import BorderBottomStyle from "./property/border-bottom-style.js";
import BorderBottomWidth from "./property/border-bottom-width.js";
import BorderCollapse from "./property/border-collapse.js";
import BorderEndEndRadius from "./property/border-end-end-radius.js";
import BorderEndStartRadius from "./property/border-end-start-radius.js";
import BorderImageOutset from "./property/border-image-outset.js";
import BorderImageRepeat from "./property/border-image-repeat.js";
import BorderImageSlice from "./property/border-image-slice.js";
import BorderImageSource from "./property/border-image-source.js";
import BorderImageWidth from "./property/border-image-width.js";
import BorderInlineEndColor from "./property/border-inline-end-color.js";
import BorderInlineEndStyle from "./property/border-inline-end-style.js";
import BorderInlineEndWidth from "./property/border-inline-end-width.js";
import BorderInlineStartColor from "./property/border-inline-start-color.js";
import BorderInlineStartStyle from "./property/border-inline-start-style.js";
import BorderInlineStartWidth from "./property/border-inline-start-width.js";
import BorderLeftColor from "./property/border-left-color.js";
import BorderLeftStyle from "./property/border-left-style.js";
import BorderLeftWidth from "./property/border-left-width.js";
import BorderRightColor from "./property/border-right-color.js";
import BorderRightStyle from "./property/border-right-style.js";
import BorderRightWidth from "./property/border-right-width.js";
import BorderStartEndRadius from "./property/border-start-end-radius.js";
import BorderStartStartRadius from "./property/border-start-start-radius.js";
import BorderTopColor from "./property/border-top-color.js";
import BorderTopLeftRadius from "./property/border-top-left-radius.js";
import BorderTopRightRadius from "./property/border-top-right-radius.js";
import BorderTopStyle from "./property/border-top-style.js";
import BorderTopWidth from "./property/border-top-width.js";
import Bottom from "./property/bottom.js";
import BoxShadow from "./property/box-shadow.js";
import ClipPath from "./property/clip-path.js";
import Clip from "./property/clip.js";
import Color from "./property/color.js";
import Contain from "./property/contain.js";
import ContainerType from "./property/container-type.js";
import Cursor from "./property/cursor.js";
import Display from "./property/display.js";
import FlexDirection from "./property/flex-direction.js";
import FlexWrap from "./property/flex-wrap.js";
import Float from "./property/float.js";
import FontFamily from "./property/font-family.js";
import FontSize from "./property/font-size.js";
import FontStretch from "./property/font-stretch.js";
import FontStyle from "./property/font-style.js";
import FontVariantCaps from "./property/font-variant-caps.js";
import FontVariantEastAsian from "./property/font-variant-east-asian.js";
import FontVariantLigatures from "./property/font-variant-ligatures.js";
import FontVariantNumeric from "./property/font-variant-numeric.js";
import FontVariantPosition from "./property/font-variant-position.js";
import FontWeight from "./property/font-weight.js";
import Height from "./property/height.js";
import Hyphens from "./property/hyphens.js";
import InsetBlockEnd from "./property/inset-block-end.js";
import InsetBlockStart from "./property/inset-block-start.js";
import InsetInlineEnd from "./property/inset-inline-end.js";
import InsetInlineStart from "./property/inset-inline-start.js";
import Isolation from "./property/isolation.js";
import Left from "./property/left.js";
import LetterSpacing from "./property/letter-spacing.js";
import LineBreak from "./property/line-break.js";
import LineHeight from "./property/line-height.js";
import MarginBottom from "./property/margin-bottom.js";
import MarginLeft from "./property/margin-left.js";
import MarginRight from "./property/margin-right.js";
import MarginTop from "./property/margin-top.js";
import MaskClip from "./property/mask-clip.js";
import MaskComposite from "./property/mask-composite.js";
import MaskImage from "./property/mask-image.js";
import MaskMode from "./property/mask-mode.js";
import MaskOrigin from "./property/mask-origin.js";
import MaskPosition from "./property/mask-position.js";
import MaskRepeat from "./property/mask-repeat.js";
import MaskSize from "./property/mask-size.js";
import MinHeight from "./property/min-height.js";
import MinWidth from "./property/min-width.js";
import MixBlendMode from "./property/mix-blend-mode.js";
import Opacity from "./property/opacity.js";
import OutlineColor from "./property/outline-color.js";
import OutlineOffset from "./property/outline-offset.js";
import OutlineStyle from "./property/outline-style.js";
import OutlineWidth from "./property/outline-width.js";
import OverflowWrap from "./property/overflow-wrap.js";
import OverflowX from "./property/overflow-x.js";
import OverflowY from "./property/overflow-y.js";
import Perspective from "./property/perspective.js";
import PointerEvents from "./property/pointer-events.js";
import Position from "./property/position.js";
import Right from "./property/right.js";
import Rotate from "./property/rotate.js";
import Scale from "./property/scale.js";
import TextAlign from "./property/text-align.js";
import TextDecorationColor from "./property/text-decoration-color.js";
import TextDecorationLine from "./property/text-decoration-line.js";
import TextDecorationStyle from "./property/text-decoration-style.js";
import TextDecorationThickness from "./property/text-decoration-thickness.js";
import TextIndent from "./property/text-indent.js";
import TextOverflow from "./property/text-overflow.js";
import TextShadow from "./property/text-shadow.js";
import TextTransform from "./property/text-transform.js";
import TextWrapMode from "./property/text-wrap-mode.js";
import TextWrapStyle from "./property/text-wrap-style.js";
import Top from "./property/top.js";
import Transform from "./property/transform.js";
import Translate from "./property/translate.js";
import VerticalAlign from "./property/vertical-align.js";
import Visibility from "./property/visibility.js";
import WrapAfter from "./property/wrap-after.js";
import WrapBefore from "./property/wrap-before.js";
import WrapInside from "./property/wrap-inside.js";
import WhiteSpace from "./property/white-space.js";
import WhiteSpaceCollapse from "./property/white-space-collapse.js";
import WhiteSpaceTrim from "./property/white-space-trim.js";
import Width from "./property/width.js";
import WillChange from "./property/will-change.js";
import WordBreak from "./property/word-break.js";
import WordSpacing from "./property/word-spacing.js";
import ZIndex from "./property/z-index.js";

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
   * @remarks
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
    "white-space": WhiteSpace,
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
