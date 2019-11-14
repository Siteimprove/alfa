import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#table
 */
Role.register(
  Role.of("table", Role.Category.Structure, {
    inherits: ["section"],
    owns: ["row", ["rowgroup", "row"]],
    supports: ["aria-colcount", "aria-rowcount"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
