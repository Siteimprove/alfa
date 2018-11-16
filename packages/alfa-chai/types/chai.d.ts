// tslint:disable:class-name

declare module "chai" {
  interface chai {
    use(plugin: (chai: this, util: chai.Util) => void): this;

    util: chai.Util;

    Assertion: chai.AssertionConstructor;

    assert: chai.Assert;
    expect: chai.Expect;
    should: chai.Should;
  }

  namespace chai {
    interface Util {
      flag(assertion: Assertion, name: string): unknown;
      flag(assertion: Assertion, name: string, value: unknown): void;
    }

    interface Assert {
      (expression: boolean, message: string): void;
      fail(
        actual?: unknown,
        expected?: unknown,
        message?: string,
        operator?: string
      ): void;
    }

    interface Expect {
      (value: unknown, message?: string): Assertion;
      fail(
        actual?: unknown,
        expected?: unknown,
        message?: string,
        operator?: string
      ): void;
    }

    interface Should extends Assertion {
      fail(
        actual?: unknown,
        expected?: unknown,
        message?: string,
        operator?: string
      ): void;
    }

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

    interface AssertionConstructor {
      new (): Assertion;
      prototype: Assertion;

      addProperty(
        name: string,
        property: (this: Assertion, target: unknown) => void
      ): void;
    }
  }

  const chai: chai;

  export = chai;
}

interface Object {
  should: import("chai").Should;
}
