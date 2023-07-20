import { Value } from "../value";

/**
 * @internal
 */
export abstract class Function<
  K extends string = string,
  CALC extends boolean = boolean
> extends Value<"transform", CALC> {
  private readonly _kind: K;
  protected constructor(kind: K, hasCalculation: CALC) {
    super("transform", hasCalculation);
    this._kind = kind;
  }

  public get kind(): K {
    return this._kind;
  }

  public toJSON(): Function.JSON<K> {
    return {
      ...super.toJSON(),
      kind: this._kind,
    };
  }
}

/**
 * @internal
 */
export namespace Function {
  export interface JSON<K extends string = string>
    extends Value.JSON<"transform"> {
    kind: K;
  }
}
