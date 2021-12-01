import "jsdom-global/register";
import * as device from "@siteimprove/alfa-device/native";
import { test } from "@siteimprove/alfa-test";

import { Device } from "@siteimprove/alfa-device";
import { h } from "@siteimprove/alfa-dom";
import { Request, Response } from "@siteimprove/alfa-http";
import { Page } from "@siteimprove/alfa-web";

import V from "vue";
import { mount } from "@vue/test-utils";

import { Vue } from "../src";

export const Button = V.extend({
  template: `
    <button class="btn"></button>
  `,
});

// window.matchMedia is not currently implemented by JSDOM, so we need to mock
// it.
// For the purpose of this test, we actually don't care about the result (they
// are not actually used), so we are OK with a mock that always answer `false`.
window.matchMedia =
  window.matchMedia ||
  function () {
    return {
      matches: false,
    };
  };

test(`.toPage() creates an Alfa Page`, (t) => {
  const button = mount(Button);

  const actual = Vue.toPage(button);
  const expected = Page.of(
    Request.empty(),
    Response.empty(),
    h.document([h.element("button", { class: "btn" })]),
    Device.from(device.Native.fromWindow(window))
  );

  t.deepEqual(actual.toJSON(), expected.toJSON());
});
