/// <reference types="jest" />
/// <reference types="@siteimprove/alfa-jest" />

import { mount } from "@vue/test-utils";

import { Button } from "./button";

it("should be accessible", async () => {
  await expect(mount(Button)).toBeAccessible();
});
