import { Device } from "@siteimprove/alfa-device";
import { Document, Node } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import * as dom from "@siteimprove/alfa-dom/native";

import { ElementFinder } from "protractor";

/**
 * @public
 */
export namespace Protractor {
  export type Type = ElementFinder;

  export async function toPage(value: Type): Promise<Page> {
    const nodeJSON: Node.JSON = await value.browser_.executeScript(
      dom.Native.fromNode,
      value
    );

    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of([Node.from(nodeJSON)]),
      Device.standard()
    );
  }
}
