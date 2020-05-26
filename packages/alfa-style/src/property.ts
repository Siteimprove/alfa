import { Token, Keyword } from "@siteimprove/alfa-css";
import { Mapper } from "@siteimprove/alfa-mapper";
import { Record } from "@siteimprove/alfa-record";
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

  export type Parser<T> = parser.Parser<Slice<Token>, T, string>;

  export namespace Value {
    export type Parsed<N extends Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? T
      : never;

    export type Initial<N extends Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? U
      : never;

    export type Cascaded<N extends Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? T | Keyword<"initial" | "inherit">
      : never;

    export type Specified<N extends Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? T | U
      : never;

    export type Computed<N extends Name> = WithName<N> extends Property<
      infer T,
      infer U
    >
      ? U
      : never;
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
    export type Parser<N extends Property.Name> = parser.Parser<
      Slice<Token>,
      Record<
        {
          [M in N]: Property.Value.Parsed<M>;
        }
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
import { Width } from "./property/width";

export namespace Property {
  export type Name = keyof Registered;

  export type WithName<N extends Name> = Registered[N];

  type Registered = typeof Registered;
  const Registered = {
    "background-color": Background.Color,
    "background-image": Background.Image,
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
    transform: Transform,
    visibility: Visibility,
    width: Width,
  };

  export function isName(name: string): name is Name {
    return name in Registered;
  }

  export function get<N extends Name>(name: N): WithName<N> {
    return Registered[name];
  }
}

export namespace Property {
  export namespace Shorthand {
    export type Name = keyof Registered;

    export type WithName<N extends Name> = Registered[N];

    type Registered = typeof Registered;
    const Registered = {
      overflow: Overflow.Shorthand,
    };

    export function isName(name: string): name is Name {
      return name in Registered;
    }

    export function get<N extends Name>(name: N): WithName<N> {
      return Registered[name];
    }
  }
}
