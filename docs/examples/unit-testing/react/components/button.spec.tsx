/// <reference types="@siteimprove/alfa-jest" />

import { shallow } from "enzyme";
import * as React from "react";
import { Button } from "./button";

it("should be accessible", async () => {
  await expect(shallow(<Button />)).toBeAccessible();
});
