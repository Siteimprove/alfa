import { Predicate } from "@siteimprove/alfa-predicate";
import { Refinement } from "@siteimprove/alfa-refinement";

import type { Element } from "../../element.js";
import { type InputType } from "../input-type.js";
import { hasName } from "./has-name.js";

const { equals, test } = Predicate;
const { and } = Refinement;

/**
 * @public
 */
export function hasInputType(
  predicate: Predicate<InputType>,
): Predicate<Element>;

/**
 * @public
 */
export function hasInputType(
  inputType: InputType,
  ...rest: Array<InputType>
): Predicate<Element>;

export function hasInputType(
  inputTypeOrPredicate: InputType | Predicate<InputType>,
  ...inputTypes: Array<InputType>
): Predicate<Element> {
  let predicate: Predicate<InputType>;

  if (typeof inputTypeOrPredicate === "function") {
    predicate = inputTypeOrPredicate;
  } else {
    predicate = equals(inputTypeOrPredicate, ...inputTypes);
  }

  return and(hasName("input"), (element) =>
    test(predicate, element.inputType()),
  );
}
