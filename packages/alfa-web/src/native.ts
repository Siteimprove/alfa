/// <reference lib="dom" />

import { Request, Response } from "@siteimprove/alfa-http";

import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/native";

import { Page } from ".";

/**
 * @internal
 */
export namespace Native {
  export function fromDocument(document: globalThis.Document): Page.JSON {
    return {
      request: Request.empty().toJSON(),
      response: Response.empty().toJSON(),
      document: dom.Native.fromNode(document),
      device: device.Native.fromWindow(document.defaultView ?? window),
    };
  }
}
