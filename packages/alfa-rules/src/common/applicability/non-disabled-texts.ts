import { Cache } from "@siteimprove/alfa-cache";
import { DOM, Node as ariaNode } from "@siteimprove/alfa-aria";
import type { Device } from "@siteimprove/alfa-device";
import type { Document } from "@siteimprove/alfa-dom";
import { Element, Namespace, Node, Text } from "@siteimprove/alfa-dom";
import type { Iterable } from "@siteimprove/alfa-iterable";
import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Set } from "@siteimprove/alfa-set";
import { Style } from "@siteimprove/alfa-style";

const { hasRole, isSemanticallyDisabled } = DOM;
const { hasAttribute, hasName, hasNamespace, isElement } = Element;
const { or, not } = Predicate;
const { and, test } = Refinement;
const { isVisible } = Style;
const { isText } = Text;

const cache = Cache.empty<Document, Cache<Device, Sequence<Text>>>();

/**
 * Return all text nodes that are neither:
 * * part of a disabled group or widget;
 * * part of the name of a disabled group or widget;
 *
 * @internal
 */
export function nonDisabledTexts(
  document: Document,
  device: Device,
): Sequence<Text> {
  return cache.get(document, Cache.empty).get(device, () => {
    // Gather all text nodes used to name a disabled widget or group
    const disabledWidgetNames: Set<Text> = Set.from(
      document
        // Find all disabled widgets and groups.
        .descendants(Node.fullTree)
        .filter(and(isElement, isDisabledGroupOrWidget(device)))
        // Find all text nodes that are part of their names
        .flatMap((element) =>
          ariaNode
            .from(element, device)
            .name.map((name) =>
              Sequence.from(name.sourceNodes()).filter(isText),
            )
            .getOr(Sequence.empty<Text>()),
        ),
    );

    return Sequence.from(visit(document, device, disabledWidgetNames));
  });
}

function* visit(
  node: Node,
  device: Device,
  disabledWidgetNames: Set<Text>,
): Iterable<Text> {
  // If the node is a disabled group or widget, stop looking
  if (
    test(
      and(
        isElement,
        or(not(hasNamespace(Namespace.HTML)), isDisabledGroupOrWidget(device)),
      ),
      node,
    )
  ) {
    return;
  }

  // If it is a visible text, not used in the name of a disabled widget,
  // yield it.
  if (
    test(and(isText, isVisible(device)), node) &&
    !disabledWidgetNames.has(node)
  ) {
    yield node;
  }

  // Recurse into children
  for (const child of node.children(Node.fullTree)) {
    yield* visit(child, device, disabledWidgetNames);
  }
}

function isDisabledGroupOrWidget(device: Device): Predicate<Element> {
  return or(
    and(
      hasRole(device, (role) => role.isWidget() || role.is("group")),
      isSemanticallyDisabled,
    ),
    // see https://github.com/act-rules/act-rules.github.io/issues/2215
    and(
      hasName("a", "area"),
      not(hasAttribute("href")),
      hasAttribute("aria-disabled", (value) => value === "true"),
    ),
  );
}
