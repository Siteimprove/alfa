import { Element } from "./element.js";
import { Shadow } from "./shadow.js";
import { Slotable } from "./slotable.js";

/**
 * @public
 */
export interface Slot extends Element {
  /**
   * Get the slotables assigned to this slot.
   *
   * {@link https://html.spec.whatwg.org/#dom-slot-assignednodes}
   */
  assignedNodes(): Iterable<Slotable>;
}

/**
 * @public
 */
export namespace Slot {
  export function isSlot(element: Element): boolean;

  export function isSlot(value: unknown): value is Slot;

  export function isSlot(value: unknown): value is Slot {
    return Element.isElement(value) && value.name === "slot";
  }

  /**
   * {@link https://dom.spec.whatwg.org/#slot-name}
   */
  export function name(slot: Slot): string {
    return slot
      .attribute("name")
      .map((name) => name.value)
      .getOr("");
  }

  /**
   * {@link https://dom.spec.whatwg.org/#find-slotables}
   */
  export function* findSlotables(slot: Slot): Iterable<Slotable> {
    const root = slot.root();

    if (Shadow.isShadow(root)) {
      for (const host of root.host) {
        for (const child of host.children()) {
          if (
            Slotable.isSlotable(child) &&
            child.assignedSlot().includes(slot)
          ) {
            yield child;
          }
        }
      }
    }
  }
}
