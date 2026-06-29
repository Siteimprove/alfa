import type { Equatable } from "@siteimprove/alfa-equatable";
import type { Hash, Hashable } from "@siteimprove/alfa-hash";
import type { Serializable } from "@siteimprove/alfa-json";
import { String } from "@siteimprove/alfa-string";

import type * as json from "@siteimprove/alfa-json";

/**
 * Diagnostics are associated with each Question or final Outcome. They at least
 * contain an explanatory message. Diagnostics can be extended to include more
 * information for the rules that need it.
 *
 * @public
 */
export class Diagnostic
  implements Equatable, Hashable, Serializable<Diagnostic.JSON>
{
  public static of(message: string): Diagnostic {
    return new Diagnostic(String.normalize(message, false));
  }

  private static _empty = new Diagnostic("No extra information");

  public static empty(): Diagnostic {
    return this._empty;
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

  public hash(hash: Hash) {
    hash.writeString(this._message);
  }

  public toJSON(options?: Serializable.Options): Diagnostic.JSON {
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
