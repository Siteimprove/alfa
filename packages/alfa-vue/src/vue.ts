/// <reference lib="dom" />
/// <reference types="node" />

import { Cheerio } from "@siteimprove/alfa-cheerio";
import { Device } from "@siteimprove/alfa-device";
import { Document, Node } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/native";

import { Wrapper } from "@vue/test-utils";
import V from "vue";

/**
 * @public
 */
export namespace Vue {
  export type Type = Wrapper<V | null> | Cheerio.Type;

  export function toPage(value: Type): Page {
    if ("cheerio" in value) {
      return Cheerio.toPage(value);
    }

    const nodeJSON = dom.Native.fromNode(value.element);

    const deviceJSON = device.Native.fromWindow(window);

    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of([Node.from(nodeJSON)]),
      Device.from(deviceJSON)
    );
  }
}
