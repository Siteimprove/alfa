import * as condition from "./condition";
import * as media from "./media";
import * as supports from "./supports";

/**
 * @public
 */
export namespace Feature {
  export import Condition = condition.Condition;
  export import And = condition.And;
  export import Or = condition.Or;
  export import Not = condition.Not;

  export import Media = media.Media;
  export import Supports = supports.Supports;

  export const { isMedia } = Media;
  export const { isProperty } = Supports;
  export const { of: and, isAnd } = And;
  export const { of: or, isOr } = Or;
  export const { of: not, isNot } = Not;
  export const { isCondition } = Condition;

  export const parseMediaQuery = Media.parse;
  export const parseSupportsQuery = Supports.parse;
}
