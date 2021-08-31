import { Diagnostic, Outcome as Base, Rule } from "@siteimprove/alfa-act-base";
import { Equatable } from "@siteimprove/alfa-equatable";

import * as json from "@siteimprove/alfa-json";
import * as sarif from "@siteimprove/alfa-sarif";

export namespace Outcome {
  export class Inventory<I, T, Q = never, S = T> extends Base<I, T, Q, S> {
    public static of<I, T, Q, S>(
      rule: Rule<I, T, Q, S>,
      target: T,
      inventory: Diagnostic
    ): Inventory<I, T, Q, S> {
      return new Inventory(rule, target, inventory);
    }

    private readonly _target: T;
    private readonly _inventory: Diagnostic;

    private constructor(
      rule: Rule<I, T, Q, S>,
      target: T,
      inventory: Diagnostic
    ) {
      super(rule);

      this._target = target;
      this._inventory = inventory;
    }

    public get target(): T {
      return this._target;
    }

    public get inventory(): Diagnostic {
      return this._inventory;
    }

    public equals<I, T, Q, S>(value: Inventory<I, T, Q, S>): boolean;

    public equals(value: unknown): value is this;

    public equals(value: unknown): boolean {
      return (
        value instanceof Inventory &&
        value._rule.equals(this._rule) &&
        Equatable.equals(value._target, this._target) &&
        value._inventory.equals(this._inventory)
      );
    }

    public toJSON(): Inventory.JSON<T> {
      return {
        outcome: "inventory",
        rule: this._rule.toJSON(),
        target: json.Serializable.toJSON(this._target),
        inventory: this._inventory.toJSON(),
      };
    }

    public toSARIF(): sarif.Result {
      const locations: Array<sarif.Location> = [];

      for (const location of sarif.Serializable.toSARIF(this._target)) {
        locations.push(location as sarif.Location);
      }

      return {
        ruleId: this._rule.uri,
        kind: "informational",
        level: "none",
        message: {
          text: this._inventory.message,
          markdown: this._inventory.message,
        },
        locations,
      };
    }
  }

  export namespace Inventory {
    export interface JSON<T> extends Base.JSON {
      [key: string]: json.JSON;

      outcome: "inventory";
      target: json.Serializable.ToJSON<T>;
      inventory: Diagnostic.JSON;
    }

    export function isInventory<I, T, Q, S>(
      value: Base<I, T, Q, S>
    ): value is Inventory<I, T, Q, S>;

    export function isInventory<I, T, Q, S>(
      value: unknown
    ): value is Inventory<I, T, Q, S>;

    export function isInventory<I, T, Q, S>(
      value: unknown
    ): value is Inventory<I, T, Q, S> {
      return value instanceof Inventory;
    }
  }

  export const { of: inventory, isInventory } = Inventory;
}
