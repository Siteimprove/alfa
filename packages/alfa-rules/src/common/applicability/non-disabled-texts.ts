import { Cache } from "@siteimprove/alfa-cache";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import { Device } from "@siteimprove/alfa-device";
import {
  Document,
  Element,
  Namespace,
  Node,
  Text,
} from "@siteimprove/alfa-dom";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";

const { hasRole, isPerceivableForAll, isSemanticallyDisabled } = DOM;
const { hasNamespace, isElement } = Element;
const { or, not } = Predicate;
const { and, test } = Refinement;
const { isText } = Text;

const cache = Cache.empty<Document, Cache<Device, Sequence<Text>>>();

/**
 * Return all text nodes that are neither:
 * * part of a widget;
 * * part of the name of a disabled widget;
 * * part of a disabled group.
 *
 * @internal
 */
export function nonDisabledTexts(
  document: Document,
  device: Device
): Sequence<Text> {
  return cache.get(document, Cache.empty).get(device, () => {
    // Gather all aria-disabled widgets or groups on the document
    const disabledWidgetNames: Set<Text> = Set.from(
      document
        // Find all disabled widgets and groups.
        .descendants(Node.fullTree)
        .filter(isElement)
        .filter(
          and(
            hasRole(device, (role) => role.isWidget() || role.is("group")),
            isSemanticallyDisabled
          )
        )
        // Find all text node that are part of their names
        .flatMap((element) =>
          ariaNode
            .from(element, device)
            .name.map((name) =>
              Sequence.from(name.sourceNodes()).filter(isText)
            )
            .getOr(Sequence.empty<Text>())
        )
    );

    return Sequence.from(visit(document, device, disabledWidgetNames));
  });
}

function* visit(
  node: Node,
  device: Device,
  disabledWidgetNames: Set<Text>
): Iterable<Text> {
  // If the node is a widget or a disabled group, stop looking
  if (
    test(
      and(
        isElement,
        or(
          not(hasNamespace(Namespace.HTML)),
          hasRole(device, (role) => role.isWidget()),
          and(hasRole(device, "group"), isSemanticallyDisabled)
        )
      ),
      node
    )
  ) {
    return;
  }

  // If it is a perceivable text, not used in the name of a disabled widget,
  // yield it.
  if (
    test(and(isText, isPerceivableForAll(device)), node) &&
    !disabledWidgetNames.has(node)
  ) {
    yield node;
  }

  // Recurse into children
  for (const child of node.children(Node.fullTree)) {
    yield* visit(child, device, disabledWidgetNames);
  }
}
