import { Role } from "../../types";
import { Landmark } from "../abstract/landmark";

/**
 * @see https://www.w3.org/TR/wai-aria/#complementary
 */
export const Complementary: Role = {
  name: "complementary",
  inherits: () => [Landmark],
  label: { from: ["author"] }
};
