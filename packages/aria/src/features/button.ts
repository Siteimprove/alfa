import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#button
 */
export const Button: Feature = {
  element: "button",
  role: Roles.Button
  // allowedRoles: [
  //   Roles.Checkbox,
  //   Roles.Link,
  //   Roles.MenuItem
  // ]
};
