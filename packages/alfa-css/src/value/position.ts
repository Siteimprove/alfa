import { Hash } from "@siteimprove/alfa-hash";
import { Option, None, Some } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import { Value } from "../value";

import { Keyword } from "./keyword";
import { Length } from "./length";
import { Percentage } from "./percentage";
import { Unit } from "./unit";
import { Slice } from "@siteimprove/alfa-slice";
import { Token } from "../syntax/token";
import { Err, Result } from "@siteimprove/alfa-result";

const {
  map,
  filter,
  either,
  delimited,
  option,
  pair,
  right,
  separatedList,
} = Parser;

/**
 * @see https://drafts.csswg.org/css-values/#position
 */
export class Position<
  V extends Position.Component = Position.Component,
  H extends Position.Component = V
> extends Value<"position"> {
  public static of<
    V extends Position.Component,
    H extends Position.Component = V
  >(vertical: V, horizontal: H): Position<V, H> {
    return new Position(vertical, horizontal);
  }

  private readonly _vertical: V;
  private readonly _horizontal: H;

  private constructor(vertical: V, horizontal: H) {
    super();
    this._vertical = vertical;
    this._horizontal = horizontal;
  }

  public get type(): "position" {
    return "position";
  }

  public get vertical(): V {
    return this._vertical;
  }

  public get horizontal(): H {
    return this._horizontal;
  }

  public equals(value: unknown): value is this {
    return (
      value instanceof Position &&
      value._vertical.equals(this._vertical) &&
      value._horizontal.equals(this._horizontal)
    );
  }

  public hash(hash: Hash): void {
    this._vertical.hash(hash);
    this._horizontal.hash(hash);
  }

  public toJSON(): Position.JSON {
    return {
      type: "position",
      vertical: this._vertical.toJSON(),
      horizontal: this._horizontal.toJSON(),
    };
  }

  public toString(): string {
    return `${this._vertical.toString()} ${this._horizontal.toString()}`;
  }
}

export namespace Position {
  export interface JSON extends Value.JSON {
    type: "position";
    vertical: Component.JSON;
    horizontal: Component.JSON;
  }

  export type Center = Keyword<"center">;

  export const parseCenter = Keyword.parse("center");

  export type Vertical = Keyword<"top" | "bottom">;

  export const parseVertical = Keyword.parse("top", "bottom");

  export type Horizontal = Keyword<"left" | "right">;

  export const parseHorizontal = Keyword.parse("left", "right");

  export type Offset<U extends Unit.Length = Unit.Length> =
    | Length<U>
    | Percentage;

  export class Side<
    S extends Vertical | Horizontal = Vertical | Horizontal,
    O extends Offset = Offset
  > extends Value<"side"> {
    public static of<S extends Vertical | Horizontal, O extends Offset>(
      side: S,
      offset: Option<O> = None
    ): Side<S, O> {
      return new Side(side, offset);
    }

    private readonly _side: S;
    private readonly _offset: Option<O>;

    private constructor(side: S, offset: Option<O>) {
      super();
      this._side = side;
      this._offset = offset;
    }

    public get type(): "side" {
      return "side";
    }

    public get side(): S {
      return this._side;
    }

    public get offset(): Option<O> {
      return this._offset;
    }

    public isCenter(): boolean {
      return this._offset.some(
        (offset) => offset.type === "percentage" && offset.value === 0.5
      );
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Side &&
        value._side.equals(this._side) &&
        value._offset.equals(this._offset)
      );
    }

    public hash(hash: Hash): void {
      this._side.hash(hash);
      this._offset.hash(hash);
    }

    public toJSON(): Side.JSON {
      return {
        type: "side",
        side: this._side.toJSON(),
        offset: this._offset.map((offset) => offset.toJSON()).getOr(null),
      };
    }

    public toString(): string {
      return `${this._side.toString()}${this._offset
        .map((offset) => ` ${offset.toString()}`)
        .getOr("")}`;
    }
  }

  export namespace Side {
    export interface JSON extends Value.JSON {
      type: "side";
      side: Keyword.JSON;
      offset: Length.JSON | Percentage.JSON | null;
    }
  }

  export type Component<
    S extends Horizontal | Vertical = Horizontal | Vertical,
    U extends Unit.Length = Unit.Length
  > = Center | Offset<U> | Side<S, Offset<U>>;

  export namespace Component {
    export type JSON = Keyword.JSON | Length.JSON | Percentage.JSON | Side.JSON;
  }

  const parsePositionX = either(
    map(Keyword.parse("left", "right", "center"), (x) =>
      x.value === "center" ? x : Side.of(x)
    ),
    either(Length.parse, Percentage.parse)
  );

  const parsePositionY = either(
    map(Keyword.parse("top", "bottom", "center"), (x) =>
      x.value === "center" ? x : Side.of(x)
    ),
    either(Length.parse, Percentage.parse)
  );

  /**
   * @see https://drafts.csswg.org/css-backgrounds/#typedef-bg-position
   */
  export const parseOld: Parser<
    Slice<Token>,
    [Option<Component<Horizontal>>, Option<Component<Vertical>>],
    string
  > = (input) => {
    let x: Option<Component<Horizontal>> = None;
    let y: Option<Component<Vertical>> = None;

    while (true) {
      for (const [remainder] of Token.parseWhitespace(input)) {
        input = remainder;
      }

      if (x.isNone()) {
        const result = parsePositionX(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          x = Option.of(value);
          input = remainder;
          continue;
        }
      }

      if (y.isNone()) {
        const result = parsePositionY(input);

        if (result.isOk()) {
          const [remainder, value] = result.get();
          y = Option.of(value);
          input = remainder;
          continue;
        }
      }

      break;
    }

    if (x.isNone() && y.isNone()) {
      return Err.of(`Expected one of x or y`);
    }

    return Result.of([
      input,
      [x, y.orElse(() => Option.of(Keyword.of("center")))],
    ]);
  };

  /**
   * @see https://drafts.csswg.org/css-values-4/#typedef-position
   * @see https://drafts.csswg.org/css-backgrounds/#typedef-bg-position
   *
   * Parsing positions is a mess… It can be a 1, 2, 3, or 4 tokens value.
   * What the grammar doesn't say is that 3 is only allowed for background-position and
   * that the H/V components can only be switched when both start with a keyword.
   * Parsing has to be greedy, consuming as much as possible. So we check whether we can
   * get a 4, 3, 2, 1 match. It is hard to know whether a 1 match can be extended as a 2 match,
   * and so on, so it's easier to retry from the start. This should be OK performance wise since it
   * is not that much retry and it shouldn't be a type present in that many values…
   *
   * Notations: H/V: keyword for the component, h/v: numeric (length percentage), Hh/Vv: both keyword and numeric.
   * "center" may be used as H/V but not in Hh nor Vv…
   * * Accepted 4 tokens values: Hh Vv / Vv Hh
   * * Accepted 3 tokens values: Hh V / H Vv / Vv H / V Hh (only for background-position)
   * * Accepted 2 tokens values: H V / H v / h v / h V / Hh / V H (**not** "Vv", **not** "v *", "H v" is **not** "Hh")
   * * Accepted 1 token values: H / V / h
   */
  export function parse(): Parser<
    Slice<Token>,
    [Option<Component<Horizontal>>, Option<Component<Vertical>>],
    string
  > {
    type ComponentParser = Parser<Slice<Token>, Component, string>;
    type PositionParser = Parser<Slice<Token>, Position, string>;

    const parseHorizontalKeyword: ComponentParser = either(
      parseCenter,
      map(parseHorizontal, Side.of)
    );

    const parseHorizontalKeywordValue: ComponentParser = map(
      pair(parseHorizontal, either(Length.parse, Percentage.parse)),
      ([keyword, value]) => Side.of(keyword, Some.of(value))
    );

    const parseVerticalKeyword: ComponentParser = either(
      parseCenter,
      map(parseVertical, Side.of)
    );

    const parseVerticalKeywordValue: ComponentParser = map(
      pair(parseVertical, either(Length.parse, Percentage.parse)),
      ([keyword, value]) => Side.of(keyword, Some.of(value))
    );

    return (input) => Result.of([input, [None, None]]);
  }
}
