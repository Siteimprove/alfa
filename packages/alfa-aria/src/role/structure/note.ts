import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#note
 */
Role.register(
  Role.of("note", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
