import { test } from "@siteimprove/alfa-test";

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
      response: {
        url: "about:blank",
        body: "",
        headers: [],
        method: "GET",
        status: 500,
      },
      device: {
        type: "screen",
        viewport: {
          width: 1280,
          height: 720,
          orientation: "landscape",
        },
        display: {
          resolution: 1,
          scan: "progressive",
        },
        scripting: {
          enabled: true,
        },
        preferences: [],
      },
      document: {
        type: "document",
        children: [],
        style: [],
      },
    }).isErr(),
    true
  );
});

test(".from() returns Err on invalid URL in response", (t) => {
  t.deepEqual(
    Page.from({
      request: {
        url: "about:blank",
        body: "",
        headers: [],
        method: "GET",
      },
      response: {
        url: "foo",
        body: "",
        headers: [],
        method: "GET",
        status: 500,
      },
      device: {
        type: "screen",
        viewport: {
          width: 1280,
          height: 720,
          orientation: "landscape",
        },
        display: {
          resolution: 1,
          scan: "progressive",
        },
        scripting: {
          enabled: true,
        },
        preferences: [],
      },
      document: {
        type: "document",
        children: [],
        style: [],
      },
    }).isErr(),
    true
  );
});
