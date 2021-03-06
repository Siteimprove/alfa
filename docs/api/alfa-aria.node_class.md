<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@siteimprove/alfa-aria](./alfa-aria.md) &gt; [Node](./alfa-aria.node_class.md)

## Node class

[https://w3c.github.io/aria/\#accessibility\_tree](https://w3c.github.io/aria/#accessibility_tree)

<b>Signature:</b>

```typescript
export declare abstract class Node implements Serializable<Node.JSON> 
```
<b>Implements:</b> [Serializable](./alfa-json.serializable_interface.md)<!-- -->&lt;[Node.JSON](./alfa-aria.node_namespace.json_interface.md)<!-- -->&gt;

## Constructors

|  Constructor | Modifiers | Description |
|  --- | --- | --- |
|  [(constructor)(owner, children)](./alfa-aria.node_class._constructor__1_constructor.md) |  | Constructs a new instance of the <code>Node</code> class |

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [\_children](./alfa-aria.node_class._children_property.md) |  | Array&lt;[Node](./alfa-aria.node_class.md)<!-- -->&gt; |  |
|  [\_frozen](./alfa-aria.node_class._frozen_property.md) |  | boolean | Whether or not the node is frozen. |
|  [\_node](./alfa-aria.node_class._node_property.md) |  | dom.[Node](./alfa-dom.node_class.md) |  |
|  [\_parent](./alfa-aria.node_class._parent_property.md) |  | [Option](./alfa-option.option_interface.md)<!-- -->&lt;[Node](./alfa-aria.node_class.md)<!-- -->&gt; |  |
|  [frozen](./alfa-aria.node_class.frozen_property.md) |  | boolean |  |
|  [name](./alfa-aria.node_class.name_property.md) |  | [Option](./alfa-option.option_interface.md)<!-- -->&lt;[Name](./alfa-aria.name_class.md)<!-- -->&gt; |  |
|  [node](./alfa-aria.node_class.node_property.md) |  | dom.[Node](./alfa-dom.node_class.md) |  |
|  [role](./alfa-aria.node_class.role_property.md) |  | [Option](./alfa-option.option_interface.md)<!-- -->&lt;[Role](./alfa-aria.role_class.md)<!-- -->&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [ancestors(options)](./alfa-aria.node_class.ancestors_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-ancestor](https://dom.spec.whatwg.org/#concept-tree-ancestor) |
|  [attribute(refinement)](./alfa-aria.node_class.attribute_1_method.md) |  |  |
|  [attribute(predicate)](./alfa-aria.node_class.attribute_2_method.md) |  |  |
|  [attribute(name)](./alfa-aria.node_class.attribute_3_method.md) |  |  |
|  [children(options)](./alfa-aria.node_class.children_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-child](https://dom.spec.whatwg.org/#concept-tree-child) |
|  [clone(parent)](./alfa-aria.node_class.clone_1_method.md) |  |  |
|  [descendants(options)](./alfa-aria.node_class.descendants_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-descendant](https://dom.spec.whatwg.org/#concept-tree-descendant) |
|  [freeze()](./alfa-aria.node_class.freeze_1_method.md) |  | Freeze the node. This prevents further expansion of the node hierarchy, meaning that the node can no longer be passed as a child to a parent node. |
|  [inclusiveAncestors(options)](./alfa-aria.node_class.inclusiveancestors_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-inclusive-ancestor](https://dom.spec.whatwg.org/#concept-tree-inclusive-ancestor) |
|  [inclusiveDescendants(options)](./alfa-aria.node_class.inclusivedescendants_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-inclusive-descendant](https://dom.spec.whatwg.org/#concept-tree-inclusive-descendant) |
|  [isIgnored()](./alfa-aria.node_class.isignored_1_method.md) |  |  |
|  [parent(options)](./alfa-aria.node_class.parent_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-parent](https://dom.spec.whatwg.org/#concept-tree-parent) |
|  [root(options)](./alfa-aria.node_class.root_1_method.md) |  | [https://dom.spec.whatwg.org/\#concept-tree-root](https://dom.spec.whatwg.org/#concept-tree-root) |
|  [toJSON()](./alfa-aria.node_class.tojson_1_method.md) |  |  |

