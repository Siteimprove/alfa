import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#directory
 */
Role.register(
  Role.of("directory", Role.Category.Structure, {
    inherits: ["list"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
