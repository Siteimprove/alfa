export type Constant = Readonly<{
  type: "constant";
  value: number
}>;

export type Operator = Readonly<{
  type: "operator";
  value: string;
  left: Expression;
  right: Expression;
}>;

export type Expression = Constant | Operator;

export * from "./expression/lexer";
export * from "./expression/parser";
