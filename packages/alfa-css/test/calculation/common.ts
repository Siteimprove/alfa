import type { Expression } from "../../dist/calculation/index.js";
import { Length } from "../../dist/calculation/numeric/index.js";

export const resolver: Expression.Resolver = {
  length: (length) => {
    switch (length.unit) {
      case "em":
        return Length.of(length.value * 16, "px");
      case "rem":
        return Length.of(length.value * 32, "px");
      case "vh":
        return Length.of(length.value * 1024, "px");
      default:
        return Length.of(0, "px");
    }
  },
  percentage: (percent) => Length.of(percent.value * 16, "px"),
};
