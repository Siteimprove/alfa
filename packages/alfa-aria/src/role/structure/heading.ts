import { Role } from "../../role";
/**
 * @see https://www.w3.org/TR/wai-aria/#heading
 */
Role.register(
  Role.of("heading", Role.Category.Structure, {
    inherits: ["sectionhead"],
    requires: ["aria-level"],
    name: {
      from: ["contents", "author"],
      required: true,
    },
    implicits: [["aria-level", "2"]],
  })
);
