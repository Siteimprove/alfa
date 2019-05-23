import {
  fromCheerioWrapper,
  isCheerioWrapper
} from "@siteimprove/alfa-cheerio";
import { Element } from "@siteimprove/alfa-dom";
import { fromReactElement } from "@siteimprove/alfa-react";
import { EnzymeWrapper } from "./types";

export function fromEnzymeWrapper(enzymeWrapper: EnzymeWrapper): Element {
  if (isCheerioWrapper(enzymeWrapper)) {
    return fromCheerioWrapper(enzymeWrapper);
  }

  return fromReactElement(enzymeWrapper.getElement());
}
