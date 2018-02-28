import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#complementary
 */
export const Complementary: Role = {
  name: "complementary",
  label: { from: ["author"] },
  inherits: [Landmark]
};
