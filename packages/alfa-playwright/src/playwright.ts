/// <reference lib="dom" />
/// <reference types="node" />

import { Device } from "@siteimprove/alfa-device";
import { Document, Node } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/native";

import { JSHandle } from "playwright";

/**
 * @public
 */
export namespace Playwright {
  export type Type = JSHandle;

  export async function toNode(value: Type): Promise<Node> {
    return Node.from(await value.evaluate(dom.Native.fromNode));
  }

  export async function toPage(value: Type): Promise<Page> {
    const nodeJSON = await value.evaluate(dom.Native.fromNode);

    const deviceJSON = await value
      .evaluateHandle(() => window)
      .then((handle) => handle.evaluate(device.Native.fromWindow));

    return Page.of(
      Request.empty(),
      Response.empty(),
      nodeJSON.type === "document"
        ? Document.from(nodeJSON as Document.JSON)
        : Document.of([Node.from(nodeJSON)]),
      Device.from(deviceJSON)
    );
  }
}
