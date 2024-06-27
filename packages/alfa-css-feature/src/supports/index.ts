import * as supportsFeature from "./feature/index.js";
import * as supportsQuery from "./query.js";

/**
 * @public
 */
export namespace Supports {
  export import Property = supportsFeature.Property;
  export import Query = supportsQuery.Query;

  export const { isProperty } = Property;
  export const { of: query, isQuery } = Query;
  export const parse = Query.parse;
}
