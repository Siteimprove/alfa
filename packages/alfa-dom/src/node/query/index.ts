import * as descendants from "./descendants.ts";
import * as elementIdMap from "./element-id-map.ts";

import type { Node } from "../index.ts";

/**
 * @public
 */
export namespace Query {
  export const getDescendants = descendants.getDescendants;
  export const getElementDescendants = descendants.getElementDescendants;
  export const getInclusiveElementDescendants =
    descendants.getInclusiveElementDescendants;
  export const getTextDescendants = descendants.getTextDescendants;
  export const getElementIdMap = elementIdMap.getElementIdMap;

  export type TextGroup = descendants.TextGroup;
  export type TextGroupOptions<N extends Node = Node> =
    descendants.TextGroupOptions<N>;
}
