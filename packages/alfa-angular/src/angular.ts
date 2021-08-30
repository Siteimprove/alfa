/// <reference lib="dom" />

import { Device } from "@siteimprove/alfa-device";
import { Document, Node } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import * as device from "@siteimprove/alfa-device/native";
import * as dom from "@siteimprove/alfa-dom/native";

import { ComponentFixture } from "@angular/core/testing";

/**
 * @public
 */
export namespace Angular {
  export type Type = ComponentFixture<unknown>;

  export function toPage(value: Type): Page {
    const nodeJSON = dom.Native.fromNode(value.nativeElement);

    const deviceJSON = device.Native.fromWindow(window);

    return Page.of(
      Request.empty(),
      Response.empty(),
      Document.of([Node.from(nodeJSON)]),
      Device.from(deviceJSON)
    );
  }
}
