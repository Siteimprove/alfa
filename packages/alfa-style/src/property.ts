import { Token, Keyword } from "@siteimprove/alfa-css";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Slice } from "@siteimprove/alfa-slice";
import { Parser } from "@siteimprove/alfa-parser";

import * as parser from "@siteimprove/alfa-parser";

import { Style } from "./style";
import { Value } from "./value";

const { left, either, end } = Parser;

const parseDefaults = Keyword.parse("initial", "inherit", "unset");

/**
 * @internal
 */
export class Property<T = unknown, U = T> {
  public static of<T, U>(
    initial: U,
    parse: Property.Parser<T>,
    compute: Mapper<Value<T>, Value<U>, [style: Style]>,
    options: Property.Options = {
      inherits: false,
    }
  ): Property<T, U> {
    return new Property(
      initial,
      left(
        either(parseDefaults, parse),
        end(() => "Expected end of input")
      ),
      compute,
      options
    );
  }

  public static extend<T, U>(
    property: Property<T, U>,
    overrides: {
      initial?: U;
      parse?: Property.Parser<T>;
      compute?: Mapper<Value<T>, Value<U>, [style: Style]>;
      options?: Property.Options;
    } = {}
  ): Property<T, U> {
    const {
      initial = property._initial,
      parse,
      compute = property._compute,
      options = {},
    } = overrides;

    return new Property(
      initial,
      parse === undefined
        ? property._parse
        : left(
            either(parseDefaults, parse),
            end(() => "Expected end of input")
          ),
      compute,
      {
        ...property._options,
        ...options,
      }
    );
  }

  private readonly _initial: U;
  private readonly _parse: Property.Parser<T>;
  private readonly _compute: Mapper<Value<T>, Value<U>, [style: Style]>;
  private readonly _options: Property.Options;

  private constructor(
    initial: U,
    parse: Property.Parser<T>,
    compute: Mapper<Value<T>, Value<U>, [style: Style]>,
    options: Property.Options
  ) {
    this._initial = initial;
    this._parse = parse;
    this._compute = compute;
    this._options = options;
  }

  get initial(): U {
    return this._initial;
  }

  get parse(): Property.Parser<T> {
    return this._parse;
  }

  get compute(): Mapper<Value<T>, Value<U>, [style: Style]> {
    return this._compute;
  }

  get options(): Property.Options {
    return this._options;
  }
}

/**
 * @internal
 */
export namespace Property {
  export interface Options {
    readonly inherits: boolean;
  }

  export type Parser<T = Value.Parsed> = parser.Parser<
    Slice<Token>,
    Value.Default | T,
    string
  >;

  export namespace Value {
    /**
     * The default keywords recognised by all properties.
     */
    export type Default =
      | Keyword<"initial">
      | Keyword<"inherit">
      | Keyword<"unset">;

    /**
     * Extract the parsed type of a named property.
     *
     * @remarks
     * The parsed type differs from the declared type in that the parsed type
     * must not include the defaulting keywords as these are handled globally
     * rather than individually.
     */
    export type Parsed<N extends Name = Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? T
      : never;

    /**
     * Extract the declared type of a named property.
     *
     * {@link https://drafts.csswg.org/css-cascade/#declared}
     *
     * @remarks
     * The declared type includes the parsed type in addition to the defaulting
     * keywords recognised by all properties.
     */
    export type Declared<N extends Name> = Parsed<N> | Default;

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
    export type Computed<N extends Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? U
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
}

/**
 * @internal
 */
export namespace Property {
  export class Shorthand<N extends Name = never> {
    public static of<N extends Name>(
      properties: Array<N>,
      parse: Shorthand.Parser<N>
    ) {
      return new Shorthand(
        properties,
        left(
          either(parseDefaults, parse),
          end(() => "Expected end of input")
        )
      );
    }

    private readonly _properties: Array<N>;
    private readonly _parse: Shorthand.Parser<N>;

    private constructor(properties: Array<N>, parse: Shorthand.Parser<N>) {
      this._properties = properties;
      this._parse = parse;
    }

    public get properties(): Iterable<N> {
      return this._properties;
    }

    public get parse(): Shorthand.Parser<N> {
      return this._parse;
    }
  }

  export namespace Shorthand {
    export type Parser<N extends Property.Name = Property.Name> = parser.Parser<
      Slice<Token>,
      | Property.Value.Default
      | Iterable<{ [M in N]: readonly [M, Property.Value.Declared<M>] }[N]>,
      string
    >;
  }

  export const { of: shorthand } = Shorthand;
}

import Background from "./property/background";
import BackgroundAttachment from "./property/background-attachment";
import BackgroundClip from "./property/background-clip";
import BackgroundColor from "./property/background-color";
import BackgroundImage from "./property/background-image";
import BackgroundOrigin from "./property/background-origin";
import BackgroundPosition from "./property/background-position";
import BackgroundPositionX from "./property/background-position-x";
import BackgroundPositionY from "./property/background-position-y";
import BackgroundRepeat from "./property/background-repeat";
import BackgroundRepeatX from "./property/background-repeat-x";
import BackgroundRepeatY from "./property/background-repeat-y";
import BackgroundSize from "./property/background-size";
import BorderBlockColor from "./property/border-block-color";
import BorderBlockEndColor from "./property/border-block-end-color";
import BorderBlockEndStyle from "./property/border-block-end-style";
import BorderBlockEndWidth from "./property/border-block-end-width";
import BorderBlockStartColor from "./property/border-block-start-color";
import BorderBlockStartStyle from "./property/border-block-start-style";
import BorderBlockStartWidth from "./property/border-block-start-width";
import BorderBlockWidth from "./property/border-block-width";
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
import BorderInlineColor from "./property/border-inline-color";
import BorderInlineEndColor from "./property/border-inline-end-color";
import BorderInlineEndStyle from "./property/border-inline-end-style";
import BorderInlineEndWidth from "./property/border-inline-end-width";
import BorderInlineStartColor from "./property/border-inline-start-color";
import BorderInlineStartStyle from "./property/border-inline-start-style";
import BorderInlineStartWidth from "./property/border-inline-start-width";
import BorderInlineWidth from "./property/border-inline-width";
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
import Display from "./property/display";
import Font from "./property/font";
import FontFamily from "./property/font-family";
import FontSize from "./property/font-size";
import FontStretch from "./property/font-stretch";
import FontStyle from "./property/font-style";
import FontWeight from "./property/font-weight";
import Height from "./property/height";
import Inset from "./property/inset";
import InsetBlock from "./property/inset-block";
import InsetBlockEnd from "./property/inset-block-end";
import InsetBlockStart from "./property/inset-block-start";
import InsetInline from "./property/inset-inline";
import InsetInlineEnd from "./property/inset-inline-end";
import InsetInlineStart from "./property/inset-inline-start";
import Left from "./property/left";
import LetterSpacing from "./property/letter-spacing";
import LineHeight from "./property/line-height";
import Opacity from "./property/opacity";
import Outline from "./property/outline";
import OutlineColor from "./property/outline-color";
import OutlineOffset from "./property/outline-offset";
import OutlineStyle from "./property/outline-style";
import OutlineWidth from "./property/outline-width";
import Overflow from "./property/overflow";
import OverflowX from "./property/overflow-x";
import OverflowY from "./property/overflow-y";
import Position from "./property/position";
import Right from "./property/right";
import TextAlign from "./property/text-align";
import TextDecoration from "./property/text-decoration";
import TextDecorationColor from "./property/text-decoration-color";
import TextDecorationLine from "./property/text-decoration-line";
import TextDecorationStyle from "./property/text-decoration-style";
import TextIndent from "./property/text-indent";
import TextOverflow from "./property/text-overflow";
import TextTransform from "./property/text-transform";
import Top from "./property/top";
import Transform from "./property/transform";
import Visibility from "./property/visibility";
import WhiteSpace from "./property/white-space";
import Width from "./property/width";
import WordSpacing from "./property/word-spacing";

type Longhands = typeof Longhands;

const Longhands = {
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
  clip: Clip,
  "clip-path": ClipPath,
  color: Color,
  display: Display,
  "font-family": FontFamily,
  "font-size": FontSize,
  "font-stretch": FontStretch,
  "font-style": FontStyle,
  "font-weight": FontWeight,
  height: Height,
  "inset-block-end": InsetBlockEnd,
  "inset-block-start": InsetBlockStart,
  "inset-inline-end": InsetInlineEnd,
  "inset-inline-start": InsetInlineStart,
  left: Left,
  "letter-spacing": LetterSpacing,
  "line-height": LineHeight,
  opacity: Opacity,
  "outline-color": OutlineColor,
  "outline-offset": OutlineOffset,
  "outline-style": OutlineStyle,
  "outline-width": OutlineWidth,
  "overflow-x": OverflowX,
  "overflow-y": OverflowY,
  position: Position,
  right: Right,
  "text-align": TextAlign,
  "text-decoration-color": TextDecorationColor,
  "text-decoration-line": TextDecorationLine,
  "text-decoration-style": TextDecorationStyle,
  "text-indent": TextIndent,
  "text-transform": TextTransform,
  "text-overflow": TextOverflow,
  top: Top,
  transform: Transform,
  visibility: Visibility,
  "white-space": WhiteSpace,
  width: Width,
  "word-spacing": WordSpacing,
};

type Shorthands = typeof Shorthands;

const Shorthands = {
  background: Background,
  "background-position": BackgroundPosition,
  "background-repeat": BackgroundRepeat,
  "border-block-color": BorderBlockColor,
  "border-block-width": BorderBlockWidth,
  "border-inline-color": BorderInlineColor,
  "border-inline-width": BorderInlineWidth,
  font: Font,
  inset: Inset,
  "inset-block": InsetBlock,
  "inset-inline": InsetInline,
  outline: Outline,
  overflow: Overflow,
  "text-decoration": TextDecoration,
};

/**
 * @internal
 */
export namespace Property {
  export type Name = keyof Longhands;

  export type WithName<N extends Name> = Longhands[N];

  export function isName(name: string): name is Name {
    return name in Longhands;
  }

  export function get<N extends Name>(name: N): WithName<N> {
    return Longhands[name];
  }
}

/**
 * @internal
 */
export namespace Property {
  export namespace Shorthand {
    export type Name = keyof Shorthands;

    export type WithName<N extends Name> = Shorthands[N];

    export function isName(name: string): name is Name {
      return name in Shorthands;
    }

    export function get<N extends Name>(name: N): WithName<N> {
      return Shorthands[name];
    }
  }
}
