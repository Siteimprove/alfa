import { Diagnostic, Rule } from "@siteimprove/alfa-act-base";
import { Outcome as Inventory } from "@siteimprove/alfa-inventory";
import { Page } from "@siteimprove/alfa-web";

export function inventory<T, Q>(
  rule: Rule<Page, T, Q>,
  target: T,
  inventory: Diagnostic
): Inventory.Inventory.JSON<T> {
  return Inventory.Inventory.of(rule, target, inventory).toJSON();
}
