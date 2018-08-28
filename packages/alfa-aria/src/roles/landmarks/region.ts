import { Category, Role } from "../../types";
import { Landmark } from "../abstract/landmark";

/**
 * @see https://www.w3.org/TR/wai-aria/#region
 */
export const Region: Role = {
  name: "region",
  category: Category.Landmark,
  inherits: () => [Landmark],
  label: { from: ["author"], required: true }
};
