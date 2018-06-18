import { hasTextAlternative } from "../";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#section
 */
export const Section: Feature = {
  element: "section",
  role: (section, context) =>
    hasTextAlternative(section, context) ? Roles.Region : null,
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
