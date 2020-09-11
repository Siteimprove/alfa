import { Equatable } from "@siteimprove/alfa-equatable";
import { Hash } from "@siteimprove/alfa-hash";
import { Serializable } from "@siteimprove/alfa-json";
import { Parser } from "@siteimprove/alfa-parser";
import { Slice } from "@siteimprove/alfa-slice";

import * as json from "@siteimprove/alfa-json";

import { Token } from "../syntax/token";
import { Function } from "../syntax/function";

import { Value } from "../value";

import { Angle } from "./angle";
import { Length } from "./length";
import { Number } from "./number";
import { Numeric } from "./numeric";
import { Percentage } from "./percentage";
import { Unit } from "./unit";

const { map, either, delimited, pair, option } = Parser;

export class Calculation extends Value<"calculation"> {
  public static of(root: Calculation.Node): Calculation {
    return new Calculation(root.simplify());
  }

  private readonly _root: Calculation.Node;

  private constructor(root: Calculation.Node) {
    super();

    this._root = root;
  }

  public get type(): "calculation" {
    return "calculation";
  }

  public hash(hash: Hash): void {}

  public equals(value: unknown): value is this {
    return value instanceof Calculation && value._root.equals(this._root);
  }

  public toJSON(): Calculation.JSON {
    return {
      type: "calculation",
      root: this._root.toJSON(),
    };
  }

  public toString(): string {
    return `calc(${this._root})`;
  }
}

export namespace Calculation {
  export interface JSON {
    [key: string]: json.JSON;
    type: "calculation";
    root: Node.JSON;
  }

  export abstract class Node implements Equatable, Serializable {
    public abstract get type(): string;

    /**
     * @see https://drafts.csswg.org/css-values/#simplify-a-calculation-tree
     */
    public abstract simplify(): Node;

    public abstract equals(value: unknown): value is this;

    public toJSON(): Node.JSON {
      return {
        type: this.type,
      };
    }
  }

  export namespace Node {
    export interface JSON {
      [key: string]: json.JSON;
      type: string;
    }
  }

  export class Value extends Node {
    public static of(value: Numeric): Value {
      return new Value(value);
    }

    private readonly _value: Numeric;

    private constructor(value: Numeric) {
      super();

      this._value = value;
    }

    public get type(): "value" {
      return "value";
    }

    public get value(): Numeric {
      return this._value;
    }

    public simplify(): Node {
      const value = this._value;

      if (Length.isLength(value) && Unit.isAbsoluteLength(value.unit)) {
        return Value.of(value.withUnit("px"));
      }

      return this;
    }

    public equals(value: unknown): value is this {
      return value instanceof Value && value._value.equals(this._value);
    }

    public toJSON(): Value.JSON {
      return {
        type: "value",
        value: this._value.toJSON(),
      };
    }

    public toString(): string {
      return `${this._value}`;
    }
  }

  export namespace Value {
    export interface JSON extends Node.JSON {
      type: "value";
      value: Numeric.JSON;
    }
  }

  export abstract class Operation<
    O extends Array<Node> = Array<Node>
  > extends Node {
    protected readonly _operands: Readonly<O>;

    protected constructor(operands: Readonly<O>) {
      super();

      this._operands = operands;
    }

    public get operands(): Readonly<O> {
      return this._operands;
    }

    public equals(value: this): value is this {
      return (
        value instanceof Operation &&
        value.type === this.type &&
        value._operands.length === this._operands.length &&
        value._operands.every((operand, i) => operand.equals(this._operands[i]))
      );
    }

    public toJSON(): Operation.JSON {
      return {
        ...super.toJSON(),
        operands: this._operands.map((operand) => operand.toJSON()),
      };
    }
  }

  export namespace Operation {
    export interface JSON extends Node.JSON {
      operands: Array<Node.JSON>;
    }

    export abstract class Unary extends Operation<[Node]> {
      protected constructor(operands: [Node]) {
        super(operands);
      }
    }

    export abstract class Binary extends Operation<[Node, Node]> {
      protected constructor(operands: [Node, Node]) {
        super(operands);
      }
    }
  }

  export class Sum extends Operation.Binary {
    public static of(...operands: [Node, Node]): Sum {
      return new Sum(operands);
    }

    public get type(): "sum" {
      return "sum";
    }

    public simplify(): Node {
      const [fst, snd] = this._operands.map((operand) => operand.simplify());

      if (fst instanceof Value && snd instanceof Value) {
        if (Number.isNumber(fst.value) && Number.isNumber(snd.value)) {
          return Value.of(Number.of(fst.value.value + snd.value.value));
        }

        if (
          Length.isLength(fst.value) &&
          Length.isLength(snd.value) &&
          fst.value.unit === snd.value.unit
        ) {
          return Value.of(
            Length.of(fst.value.value + snd.value.value, fst.value.unit)
          );
        }
      }

      return new Sum([fst, snd]);
    }

    public toString(): string {
      const [fst, snd] = this._operands;

      if (snd instanceof Negate) {
        return `(${fst} - ${snd.operands[0]})`;
      }

      return `(${fst} + ${snd})`;
    }
  }

  export class Negate extends Operation.Unary {
    public static of(operand: Node): Negate {
      return new Negate([operand]);
    }

    public get type(): "negate" {
      return "negate";
    }

    public simplify(): Node {
      const [operand] = this._operands.map((operand) => operand.simplify());

      if (operand instanceof Value) {
        if (Number.isNumber(operand.value)) {
          return Value.of(Number.of(-1 * operand.value.value));
        }
      }

      if (operand instanceof Negate) {
        return operand._operands[0];
      }

      return Negate.of(operand);
    }

    public toString(): string {
      const [operand] = this._operands;

      return `(-1 * ${operand})`;
    }
  }

  export class Product extends Operation.Binary {
    public static of(...operands: [Node, Node]): Product {
      return new Product(operands);
    }

    public get type(): "product" {
      return "product";
    }

    public simplify(): Node {
      const [fst, snd] = this._operands.map((operand) => operand.simplify());

      if (fst instanceof Value && snd instanceof Value) {
        return Value.of(Number.of(fst.value.value * snd.value.value));
      }

      return new Product([fst, snd]);
    }

    public toString(): string {
      const [fst, snd] = this._operands;

      return `${fst} * ${snd}`;
    }
  }

  export class Invert extends Operation.Unary {
    public static of(operand: Node): Invert {
      return new Invert([operand]);
    }

    public get type(): "invert" {
      return "invert";
    }

    public simplify(): Node {
      const [operand] = this._operands.map((operand) => operand.simplify());

      if (operand instanceof Value) {
        return Value.of(Number.of(1 / operand.value.value));
      }

      if (operand instanceof Invert) {
        return operand._operands[0];
      }

      return Negate.of(operand);
    }

    public toString(): string {
      const [operand] = this._operands;

      return `(1 / ${operand})`;
    }
  }

  let parseSum: Parser<Slice<Token>, Node, string>;

  const parseCalc = map(
    Function.parse("calc", (input) => parseSum(input)),
    ([, node]) => node
  );

  /**
   * @see https://drafts.csswg.org/css-values/#typedef-calc-value
   */
  const parseValue = either<Slice<Token>, Node, string>(
    map(
      either<Slice<Token>, Numeric, string>(
        Number.parse,
        Percentage.parse,
        Length.parse,
        Angle.parse
      ),
      Value.of
    ),
    parseCalc,
    delimited(
      Token.parseOpenParenthesis,
      (input) => parseSum(input),
      Token.parseCloseParenthesis
    )
  );

  /**
   * @see https://drafts.csswg.org/css-values/#typedef-calc-product
   */
  const parseProduct = map(
    pair(
      parseValue,
      option(
        pair(
          delimited(
            option(Token.parseWhitespace),
            either(
              map(Token.parseDelim("*"), () => false),
              map(Token.parseDelim("/"), () => true)
            )
          ),
          parseValue
        )
      )
    ),
    ([left, right]) =>
      right
        .map(([invert, right]) =>
          Product.of(left, invert ? Invert.of(right) : right)
        )
        .getOr(left)
  );

  /**
   * @see https://drafts.csswg.org/css-values/#typedef-calc-sum
   */
  parseSum = map(
    pair(
      parseProduct,
      option(
        pair(
          delimited(
            Token.parseWhitespace,
            either(
              map(Token.parseDelim("+"), () => false),
              map(Token.parseDelim("-"), () => true)
            )
          ),
          parseProduct
        )
      )
    ),
    ([left, right]) =>
      right
        .map(([negate, right]) =>
          Sum.of(left, negate ? Negate.of(right) : right)
        )
        .getOr(left)
  );

  export const parse = map(parseCalc, Calculation.of);
}
