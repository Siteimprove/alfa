import * as mediaFeature from "./feature";
import * as mediaList from "./list";
import * as modifier from "./modifier";
import * as mediaQuery from "./query";
import * as mediaType from "./type";

import * as value from "./feature/value";

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
