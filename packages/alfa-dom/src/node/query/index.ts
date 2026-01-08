import * as descendants from "./descendants.js";
import * as elementIdMap from "./element-id-map.js";

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
}
