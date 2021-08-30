/// <reference lib="dom" />
/// <reference types="jquery" />

import { Device } from "@siteimprove/alfa-device";
import { Document, Node } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/native";

/**
 * @public
 */
export namespace JQuery {
  export type Type = globalThis.JQuery;

  export function toPage(value: Type): Page {
    const nodeJSON = dom.Native.fromNode(value.get(0));

    const deviceJSON = device.Native.fromWindow(window);

    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of([Node.from(nodeJSON)]),
      Device.from(deviceJSON)
    );
  }
}
