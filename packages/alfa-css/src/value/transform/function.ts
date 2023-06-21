import { Value } from "../value";

/**
 * @internal
 */
export abstract class Function<
  K extends string = string
> extends Value<"transform"> {
  private readonly _kind: K;
  protected constructor(kind: K, hasCalculation: false) {
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

  export function isFunction(value: unknown): value is Function {
    return value instanceof Function;
  }
}
