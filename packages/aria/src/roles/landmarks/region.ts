import { Role } from "../../types";
import { Landmark } from "../abstract";

/**
 * @see https://www.w3.org/TR/wai-aria/#region
 */
export const Region: Role = {
  name: "region",
  label: { from: ["author"], required: true },
  inherits: [Landmark]
};
