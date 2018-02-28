import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { Group } from "../structure";
import { Composite } from "./composite";

/**
 * @see https://www.w3.org/TR/wai-aria/#select
 */
export const Select: Role = {
  name: "select",
  abstract: true,
  label: { from: ["author"] },
  inherits: [Composite, Group],
  supported: [Attributes.Orientation]
};
