import {
  AttributeMatcher,
  AttributeModifier,
  AttributeSelector,
  ClassSelector,
  CompoundSelector,
  IdSelector,
  parseSelector,
  PseudoClassSelector,
  PseudoElementSelector,
  RelativeSelector,
  Selector,
  SelectorCombinator,
  SelectorType,
  TypeSelector
} from "@siteimprove/alfa-css";
import { Iterable } from "@siteimprove/alfa-iterable";
import { Option } from "@siteimprove/alfa-option";
import { AncestorFilter } from "./ancestor-filter";
import { contains } from "./contains";
import { getAttribute } from "./get-attribute";
import { getAttributeNamespace } from "./get-attribute-namespace";
import { getClosest } from "./get-closest";
import { getElementNamespace } from "./get-element-namespace";
import { getHost } from "./get-host";
import { getId } from "./get-id";
import { getParentElement } from "./get-parent-element";
import { getPreviousElementSibling } from "./get-previous-element-sibling";
import { isElement, isShadowRoot } from "./guards";
import { hasClass } from "./has-class";
import { Element, Namespace, Node } from "./types";

const { isArray } = Array;

/**
 * Given an element and a context, check if the element matches the given
 * selector within the context.
 *
 * @see https://dom.spec.whatwg.org/#dom-element-matches
 */
export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | Array<Selector>,
  options?: matches.Options
): boolean;

/**
 * @internal
 */
export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | Array<Selector>,
  options: matches.Options,
  root: Selector
): boolean;

export function matches(
  element: Element,
  context: Node,
  selector: string | Selector | Array<Selector>,
  options: matches.Options = {},
  root: Selector | null = null
): boolean {
  if (typeof selector === "string") {
    const parsed = parseSelector(selector);

    if (parsed === null) {
      return false;
    }

    selector = parsed;
  }

  if (isArray(selector)) {
    return matchesList(element, context, selector, options);
  }

  if (!matchesDefaultNamespace(element, context, selector, options)) {
    return false;
  }

  if (root === null) {
    root = selector;
  }

  switch (selector.type) {
    case SelectorType.IdSelector:
      return matchesId(element, context, selector);

    case SelectorType.ClassSelector:
      return matchesClass(element, context, selector);

    case SelectorType.TypeSelector:
      return matchesType(element, context, selector, options);

    case SelectorType.AttributeSelector:
      return matchesAttribute(element, context, selector, options);

    case SelectorType.CompoundSelector:
      return matchesCompound(element, context, selector, options, root);

    case SelectorType.RelativeSelector:
      return matchesRelative(element, context, selector, options, root);

    case SelectorType.PseudoClassSelector:
      return matchesPseudoClass(element, context, selector, options, root);

    case SelectorType.PseudoElementSelector:
      return matchesPseudoElement(element, context, selector, options, root);
  }

  return false;
}

export namespace matches {
  export interface Options {
    readonly flattened?: boolean;

    /**
     * @see https://www.w3.org/TR/selectors/#scope-element
     * @internal
     */
    readonly scope?: Element;

    /**
     * @see https://drafts.csswg.org/css-scoping/#tree-context
     * @internal
     */
    readonly treeContext?: Node;

    /**
     * @see https://www.w3.org/TR/selectors/#the-hover-pseudo
     * @internal
     */
    readonly hover?: Element | boolean;

    /**
     * @see https://www.w3.org/TR/selectors/#the-active-pseudo
     * @internal
     */
    readonly active?: Element | boolean;

    /**
     * @see https://www.w3.org/TR/selectors/#the-focus-pseudo
     * @internal
     */
    readonly focus?: Element | boolean;

    /**
     * Whether or not to perform selector matching against pseudo-elements.
     *
     * @see https://www.w3.org/TR/selectors/#pseudo-elements
     * @internal
     */
    readonly pseudo?: boolean;

    /**
     * Ancestor filter used for fast-rejecting elements during selector matching.
     *
     * @internal
     */
    readonly filter?: AncestorFilter;

    /**
     * Declared prefixes mapped to namespace URI.
     *
     * @see https://www.w3.org/TR/selectors/#type-nmsp
     * @internal
     */
    readonly namespaces?: Map<string | null, Namespace>;
  }
}

/**
 * @see https://www.w3.org/TR/selectors/#selector-list
 */
function matchesList(
  element: Element,
  context: Node,
  selectors: Array<Selector>,
  options: matches.Options
): boolean {
  for (let i = 0, n = selectors.length; i < n; i++) {
    const root = selectors[i];

    if (matches(element, context, root, options, root)) {
      return true;
    }
  }

  return false;
}

function matchesDefaultNamespace(
  element: Element,
  context: Node,
  selector: Selector,
  options: matches.Options
): boolean {
  switch (selector.type) {
    // Type and attribute selector matching handles namespace checking on its
    // own as these selectors can have non-default namespaces assigned.
    case SelectorType.TypeSelector:
    case SelectorType.AttributeSelector:
      break;

    // For the remaning selectors, check that the element being matched exist
    // in the default namespace if specified.
    default:
      const { namespaces } = options;

      if (namespaces !== undefined) {
        const namespace = namespaces.get(null);

        if (
          namespace !== undefined &&
          !getElementNamespace(element, context).includes(namespace)
        ) {
          return false;
        }
      }
  }

  return true;
}

/**
 * @see https://www.w3.org/TR/selectors/#id-selectors
 */
function matchesId(
  element: Element,
  context: Node,
  selector: IdSelector
): boolean {
  return getId(element, context).includes(selector.name);
}

/**
 * @see https://www.w3.org/TR/selectors/#class-html
 */
function matchesClass(
  element: Element,
  context: Node,
  selector: ClassSelector
): boolean {
  return hasClass(element, context, selector.name);
}

/**
 * @see https://www.w3.org/TR/selectors/#type-selectors
 */
function matchesType(
  element: Element,
  context: Node,
  selector: TypeSelector,
  options: matches.Options
): boolean {
  // https://www.w3.org/TR/selectors/#the-universal-selector
  if (selector.name === "*") {
    return true;
  }

  if (!matchesElementNamespace(element, context, selector, options)) {
    return false;
  }

  return element.localName === selector.name;
}

/**
 * @see https://www.w3.org/TR/selectors/#type-nmsp
 */
function matchesElementNamespace(
  element: Element,
  context: Node,
  selector: TypeSelector,
  options: matches.Options
): boolean {
  if (selector.namespace === "*") {
    return true;
  }

  if (options.namespaces === undefined && selector.namespace === null) {
    return true;
  }

  const elementNamespace = getElementNamespace(element, context);

  if (selector.namespace === "" && elementNamespace.isNone()) {
    return true;
  }

  if (options.namespaces === undefined) {
    return false;
  }

  const declaredNamespace = options.namespaces.get(selector.namespace);

  return (
    declaredNamespace === undefined ||
    elementNamespace.includes(declaredNamespace)
  );
}

const whitespace = /\s+/;

/**
 * @see https://www.w3.org/TR/selectors/#attribute-selectors
 */
function matchesAttribute(
  element: Element,
  context: Node,
  selector: AttributeSelector,
  options: matches.Options
): boolean {
  if (!matchesAttributeNamespace(element, context, selector, options)) {
    return false;
  }

  let value: Option<string | Iterable<string>>;

  switch (selector.namespace) {
    case null:
    case "":
      value = getAttribute(element, context, selector.name);
      break;

    case "*":
      value = getAttribute(element, context, selector.name, "*");
      break;

    default:
      // Abort when no namespace is declared
      if (options.namespaces === undefined) {
        return false;
      }

      // Selector namespace must match a declared namespace
      const declaredNamespace = options.namespaces.get(selector.namespace);

      if (declaredNamespace === undefined) {
        return false;
      }

      value = getAttribute(element, context, selector.name, declaredNamespace);
  }

  const caseInsensitive =
    (selector.modifier & AttributeModifier.CaseInsensitive) !== 0;

  return value
    .map(value =>
      typeof value === "string"
        ? matchesValue(value, selector, caseInsensitive)
        : Iterable.some(value, value =>
            matchesValue(value, selector, caseInsensitive)
          )
    )
    .getOr(false);
}

function matchesValue(
  value: string,
  selector: AttributeSelector,
  caseInsensitive: boolean
): boolean {
  if (selector.value === null) {
    return true;
  }

  if (caseInsensitive) {
    value = value.toLowerCase();
  }

  switch (selector.matcher) {
    case AttributeMatcher.Equal:
      return selector.value === value;

    case AttributeMatcher.Prefix:
      return value.startsWith(selector.value);

    case AttributeMatcher.Suffix:
      return value.endsWith(selector.value);

    case AttributeMatcher.Substring:
      return value.includes(selector.value);

    case AttributeMatcher.DashMatch:
      return value === selector.value || value.startsWith(`${selector.value}-`);

    case AttributeMatcher.Includes:
      return Iterable.includes(value.split(whitespace), selector.value);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#attrnmsp
 */
function matchesAttributeNamespace(
  element: Element,
  context: Node,
  selector: AttributeSelector,
  options: matches.Options
): boolean {
  if (selector.namespace === null || selector.namespace === "*") {
    return true;
  }

  const { attributes } = element;

  for (let i = 0, n = attributes.length; i < n; i++) {
    const attribute = attributes[i];

    if (attribute.localName === selector.name) {
      const attributeNamespace = getAttributeNamespace(attribute, context);

      // Selector "[|att]" should only match attributes with no namespace
      if (selector.namespace === "") {
        if (attributeNamespace === null) {
          return true;
        }
      } else if (options.namespaces !== undefined) {
        const namespace = options.namespaces.get(selector.namespace);

        if (namespace !== undefined && attributeNamespace.includes(namespace)) {
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#compound
 */
function matchesCompound(
  element: Element,
  context: Node,
  selector: CompoundSelector,
  options: matches.Options,
  root: Selector
): boolean {
  return (
    matches(element, context, selector.left, options, root) &&
    matches(element, context, selector.right, options, root)
  );
}

/**
 * @see https://www.w3.org/TR/selectors/#combinators
 */
function matchesRelative(
  element: Element,
  context: Node,
  selector: RelativeSelector,
  options: matches.Options,
  root: Selector
): boolean {
  // Before any other work is done, check if the left part of the selector can
  // be rejected by the ancestor filter optionally passed to `matches()`. Only
  // descendant and direct-descendant selectors can potentially be rejected.
  if (options.filter !== undefined) {
    switch (selector.combinator) {
      case SelectorCombinator.Descendant:
      case SelectorCombinator.DirectDescendant:
        if (canReject(selector.left, options.filter)) {
          return false;
        }

        // If the selector cannot be rejected, unset the ancestor filter as it
        // no longer applies when we start recursively moving up the tree.
        options = { ...options, filter: undefined };
    }
  }

  // Otherwise, make sure that the right part of the selector, i.e. the part
  // that relates to the current element, matches.
  if (!matches(element, context, selector.right, options, root)) {
    return false;
  }

  // If it does, move on the heavy part of the work: Looking either up the tree
  // for a descendant match or looking to the side of the tree for a sibling
  // match.
  switch (selector.combinator) {
    case SelectorCombinator.Descendant:
      return matchesDescendant(element, context, selector.left, options, root);

    case SelectorCombinator.DirectDescendant:
      return matchesDirectDescendant(
        element,
        context,
        selector.left,
        options,
        root
      );

    case SelectorCombinator.Sibling:
      return matchesSibling(element, context, selector.left, options, root);

    case SelectorCombinator.DirectSibling:
      return matchesDirectSibling(
        element,
        context,
        selector.left,
        options,
        root
      );
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#descendant-combinators
 */
function matchesDescendant(
  element: Element,
  context: Node,
  selector: Selector,
  options: matches.Options,
  root: Selector
): boolean {
  let parentElement = getParentElement(element, context, options).getOr(null);

  while (parentElement !== null) {
    if (matches(parentElement, context, selector, options, root)) {
      return true;
    }

    parentElement = getParentElement(parentElement, context, options).getOr(
      null
    );
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#child-combinators
 */
function matchesDirectDescendant(
  element: Element,
  context: Node,
  selector: Selector,
  options: matches.Options,
  root: Selector
): boolean {
  return getParentElement(element, context, options)
    .map(parentElement =>
      matches(parentElement, context, selector, options, root)
    )
    .getOr(false);
}

/**
 * @see https://www.w3.org/TR/selectors/#general-sibling-combinators
 */
function matchesSibling(
  element: Element,
  context: Node,
  selector: Selector,
  options: matches.Options,
  root: Selector
): boolean {
  let previousElementSibling = getPreviousElementSibling(
    element,
    context,
    options
  ).getOr(null);

  while (previousElementSibling !== null) {
    if (matches(previousElementSibling, context, selector, options, root)) {
      return true;
    }

    previousElementSibling = getPreviousElementSibling(
      previousElementSibling,
      context,
      options
    ).getOr(null);
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#adjacent-sibling-combinators
 */
function matchesDirectSibling(
  element: Element,
  context: Node,
  selector: Selector,
  options: matches.Options,
  root: Selector
): boolean {
  return getPreviousElementSibling(element, context, options)
    .map(previousElementSibling =>
      matches(previousElementSibling, context, selector, options, root)
    )
    .getOr(false);
}

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-classes
 */
function matchesPseudoClass(
  element: Element,
  context: Node,
  selector: PseudoClassSelector,
  options: matches.Options,
  root: Selector
): boolean {
  switch (selector.name) {
    // https://www.w3.org/TR/selectors/#scope-pseudo
    case "scope":
      return options.scope === element;

    // https://drafts.csswg.org/css-scoping/#host-selector
    case "host": {
      // Do not allow prefix (e.g. "div:host")
      if (root !== selector) {
        return false;
      }

      const { treeContext } = options;

      if (treeContext === undefined || !isShadowRoot(treeContext)) {
        return false;
      }

      return getHost(treeContext, context)
        .filter(host => host === element)
        .map(
          host =>
            selector.value === undefined ||
            matches(element, context, selector.value, options, root)
        )
        .getOr(false);
    }

    // https://drafts.csswg.org/css-scoping/#host-selector
    case "host-context": {
      // Do not allow prefix (e.g. "div:host")
      if (root !== selector) {
        return false;
      }

      const { treeContext } = options;
      const query = selector.value;

      if (
        treeContext === undefined ||
        !isShadowRoot(treeContext) ||
        query === null
      ) {
        return false;
      }

      return getHost(treeContext, context)
        .filter(host => host === element)
        .flatMap(host =>
          getClosest(
            host,
            context,
            node =>
              isElement(node) && matches(node, context, query, options, root)
          )
        )
        .isSome();
    }

    // https://www.w3.org/TR/selectors/#negation-pseudo
    case "not":
      return (
        selector.value === null ||
        !matches(element, context, selector.value, options, root)
      );

    // https://www.w3.org/TR/selectors/#hover-pseudo
    case "hover":
      const { hover } = options;

      if (hover === undefined || hover === false) {
        return false;
      }

      return (
        hover === true ||
        contains(element, context, hover, { flattened: options.flattened })
      );

    // https://www.w3.org/TR/selectors/#active-pseudo
    case "active":
      const { active } = options;

      if (active === undefined || active === false) {
        return false;
      }

      return (
        active === true ||
        contains(element, context, active, { flattened: options.flattened })
      );

    // https://www.w3.org/TR/selectors/#focus-pseudo
    case "focus":
      const { focus } = options;

      if (focus === undefined || focus === false) {
        return false;
      }

      return focus === true || element === focus;
  }

  return false;
}

/**
 * @see https://www.w3.org/TR/selectors/#pseudo-elements
 */
function matchesPseudoElement(
  element: Element,
  context: Node,
  selector: PseudoElementSelector,
  options: matches.Options,
  root: Selector
): boolean {
  return options.pseudo === true;
}

/**
 * Check if a selector can be rejected based on an ancestor filter. As this is
 * the critical path of selector matching, make sure to observe proper care when
 * modifying!
 */
function canReject(selector: Selector, filter: AncestorFilter): boolean {
  switch (selector.type) {
    case SelectorType.IdSelector:
    case SelectorType.ClassSelector:
    case SelectorType.TypeSelector:
      return !filter.matches(selector);

    case SelectorType.CompoundSelector:
      // Compound selectors are right-leaning, so recurse to the left first as
      // it is likely the shortest branch.
      return (
        canReject(selector.left, filter) || canReject(selector.right, filter)
      );

    case SelectorType.RelativeSelector:
      const { combinator } = selector;
      if (
        combinator === SelectorCombinator.Descendant ||
        combinator === SelectorCombinator.DirectDescendant
      ) {
        // Relative selectors are left-leaning, so recurse to the right first as
        // it is likely the shortest branch.
        return (
          canReject(selector.right, filter) || canReject(selector.left, filter)
        );
      }
  }

  return false;
}
