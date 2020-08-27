import { Token, Keyword } from "@siteimprove/alfa-css";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Slice } from "@siteimprove/alfa-slice";

import * as parser from "@siteimprove/alfa-parser";

import { Style } from "./style";
import { Value } from "./value";

export class Property<T = unknown, U = T> {
  public static of<T, U>(
    initial: U,
    parse: Property.Parser<T>,
    compute: Mapper<Style, Value<U>>,
    options: Property.Options = {
      inherits: false,
    }
  ): Property<T, U> {
    return new Property(initial, parse, compute, options);
  }

  private readonly _initial: U;
  private readonly _parse: Property.Parser<T>;
  private readonly _compute: Mapper<Style, Value<U>>;
  private readonly _options: Property.Options;

  private constructor(
    initial: U,
    parse: Property.Parser<T>,
    compute: Mapper<Style, Value<U>>,
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

  get compute(): Mapper<Style, Value<U>> {
    return this._compute;
  }

  get options(): Property.Options {
    return this._options;
  }
}

export namespace Property {
  export interface Options {
    readonly inherits: boolean;
  }

  export type Parser<T = Value.Parsed> = parser.Parser<Slice<Token>, T, string>;

  export namespace Value {
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
     * @see https://drafts.csswg.org/css-cascade/#declared
     *
     * @remarks
     * The declared type includes the parsed type in addition to the defaulting
     * keywords recognised by all properties.
     */
    export type Declared<N extends Name> =
      | Parsed<N>
      | Keyword<"initial">
      | Keyword<"inherit">
      | Keyword<"unset">;

    /**
     * Extract the cascaded type of a named property.
     *
     * @see https://drafts.csswg.org/css-cascade/#cascaded
     */
    export type Cascaded<N extends Name> = Declared<N>;

    /**
     * Extract the specified type of a named property.
     *
     * @see https://drafts.csswg.org/css-cascade/#specified
     */
    export type Specified<N extends Name> = Parsed<N> | Computed<N>;

    /**
     * Extract the computed type a named property.
     *
     * @see https://drafts.csswg.org/css-cascade/#computed
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

export namespace Property {
  export class Shorthand<N extends Name = never> {
    public static of<N extends Name>(
      properties: Array<N>,
      parse: Shorthand.Parser<N>
    ) {
      return new Shorthand(properties, parse);
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
      Iterable<
        {
          [M in N]: [M, Property.Value.Declared<M>];
        }[N]
      >,
      string
    >;
  }
}

import { Background } from "./property/background";
import { Color } from "./property/color";
import { Display } from "./property/display";
import { Font } from "./property/font";
import { Height } from "./property/height";
import { Line } from "./property/line";
import { Opacity } from "./property/opacity";
import { Overflow } from "./property/overflow";
import { Text } from "./property/text";
import { Transform } from "./property/transform";
import { Visibility } from "./property/visibility";
import { Whitespace } from "./property/whitespace";
import { Width } from "./property/width";

type Longhands = typeof Longhands;
const Longhands = {
  "background-color": Background.Color,
  "background-image": Background.Image,
  "background-repeat-x": Background.Repeat.X,
  "background-repeat-y": Background.Repeat.Y,
  "background-attachment": Background.Attachment,
  "background-position-x": Background.Position.X,
  "background-position-y": Background.Position.Y,
  "background-clip": Background.Clip,
  "background-origin": Background.Origin,
  "background-size": Background.Size,
  color: Color,
  display: Display,
  "font-family": Font.Family,
  "font-size": Font.Size,
  "font-style": Font.Style,
  "font-weight": Font.Weight,
  height: Height,
  "line-height": Line.Height,
  opacity: Opacity,
  "overflow-x": Overflow.X,
  "overflow-y": Overflow.Y,
  "text-align": Text.Align,
  "text-transform": Text.Transform,
  "text-overflow": Text.Overflow,
  transform: Transform,
  visibility: Visibility,
  "white-space": Whitespace,
  width: Width,
};

type Shorthands = typeof Shorthands;
const Shorthands = {
  background: Background.Shorthand,
  "background-repeat": Background.Repeat.Shorthand,
  "background-position": Background.Position.Shorthand,
  overflow: Overflow.Shorthand,
};

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
