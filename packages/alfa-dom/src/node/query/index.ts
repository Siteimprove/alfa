import * as elementDescendants from "./descendants.js";
import * as elementIdMap from "./element-id-map.js";
import * as inclusiveElementDescendants from "./inclusive-element-descendants.js";

/**
 * @public
 */
export namespace Query {
  export const getElementDescendants = elementDescendants.getElementDescendants;
  export const getElementIdMap = elementIdMap.getElementIdMap;
  export const getInclusiveElementDescendants =
    inclusiveElementDescendants.getInclusiveElementDescendants;
}
