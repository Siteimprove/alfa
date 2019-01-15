// tslint:disable:class-name

declare module "should" {
  interface should {
    (obj: unknown): should.Assertion;

    Assertion: should.AssertionConstructor;

    use(
      plugin: (should: this, Assertion: typeof should.Assertion) => void
    ): this;
  }

  namespace should {
    interface Assertion {
      readonly obj: unknown;

      params: {
        operator: string;
        obj?: unknown;
        message?: string;
        expected?: unknown;
        details?: string;
      };

      readonly be: this;

      null(): this;

      assert(expression: boolean): void;
    }

    interface AssertionConstructor {
      new (obj: unknown): Assertion;
      prototype: Assertion;

      add(name: string, handler: (this: Assertion) => void): void;
    }
  }

  const should: should;

  export = should;
}

interface Object {
  // @ts-ignore This will clash with other packages that define `Object.should`
  should: import("should").Assertion;
}
