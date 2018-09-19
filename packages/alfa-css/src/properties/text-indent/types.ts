import { Values } from "../../values";

export type TextIndent = Values.Dictionary<{
  indent: Values.Length | Values.Percentage;
  hanging?: Values.Boolean;
  eachLine?: Values.Boolean;
}>;
