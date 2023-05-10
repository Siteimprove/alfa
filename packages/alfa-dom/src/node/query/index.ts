import * as elementDescendants from "./element-descendants";
import * as elementIdMap from "./element-id-map";

/**
 * @public
 */
export namespace Query {
  /**
   * @public
   */
  export const getElementDescendants = elementDescendants.getElementDescendants;

  /**
   * @public
   */
  export const getElementIdMap = elementIdMap.getElementIdMap;
}
