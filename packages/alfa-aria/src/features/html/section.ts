import * as Roles from "../../roles";
import { Feature } from "../../types";

/**
 * @see https://www.w3.org/TR/html-aria/#section
 */
export const Section: Feature = {
  element: "section",
  // The role of a form element CANNOT depend on whether or not it has an
  // accessible name; to determine the accessible name of an element, it's role
  // must be considered, therefore causing a recursive definition.
  role: (section, context) => Roles.Region,
  allowedRoles: () => [
    Roles.Alert,
    Roles.AlertDialog,
    Roles.Application,
    Roles.Banner,
    Roles.Complementary,
    Roles.ContentInfo,
    Roles.Dialog,
    Roles.Document,
    Roles.Feed,
    Roles.Log,
    Roles.Main,
    Roles.Marquee,
    Roles.Navigation,
    Roles.None,
    Roles.Presentation,
    Roles.Search,
    Roles.Status,
    Roles.TabPanel
  ]
};
