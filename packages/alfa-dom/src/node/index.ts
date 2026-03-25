import { Cache } from "@siteimprove/alfa-cache";
import type { Device } from "@siteimprove/alfa-device";
import type { Trampoline } from "@siteimprove/alfa-trampoline";

import { Node as BaseNode } from "./node.js";

import { Attribute } from "./attribute.js";
import { Comment } from "./comment.js";
import { Document } from "./document.js";
import { Element } from "./element.js";
import { Fragment } from "./fragment.js";
import { Shadow } from "./shadow.js";
import { Slotable } from "./slotable.js";
import { Text } from "./text.js";
import { Type } from "./type.js";

import * as predicate from "./predicate/index.js";
import * as traversal from "./traversal/index.js";

export * from "./attribute.js";
export * from "./comment.js";
export * from "./document.js";
export * from "./element.js";
export * from "./fragment.js";
export * from "./shadow.js";
export * from "./slot.js";
export * from "./slotable.js";
export * from "./text.js";
export * from "./type.js";

/**
 * @public
 */
export type Node =
  | Attribute
  | Comment
  | Document
  | Element
  | Fragment
  | Shadow
  | Slotable
  | Text
  | Type;

/**
 * @public
 */
export namespace Node {
  export type JSON =
    | Attribute.JSON
    | Comment.JSON
    | Document.JSON
    | Element.JSON
    | Fragment.JSON
    | Shadow.JSON
    | Text.JSON
    | Type.JSON;

  export import Traversal = BaseNode.Traversal;
  export const { flatTree, fullTree, composedNested } = BaseNode;

  const cacheWithDevice = Cache.empty<BaseNode.JSON, Cache<Device, BaseNode>>();
  const cacheWithoutDevice = Cache.empty<BaseNode.JSON, BaseNode>();

  export function from(json: Element.JSON, device?: Device): Element;

  export function from(json: Attribute.JSON, device?: Device): Attribute;

  export function from(json: Text.JSON, device?: Device): Text;

  export function from(json: Comment.JSON, device?: Device): Comment;

  export function from(json: Document.JSON, device?: Device): Document;

  export function from(json: Type.JSON, device?: Device): Document;

  export function from(json: Fragment.JSON, device?: Device): Fragment;

  export function from(json: BaseNode.JSON, device?: Device): BaseNode;

  export function from(json: BaseNode.JSON, device?: Device): BaseNode {
    return device === undefined
      ? cacheWithoutDevice.get(json, () => fromNode(json, device).run())
      : cacheWithDevice
          .get(json, Cache.empty)
          .get(device, () => fromNode(json, device).run());
  }

  /**
   * @internal
   */
  export function fromNode(
    json: BaseNode.JSON,
    device?: Device,
  ): Trampoline<BaseNode> {
    switch (json.type) {
      case "element":
        return Element.fromElement(json as Element.JSON, fromNode, device);

      case "attribute":
        return Attribute.fromAttribute(json as Attribute.JSON);

      case "text":
        return Text.fromText(json as Text.JSON, device);

      case "comment":
        return Comment.fromComment(json as Comment.JSON);

      case "document":
        return Document.fromDocument(json as Document.JSON, fromNode, device);

      case "type":
        return Type.fromType(json as Type.JSON);

      case "fragment":
        return Fragment.fromFragment(json as Fragment.JSON, fromNode, device);

      default:
        throw new Error(`Unexpected node of type: ${json.type}`);
    }
  }

  export const getNodesBetween = traversal.getNodesBetween(
    BaseNode.Traversal.empty,
  );

  export const { hasBox, isRoot } = predicate;

  export const hasChild = predicate.hasChild(BaseNode.Traversal.empty);
  export const hasDescendant = predicate.hasDescendant(
    BaseNode.Traversal.empty,
  );
  export const hasInclusiveDescendant = predicate.hasInclusiveDescendant(
    BaseNode.Traversal.empty,
  );
  export const hasTextContent = predicate.hasTextContent(
    BaseNode.Traversal.empty,
  );
}
