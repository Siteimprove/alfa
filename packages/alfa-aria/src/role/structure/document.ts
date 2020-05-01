import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#document
 */
Role.register(
  Role.of("document", Role.Category.Structure, {
    inherits: ["structure"],
    supports: ["aria-expanded"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
