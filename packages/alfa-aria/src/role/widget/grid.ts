import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#grid
 */
Role.register(
  Role.of("grid", Role.Category.Widget, {
    inherits: ["composite", "table"],
    supports: ["aria-level", "aria-multiselectable", "aria-readonly"],
    owns: ["row", ["rowgroup", "row"]],
    name: {
      from: ["author"],
      required: true,
    },
  })
);
