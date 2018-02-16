import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Section } from "./section";

/**
 * @see https://www.w3.org/TR/wai-aria/#landmark
 */
export const Landmark: Role = {
  name: "landmark",
  abstract: true,
  label: { from: "author" },
  inherits: [Section]
};
