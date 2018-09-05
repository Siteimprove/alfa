import { AbsoluteLength, RelativeLength } from "../../types";

export type TextIndent = Readonly<
  | {
      type: "length";
      value: number;
      unit: AbsoluteLength;
      hanging?: boolean;
      eachLine?: boolean;
    }
  | {
      type: "percentage";
      value: number;
      unit?: RelativeLength;
      hanging?: boolean;
      eachLine?: boolean;
    }
>;
