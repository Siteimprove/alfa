import { test } from "@siteimprove/alfa-test";

import { Response } from "../src/response";

test(".from() returns Err on invalid URL", (t) => {
  t.deepEqual(
    Response.from({
      url: "foo",
      body: "",
      headers: [],
      method: "GET",
      status: 500,
    }).toJSON(),
    {
      type: "err",
      error: "Invalid URL",
    }
  );
});
