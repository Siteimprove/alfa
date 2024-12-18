import { Diagnostic } from "@siteimprove/alfa-act";
import type { Element, Node } from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";
import type { Option } from "@siteimprove/alfa-option";

/**
 * @public
 */
export type HeadingPosition = "previous" | "next";

/**
 * @public
 */
export class WithOtherHeading extends Diagnostic {
  public static of(message: string): Diagnostic;

  public static of(
    message: string,
    otherHeading: Option<Element>,
    currentLevel: number,
    otherLevel: number,
    otherPosition: HeadingPosition,
  ): WithOtherHeading;

  public static of(
    message: string,
    otherHeading?: Option<Element>,
    currentLevel?: number,
    otherLevel?: number,
    otherPosition?: HeadingPosition,
  ): Diagnostic {
    return otherHeading === undefined ||
      currentLevel === undefined ||
      otherLevel === undefined ||
      otherPosition === undefined
      ? Diagnostic.of(message)
      : new WithOtherHeading(
          message,
          otherHeading,
          currentLevel,
          otherLevel,
          otherPosition,
        );
  }

  private readonly _otherHeading: Option<Element>;
  private readonly _currentLevel: number;
  private readonly _otherLevel: number;
  private readonly _otherPosition: HeadingPosition;

  protected constructor(
    message: string,
    otherHeading: Option<Element>,
    currentLevel: number,
    otherLevel: number,
    otherPosition: HeadingPosition,
  ) {
    super(message);
    this._otherHeading = otherHeading;
    this._currentLevel = currentLevel;
    this._otherLevel = otherLevel;
    this._otherPosition = otherPosition;
  }

  public get otherHeading(): Option<Element> {
    return this._otherHeading;
  }

  public get currentHeadingLevel(): number {
    return this._currentLevel;
  }

  public get otherHeadingLevel(): number {
    return this._otherLevel;
  }

  public get otherPosition(): HeadingPosition {
    return this._otherPosition;
  }

  public equals(value: WithOtherHeading): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithOtherHeading &&
      value._message === this._message &&
      value._otherHeading.equals(this._otherHeading) &&
      value._currentLevel === this._currentLevel &&
      value._otherLevel === this._otherLevel &&
      value._otherPosition === this._otherPosition
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeNumber(this._currentLevel);
    hash.writeNumber(this._otherLevel);
    hash.writeString(this._otherPosition);
    this._otherHeading.hash(hash);
  }

  public toJSON(options?: Node.SerializationOptions): WithOtherHeading.JSON {
    return {
      ...super.toJSON(options),
      otherHeading: this._otherHeading.toJSON(options),
      currentHeadingLevel: this._currentLevel,
      otherHeadingLevel: this._otherLevel,
      otherPosition: this._otherPosition,
    };
  }
}

/**
 * @public
 */
export namespace WithOtherHeading {
  export interface JSON extends Diagnostic.JSON {
    otherHeading: Option.JSON<Element>;
    currentHeadingLevel: number;
    otherHeadingLevel: number;
    otherPosition: HeadingPosition;
  }

  export function isWithOtherHeading(
    value: Diagnostic,
  ): value is WithOtherHeading;

  export function isWithOtherHeading(value: unknown): value is WithOtherHeading;

  /**@public */
  export function isWithOtherHeading(
    value: unknown,
  ): value is WithOtherHeading {
    return value instanceof WithOtherHeading;
  }
}
