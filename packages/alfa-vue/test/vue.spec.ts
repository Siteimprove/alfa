import "jsdom-global/register";
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

// const { window } = new JSDOM("");

test(`.toPage() creates an Alfa Page`, (t) => {
  const button = mount(Button);

  const actual = Vue.toPage(button);
  const expected = Page.of(
    Request.empty(),
    Response.empty(),
    h.document([h.element("button", { class: "btn" }, [], [])]),
    Device.standard()
  );

  t.deepEqual(actual.toJSON(), expected.toJSON());
});
