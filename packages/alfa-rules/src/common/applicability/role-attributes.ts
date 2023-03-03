import { DOM } from "@siteimprove/alfa-aria";
import { Cache } from "@siteimprove/alfa-cache";
import { Device } from "@siteimprove/alfa-device";
import {
  Attribute,
  Document,
  Element,
  Namespace,
  Node,
} from "@siteimprove/alfa-dom";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Sequence } from "@siteimprove/alfa-sequence";

const { isProgrammaticallyHidden } = DOM;
const { hasAttribute, hasNamespace, isElement } = Element;
const { and, not } = Predicate;

const cache = Cache.empty<
  Document,
  Cache<Device, Sequence<Attribute<"role">>>
>();

/**
 * @internal
 */
export function roleAttributes(
  document: Document,
  device: Device
): Sequence<Attribute<"role">> {
  return cache.get(document, Cache.empty).get(device, () =>
    document
      .descendants(Node.fullTree)
      .filter(isElement)
      .filter(
        and(
          hasNamespace(Namespace.HTML, Namespace.SVG),
          hasAttribute("role", (value) => value.trim().length > 0),
          not(isProgrammaticallyHidden(device))
        )
      )
      // The previous filter ensures the existence of role.
      .map((element) => element.attribute("role").getUnsafe())
  );
}
