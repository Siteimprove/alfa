import { Diagnostic as Base } from "@siteimprove/alfa-act-base";

/**
 * @public
 */
export class Diagnostic extends Base {
  public static of(message: string): Diagnostic {
    return new Diagnostic(normalize(message));
  }

  protected readonly _message: string;

  protected constructor(message: string) {
    super();
    this._message = message;
  }

  public get message(): string {
    return this._message;
  }

  public equals(value: Diagnostic): boolean;

  public equals(value: unknown): value is this;

  public equals(value: unknown): boolean {
    return value instanceof Diagnostic && value._message === this._message;
  }

  public toJSON(): Diagnostic.JSON {
    return {
      message: this._message,
    };
  }
}

/**
 * @public
 */
export namespace Diagnostic {
  export interface JSON extends Base.JSON {
    message: string;
  }

  export function isDiagnostic(value: unknown): value is Diagnostic {
    return value instanceof Diagnostic;
  }
}

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
