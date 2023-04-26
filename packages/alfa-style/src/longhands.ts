import { Longhand } from "./longhand";

import BackgroundAttachment from "./property/background-attachment";
import BackgroundClip from "./property/background-clip";
import BackgroundColor from "./property/background-color";
import BackgroundImage from "./property/background-image";
import BackgroundOrigin from "./property/background-origin";
import BackgroundPositionX from "./property/background-position-x";
import BackgroundPositionY from "./property/background-position-y";
import BackgroundRepeatX from "./property/background-repeat-x";
import BackgroundRepeatY from "./property/background-repeat-y";
import BackgroundSize from "./property/background-size";
import BorderBlockEndColor from "./property/border-block-end-color";
import BorderBlockEndStyle from "./property/border-block-end-style";
import BorderBlockEndWidth from "./property/border-block-end-width";
import BorderBlockStartColor from "./property/border-block-start-color";
import BorderBlockStartStyle from "./property/border-block-start-style";
import BorderBlockStartWidth from "./property/border-block-start-width";
import BorderBottomColor from "./property/border-bottom-color";
import BorderBottomLeftRadius from "./property/border-bottom-left-radius";
import BorderBottomRightRadius from "./property/border-bottom-right-radius";
import BorderBottomStyle from "./property/border-bottom-style";
import BorderBottomWidth from "./property/border-bottom-width";
import BorderCollapse from "./property/border-collapse";
import BorderEndEndRadius from "./property/border-end-end-radius";
import BorderEndStartRadius from "./property/border-end-start-radius";
import BorderImageOutset from "./property/border-image-outset";
import BorderImageRepeat from "./property/border-image-repeat";
import BorderImageSlice from "./property/border-image-slice";
import BorderImageSource from "./property/border-image-source";
import BorderImageWidth from "./property/border-image-width";
import BorderInlineEndColor from "./property/border-inline-end-color";
import BorderInlineEndStyle from "./property/border-inline-end-style";
import BorderInlineEndWidth from "./property/border-inline-end-width";
import BorderInlineStartColor from "./property/border-inline-start-color";
import BorderInlineStartStyle from "./property/border-inline-start-style";
import BorderInlineStartWidth from "./property/border-inline-start-width";
import BorderLeftColor from "./property/border-left-color";
import BorderLeftStyle from "./property/border-left-style";
import BorderLeftWidth from "./property/border-left-width";
import BorderRightColor from "./property/border-right-color";
import BorderRightStyle from "./property/border-right-style";
import BorderRightWidth from "./property/border-right-width";
import BorderStartEndRadius from "./property/border-start-end-radius";
import BorderStartStartRadius from "./property/border-start-start-radius";
import BorderTopColor from "./property/border-top-color";
import BorderTopLeftRadius from "./property/border-top-left-radius";
import BorderTopRightRadius from "./property/border-top-right-radius";
import BorderTopStyle from "./property/border-top-style";
import BorderTopWidth from "./property/border-top-width";
import Bottom from "./property/bottom";
import BoxShadow from "./property/box-shadow";
import Clip from "./property/clip";
import ClipPath from "./property/clip-path";
import Color from "./property/color";
import Cursor from "./property/cursor";
import Display from "./property/display";
import FlexDirection from "./property/flex-direction";
import FlexWrap from "./property/flex-wrap";
import Float from "./property/float";
import FontFamily from "./property/font-family";
import FontSize from "./property/font-size";
import FontStretch from "./property/font-stretch";
import FontStyle from "./property/font-style";
import FontVariantCaps from "./property/font-variant-caps";
import FontVariantEastAsian from "./property/font-variant-east-asian";
import FontVariantLigatures from "./property/font-variant-ligatures";
import FontVariantNumeric from "./property/font-variant-numeric";
import FontVariantPosition from "./property/font-variant-position";
import FontWeight from "./property/font-weight";
import Height from "./property/height";
import InsetBlockEnd from "./property/inset-block-end";
import InsetBlockStart from "./property/inset-block-start";
import InsetInlineEnd from "./property/inset-inline-end";
import InsetInlineStart from "./property/inset-inline-start";
import Left from "./property/left";
import LetterSpacing from "./property/letter-spacing";
import LineHeight from "./property/line-height";
import MarginBottom from "./property/margin-bottom";
import MarginLeft from "./property/margin-left";
import MarginRight from "./property/margin-right";
import MarginTop from "./property/margin-top";
import MinHeight from "./property/min-height";
import MinWidth from "./property/min-width";
import Opacity from "./property/opacity";
import OutlineColor from "./property/outline-color";
import OutlineOffset from "./property/outline-offset";
import OutlineStyle from "./property/outline-style";
import OutlineWidth from "./property/outline-width";
import OverflowX from "./property/overflow-x";
import OverflowY from "./property/overflow-y";
import Position from "./property/position";
import Right from "./property/right";
import Rotate from "./property/rotate";
import TextAlign from "./property/text-align";
import TextDecorationColor from "./property/text-decoration-color";
import TextDecorationLine from "./property/text-decoration-line";
import TextDecorationStyle from "./property/text-decoration-style";
import TextDecorationThickness from "./property/text-decoration-thickness";
import TextIndent from "./property/text-indent";
import TextOverflow from "./property/text-overflow";
import TextShadow from "./property/text-shadow";
import TextTransform from "./property/text-transform";
import Top from "./property/top";
import Transform from "./property/transform";
import VerticalAlign from "./property/vertical-align";
import Visibility from "./property/visibility";
import WhiteSpace from "./property/white-space";
import Width from "./property/width";
import WordSpacing from "./property/word-spacing";

export namespace Longhands {
  export type Property = typeof longHands;

  export type Name = keyof Property;

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
  export type Parsed<N extends Name> = Property[N] extends Longhand<
    infer S,
    infer C
  >
    ? S
    : never;

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
  export type Computed<N extends Name> = Property[N] extends Longhand<
    infer S,
    infer C
  >
    ? C
    : never;

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
    "inset-block-end": InsetBlockEnd,
    "inset-block-start": InsetBlockStart,
    "inset-inline-end": InsetInlineEnd,
    "inset-inline-start": InsetInlineStart,
    left: Left,
    "letter-spacing": LetterSpacing,
    "line-height": LineHeight,
    "margin-bottom": MarginBottom,
    "margin-left": MarginLeft,
    "margin-right": MarginRight,
    "margin-top": MarginTop,
    "min-height": MinHeight,
    "min-width": MinWidth,
    opacity: Opacity,
    "outline-color": OutlineColor,
    "outline-offset": OutlineOffset,
    "outline-style": OutlineStyle,
    "outline-width": OutlineWidth,
    "overflow-x": OverflowX,
    "overflow-y": OverflowY,
    position: Position,
    right: Right,
    rotate: Rotate,
    "text-align": TextAlign,
    "text-decoration-color": TextDecorationColor,
    "text-decoration-line": TextDecorationLine,
    "text-decoration-style": TextDecorationStyle,
    "text-decoration-thickness": TextDecorationThickness,
    "text-indent": TextIndent,
    "text-overflow": TextOverflow,
    "text-shadow": TextShadow,
    "text-transform": TextTransform,
    top: Top,
    transform: Transform,
    "vertical-align": VerticalAlign,
    visibility: Visibility,
    "white-space": WhiteSpace,
    width: Width,
    "word-spacing": WordSpacing,
  } as const;

  export function isName(name: string): name is Name {
    return name in longHands;
  }

  export function get<N extends Name>(name: N): Property[N] {
    return longHands[name];
  }
}
