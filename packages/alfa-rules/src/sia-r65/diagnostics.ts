import { Diagnostic } from "@siteimprove/alfa-act";
import { Map } from "@siteimprove/alfa-map";

export type Matches = {
  matchingTargets: number;
  matchingNonTargets: number;
};

/**
 * @internal
 */
export class ExtendedDiagnostic extends Diagnostic {
  public static of(
    message: string,
    matches: Map<string, Matches> = Map.empty()
  ): Diagnostic {
    return new ExtendedDiagnostic(message, matches);
  }

  private readonly _matches: Map<string, Matches>;

  private constructor(message: string, matches: Map<string, Matches>) {
    super(message);
    this._matches = matches;
  }

  public equals(value: ExtendedDiagnostic): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ExtendedDiagnostic &&
      value._matches.equals(this._matches)
    );
  }

  public toJSON(): ExtendedDiagnostic.JSON {
    return {
      ...super.toJSON(),
      matches: this._matches.toJSON(),
    };
  }
}

/**
 * @internal
 */
export namespace ExtendedDiagnostic {
  export interface JSON extends Diagnostic.JSON {
    matches: Map.JSON<string, Matches>;
  }

  export function isExtendedDiagnostic(
    value: Diagnostic
  ): value is ExtendedDiagnostic;

  export function isExtendedDiagnostic(
    value: unknown
  ): value is ExtendedDiagnostic;

  export function isExtendedDiagnostic(
    value: unknown
  ): value is ExtendedDiagnostic {
    return value instanceof ExtendedDiagnostic;
  }
}
