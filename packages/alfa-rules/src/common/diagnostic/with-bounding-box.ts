import { Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import { Hash } from "@siteimprove/alfa-hash";
import { Rectangle } from "@siteimprove/alfa-rectangle";
import { Sequence } from "@siteimprove/alfa-sequence";

import { WithName } from "./with-name.js";

import * as json from "@siteimprove/alfa-json";

export class WithBoundingBox extends WithName {
  public static of(message: string): Diagnostic;

  public static of(message: string, name: string): WithName;

  public static of(
    message: string,
    name: string,
    box: Rectangle,
    condition: Either<
      WithBoundingBox.UACondition,
      WithBoundingBox.SizeAndSpacingCondition
    >,
    tooCloseNeighbors: Iterable<Element>,
  ): WithBoundingBox;

  public static of(
    message: string,
    name?: string,
    box?: Rectangle,
    condition?: Either<
      WithBoundingBox.UACondition,
      WithBoundingBox.SizeAndSpacingCondition
    >,
    tooCloseNeighbors?: Iterable<Element>,
  ): Diagnostic {
    if (name === undefined) {
      return new Diagnostic(message);
    }

    if (
      box === undefined ||
      condition === undefined ||
      tooCloseNeighbors === undefined
    ) {
      return new WithName(message, name);
    }

    return new WithBoundingBox(
      message,
      name,
      box,
      condition,
      tooCloseNeighbors,
    );
  }

  protected readonly _box: Rectangle;
  protected readonly _condition: Either<
    WithBoundingBox.UACondition,
    WithBoundingBox.SizeAndSpacingCondition
  >;
  protected readonly _tooCloseNeighbors: Sequence<Element>;

  protected constructor(
    message: string,
    name: string,
    box: Rectangle,
    condition: Either<
      WithBoundingBox.UACondition,
      WithBoundingBox.SizeAndSpacingCondition
    >,
    tooCloseNeighbors: Iterable<Element>,
  ) {
    super(message, name);
    this._box = box;

    // Copy the objects to ensure they are immutable from the outside.
    this._condition = condition.either(
      (uaCond) => Either.left({ ua: uaCond.ua }),
      (sizeAndSpacingCond) =>
        Either.right({
          size: sizeAndSpacingCond.size,
          spacing: sizeAndSpacingCond.spacing,
        }),
    );

    this._tooCloseNeighbors = Sequence.from(tooCloseNeighbors);
  }

  public get box(): Rectangle {
    return this._box;
  }

  public get condition(): Either<
    WithBoundingBox.UACondition,
    WithBoundingBox.SizeAndSpacingCondition
  > {
    return this._condition;
  }

  public get tooCloseNeighbors(): Iterable<Element> {
    return this._tooCloseNeighbors;
  }

  public equals(value: WithBoundingBox): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithBoundingBox &&
      value._message === this._message &&
      value._name === this._name &&
      value._box.equals(this._box) &&
      value._condition.equals(this._condition) &&
      value._tooCloseNeighbors.equals(this._tooCloseNeighbors)
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    this._box.hash(hash);
    this._condition.hash(hash);
    this._tooCloseNeighbors.hash(hash);
  }

  public toJSON(): WithBoundingBox.JSON {
    return {
      ...super.toJSON(),
      box: this._box.toJSON(),
      condition: this._condition.toJSON(),
      tooCloseNeighbors: this._tooCloseNeighbors.toJSON(),
    };
  }
}

export namespace WithBoundingBox {
  export interface JSON extends WithName.JSON {
    box: Rectangle.JSON;
    condition: json.JSON;
    tooCloseNeighbors: Sequence.JSON<Element>;
  }

  export interface UACondition {
    ua: boolean;
  }

  export interface SizeAndSpacingCondition {
    size: boolean;
    spacing: boolean;
  }

  export function isWithBoundingBox(
    value: WithBoundingBox,
  ): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox;

  export function isWithBoundingBox(value: unknown): value is WithBoundingBox {
    return value instanceof WithBoundingBox;
  }
}
