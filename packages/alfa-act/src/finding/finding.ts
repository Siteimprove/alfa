import type { Equatable } from "@siteimprove/alfa-equatable";
import type * as json from "@siteimprove/alfa-json";

/**
 * The result of an {@link Interview}: either conclusive (a final answer was
 * reached) or inconclusive (more information is needed).
 *
 * @public
 */
export abstract class Finding<K extends string = string>
  implements Equatable, json.Serializable<Finding.JSON<K>>
{
  protected readonly _type = "finding" as const;
  protected readonly _kind: K;
  protected readonly _oracleUsed: boolean;

  protected constructor(kind: K, oracleUsed: boolean) {
    this._kind = kind;
    this._oracleUsed = oracleUsed;
  }

  public get type(): "finding" {
    return this._type;
  }

  public get kind(): K {
    return this._kind;
  }

  public get oracleUsed(): boolean {
    return this._oracleUsed;
  }

  public abstract withOracle(): Finding;

  public equals(value: Finding): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof Finding &&
      value._kind === this._kind &&
      value._oracleUsed === this._oracleUsed
    );
  }

  public toJSON(options?: json.Serializable.Options): Finding.JSON<K> {
    return {
      type: this._type,
      kind: this._kind,
      oracleUsed: this._oracleUsed,
    };
  }

  public abstract toString(): string;
}

/**
 * @public
 */
export namespace Finding {
  export interface JSON<K extends string = string> {
    [key: string]: json.JSON;
    type: "finding";
    kind: K;
    oracleUsed: boolean;
  }

  export function isFinding(value: unknown): value is Finding {
    return value instanceof Finding;
  }
}
