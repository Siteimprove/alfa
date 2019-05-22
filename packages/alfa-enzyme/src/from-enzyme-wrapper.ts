import {
  fromCheerioElement,
  isCheerioElement
} from "@siteimprove/alfa-cheerio";
import { Element } from "@siteimprove/alfa-dom";
import { fromReactElement } from "@siteimprove/alfa-react";
import { EnzymeWrapper } from "./types";

export function fromEnzymeWrapper(enzymeWrapper: EnzymeWrapper): Element {
  if (isCheerioElement(enzymeWrapper)) {
    return fromCheerioElement(enzymeWrapper);
  }

  return fromReactElement(enzymeWrapper.getElement());
}
