import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { Document } from "@siteimprove/alfa-dom";
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
