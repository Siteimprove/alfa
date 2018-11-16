declare module "chai" {
  namespace chai {
    type Chai = typeof chai;

    interface Assertion {
      assert(
        expression: boolean,
        message: string,
        negatedMessage: string,
        expected?: unknown,
        acutal?: unknown,
        showDiff?: boolean
      ): void;

      to: this;
      be: this;
      been: this;
      is: this;
      that: this;
      which: this;
      and: this;
      has: this;
      have: this;
      with: this;
      at: this;
      of: this;
      same: this;
      but: this;
      does: this;

      not: this;
      deep: this;
      nested: this;
      own: this;
      any: this;
      all: this;

      ok: this;
      true: this;
      false: this;
      null: this;
      undefined: this;
      NaN: this;
      exist: this;
      empty: this;
      arguments: this;

      a(type: string, message?: string): this;
      include(value: unknown, message?: string): this;
      equal(value: unknown, message?: string): this;
      eql(value: object, message?: string): this;
      above(number: number, message?: string): this;
    }

    namespace Assertion {
      function addProperty(
        name: string,
        property: (this: Assertion, target: unknown) => void
      ): void;
    }

    interface Utils {
      flag(assertion: Assertion, name: string): unknown;
      flag(assertion: Assertion, name: string, value: unknown): void;
    }

    function assert(expression: boolean, message: string): void;

    function expect(input: unknown): Assertion;

    function should(): void;

    function use(plugin: (chai: Chai, utils: Utils) => void): Chai;
  }

  export = chai;
}

interface Object {
  should: import("chai").Assertion;
}
