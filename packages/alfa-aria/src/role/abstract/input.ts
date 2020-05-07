import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#input
 */
Role.register(
  Role.of("input", Role.Category.Abstract, {
    inherits: ["widget"],
    name: {
      from: ["author"],
      required: false,
    },
  })
);
