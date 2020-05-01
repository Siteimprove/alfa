import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#toolbar
 */
Role.register(
  Role.of("toolbar", Role.Category.Structure, {
    inherits: ["group"],
    supports: ["aria-orientation"],
    name: {
      from: ["author"],
      required: false,
    },
    implicits: [["aria-orientation", "horizontal"]],
  })
);
