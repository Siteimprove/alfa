import { test } from "@siteimprove/alfa-test";

import { Request } from "../dist/request.js";

test(".from() returns Err on invalid URL", (t) => {
  t.deepEqual(
    Request.from({
      url: "foo",
      body: "",
      headers: [],
      method: "GET",
    }).isErr(),
    true,
  );
});
