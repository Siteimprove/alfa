import { Cheerio } from "@siteimprove/alfa-cheerio";
import { React } from "@siteimprove/alfa-react";
import { Page } from "@siteimprove/alfa-web";
import { ReactWrapper, ShallowWrapper } from "enzyme";

export namespace Enzyme {
  export type Type = ReactWrapper | ShallowWrapper | Cheerio.Type;

  export function isType(value: unknown): value is Type {
    return (
      value instanceof ReactWrapper ||
      value instanceof ShallowWrapper ||
      Cheerio.isType(value)
    );
  }

  export function asPage(enzyme: Type): Page {
    if (Cheerio.isType(enzyme)) {
      return Cheerio.asPage(enzyme);
    }

    return React.asPage(enzyme.getElement());
  }
}
