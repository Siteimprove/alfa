import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @public
 */
export abstract class Diagnostic
  implements Equatable, Serializable<Diagnostic.JSON> {
  public abstract equals(value: Diagnostic): boolean;

  public abstract equals(value: unknown): value is this;

  public abstract equals(value: unknown): boolean;

  public abstract toJSON(): Diagnostic.JSON;
}

/**
 * @public
 */
export namespace Diagnostic {
  export interface JSON {
    [key: string]: json.JSON;
  }

  export function isDiagnostic(value: unknown): value is Diagnostic {
    return value instanceof Diagnostic;
  }
}
