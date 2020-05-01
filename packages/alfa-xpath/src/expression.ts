import { Equatable } from "@siteimprove/alfa-equatable";
import { Serializable } from "@siteimprove/alfa-json";
import { Option, None } from "@siteimprove/alfa-option";

import * as json from "@siteimprove/alfa-json";

export type Expression =
  | Expression.Primary
  | Expression.Path
  | Expression.Axis
  | Expression.Filter;

export namespace Expression {
  export type JSON = Primary.JSON | Path.JSON | Axis.JSON | Filter.JSON;

  export type Literal = Integer | Decimal | Double | String;

  export namespace Literal {
    export type JSON = Integer.JSON | Decimal.JSON | Double.JSON | String.JSON;
  }

  export type Primary = Literal | ContextItem | FunctionCall;

  export namespace Primary {
    export type JSON = Literal.JSON | ContextItem.JSON | FunctionCall.JSON;
  }

  export type Postfix = Primary | Filter;

  export namespace Postfix {
    export type JSON = Primary.JSON | Filter.JSON;
  }

  export type Step = Postfix | Axis;

  export namespace Step {
    export type JSON = Postfix.JSON | Axis.JSON;
  }

  export class Integer implements Equatable, Serializable {
    public static of(value: number): Integer {
      return new Integer(value);
    }

    private readonly _value: number;

    private constructor(value: number) {
      this._value = value;
    }

    public get type(): "integer" {
      return "integer";
    }

    public get value(): number {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof Integer && value._value === this._value;
    }

    public toJSON(): Integer.JSON {
      return {
        type: "integer",
        value: this._value,
      };
    }

    public toString(): string {
      return `${this._value}`;
    }
  }

  export namespace Integer {
    export interface JSON {
      [key: string]: json.JSON;
      type: "integer";
      value: number;
    }
  }

  export class Decimal implements Equatable, Serializable {
    public static of(value: number): Decimal {
      return new Decimal(value);
    }

    private readonly _value: number;

    private constructor(value: number) {
      this._value = value;
    }

    public get type(): "decimal" {
      return "decimal";
    }

    public get value(): number {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof Decimal && value._value === this._value;
    }

    public toJSON(): Decimal.JSON {
      return {
        type: "decimal",
        value: this._value,
      };
    }

    public toString(): string {
      return `${this._value}`;
    }
  }

  export namespace Decimal {
    export interface JSON {
      [key: string]: json.JSON;
      type: "decimal";
      value: number;
    }
  }

  export class Double implements Equatable, Serializable {
    public static of(value: number): Double {
      return new Double(value);
    }

    private readonly _value: number;

    private constructor(value: number) {
      this._value = value;
    }

    public get type(): "double" {
      return "double";
    }

    public get value(): number {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof Double && value._value === this._value;
    }

    public toJSON(): Double.JSON {
      return {
        type: "double",
        value: this._value,
      };
    }

    public toString(): string {
      return `${this._value}`;
    }
  }

  export namespace Double {
    export interface JSON {
      [key: string]: json.JSON;
      type: "double";
      value: number;
    }
  }

  export class String implements Equatable, Serializable {
    public static of(value: string): String {
      return new String(value);
    }

    private readonly _value: string;

    private constructor(value: string) {
      this._value = value;
    }

    public get type(): "string" {
      return "string";
    }

    public get value(): string {
      return this._value;
    }

    public equals(value: unknown): value is this {
      return value instanceof String && value._value === this._value;
    }

    public toJSON(): String.JSON {
      return {
        type: "string",
        value: this._value,
      };
    }

    public toString(): string {
      return `"${this._value}"`;
    }
  }

  export namespace String {
    export interface JSON {
      [key: string]: json.JSON;
      type: "string";
      value: string;
    }
  }

  export class Path implements Equatable, Serializable {
    public static of(left: Expression, right: Expression): Path {
      return new Path(left, right);
    }

    private readonly _left: Expression;
    private readonly _right: Expression;

    private constructor(left: Expression, right: Expression) {
      this._left = left;
      this._right = right;
    }

    public get type(): "path" {
      return "path";
    }

    public get left(): Expression {
      return this._left;
    }

    public get right(): Expression {
      return this._right;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Path &&
        value._left.equals(this._left) &&
        value._right.equals(this._right)
      );
    }

    public toJSON(): Path.JSON {
      return {
        type: "path",
        left: this._left.toJSON(),
        right: this._right.toJSON(),
      };
    }

    public toString(): string {
      return `${this._left}/${this._right}`;
    }
  }

  export namespace Path {
    export interface JSON {
      [key: string]: json.JSON;
      type: "path";
      left: Expression.JSON;
      right: Expression.JSON;
    }
  }

  export class Axis implements Equatable, Serializable {
    public static of(
      axis: Axis.Type,
      test: Option<Test> = None,
      predicates: Array<Expression> = []
    ): Axis {
      return new Axis(axis, test, predicates);
    }

    private readonly _axis: Axis.Type;
    private readonly _test: Option<Test>;
    private readonly _predicates: Array<Expression>;

    private constructor(
      axis: Axis.Type,
      test: Option<Test>,
      predicates: Array<Expression>
    ) {
      this._axis = axis;
      this._test = test;
      this._predicates = predicates;
    }

    public get type(): "axis" {
      return "axis";
    }

    public get axis(): Axis.Type {
      return this._axis;
    }

    public get test(): Option<Test> {
      return this._test;
    }

    public get predicates(): Iterable<Expression> {
      return this._predicates;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Axis &&
        value._axis === this._axis &&
        value._test.equals(this._test) &&
        value._predicates.length === this._predicates.length &&
        value._predicates.every((predicate, i) =>
          predicate.equals(this._predicates[i])
        )
      );
    }

    public toJSON(): Axis.JSON {
      return {
        type: "axis",
        axis: this._axis,
        test: this._test.map((test) => test.toJSON()).getOr(null),
        predicates: this._predicates.map((predicate) => predicate.toJSON()),
      };
    }
  }

  export namespace Axis {
    export interface JSON {
      [key: string]: json.JSON;
      type: "axis";
      axis: string;
      test: Test.JSON | null;
      predicates: Array<Expression.JSON>;
    }

    export type Type =
      | "ancestor"
      | "ancestor-or-self"
      | "attribute"
      | "child"
      | "descendant"
      | "descendant-or-self"
      | "following"
      | "following-sibling"
      | "parent"
      | "preceding"
      | "preceding-sibling"
      | "self";
  }

  export type Test = Test.Kind | Test.Name;

  export namespace Test {
    export type JSON = Kind.JSON | Name.JSON;

    export type Kind = Node | Document | Element | Attribute | Comment | Text;

    export namespace Kind {
      export type JSON =
        | Node.JSON
        | Document.JSON
        | Element.JSON
        | Attribute.JSON
        | Comment.JSON
        | Text.JSON;
    }

    export class Node implements Equatable, Serializable {
      private static _instance = new Node();

      public static of(): Node {
        return this._instance;
      }

      private constructor() {}

      public get type(): "kind" {
        return "kind";
      }

      public get kind(): "node" {
        return "node";
      }

      public equals(value: unknown): value is this {
        return value instanceof Document;
      }

      public toJSON(): Node.JSON {
        return {
          type: "kind",
          kind: "node",
        };
      }

      public toString(): string {
        return "node()";
      }
    }

    export namespace Node {
      export interface JSON {
        [key: string]: json.JSON;
        type: "kind";
        kind: "node";
      }
    }

    export class Document implements Equatable, Serializable {
      private static _instance = new Document();

      public static of(): Document {
        return this._instance;
      }

      private constructor() {}

      public get type(): "kind" {
        return "kind";
      }

      public get kind(): "document" {
        return "document";
      }

      public equals(value: unknown): value is this {
        return value instanceof Document;
      }

      public toJSON(): Document.JSON {
        return {
          type: "kind",
          kind: "document",
        };
      }

      public toString(): string {
        return "document-node()";
      }
    }

    export namespace Document {
      export interface JSON {
        [key: string]: json.JSON;
        type: "kind";
        kind: "document";
      }
    }

    export class Element implements Equatable, Serializable {
      public static of(name: Option<string>): Element {
        return new Element(name);
      }

      private readonly _name: Option<string>;

      private constructor(name: Option<string>) {
        this._name = name;
      }

      public get type(): "kind" {
        return "kind";
      }

      public get kind(): "element" {
        return "element";
      }

      public get name(): Option<string> {
        return this._name;
      }

      public equals(value: unknown): value is this {
        return value instanceof Element && value._name.equals(this._name);
      }

      public toJSON(): Element.JSON {
        return {
          type: "kind",
          kind: "element",
          name: this._name.getOr(null),
        };
      }

      public toString(): string {
        return `element(${this._name.getOr("")})`;
      }
    }

    export namespace Element {
      export interface JSON {
        [key: string]: json.JSON;
        type: "kind";
        kind: "element";
        name: string | null;
      }
    }

    export class Attribute implements Equatable, Serializable {
      public static of(name: Option<string>): Attribute {
        return new Attribute(name);
      }

      private readonly _name: Option<string>;

      private constructor(name: Option<string>) {
        this._name = name;
      }

      public get type(): "kind" {
        return "kind";
      }

      public get kind(): "attribute" {
        return "attribute";
      }

      public get name(): Option<string> {
        return this._name;
      }

      public equals(value: unknown): value is this {
        return value instanceof Attribute && value._name.equals(this._name);
      }

      public toJSON(): Attribute.JSON {
        return {
          type: "kind",
          kind: "attribute",
          name: this._name.getOr(null),
        };
      }

      public toString(): string {
        return `attribute(${this._name.getOr("")})`;
      }
    }

    export namespace Attribute {
      export interface JSON {
        [key: string]: json.JSON;
        type: "kind";
        kind: "attribute";
        name: string | null;
      }
    }

    export class Comment implements Equatable, Serializable {
      private static _instance = new Comment();

      public static of(): Comment {
        return this._instance;
      }

      private constructor() {}

      public get type(): "kind" {
        return "kind";
      }

      public get kind(): "comment" {
        return "comment";
      }

      public equals(value: unknown): value is this {
        return value instanceof Comment;
      }

      public toJSON(): Comment.JSON {
        return {
          type: "kind",
          kind: "comment",
        };
      }

      public toString(): string {
        return "comment()";
      }
    }

    export namespace Comment {
      export interface JSON {
        [key: string]: json.JSON;
        type: "kind";
        kind: "comment";
      }
    }

    export class Text implements Equatable, Serializable {
      private static _instance = new Text();

      public static of(): Text {
        return this._instance;
      }

      private constructor() {}

      public get type(): "kind" {
        return "kind";
      }

      public get kind(): "text" {
        return "text";
      }

      public equals(value: unknown): value is this {
        return value instanceof Text;
      }

      public toJSON(): Text.JSON {
        return {
          type: "kind",
          kind: "text",
        };
      }

      public toString(): string {
        return "text()";
      }
    }

    export namespace Text {
      export interface JSON {
        [key: string]: json.JSON;
        type: "kind";
        kind: "text";
      }
    }

    export class Name implements Equatable, Serializable {
      public static of(prefix: Option<string>, name: string): Name {
        return new Name(prefix, name);
      }

      private readonly _prefix: Option<string>;
      private readonly _name: string;

      private constructor(prefix: Option<string>, name: string) {
        this._prefix = prefix;
        this._name = name;
      }

      public get type(): "name" {
        return "name";
      }

      public get prefix(): Option<string> {
        return this._prefix;
      }

      public get name(): string {
        return this._name;
      }

      public equals(value: unknown): value is this {
        return (
          value instanceof Name &&
          value._prefix.equals(this._prefix) &&
          value._name === this._name
        );
      }

      public toJSON(): Name.JSON {
        return {
          type: "name",
          prefix: this._prefix.getOr(null),
          name: this._name,
        };
      }

      public toString(): string {
        const prefix = this._prefix.map((prefix) => `${prefix}:`).getOr("");

        return `${prefix}${this._name}`;
      }
    }

    export namespace Name {
      export interface JSON {
        [key: string]: json.JSON;
        type: "name";
        prefix: string | null;
        name: string;
      }
    }
  }

  export class Filter implements Equatable, Serializable {
    public static of(base: Expression, predicates: Array<Expression>): Filter {
      return new Filter(base, predicates);
    }

    private readonly _base: Expression;
    private readonly _predicates: Array<Expression>;

    private constructor(base: Expression, predicates: Array<Expression>) {
      this._base = base;
      this._predicates = predicates;
    }

    public get type(): "filter" {
      return "filter";
    }

    public get base(): Expression {
      return this._base;
    }

    public get predicates(): Iterable<Expression> {
      return this._predicates;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof Filter &&
        value._base.equals(this._base) &&
        value._predicates.length === this._predicates.length &&
        value._predicates.every((predicate, i) =>
          predicate.equals(this._predicates[i])
        )
      );
    }

    public toJSON(): Filter.JSON {
      return {
        type: "filter",
        base: this._base.toJSON(),
        predicates: this._predicates.map((predicate) => predicate.toJSON()),
      };
    }

    public toString(): string {
      return `${this._base}${this._predicates.map(
        (predicate) => `[${predicate}]`
      )}`;
    }
  }

  export namespace Filter {
    export interface JSON {
      [key: string]: json.JSON;
      type: "filter";
      base: Expression.JSON;
      predicates: Array<Expression.JSON>;
    }
  }

  export class ContextItem implements Equatable, Serializable {
    private static _instance = new ContextItem();

    public static of(): ContextItem {
      return this._instance;
    }

    private constructor() {}

    public get type(): "context-item" {
      return "context-item";
    }

    public equals(value: unknown): value is this {
      return value instanceof ContextItem;
    }

    public toJSON(): ContextItem.JSON {
      return {
        type: "context-item",
      };
    }

    public toString(): string {
      return ".";
    }
  }

  export namespace ContextItem {
    export interface JSON {
      [key: string]: json.JSON;
      type: "context-item";
    }
  }

  export class FunctionCall implements Equatable, Serializable {
    public static of(
      prefix: Option<string>,
      name: string,
      arity: number,
      parameters: Array<Expression>
    ): FunctionCall {
      return new FunctionCall(prefix, name, arity, parameters);
    }

    private readonly _prefix: Option<string>;
    private readonly _name: string;
    private readonly _arity: number;
    private readonly _parameters: Array<Expression>;

    private constructor(
      prefix: Option<string>,
      name: string,
      arity: number,
      parameters: Array<Expression>
    ) {
      this._prefix = prefix;
      this._name = name;
      this._arity = arity;
      this._parameters = parameters;
    }

    public get type(): "function-call" {
      return "function-call";
    }

    public get prefix(): Option<string> {
      return this._prefix;
    }

    public get name(): string {
      return this._name;
    }

    public get arity(): number {
      return this._arity;
    }

    public get parameters(): Iterable<Expression> {
      return this._parameters;
    }

    public equals(value: unknown): value is this {
      return (
        value instanceof FunctionCall &&
        value._prefix.equals(this._prefix) &&
        value._name === this._name &&
        value._arity === this._arity &&
        value._parameters.length === this._parameters.length &&
        value._parameters.every((parameter, i) =>
          parameter.equals(this._parameters[i])
        )
      );
    }

    public toJSON(): FunctionCall.JSON {
      return {
        type: "function-call",
        prefix: this._prefix.getOr(null),
        name: this._name,
        arity: this._arity,
        parameters: this._parameters.map((parameter) => parameter.toJSON()),
      };
    }

    public toString(): string {
      const prefix = this._prefix.map((prefix) => `${prefix}:`).getOr("");

      return `${prefix}${this._name}(${this._parameters.join(", ")})`;
    }
  }

  export namespace FunctionCall {
    export interface JSON {
      [key: string]: json.JSON;
      type: "function-call";
      prefix: string | null;
      name: string;
      arity: number;
      parameters: Array<Expression.JSON>;
    }
  }
}
