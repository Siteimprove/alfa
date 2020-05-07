import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#switch
 */
Role.register(
  Role.of("switch", Role.Category.Widget, {
    inherits: ["checkbox"],
    requires: ["aria-checked"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
    implicits: [["aria-checked", "false"]],
  })
);
