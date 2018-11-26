export interface Constant {
  readonly type: "constant";
  readonly value: number;
}

export interface Operator {
  readonly type: "operator";
  readonly value: string;
  readonly left: Expression;
  readonly right: Expression;
}

export type Expression = Constant | Operator;

export * from "./expression/alphabet";
export * from "./expression/grammar";
