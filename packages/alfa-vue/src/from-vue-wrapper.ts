import {
  fromCheerioWrapper,
  isCheerioWrapper
} from "@siteimprove/alfa-cheerio";
import { Element } from "@siteimprove/alfa-dom";
import { VueWrapper } from "./types";

export function fromVueWrapper(vueWrapper: VueWrapper): Element {
  if (isCheerioWrapper(vueWrapper)) {
    return fromCheerioWrapper(vueWrapper);
  }

  return vueWrapper.element;
}
