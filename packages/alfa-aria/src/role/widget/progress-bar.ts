import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#progressbar
 */
Role.register(
  Role.of("progressbar", Role.Category.Widget, {
    inherits: ["range"],
    name: {
      from: ["author"],
      required: true,
    },
  })
);
