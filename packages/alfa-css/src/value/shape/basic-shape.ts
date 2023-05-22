import { Value } from "../../value";

/**
 * @internal
 */
export abstract class BasicShape<K extends string = string> extends Value<
  "basic-shape",
  false
> {
  private readonly _kind: K;
  protected constructor(kind: K, hasCalculation: false) {
    super("basic-shape", hasCalculation);
    this._kind = kind;
  }

  public get kind(): K {
    return this._kind;
  }

  public toJSON(): BasicShape.JSON<K> {
    return {
      ...super.toJSON(),
      kind: this._kind,
    };
  }
}

/**
 * @internal
 */
export namespace BasicShape {
  export interface JSON<K extends string = string>
    extends Value.JSON<"basic-shape"> {
    kind: K;
  }

  export function isBasicShape(value: unknown): value is BasicShape {
    return value instanceof BasicShape;
  }
}
