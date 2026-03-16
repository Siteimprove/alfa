import { Equatable } from "@siteimprove/alfa-equatable";
import * as json from "@siteimprove/alfa-json";

import { Finding } from "./finding.js";

/**
 * @public
 */
export class Conclusive<ANSWER> extends Finding<"conclusive"> {
  public static of<ANSWER>(
    answer: ANSWER,
    oracleUsed: boolean = false,
  ): Conclusive<ANSWER> {
    return new Conclusive(answer, oracleUsed);
  }

  private readonly _answer: ANSWER;

  private constructor(answer: ANSWER, oracleUsed: boolean) {
    super("conclusive", oracleUsed);
    this._answer = answer;
  }

  public get answer(): ANSWER {
    return this._answer;
  }

  public withOracle(): Conclusive<ANSWER> {
    if (this.oracleUsed) {
      return this;
    }

    return new Conclusive(this._answer, true);
  }

  public equals<ANSWER>(value: Conclusive<ANSWER>): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      super.equals(value) &&
      value instanceof Conclusive &&
      Equatable.equals(value._answer, this._answer)
    );
  }

  public toJSON(options?: json.Serializable.Options): Conclusive.JSON<ANSWER> {
    return {
      ...super.toJSON(options),
      answer: json.Serializable.toJSON(this._answer, options),
    };
  }

  public toString(): string {
    return `Conclusive { answer: ${JSON.stringify(this._answer)} }`;
  }
}

/**
 * @public
 */
export namespace Conclusive {
  export interface JSON<ANSWER> extends Finding.JSON<"conclusive"> {
    answer: json.Serializable.ToJSON<ANSWER>;
  }

  export function isConclusive<ANSWER>(
    value: unknown,
  ): value is Conclusive<ANSWER> {
    return value instanceof Conclusive;
  }
}
