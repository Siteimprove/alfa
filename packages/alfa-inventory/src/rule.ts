import { Diagnostic } from "@siteimprove/alfa-act-base";
import { Future } from "@siteimprove/alfa-future";
import { Iterable } from "@siteimprove/alfa-iterable";

import * as base from "@siteimprove/alfa-act-base";

import { Outcome } from "./outcome";

/**
 * @public
 */
export namespace Rule {
  export class Inventory<I = unknown, T = unknown> extends base.Rule<I, T> {
    public static of<I, T = unknown>(properties: {
      uri: string;
      evaluate: Inventory.Evaluate<I, T>;
    }): Inventory<I, T> {
      return new Inventory(properties.uri, properties.evaluate);
    }

    private constructor(uri: string, evaluate: Inventory.Evaluate<I, T>) {
      super(uri, [], (input) => {
        const { applicability, expectations } = evaluate(input);

        return Future.traverse(applicability(), (target) =>
          Future.now(Outcome.inventory(this, target, expectations(target)))
        );
      });
    }

    public toJSON(): Inventory.JSON {
      return {
        type: "inventory",
        uri: this._uri,
        tags: [],
      };
    }
  }

  export namespace Inventory {
    export interface JSON extends base.Rule.JSON {
      type: "inventory";
    }

    export interface Evaluate<I, T> {
      (input: Readonly<I>): {
        applicability(): Iterable<T>;
        expectations(target: T): Diagnostic;
      };
    }
  }
}
