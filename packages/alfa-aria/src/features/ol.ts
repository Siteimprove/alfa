import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#ol
 */
export const Ol: Feature = {
  element: "ol",
  role: Roles.List,
  allowedRoles: [
    Roles.Directory,
    Roles.Group,
    Roles.ListBox,
    Roles.Menu,
    Roles.MenuBar,
    Roles.None,
    Roles.Presentation,
    Roles.RadioGroup,
    Roles.TabList,
    Roles.Toolbar,
    Roles.Tree
  ]
};
