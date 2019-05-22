import { shallow } from "enzyme";
import * as React from "react";
import { Button } from "./button";

it("should be accessible", () => {
  expect(shallow(<Button />)).toBeAccessible();
});
