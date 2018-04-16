import { Role } from "../../types";
import * as Attributes from "../../attributes";
import { SectionHead } from "../abstract";
/**
 * @see https://www.w3.org/TR/wai-aria/#heading
 */
export const Heading: Role = {
  name: "heading",
  inherits: [SectionHead],
  required: [Attributes.Level],
  label: { from: ["contents", "author"], required: true }
};
