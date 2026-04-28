import { Diagnostic } from "@siteimprove/alfa-act";
import type { Element, Node } from "@siteimprove/alfa-dom";
import { Either } from "@siteimprove/alfa-either";
import type { Hash } from "@siteimprove/alfa-hash";
import type { Rectangle } from "@siteimprove/alfa-rectangle";
import { Sequence } from "@siteimprove/alfa-sequence";

import { WithBoundingBox } from "./with-bounding-box.ts";
import { WithName } from "./with-name.ts";

/**
 * Diagnostic for target size rules that includes the full clickable region,
 * exposing the elements that contributed to or subtracted from it, helping
 * end-users understand which elements are affecting the outcome.
 *
 * @public
 */
export class WithClickableRegion extends WithBoundingBox {
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
    name: string,
    box: Rectangle,
    condition: Either<
      WithBoundingBox.UACondition,
      WithBoundingBox.SizeAndSpacingCondition
    >,
    tooCloseNeighbors: Iterable<Element>,
    contributors: Iterable<Element>,
    subtractors: Iterable<Element>,
  ): WithClickableRegion;

  public static of(
    message: string,
    name?: string,
    box?: Rectangle,
    condition?: Either<
      WithBoundingBox.UACondition,
      WithBoundingBox.SizeAndSpacingCondition
    >,
    tooCloseNeighbors?: Iterable<Element>,
    contributors: Iterable<Element> = [],
    subtractors: Iterable<Element> = [],
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

    return new WithClickableRegion(
      message,
      name,
      box,
      condition,
      tooCloseNeighbors,
      contributors,
      subtractors,
    );
  }

  private readonly _contributors: Sequence<Element>;
  private readonly _subtractors: Sequence<Element>;

  protected constructor(
    message: string,
    name: string,
    box: Rectangle,
    condition: Either<
      WithBoundingBox.UACondition,
      WithBoundingBox.SizeAndSpacingCondition
    >,
    tooCloseNeighbors: Iterable<Element>,
    contributors: Iterable<Element>,
    subtractors: Iterable<Element>,
  ) {
    super(message, name, box, condition, tooCloseNeighbors);
    this._contributors = Sequence.from(contributors);
    this._subtractors = Sequence.from(subtractors);
  }

  /**
   * Elements that contributed area to the clickable region: the target element
   * itself and any visible, non-target descendants whose boxes were added.
   */
  public get contributors(): Sequence<Element> {
    return this._contributors;
  }

  /**
   * Elements that subtracted area from the clickable region: elements painted
   * above the target that intercept pointer events.
   */
  public get subtractors(): Sequence<Element> {
    return this._subtractors;
  }

  public equals(value: WithClickableRegion): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithClickableRegion &&
      super.equals(value) &&
      value._contributors.equals(this._contributors) &&
      value._subtractors.equals(this._subtractors)
    );
  }

  public hash(hash: Hash): void {
    super.hash(hash);
    this._contributors.hash(hash);
    this._subtractors.hash(hash);
  }

  public toJSON(
    options?: Node.SerializationOptions,
  ): WithClickableRegion.JSON {
    return {
      ...super.toJSON(options),
      contributors: this._contributors.toJSON(options),
      subtractors: this._subtractors.toJSON(options),
    };
  }
}

/**
 * @public
 */
export namespace WithClickableRegion {
  export interface JSON extends WithBoundingBox.JSON {
    contributors: Sequence.JSON<Element>;
    subtractors: Sequence.JSON<Element>;
  }

  export function isWithClickableRegion(
    value: WithClickableRegion,
  ): value is WithClickableRegion;

  export function isWithClickableRegion(
    value: unknown,
  ): value is WithClickableRegion;

  export function isWithClickableRegion(
    value: unknown,
  ): value is WithClickableRegion {
    return value instanceof WithClickableRegion;
  }
}
