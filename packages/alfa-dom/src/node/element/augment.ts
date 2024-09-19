/*
 * Augment the Element class with some methods that are specific to a given
 * element. These are grouped here to de-clutter the main class declaration
 * which thus only contains generic methods.
 *
 * {@link https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */

import { None, Some } from "@siteimprove/alfa-option";
import { Sequence } from "@siteimprove/alfa-sequence";
import { Element } from "../element.js";
import type { InputType } from "./input-type.js";

declare module "../element.js" {
  interface Element<N extends string> {
    /**
     * {@link https://html.spec.whatwg.org/#attr-input-type}
     */
    inputType(this: Element<"input">): InputType;

    /**
     * {@link https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-size}
     *
     * @remarks
     * The size IDL attribute should have a value of 0, not 1 or 4, when the
     *   content attribute is undefined. This is for historical reasons. In our
     *   case, this is not affecting the results and it is easier to treat it as
     *   the actual displayed size.
     * {@link https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-size}
     */
    displaySize(this: Element<"select">): number;

    /**
     * {@link https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-option-list}
     */
    optionsList(this: Element<"select">): Sequence<Element<"option">>;
  }
}

Element.prototype.inputType = function (this: Element<"input">): InputType {
  if (this._inputType === undefined) {
    this._inputType = this.attribute("type")
      .flatMap((attribute) =>
        attribute.enumerate(
          "hidden",
          "search",
          "tel",
          "url",
          "email",
          "password",
          "date",
          "month",
          "week",
          "time",
          "datetime-local",
          "number",
          "range",
          "color",
          "checkbox",
          "radio",
          "file",
          "submit",
          "image",
          "reset",
          "button",
          "text",
        ),
      )
      .getOr("text");
  }
  return this._inputType;
};

Element.prototype.displaySize = function (this: Element<"select">): number {
  if (this._displaySize === undefined) {
    this._displaySize = this.attribute("size")
      .flatMap((attribute) => {
        const size = parseInt(attribute.value, 10);
        if (size === size && size === (size | 0)) {
          return Some.of(size);
        }
        return None;
      })
      .getOrElse(() => (this.attribute("multiple").isSome() ? 4 : 1));
  }

  return this._displaySize;
};

Element.prototype.optionsList = function (
  this: Element<"select">,
): Sequence<Element<"option">> {
  if (this._optionsList === undefined) {
    this._optionsList = this.children()
      .filter(Element.isElement)
      .flatMap((child) => {
        switch (child.name) {
          case "option":
            return Sequence.from([child as Element<"option">]);

          case "optgroup":
            return child
              .children()
              .filter(Element.isElement)
              .filter(
                (grandchild): grandchild is Element<"option"> =>
                  grandchild.name === "option",
              );

          default:
            return Sequence.empty();
        }
      });
  }

  return this._optionsList;
};
