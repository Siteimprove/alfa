import { Role } from "../../types";
import { Section } from "./section";

/**
 * @see https://www.w3.org/TR/wai-aria/#landmark
 */
export const Landmark: Role = {
  name: "landmark",
  abstract: true,
  inherits: [Section],
  label: { from: ["author"] }
};
