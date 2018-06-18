import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ul
 */
export const Ul: Feature = {
  element: "ul",
  role: () => Roles.List,
  allowedRoles: () => [
    Roles.Directory,
    Roles.Group,
    Roles.ListBox,
    Roles.Menu,
    Roles.MenuBar,
    Roles.RadioGroup,
    Roles.TabList,
    Roles.Toolbar,
    Roles.Tree,
    Roles.Presentation,
    Roles.None
  ]
};
