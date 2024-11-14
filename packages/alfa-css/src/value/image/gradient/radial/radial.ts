import type { Hash } from "@siteimprove/alfa-hash";
import { Iterable } from "@siteimprove/alfa-iterable";
import { None, Option } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";

import {
  Comma,
  Function,
  type Parser as CSSParser,
  Token,
} from "../../../../syntax/index.js";

import { Keyword } from "../../../textual/keyword.js";
import { Position } from "../../../position/index.js";
import type { PartiallyResolvable, Resolvable } from "../../../resolvable.js";
import { Value } from "../../../value.js";

import { Item } from "../item/index.js";

import { Extent } from "./extent.js";
import { Shape } from "./shape.js";

const { map, either, pair, option, left, right, delimited } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#radial-gradients}
 *
 * @public
 */
export class Radial<
    I extends Item = Item,
    S extends Shape = Shape,
    P extends Position = Position,
  >
  extends Value<"gradient", Value.HasCalculation<[I, S, P]>>
  implements
    Resolvable<Radial.Canonical, Radial.Resolver>,
    PartiallyResolvable<Radial.PartiallyResolved, Radial.PartialResolver>
{
  public static of<
    I extends Item = Item,
    S extends Shape = Shape,
    P extends Position = Position,
  >(
    shape: S,
    position: P,
    items: Iterable<I>,
    repeats: boolean,
  ): Radial<I, S, P> {
    return new Radial(shape, position, Array.from(items), repeats);
  }

  private readonly _shape: S;
  private readonly _position: P;
  private readonly _items: Array<I>;
  private readonly _repeats: boolean;

  private constructor(
    shape: S,
    position: P,
    items: Array<I>,
    repeats: boolean,
  ) {
    super(
      "gradient",
      Value.hasCalculation(
        shape,
        position,
        ...items,
      ) as unknown as Value.HasCalculation<[I, S, P]>,
    );
    this._shape = shape;
    this._position = position;
    this._items = items;
    this._repeats = repeats;
  }

  public get kind(): "radial" {
    return "radial";
  }

  public get shape(): S {
    return this._shape;
  }

  public get position(): P {
    return this._position;
  }

  public get items(): Iterable<I> {
    return this._items;
  }

  public get repeats(): boolean {
    return this._repeats;
  }

  public resolve(resolver: Radial.Resolver): Radial.Canonical {
    return new Radial(
      this._shape.resolve(resolver),
      this._position.resolve(resolver),
      this._items.map(Item.resolve(resolver)),
      this._repeats,
    );
  }

  public partiallyResolve(
    resolver: Radial.PartialResolver,
  ): Radial.PartiallyResolved {
    return new Radial(
      Shape.partiallyResolve(resolver)(this._shape),
      this._position.partiallyResolve(resolver),
      Array.from(
        Iterable.map(this._items, (item) => item.partiallyResolve(resolver)),
      ),
      this._repeats,
    );
  }

  public equals(value: Radial): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Radial &&
      value._shape.equals(this._shape) &&
      value._position.equals(this._position) &&
      value._items.length === this._items.length &&
      value._items.every((item, i) => item.equals(this._items[i])) &&
      value._repeats === this._repeats
    );
  }

  public hash(hash: Hash): void {
    hash.writeHashable(this._shape).writeHashable(this._position);

    for (const item of this._items) {
      hash.writeHashable(item);
    }

    hash.writeUint32(this._items.length).writeBoolean(this._repeats);
  }

  public toJSON(): Radial.JSON {
    return {
      ...super.toJSON(),
      kind: "radial",
      shape: this._shape.toJSON(),
      position: this._position.toJSON(),
      items: this._items.map((item) => item.toJSON()),
      repeats: this._repeats,
    };
  }

  public toString(): string {
    const args = [`${this._shape} at ${this._position}`, ...this._items].join(
      ", ",
    );

    return `${this._repeats ? "repeating-" : ""}radial-gradient(${args})`;
  }
}

/**
 * @public
 */
export namespace Radial {
  export type Canonical = Radial<
    Item.Canonical,
    Shape.Canonical,
    Position.Canonical
  >;

  export type PartiallyResolved = Radial<
    Item.PartiallyResolved,
    Shape.PartiallyResolved,
    Position.PartiallyResolved
  >;

  export interface JSON extends Value.JSON<"gradient"> {
    kind: "radial";
    shape: Shape.JSON;
    position: Position.JSON;
    items: Array<Item.JSON>;
    repeats: boolean;
  }

  export type Resolver = Item.Resolver & Shape.Resolver & Position.Resolver;

  export type PartialResolver = Item.PartialResolver &
    Shape.PartialResolver &
    Position.PartialResolver;

  export function isRadial(value: unknown): value is Radial {
    return value instanceof Radial;
  }

  const parsePosition = right(
    delimited(option(Token.parseWhitespace), Keyword.parse("at")),
    Position.parse(false /* legacySyntax */),
  );

  /**
   * {@link https://drafts.csswg.org/css-images/#funcdef-radial-gradient}
   */
  export const parse: CSSParser<Radial> = map(
    Function.parse(
      (fn) =>
        fn.value === "radial-gradient" ||
        fn.value === "repeating-radial-gradient",
      pair(
        option(
          left(
            either(
              pair(
                map(Shape.parse, (shape) => Option.of(shape)),
                option(delimited(option(Token.parseWhitespace), parsePosition)),
              ),
              map(
                parsePosition,
                (position) => [None, Option.of(position)] as const,
              ),
            ),
            Comma.parse,
          ),
        ),
        Item.parseList,
      ),
    ),
    (result) => {
      const [fn, [shapeAndPosition, items]] = result;

      const shape = shapeAndPosition
        .flatMap(([shape]) => shape)
        .getOrElse(() => Extent.of());

      const position = shapeAndPosition
        .flatMap(([, position]) => position)
        .getOrElse(() =>
          Position.of(Keyword.of("center"), Keyword.of("center")),
        );

      return Radial.of(shape, position, items, fn.name.startsWith("repeating"));
    },
  );
}
