// tslint:disable:class-name

declare module "should" {
  interface should {
    (obj: unknown): should.Assertion;

    Assertion: should.AssertionConstructor;
  }

  namespace should {
    interface Assertion {
      obj: unknown;
      be: this;
      null: this;
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
  should: import("should").Assertion;
}
