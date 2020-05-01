import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#command
 */
Role.register(
  Role.of("command", Role.Category.Abstract, {
    inherits: ["widget"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
