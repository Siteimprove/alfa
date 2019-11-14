import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#cell
 */
Role.register(
  Role.of("cell", Role.Category.Structure, {
    inherits: ["section"],
    supports: [
      "aria-colindex",
      "aria-colspan",
      "aria-rowindex",
      "aria-rowspan"
    ],
    context: ["row"],
    name: { from: ["contents", "author"], required: false }
  })
);
