import { Diagnostic } from "@siteimprove/alfa-act";
import { Array } from "@siteimprove/alfa-array";
import { Element } from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";

/**
 * @internal
 */
export class WithBadElements extends Diagnostic implements Iterable<Element> {
  public static of(
    message: string,
    errors: Iterable<Element> = []
  ): WithBadElements {
    return new WithBadElements(message, Array.from(errors));
  }

  private readonly _errors: ReadonlyArray<Element>;

  private constructor(message: string, errors: Array<Element>) {
    super(message);
    this._errors = errors;
  }

  public get errors(): ReadonlyArray<Element> {
    return this._errors;
  }

  public equals(value: WithBadElements): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof WithBadElements &&
      value._message === this._message &&
      Array.equals(value._errors, this._errors)
    );
  }

  public *[Symbol.iterator](): Iterator<Element> {
    yield* this._errors;
  }

  public toJSON(): WithBadElements.JSON {
    return {
      ...super.toJSON(),
      errors: this._errors.map((element) => element.path()),
    };
  }
}

/**
 * @internal
 */
export namespace WithBadElements {
  export interface JSON extends Diagnostic.JSON {
    errors: Array<string>;
  }

  export function isWithBadElements(
    value: Diagnostic
  ): value is WithBadElements;

  export function isWithBadElements(value: unknown): value is WithBadElements;

  export function isWithBadElements(value: unknown): value is WithBadElements {
    return value instanceof WithBadElements;
  }
}