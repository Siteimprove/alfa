import { Diagnostic } from "@siteimprove/alfa-act";
import type { Node } from "@siteimprove/alfa-dom";
import type { Hash } from "@siteimprove/alfa-hash";
import { Map } from "@siteimprove/alfa-map";

/**
 * @public
 */
export class MatchingClasses extends Diagnostic {
  public static of(
    message: string,
    matchingTargets: Map<string, number> = Map.empty(),
    matchingNonTargets: Map<string, number> = Map.empty(),
  ): Diagnostic {
    return new MatchingClasses(message, matchingTargets, matchingNonTargets);
  }

  private readonly _matchingTargets: Map<string, number>;
  private readonly _matchingNonTargets: Map<string, number>;

  protected constructor(
    message: string,
    matchingTargets: Map<string, number>,
    matchingNonTargets: Map<string, number>,
  ) {
    super(message);
    this._matchingTargets = matchingTargets;
    this._matchingNonTargets = matchingNonTargets;
  }

  public get matchingTargets(): Map<string, number> {
    return this._matchingTargets;
  }

  public get matchingNonTargets(): Map<string, number> {
    return this._matchingNonTargets;
  }

  public equals(value: MatchingClasses): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof MatchingClasses &&
      value._matchingTargets.equals(this._matchingTargets) &&
      value._matchingNonTargets.equals(this._matchingNonTargets)
    );
  }

  public hash(hash: Hash) {
    super.hash(hash);
    this._matchingTargets.hash(hash);
    this._matchingNonTargets.hash(hash);
  }

  public toJSON(options?: Node.SerializationOptions): MatchingClasses.JSON {
    return {
      ...super.toJSON(options),
      matchingTargets: this._matchingTargets.toJSON(options),
      matchingNonTargets: this._matchingNonTargets.toJSON(options),
    };
  }
}

/**
 * @public
 */
export namespace MatchingClasses {
  export interface JSON extends Diagnostic.JSON {
    matchingTargets: Map.JSON<string, number>;
    matchingNonTargets: Map.JSON<string, number>;
  }

  export function isMatchingClasses(
    value: Diagnostic,
  ): value is MatchingClasses;

  export function isMatchingClasses(value: unknown): value is MatchingClasses;

  /**@public */
  export function isMatchingClasses(value: unknown): value is MatchingClasses {
    return value instanceof MatchingClasses;
  }
}
