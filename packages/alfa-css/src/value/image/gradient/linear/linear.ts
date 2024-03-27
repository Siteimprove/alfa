import { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Parser } from "@siteimprove/alfa-parser";

import { Comma, Function, type Parser as CSSParser } from "../../../../syntax";
import { PartiallyResolvable, Resolvable } from "../../../resolvable";

import { Value } from "../../../value";

import { Item } from "../item";

import { Direction } from "./direction";
import { Side } from "./side";

const { map, pair, option, left } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#linear-gradients}
 *
 * @public
 */
export class Linear<I extends Item = Item, D extends Direction = Direction>
  extends Value<"gradient", Value.HasCalculation<[D, I]>>
  implements
    Resolvable<Linear.Canonical, Linear.Resolver>,
    PartiallyResolvable<Linear.PartiallyResolved, Linear.PartialResolver>
{
  public static of<I extends Item, D extends Direction>(
    direction: D,
    items: Iterable<I>,
    repeats: boolean,
  ): Linear<I, D> {
    return new Linear(direction, Array.from(items), repeats);
  }

  private readonly _direction: D;
  private readonly _items: Array<I>;
  private readonly _repeats: boolean;

  private constructor(direction: D, items: Array<I>, repeats: boolean) {
    super("gradient", Value.hasCalculation(direction, ...items));
    this._direction = direction;
    this._items = items;
    this._repeats = repeats;
  }

  public get kind(): "linear" {
    return "linear";
  }

  public get direction(): D {
    return this._direction;
  }

  public get items(): Iterable<I> {
    return this._items;
  }

  public get repeats(): boolean {
    return this._repeats;
  }

  public resolve(resolver: Linear.Resolver): Linear.Canonical {
    return new Linear(
      this._direction.resolve(),
      this._items.map(Item.resolve(resolver)),
      this._repeats,
    );
  }

  public partiallyResolve(
    resolver: Linear.PartialResolver,
  ): Linear.PartiallyResolved {
    return new Linear(
      this._direction.resolve(),
      Array.from(
        Iterable.map(this._items, (item) => item.partiallyResolve(resolver)),
      ),
      this._repeats,
    );
  }

  public equals(value: Linear): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Linear &&
      value._direction.equals(this._direction) &&
      value._items.length === this._items.length &&
      value._items.every((item, i) => item.equals(this._items[i])) &&
      value._repeats === this._repeats
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._direction);

    for (const item of this._items) {
      hash.writeHashable(item);
    }

    hash.writeUint32(this._items.length).writeBoolean(this._repeats);
  }

  public toJSON(): Linear.JSON {
    return {
      ...super.toJSON(),
      kind: "linear",
      direction: this._direction.toJSON(),
      items: this._items.map((item) => item.toJSON()),
      repeats: this._repeats,
    };
  }

  public toString(): string {
    const args = [this._direction, ...this._items].join(", ");

    return `${this._repeats ? "repeating-" : ""}linear-gradient(${args})`;
  }
}

/**
 * @public
 */
export namespace Linear {
  export type Canonical = Linear<Item.Canonical, Direction.Canonical>;

  export type PartiallyResolved = Linear<
    Item.PartiallyResolved,
    Direction.Canonical
  >;

  export interface JSON extends Value.JSON<"gradient"> {
    kind: "linear";
    direction: Direction.JSON;
    items: Array<Item.JSON>;
    repeats: boolean;
  }

  export type Resolver = Item.Resolver & Direction.Resolver;

  export type PartialResolver = Item.PartialResolver & Direction.Resolver;

  export function isLinear(value: unknown): value is Linear {
    return value instanceof Linear;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#funcdef-linear-gradient}
   */
  export const parse: CSSParser<Linear> = map(
    Function.parse(
      (fn) =>
        fn.value === "linear-gradient" ||
        fn.value === "repeating-linear-gradient",
      pair(option(left(Direction.parse, Comma.parse)), Item.parseList),
    ),
    ([fn, [direction, items]]) => {
      return Linear.of(
        direction.getOrElse(() => Side.of("bottom")),
        items,
        fn.name.startsWith("repeating"),
      );
    },
  );
}
