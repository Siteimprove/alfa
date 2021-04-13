import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export class Diagnostic implements Equatable, Serializable<Diagnostic.JSON> {
  public static of(message: string): Diagnostic {
    return new Diagnostic(normalize(message));
  }

  protected readonly _message: string;

  protected constructor(message: string) {
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
  export interface JSON {
    [key: string]: json.JSON;
    message: string;
  }

  export function isDiagnostic(value: unknown): value is Diagnostic {
    return value instanceof Diagnostic;
  }
}

function normalize(input: string): string {
  return input.trim().replace(/\s+/g, " ");
}
