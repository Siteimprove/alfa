/// <reference lib="dom" />

import { Request, Response } from "@siteimprove/alfa-http";

import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/dist/native";

import type { Page } from "./index.js";

/**
 * @internal
 */
export namespace Native {
  export async function fromDocument(
    document: globalThis.Document,
  ): Promise<Page.JSON> {
    return {
      request: Request.empty().toJSON(),
      response: Response.empty().toJSON(),
      document: await dom.Native.fromNode(document),
      device: device.Native.fromWindow(document.defaultView ?? window),
    };
  }
}
