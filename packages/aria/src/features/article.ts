import { AnyAttribute, Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#article
 */
export const Article: Feature = {
  element: "article",
  role: Roles.Article,
  allowedRoles: [
    Roles.Feed,
    Roles.Presentation,
    Roles.None,
    Roles.Document,
    Roles.Application,
    Roles.Main,
    Roles.Region
  ],
  allowedAttributes: AnyAttribute
};
