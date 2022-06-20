import { Diagnostic } from "@siteimprove/alfa-act";

type Reason = "focus-indicator" | "class";
export type Detection = "auto" | "manual";

/**
 * @internal
 */
export class ExtendedDiagnostic extends Diagnostic {
  public static of(
    message: string,
    reason: Reason = "class",
    detection: Detection = "auto"
  ): ExtendedDiagnostic {
    return new ExtendedDiagnostic(message, reason, detection);
  }

  private readonly _reason: Reason;
  private readonly _detection: Detection;

  private constructor(message: string, reason: Reason, detection: Detection) {
    super(message);
    this._reason = reason;
    this._detection = detection;
  }

  public equals(value: ExtendedDiagnostic): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return (
      value instanceof ExtendedDiagnostic &&
      value._reason === this._reason &&
      value._detection === this._detection
    );
  }

  public toJSON(): ExtendedDiagnostic.JSON {
    return {
      ...super.toJSON(),
      reason: this._reason,
      detection: this._detection,
    };
  }
}

/**
 * @internal
 */
export namespace ExtendedDiagnostic {
  export interface JSON extends Diagnostic.JSON {}

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
