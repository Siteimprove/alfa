import { getAttribute } from "@alfa/dom";
import { Feature } from "../types";
import * as Roles from "../roles";

/**
 * @see https://www.w3.org/TR/html-aria/#textarea
 */
export const Textarea: Feature = {
  element: "textarea",
  role: Roles.TextBox
};
