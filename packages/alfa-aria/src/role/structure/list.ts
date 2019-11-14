import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#list
 */
Role.register(
  Role.of("list", Role.Category.Structure, {
    inherits: ["section"],
    owns: ["listitem", ["group", "listitem"]],
    name: {
      from: ["author"],
      required: false
    }
  })
);
