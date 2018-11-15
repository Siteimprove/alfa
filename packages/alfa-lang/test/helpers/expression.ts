export type Constant = Readonly<{
  type: "constant";
  value: number;
}>;
/**
 * @todo halp halp
 */
export type Operator = Readonly<{
  type: "operator";
  value: string;
  left: Expression;
  right: Expression;
}>;

export type Expression = Constant | Operator;

export * from "./expression/alphabet";
export * from "./expression/grammar";
