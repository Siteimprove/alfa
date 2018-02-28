import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#main
 */
export const Main: Role = {
  name: "main",
  label: { from: ["author"] },
  inherits: [Landmark]
};
