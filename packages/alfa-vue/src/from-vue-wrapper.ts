import {
  fromCheerioWrapper,
  isCheerioWrapper
} from "@siteimprove/alfa-cheerio";
import * as dom from "@siteimprove/alfa-dom";
import { VueWrapper } from "./types";

export function fromVueWrapper(vueWrapper: VueWrapper): dom.Element {
  if (isCheerioWrapper(vueWrapper)) {
    return fromCheerioWrapper(vueWrapper);
  }

  return vueWrapper.element.cloneNode(true) as Element;
}
