import { Element } from "@siteimprove/alfa-dom";
import { fromReactElement } from "@siteimprove/alfa-react";
import { ReactWrapper, ShallowWrapper } from "enzyme";

export function fromEnzymeWrapper(
  enzymeWrapper: ShallowWrapper | ReactWrapper
): Element {
  return fromReactElement(enzymeWrapper.getElement());
}
