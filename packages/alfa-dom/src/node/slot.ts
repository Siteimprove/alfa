import { Iterable } from "@siteimprove/alfa-iterable";

import { Element } from "./element";
import { Shadow } from "./shadow";
import { Slotable } from "./slotable";

export interface Slot extends Element {
  /**
   * Get the slotables assigned to this slot.
   *
   * @see https://html.spec.whatwg.org/#dom-slot-assignednodes
   */
  assignedNodes(): Iterable<Slotable>;
}

export namespace Slot {
  export function isSlot(element: Element): boolean;

  export function isSlot(value: unknown): value is Slot;

  export function isSlot(value: unknown): value is Slot {
    return Element.isElement(value) && value.name === "slot";
  }

  /**
   * @see https://dom.spec.whatwg.org/#slot-name
   */
  export function name(slot: Slot): string {
    return slot
      .attribute("name")
      .map(name => name.value)
      .getOr("");
  }

  /**
   * @see https://dom.spec.whatwg.org/#find-slotables
   */
  export function* findSlotables(slot: Slot): Iterable<Slotable> {
    const root = slot.root();

    if (Shadow.isShadow(root)) {
      for (const child of root.host.children()) {
        if (Slotable.isSlotable(child) && child.assignedSlot().includes(slot)) {
          yield child;
        }
      }
    }
  }
}
