import * as mediaFeature from "./feature/index.ts";
import * as mediaList from "./list.ts";
import * as modifier from "./modifier.ts";
import * as mediaQuery from "./query.ts";
import * as mediaType from "./type.ts";

import * as value from "./feature/value/index.ts";

/**
 * @public
 */
export namespace Media {
  export import Feature = mediaFeature.Media;
  export import List = mediaList.List;
  export import Modifier = modifier.Modifier;
  export import Query = mediaQuery.Query;
  export import Type = mediaType.Type;
  export import Value = value.Value;

  export const { of: type, isType } = Type;
  export const { isMedia } = Feature;
  export const { of: query, isQuery } = Query;
  export const { of: list, isList } = List;

  export const parse = List.parse;
}
