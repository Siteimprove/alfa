import { Hash } from "@siteimprove/alfa-hash";
import { Option, None } from "@siteimprove/alfa-option";

import { Value } from "../value";

import { Keyword } from "./keyword";
import { Length } from "./length";
import { Percentage } from "./percentage";
import { Unit } from "./unit";

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

  export type Component = Center | Offset | Side;

  export namespace Component {
    export type JSON = Keyword.JSON | Length.JSON | Percentage.JSON | Side.JSON;
  }
}
