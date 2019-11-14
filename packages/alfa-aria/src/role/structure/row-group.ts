import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#rowgroup
 */
Role.register(
  Role.of("rowgroup", Role.Category.Structure, {
    inherits: ["structure"],
    context: ["grid", "table", "treegrid"],
    owns: ["row"],
    name: {
      from: ["contents", "author"],
      required: false
    }
  })
);
