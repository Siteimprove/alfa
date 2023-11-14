import { Diagnostic } from "@siteimprove/alfa-act";
import { Element } from "@siteimprove/alfa-dom";
import { Hash } from "@siteimprove/alfa-hash";
import { Option } from "@siteimprove/alfa-option";

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
  ): WithOtherHeading;

  public static of(
    message: string,
    otherHeading?: Option<Element>,
    currentLevel?: number,
    otherLevel?: number,
  ): Diagnostic {
    return otherHeading === undefined ||
      currentLevel === undefined ||
      otherLevel === undefined
      ? Diagnostic.of(message)
      : new WithOtherHeading(message, otherHeading, currentLevel, otherLevel);
  }

  private readonly _otherHeading: Option<Element>;
  private readonly _currentLevel: number;
  private readonly _otherLevel: number;

  private constructor(
    message: string,
    otherHeading: Option<Element>,
    currentLevel: number,
    otherLevel: number,
  ) {
    super(message);
    this._otherHeading = otherHeading;
    this._currentLevel = currentLevel;
    this._otherLevel = otherLevel;
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

  public equals(value: WithOtherHeading): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithOtherHeading &&
      value._message === this._message &&
      value._otherHeading.equals(this._otherHeading) &&
      value._currentLevel === this._currentLevel &&
      value._otherLevel === this._otherLevel
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    hash.writeNumber(this._currentLevel);
    hash.writeNumber(this._otherLevel);
    this._otherHeading.hash(hash);
  }

  public toJSON(): WithOtherHeading.JSON {
    return {
      ...super.toJSON(),
      otherHeading: this._otherHeading.toJSON(),
      currentHeadingLevel: this._currentLevel,
      otherHeadingLevel: this._otherLevel,
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
