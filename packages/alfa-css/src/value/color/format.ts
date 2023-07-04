import { Value } from "../value";

/**
 * @internal
 */
export abstract class Format<
  F extends string = string,
  CALC extends boolean = boolean
> extends Value<"color", CALC> {
  private readonly _format: F;
  protected constructor(format: F, hasCalculation: CALC) {
    super("color", hasCalculation);
    this._format = format;
  }

  public get format(): F {
    return this._format;
  }

  public toJSON(): Format.JSON<F> {
    return {
      ...super.toJSON(),
      format: this._format,
    };
  }
}

/**
 * @internal
 */
export namespace Format {
  export interface JSON<F extends string = string> extends Value.JSON<"color"> {
    format: F;
  }
}
