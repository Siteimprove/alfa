import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#checkbox
 */
Role.register(
  Role.of("checkbox", Role.Category.Widget, {
    inherits: ["input"],
    requires: ["aria-checked"],
    supports: ["aria-readonly"],
    name: {
      from: ["contents", "author"],
      required: true
    },
    implicits: [["aria-checked", "false"]]
  })
);
