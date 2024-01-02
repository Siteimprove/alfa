import * as condition from "./condition";
import * as feature from "./feature";
import * as mediaList from "./list";
import * as modifier from "./modifier";
import * as mediaQuery from "./query";
import * as mediaType from "./type";
import * as value from "./value";

/**
 * @public
 */
export namespace Media {
  export import Condition = condition.Condition;
  export import And = condition.And;
  export import Or = condition.Or;
  export import Not = condition.Not;

  export import Feature = feature.Feature;
  export import List = mediaList.List;
  export import Modifier = modifier.Modifier;
  export import Query = mediaQuery.Query;
  export import Type = mediaType.Type;
  export import Value = value.Value;

  export const { of: type, isType } = Type;
  export const { isFeature } = Feature;
  export const { of: and, isAnd } = And;
  export const { of: or, isOr } = Or;
  export const { of: not, isNot } = Not;
  export const { isCondition } = Condition;
  export const { of: query, isQuery } = Query;
  export const { of: list, isList } = List;

  export const parse = List.parse;
}
