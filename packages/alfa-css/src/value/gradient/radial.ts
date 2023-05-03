import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";
import { Parser } from "@siteimprove/alfa-parser";
import { Result, Err } from "@siteimprove/alfa-result";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../../syntax";
import { Value } from "../../value";

import { Length, Percentage } from "../numeric";
import { Position } from "../position";
import { Gradient } from "../gradient";
import { Keyword } from "../keyword";

const { map, either, pair, option, left, right, delimited, take } = Parser;

/**
 * {@link https://drafts.csswg.org/css-images/#radial-gradients}
 *
 * @public
 */
export class Radial<
  I extends Gradient.Item = Gradient.Item,
  S extends Radial.Shape = Radial.Shape,
  P extends Position = Position
> extends Value<"gradient"> {
  public static of<
    I extends Gradient.Item = Gradient.Item,
    S extends Radial.Shape = Radial.Shape,
    P extends Position = Position
  >(
    shape: S,
    position: P,
    items: Iterable<I>,
    repeats: boolean
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
    items: Iterable<I>,
    repeats: boolean
  ) {
    super();
    this._shape = shape;
    this._position = position;
    this._items = [...items];
    this._repeats = repeats;
  }

  public get type(): "gradient" {
    return "gradient";
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
      type: "gradient",
      kind: "radial",
      shape: this._shape.toJSON(),
      position: this._position.toJSON(),
      items: this._items.map((item) => item.toJSON()),
      repeats: this._repeats,
    };
  }

  public toString(): string {
    const args = [`${this._shape} at ${this._position}`, ...this._items].join(
      ", "
    );

    return `${this._repeats ? "repeating-" : ""}radial-gradient(${args})`;
  }
}

/**
 * @public
 */
export namespace Radial {
  export interface JSON extends Value.JSON<"gradient"> {
    kind: "radial";
    shape: Shape.JSON;
    position: Position.JSON;
    items: Array<Gradient.Item.JSON>;
    repeats: boolean;
  }

  export type Shape = Circle | Ellipse | Extent;

  export namespace Shape {
    export type JSON = Circle.JSON | Ellipse.JSON | Extent.JSON;
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#valdef-ending-shape-circle}
   */
  export class Circle<R extends Length = Length>
    implements Equatable, Hashable, Serializable<Circle.JSON>
  {
    public static of<R extends Length>(radius: R): Circle<R> {
      return new Circle(radius);
    }

    private readonly _radius: R;

    private constructor(radius: R) {
      this._radius = radius;
    }

    public get type(): "circle" {
      return "circle";
    }

    public get radius(): R {
      return this._radius;
    }

    public equals(value: Circle): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return value instanceof Circle && value._radius.equals(this._radius);
    }

    public hash(hash: Hash): void {
      hash.writeHashable(this._radius);
    }

    public toJSON(): Circle.JSON {
      return {
        type: "circle",
        radius: this._radius.toJSON(),
      };
    }

    public toString(): string {
      return `circle ${this._radius}`;
    }
  }

  export namespace Circle {
    export interface JSON {
      [key: string]: json.JSON;
      type: "circle";
      radius: Length.JSON;
    }
  }

  /**
   * {@link https://drafts.csswg.org/css-images/#valdef-ending-shape-ellipse}
   */
  export class Ellipse<R extends Length | Percentage = Length | Percentage>
    implements Equatable, Hashable, Serializable<Ellipse.JSON>
  {
    public static of<R extends Length | Percentage>(
      horizontal: R,
      vertical: R
    ): Ellipse<R> {
      return new Ellipse(horizontal, vertical);
    }

    private readonly _horizontal: R;
    private readonly _vertical: R;

    private constructor(horizontal: R, vertical: R) {
      this._horizontal = horizontal;
      this._vertical = vertical;
    }

    public get type(): "ellipse" {
      return "ellipse";
    }

    public get horizontal(): R {
      return this._horizontal;
    }

    public get vertical(): R {
      return this._vertical;
    }

    public equals(value: Ellipse): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Ellipse &&
        value._horizontal.equals(this._horizontal) &&
        value._vertical.equals(this._vertical)
      );
    }

    public hash(hash: Hash): void {
      hash.writeHashable(this._horizontal).writeHashable(this._vertical);
    }

    public toJSON(): Ellipse.JSON {
      return {
        type: "ellipse",
        horizontal: this._horizontal.toJSON(),
        vertical: this._vertical.toJSON(),
      };
    }

    public toString(): string {
      return `ellipse ${this._horizontal} ${this._vertical}`;
    }
  }

  export namespace Ellipse {
    export interface JSON {
      [key: string]: json.JSON;
      type: "ellipse";
      horizontal: Length.JSON | Percentage.JSON;
      vertical: Length.JSON | Percentage.JSON;
    }
  }

  export class Extent
    implements Equatable, Hashable, Serializable<Extent.JSON>
  {
    public static of(
      shape: Extent.Shape = Extent.Shape.Circle,
      size: Extent.Size = Extent.Size.FarthestCorner
    ): Extent {
      return new Extent(shape, size);
    }

    private readonly _shape: Extent.Shape;
    private readonly _size: Extent.Size;

    private constructor(shape: Extent.Shape, size: Extent.Size) {
      this._shape = shape;
      this._size = size;
    }

    public get type(): "extent" {
      return "extent";
    }

    public get shape(): Extent.Shape {
      return this._shape;
    }

    public get size(): Extent.Size {
      return this._size;
    }

    public equals(value: Extent): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Extent &&
        value._shape === this._shape &&
        value._size === this._size
      );
    }

    public hash(hash: Hash): void {
      hash.writeString(this._shape).writeString(this._size);
    }

    public toJSON(): Extent.JSON {
      return {
        type: "extent",
        shape: this._shape,
        size: this._size,
      };
    }

    public toString(): string {
      return `${this._shape} ${this._size}`;
    }
  }

  export namespace Extent {
    export enum Shape {
      Circle = "circle",
      Ellipse = "ellipse",
    }

    export enum Size {
      ClosestSide = "closest-side",
      FarthestSide = "farthest-side",
      ClosestCorner = "closest-corner",
      FarthestCorner = "farthest-corner",
    }

    export interface JSON {
      [key: string]: json.JSON;
      type: "extent";
      shape: `${Shape}`;
      size: `${Size}`;
    }
  }

  const parsePosition = right(
    delimited(option(Token.parseWhitespace), Keyword.parse("at")),
    Position.parse(false /* legacySyntax */)
  );

  const parseCircleShape = Keyword.parse("circle");

  const parseCircleRadius = Length.parse;

  const parseCircle: Parser<Slice<Token>, Circle, string> = (input) => {
    let shape: Keyword<"circle"> | undefined;
    let radius: Length | undefined;

    while (true) {
      for ([input] of Token.parseWhitespace(input)) {
      }

      if (shape === undefined) {
        const result = parseCircleShape(input);

        if (result.isOk()) {
          [input, shape] = result.get();
          continue;
        }
      }

      if (radius === undefined) {
        const result = parseCircleRadius(input);

        if (result.isOk()) {
          [input, radius] = result.get();
          continue;
        }
      }

      break;
    }

    if (radius === undefined) {
      return Err.of(`Expected circle radius`);
    }

    return Result.of([input, Circle.of(radius)]);
  };

  const parseEllipseShape = Keyword.parse("ellipse");

  const parseEllipseSize = take(
    delimited(
      option(Token.parseWhitespace),
      either(Length.parse, Percentage.parse)
    ),
    2
  );

  const parseEllipse: Parser<Slice<Token>, Ellipse, string> = (input) => {
    let shape: Keyword<"ellipse"> | undefined;
    let horizontal: Length | Percentage | undefined;
    let vertical: Length | Percentage | undefined;

    while (true) {
      for ([input] of Token.parseWhitespace(input)) {
      }

      if (shape === undefined) {
        const result = parseEllipseShape(input);

        if (result.isOk()) {
          [input, shape] = result.get();
          continue;
        }
      }

      if (horizontal === undefined || vertical === undefined) {
        const result = parseEllipseSize(input);

        if (result.isOk()) {
          [input, [horizontal, vertical]] = result.get();
          continue;
        }
      }

      break;
    }

    if (horizontal === undefined || vertical === undefined) {
      return Err.of(`Expected ellipse size`);
    }

    return Result.of([input, Ellipse.of(horizontal, vertical)]);
  };

  const parseExtentShape = map(
    Keyword.parse("circle", "ellipse"),
    (keyword) => keyword.value as Extent.Shape
  );

  const parseExtentSize = map(
    Keyword.parse(
      "closest-side",
      "farthest-side",
      "closest-corner",
      "farthest-corner"
    ),
    (keyword) => keyword.value as Extent.Size
  );

  const parseExtent: Parser<Slice<Token>, Radial.Extent, string> = (input) => {
    let shape: Extent.Shape | undefined;
    let size: Extent.Size | undefined;

    while (true) {
      for ([input] of Token.parseWhitespace(input)) {
      }

      if (shape === undefined) {
        const result = parseExtentShape(input);

        if (result.isOk()) {
          [input, shape] = result.get();
          continue;
        }
      }

      if (size === undefined) {
        const result = parseExtentSize(input);

        if (result.isOk()) {
          [input, size] = result.get();
          continue;
        }
      }

      break;
    }

    if (shape === undefined && size === undefined) {
      return Err.of(`Expected either an extent shape or size`);
    }

    return Result.of([input, Extent.of(shape, size)]);
  };

  const parseShape = either(either(parseEllipse, parseCircle), parseExtent);

  /**
   * {@link https://drafts.csswg.org/css-images/#funcdef-radial-gradient}
   */
  export const parse: Parser<Slice<Token>, Radial, string> = map(
    pair(
      Token.parseFunction(
        (fn) =>
          fn.value === "radial-gradient" ||
          fn.value === "repeating-radial-gradient"
      ),
      left(
        delimited(
          option(Token.parseWhitespace),
          pair(
            option(
              left(
                either(
                  pair(
                    map(parseShape, (shape) => Option.of(shape)),
                    option(
                      delimited(option(Token.parseWhitespace), parsePosition)
                    )
                  ),
                  map(
                    parsePosition,
                    (position) => [None, Option.of(position)] as const
                  )
                ),
                delimited(option(Token.parseWhitespace), Token.parseComma)
              )
            ),
            Gradient.parseItemList
          )
        ),
        Token.parseCloseParenthesis
      )
    ),
    (result) => {
      const [fn, [shapeAndPosition, items]] = result;

      const shape = shapeAndPosition
        .flatMap(([shape]) => shape)
        .getOrElse(() => Extent.of());

      const position = shapeAndPosition
        .flatMap(([, position]) => position)
        .getOrElse(() =>
          Position.of(Keyword.of("center"), Keyword.of("center"))
        );

      return Radial.of(
        shape,
        position,
        items,
        fn.value.startsWith("repeating")
      );
    }
  );
}
