import { getTextAlternative } from "../get-text-alternative";
import { Feature, Role } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#section
 */
export const Section: Feature = {
  element: "section",
  role: section =>
    getTextAlternative(section) === null ? undefined : Roles.Region,
  allowedRoles: [
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
