import * as descendants from "./descendants.js";
import * as elementIdMap from "./element-id-map.js";
import * as groupedText from "./grouped-text.js";

/**
 * @public
 */
export namespace Query {
  export const getDescendants = descendants.getDescendants;
  export const getElementDescendants = descendants.getElementDescendants;
  export const getElementIdMap = elementIdMap.getElementIdMap;
  export const getInclusiveElementDescendants =
    descendants.getInclusiveElementDescendants;
  export const getGroupedText = groupedText.getGroupedText;
}
