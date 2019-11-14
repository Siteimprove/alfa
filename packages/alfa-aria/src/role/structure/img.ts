import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#img
 */
Role.register(
  Role.of("img", Role.Category.Structure, {
    inherits: ["section"],
    name: {
      from: ["author"],
      required: true
    }
  })
);
