import { Property } from "../property";
import { Keyword } from "../value/keyword";

export type Visibility = Keyword<"visible" | "hidden" | "collapse">;

/**
 * @see https://drafts.csswg.org/css2/visufx.html#propdef-visibility
 */
const Visibility: Property<Visibility> = Property.of(
  Keyword.of("visible"),
  Keyword.parse("visible", "hidden", "collapse"),
  style => style.specified("visibility"),
  {
    inherits: true
  }
);

export default Visibility;
