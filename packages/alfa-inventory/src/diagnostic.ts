import { Diagnostic as Base } from "@siteimprove/alfa-act-base";

/**
 * @public
 */
export class Diagnostic extends Base {
  public static of(): Diagnostic {
    return new Diagnostic();
  }

  protected constructor() {
    super();
  }

  public equals(value: Diagnostic): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Diagnostic;
  }

  public toJSON(): Diagnostic.JSON {
    return {};
  }
}

/**
 * @public
 */
export namespace Diagnostic {
  export interface JSON extends Base.JSON {}

  export function isDiagnostic(value: unknown): value is Diagnostic {
    return value instanceof Diagnostic;
  }
}
