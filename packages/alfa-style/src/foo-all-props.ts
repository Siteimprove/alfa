import { Longhand } from "./foo-prop-class";

export namespace Foo {
  export type LongHands = typeof Bar.longHands;

  export type Name = keyof LongHands;

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
  export type Parsed<N extends Name> = LongHands[N] extends Longhand<
    infer S,
    unknown
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
  export type Declared<N extends Name> = Parsed<N> | Longhand.Value.Default;

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
  export type Computed<N extends Name> = LongHands[N] extends Longhand<
    unknown,
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
}

import BackgroundAttachment from "./property2/background-attachment";
import BackgroundClip from "./property2/background-clip";
import BackgroundColor from "./property2/background-color";
import BackgroundImage from "./property2/background-image";
import BackgroundOrigin from "./property2/background-origin";
import BackgroundPositionX from "./property2/background-position-x";
import BackgroundPositionY from "./property2/background-position-y";
import BackgroundRepeatX from "./property2/background-repeat-x";
import BackgroundRepeatY from "./property2/background-repeat-y";
import BackgroundSize from "./property2/background-size";
import BorderBlockEndColor from "./property2/border-block-end-color";
import BorderBlockEndStyle from "./property2/border-block-end-style";
import BorderBlockEndWidth from "./property2/border-block-end-width";
import BorderBlockStartColor from "./property2/border-block-start-color";
import BorderBlockStartStyle from "./property2/border-block-start-style";
import BorderBlockStartWidth from "./property2/border-block-start-width";
import BorderBottomColor from "./property2/border-bottom-color";
import BorderBottomLeftRadius from "./property2/border-bottom-left-radius";
import BorderBottomRightRadius from "./property2/border-bottom-right-radius";
import BorderBottomStyle from "./property2/border-bottom-style";
import BorderBottomWidth from "./property2/border-bottom-width";
import BorderCollapse from "./property2/border-collapse";
import BorderEndEndRadius from "./property2/border-end-end-radius";
import BorderEndStartRadius from "./property2/border-end-start-radius";
import BorderImageOutset from "./property2/border-image-outset";
import BorderImageRepeat from "./property2/border-image-repeat";
import BorderImageSlice from "./property2/border-image-slice";
import BorderImageSource from "./property2/border-image-source";
import BorderImageWidth from "./property2/border-image-width";
import BorderInlineEndColor from "./property2/border-inline-end-color";
import BorderInlineEndStyle from "./property2/border-inline-end-style";
import BorderInlineEndWidth from "./property2/border-inline-end-width";
import BorderInlineStartColor from "./property2/border-inline-start-color";
import BorderInlineStartStyle from "./property2/border-inline-start-style";
import BorderInlineStartWidth from "./property2/border-inline-start-width";
import BorderLeftColor from "./property2/border-left-color";
import BorderLeftStyle from "./property2/border-left-style";
import BorderLeftWidth from "./property2/border-left-width";
import BorderRightColor from "./property2/border-right-color";
import BorderRightStyle from "./property2/border-right-style";
import BorderRightWidth from "./property2/border-right-width";
import BorderStartEndRadius from "./property2/border-start-end-radius";
import BorderStartStartRadius from "./property2/border-start-start-radius";
import BorderTopColor from "./property2/border-top-color";
import BorderTopLeftRadius from "./property2/border-top-left-radius";
import BorderTopRightRadius from "./property2/border-top-right-radius";
import BorderTopStyle from "./property2/border-top-style";
import BorderTopWidth from "./property2/border-top-width";
import Bottom from "./property2/bottom";
import BoxShadow from "./property2/box-shadow";
import Clip from "./property2/clip";
import ClipPath from "./property2/clip-path";
import Color from "./property2/color";
import Cursor from "./property2/cursor";
import Display from "./property2/display";
import FlexDirection from "./property2/flex-direction";
import FlexWrap from "./property2/flex-wrap";
import Float from "./property2/float";
import FontFamily from "./property2/font-family";
import FontSize from "./property2/font-size";
import FontStretch from "./property2/font-stretch";
import FontStyle from "./property2/font-style";
import FontVariantCaps from "./property2/font-variant-caps";
import FontVariantEastAsian from "./property2/font-variant-east-asian";
import FontVariantLigatures from "./property2/font-variant-ligatures";
import FontVariantNumeric from "./property2/font-variant-numeric";
import FontVariantPosition from "./property2/font-variant-position";
import FontWeight from "./property2/font-weight";
import Height from "./property2/height";
import InsetBlockEnd from "./property2/inset-block-end";
import InsetBlockStart from "./property2/inset-block-start";
import InsetInlineEnd from "./property2/inset-inline-end";
import InsetInlineStart from "./property2/inset-inline-start";
import Left from "./property2/left";
import LetterSpacing from "./property2/letter-spacing";
import LineHeight from "./property2/line-height";
import MarginBottom from "./property2/margin-bottom";
import MarginLeft from "./property2/margin-left";
import MarginRight from "./property2/margin-right";
import MarginTop from "./property2/margin-top";
import MinHeight from "./property2/min-height";
import MinWidth from "./property2/min-width";
import Opacity from "./property2/opacity";
import OutlineColor from "./property2/outline-color";
import OutlineOffset from "./property2/outline-offset";
import OutlineStyle from "./property2/outline-style";
import OutlineWidth from "./property2/outline-width";
import OverflowX from "./property2/overflow-x";
import OverflowY from "./property2/overflow-y";
import Position from "./property2/position";
import Right from "./property2/right";
import Rotate from "./property2/rotate";
import TextAlign from "./property2/text-align";
import TextDecorationColor from "./property2/text-decoration-color";
import TextDecorationLine from "./property2/text-decoration-line";
import TextDecorationStyle from "./property2/text-decoration-style";
import TextDecorationThickness from "./property2/text-decoration-thickness";
import TextIndent from "./property2/text-indent";
import TextOverflow from "./property2/text-overflow";
import TextShadow from "./property2/text-shadow";
import TextTransform from "./property2/text-transform";
import Top from "./property2/top";
import Transform from "./property2/transform";
import VerticalAlign from "./property2/vertical-align";
import Visibility from "./property2/visibility";
import WhiteSpace from "./property2/white-space";
import Width from "./property2/width";
import WordSpacing from "./property2/word-spacing";

export namespace Bar {
  export const longHands = {
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

  export function isName(name: string): name is Foo.Name {
    return name in longHands;
  }

  export function get<N extends Foo.Name>(name: N): Foo.LongHands[N] {
    return longHands[name];
  }
}
