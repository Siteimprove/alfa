import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#tab
 */
Role.register(
  Role.of("tab", Role.Category.Widget, {
    inherits: ["sectionhead", "widget"],
    supports: ["aria-posinset", "aria-selected", "aria-setsize"],
    context: ["tablist"],
    name: {
      from: ["contents", "author"],
      required: false,
    },
    implicits: [["aria-selected", "false"]],
  })
);
