/*
 * Augment the Element class with some methods that are specific to a given
 * element. These are grouped here to de-clutter the main class declaration
 * which thus only contains generic methods.
 *
 * {@link https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */

import { LazyList } from "@siteimprove/alfa-lazy-list";
import { None, Some } from "@siteimprove/alfa-option";
import { Refinement } from "@siteimprove/alfa-refinement";

import { Element } from "../element.js";
import type { InputType } from "./input-type.js";

const { isElement } = Element;
const { and } = Refinement;

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
     * size content attribute is undefined. This is for historical reasons. In
     * our case, this is not affecting the results, and it is easier to treat it
     * as the actual displayed size.
     * {@link https://html.spec.whatwg.org/multipage/form-elements.html#dom-select-size}
     */
    displaySize(this: Element<"select">): number;

    /**
     * {@link https://html.spec.whatwg.org/multipage/form-elements.html#concept-select-option-list}
     */
    optionsList(this: Element<"select">): LazyList<Element<"option">>;

    /**
     * {@link https://html.spec.whatwg.org/multipage/#summary-for-its-parent-details}
     */
    isSummaryForItsParentDetails(this: Element<"summary">): boolean;
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
): LazyList<Element<"option">> {
  if (this._optionsList === undefined) {
    this._optionsList = this.children()
      .filter(isElement)
      .flatMap((child) => {
        switch (child.name) {
          case "option":
            return LazyList.from([child as Element<"option">]);

          case "optgroup":
            return child
              .children()
              .filter(isElement)
              .filter(
                // We cannot really use `Element.hasName` here as it would
                // create a circular dependency.
                (grandchild): grandchild is Element<"option"> =>
                  grandchild.name === "option",
              );

          default:
            return LazyList.empty();
        }
      });
  }

  return this._optionsList;
};

Element.prototype.isSummaryForItsParentDetails = function (
  this: Element<"summary">,
): boolean {
  // We cannot use `Element.hasName` here as it would create a circular dependency.
  return this.parent()
    .filter(and(Element.isElement, (parent) => parent.name === "details"))
    .some((details) =>
      details
        .children()
        .find(
          and(Element.isElement, (candidate) => candidate.name === "summary"),
        )
        .includes(this),
    );
};
