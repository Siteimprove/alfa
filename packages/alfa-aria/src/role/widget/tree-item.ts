import { Role } from "../../role";

/**
 * @see https://www.w3.org/TR/wai-aria/#treeitem
 */
Role.register(
  Role.of("treeitem", Role.Category.Widget, {
    inherits: ["listitem", "option"],
    context: ["group", "tree"],
    name: {
      from: ["contents", "author"],
      required: true
    }
  })
);
