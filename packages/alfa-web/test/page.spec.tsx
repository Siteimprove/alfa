import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Document, Element, h } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";

import { Page } from "../src/page";

test(".from() returns Err on invalid URL in request", (t) => {
  t.deepEqual(
    Page.from({
      request: {
        url: "foo",
        body: "",
        headers: [],
        method: "GET",
      },
      response: Response.empty().toJSON(),
      device: Device.standard().toJSON(),
      document: Document.empty().toJSON(),
    }).isErr(),
    true
  );
});

test(".from() returns Err on invalid URL in response", (t) => {
  t.deepEqual(
    Page.from({
      request: Request.empty().toJSON(),
      response: {
        url: "foo",
        body: "",
        headers: [],
        method: "GET",
        status: 500,
      },
      device: Device.standard().toJSON(),
      document: Document.empty().toJSON(),
    }).isErr(),
    true
  );
});

test(".toJSON() serializes correct box", (t) => {
  const device = Device.standard();

  const document = h.document([
    <div box={{ device, x: 8, y: 8, width: 1070, height: 18 }}>
      Hello world
    </div>,
  ]);

  const page = Page.of(Request.empty(), Response.empty(), document, device);

  t.deepEqual(
    page
      .toJSON()
      .document.children?.filter((x) => x.type === "element")
      .map((x) => x.box),
    [
      {
        type: "rectangle",
        height: 18,
        width: 1070,
        x: 8,
        y: 8,
      },
    ]
  );
});
