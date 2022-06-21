import { Diagnostic } from "@siteimprove/alfa-act";

export enum Reason {
  AutoDetected = "auto-detected",
  UserAnswered = "user-answered",
  GoodClass = "good-class",
}

/**
 * @internal
 */
export class ExtendedDiagnostic extends Diagnostic {
  public static of(message: string): Diagnostic;
  public static of(message: string, reason: Reason): ExtendedDiagnostic;
  public static of(message: string, reason?: Reason): Diagnostic {
    return reason
      ? new ExtendedDiagnostic(message, reason)
      : Diagnostic.of(message);
  }

  private readonly _reason: Reason;

  private constructor(message: string, reason: Reason) {
    super(message);
    this._reason = reason;
  }

  public equals(value: ExtendedDiagnostic): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ExtendedDiagnostic && value._reason === this._reason
    );
  }

  public toJSON(): ExtendedDiagnostic.JSON {
    return {
      ...super.toJSON(),
      reason: this._reason,
    };
  }
}

/**
 * @internal
 */
export namespace ExtendedDiagnostic {
  export interface JSON extends Diagnostic.JSON {
    reason: string;
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
