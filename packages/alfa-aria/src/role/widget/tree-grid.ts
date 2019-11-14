import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#treegrid
 */
Role.register(
  Role.of("treegrid", Role.Category.Widget, {
    inherits: ["grid", "tree"],
    owns: ["row", ["rowgroup", "row"]],
    name: {
      from: ["author"],
      required: true
    }
  })
);
