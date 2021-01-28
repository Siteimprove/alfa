import { Cheerio } from "@siteimprove/alfa-cheerio";
import { React } from "@siteimprove/alfa-react";
import { Page } from "@siteimprove/alfa-web";

import { ReactWrapper, ShallowWrapper } from "enzyme";

export namespace Enzyme {
  export type Type = ReactWrapper | ShallowWrapper | Cheerio.Type;

  export function toPage(value: Type): Page {
    if ("cheerio" in value) {
      return Cheerio.toPage(value);
    }

    return React.toPage(value.getElement());
  }
}
