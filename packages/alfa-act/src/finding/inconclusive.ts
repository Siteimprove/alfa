import * as json from "@siteimprove/alfa-json";

import { Diagnostic } from "../diagnostic.js";
import { Finding } from "./finding.js";

/**
 * @public
 */
export class Inconclusive<
  DIAGNOSTIC extends Diagnostic = Diagnostic,
> extends Finding<"inconclusive"> {
  public static of<DIAGNOSTIC extends Diagnostic = Diagnostic>(
    diagnostic: DIAGNOSTIC,
    oracleUsed: boolean = false,
  ): Inconclusive<DIAGNOSTIC> {
    return new Inconclusive(diagnostic, oracleUsed);
  }

  private readonly _diagnostic: DIAGNOSTIC;

  private constructor(diagnostic: DIAGNOSTIC, oracleUsed: boolean) {
    super("inconclusive", oracleUsed);
    this._diagnostic = diagnostic;
  }

  public get diagnostic(): DIAGNOSTIC {
    return this._diagnostic;
  }

  public withOracle(): Inconclusive<DIAGNOSTIC> {
    if (this.oracleUsed) {
      return this;
    }

    return new Inconclusive(this._diagnostic, true);
  }

  public equals<DIAGNOSTIC extends Diagnostic>(
    value: Inconclusive<DIAGNOSTIC>,
  ): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      super.equals(value) &&
      value instanceof Inconclusive &&
      value._diagnostic.equals(this._diagnostic)
    );
  }

  public toJSON(
    options?: json.Serializable.Options,
  ): Inconclusive.JSON<DIAGNOSTIC> {
    return {
      ...super.toJSON(options),
      diagnostic: json.Serializable.toJSON(
        this._diagnostic,
        options,
      ) as json.Serializable.ToJSON<DIAGNOSTIC>,
    };
  }

  public toString(): string {
    return `Inconclusive { diagnostic: ${this._diagnostic.message} }`;
  }
}

/**
 * @public
 */
export namespace Inconclusive {
  export interface JSON<
    DIAGNOSTIC extends Diagnostic = Diagnostic,
  > extends Finding.JSON<"inconclusive"> {
    diagnostic: json.Serializable.ToJSON<DIAGNOSTIC>;
  }

  export function isInconclusive(value: unknown): value is Inconclusive {
    return value instanceof Inconclusive;
  }
}
