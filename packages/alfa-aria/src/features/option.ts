import { getClosest } from "@siteimprove/alfa-dom";
import * as Roles from "../roles";
import { Feature, None } from "../types";

/**
 * @see https://www.w3.org/TR/html-aria/#option
 */
export const Option: Feature = {
  element: "option",
  role: (option, context) =>
    getClosest(option, context, "select, optgroup, datalist") !== null
      ? Roles.Option
      : null,
  allowedRoles: () => None(Roles)
};
