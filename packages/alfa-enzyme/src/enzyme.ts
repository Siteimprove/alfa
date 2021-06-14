/// <reference types="node" />

import { React } from "@siteimprove/alfa-react";
import { Page } from "@siteimprove/alfa-web";

import { CommonWrapper } from "enzyme";

/**
 * @public
 */
export namespace Enzyme {
  export type Type = CommonWrapper;

  export function toPage(value: Type): Page {
    return React.toPage(value.getElement());
  }
}
