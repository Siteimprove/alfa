# Alfa Cascade

This package builds the cascade which is then used by `@siteimprove/alfa-style` in order to find the cascaded value of each property.

While resolving the cascade is in theory somewhat easy (for each element and property, find the highest precedence declaration), it requires a lot of work. A typical page contain hundreds of element and possibly thousands of style rules, and we support nearly 150 properties. So, we cannot just brute force our way through this and need structures to help eliminate quickly most of the selectors. This is especially true for the descendants and sibling selectors whose matching require traversing the DOM tree, potentially at a far away place for something like `main .foo`

## Ancestor filter

The ancestor filter is a structure to optimize matching of descendants selectors. It is build during a depth-first traversal of the DOM tree. While inspecting each element (and trying to match selectors), we keep a list of the ancestors we've found.

In order to be compact and efficient, we just count the number of each type, class, and id on the path to the element. So, for example, a `div.foo .bar` selector cannot match if there is no `div` type or `.foo` class along the path. We cannot just keep a boolean because we want to be able to update the ancestor filter during the "upward moves" of the traversal, which require removing elements from it, so we need a precise count to figure out when it reaches 0.

The ancestor filter only allow for guaranteed "won't match" answers, because the type, class and id have been separated. For example, a `div.foo .bar` selector won't match if the `div` and `.foo` ancestors are different, but the ancestor filter doesn't hold that information. However, the filter greatly reduce the actual number of elements to test against each descendant selector and thus the amount of work to be done.

## Key selector and Selector map

The other tool to speed up matching of complex (and compound) selectors is the selector map.

Each selector is associated to a _key selector_ which is the part which is going to be matched against the element itself (not against its siblings or ancestors). For complex selector, the key selector is thus the rightmost bit. For compound selector, it could be any bit; we take the leftmost bit assuming that they are ordered significantly by authors.

That is, in a `div.foo .bar` selector, the key selector is `.bar`. Any element that matches the full `div.foo .bar` selector must necessarily be a `.bar` itself (plus some DOM tree context). For anything else, we don't need to look at DOM structure. Similarly, in the `div.foo` selector, the key selector is `div`.

Conversely, an element can only match selectors if it matches their key selector. So, a `<span class="bar baz" id="my-id">` can only match selectors whose key selector is either `span`, `.bar`, `.baz`, or `#my-id`. 

The selector map stores selectors by their key selector. Thus, when searching for selectors that may match a given element, we only ask the selector map for selectors that have one of the possible key selectors and greatly reduce the search space.

## Rule tree

The rule tree (actually a forest, although rooted at `*`) is a representation of the join-semilattice of selectors (and their associated style rules).

Selectors can be ordered by inclusion of the sets of matched elements. This forms a join-semilattice. For example, `div.foo` is smaller than both `div` and `.foo` because anything matching the former must necessarily match both of the later ones. However, `div` and `.foo` are not comparable. The semilattice of selectors existing in the current document is represented as a tree, which allow to share identical parts of otherwise incomparable selectors. For example, `div.foo.bar` and `div.foo.baz` are both smaller than `div.foo` and therefore can share any information related to it.

The rule tree is dependent of the order in which it can is built (TO VERIFY).

## Cascade

The cascade itself is a rule tree associated with a map from elements to nodes in it. Each element is mapped to its highest priority selector in the rule tree. Thus, in order to find the cascaded value of any property for a given element, we can simply walk up the rule tree until we find a selector (and associated rule) declaring that property. Since we've walk up the lattice from the smallest possible selector (highest priority), this will be the cascaded value, no matter if more rules up the tree also define this property. 
