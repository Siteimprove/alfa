import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#radio
 */
Role.register(
  Role.of("radio", Role.Category.Widget, {
    inherits: ["input"],
    requires: ["aria-checked"],
    supports: ["aria-posinset", "aria-setsize"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
    implicits: [["aria-checked", "false"]],
  })
);
