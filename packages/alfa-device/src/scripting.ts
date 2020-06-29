import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash, Hashable } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";

import * as json from "@siteimprove/alfa-json";

/**
 * @see https://drafts.csswg.org/mediaqueries-5/#mf-scripting
 *
 * @remarks
 * As noted in Media Queries Level 5, a future level of CSS may extend the
 * scripting feature to allow fine-grained detection of which script is allowed
 * to run. While the `Scripting` class therefore currently seems very sparse, we
 * foresee a need to extend it in the future.
 */
export class Scripting implements Equatable, Hashable, Serializable {
  public static of(enabled: boolean): Scripting {
    return new Scripting(enabled);
  }

  private readonly _enabled: boolean;

  private constructor(enabled: boolean) {
    this._enabled = enabled;
  }

  public get enabled(): boolean {
    return this._enabled;
  }

  public equals(value: unknown): value is this {
    return value instanceof Scripting && value._enabled === this._enabled;
  }

  public hash(hash: Hash): void {
    Hash.writeBoolean(hash, this._enabled);
  }

  public toJSON(): Scripting.JSON {
    return {
      enabled: this._enabled,
    };
  }
}

export namespace Scripting {
  export interface JSON {
    [key: string]: json.JSON;
    enabled: boolean;
  }

  export function isScripting(value: unknown): value is Scripting {
    return value instanceof Scripting;
  }

  export function from(json: JSON): Scripting {
    return Scripting.of(json.enabled);
  }
}
