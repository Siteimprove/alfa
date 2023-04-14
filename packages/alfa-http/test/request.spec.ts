import { test } from "@siteimprove/alfa-test";

import { Request } from "../src/request";

test(".from() returns Err on invalid URL", (t) => {
  t.deepEqual(
    Request.from({
      url: "foo",
      body: "",
      headers: [],
      method: "GET",
    }).isErr(),
    true
  );
});
